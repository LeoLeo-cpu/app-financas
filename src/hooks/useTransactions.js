import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ouve as transações em tempo real
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar transações:", error);
      alert("Erro de permissão no Banco de Dados! " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ouve as assinaturas recorrentes
  useEffect(() => {
    const q = query(collection(db, 'subscriptions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubscriptions(data);
    }, (error) => {
      console.error("Erro ao carregar assinaturas:", error);
    });

    return () => unsubscribe();
  }, []);

  // Ouve os cartões de crédito
  useEffect(() => {
    const q = query(collection(db, 'credit_cards'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCreditCards(data);
    }, (error) => {
      console.error("Erro ao carregar cartões:", error);
    });

    return () => unsubscribe();
  }, []);

  const addTransaction = async (transaction) => {
    try {
      if (transaction.creditCardId && transaction.type === 'expense') {
        const card = creditCards.find(c => c.id === transaction.creditCardId);
        if (!card) throw new Error("Card not found");

        const installments = parseInt(transaction.installments) || 1;
        const amountPerInstallment = transaction.amount / installments;
        
        const now = new Date();
        const purchaseDay = now.getDate();
        
        let startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (purchaseDay >= card.closingDay) {
           startMonth.setMonth(startMonth.getMonth() + 1);
        }

        for (let i = 0; i < installments; i++) {
           const invoiceDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, card.dueDay);
           invoiceDate.setHours(12, 0, 0, 0); // Evitar problemas de fuso
           
           await addDoc(collection(db, 'transactions'), {
              type: 'expense',
              amount: amountPerInstallment,
              category: transaction.category,
              description: installments > 1 ? `${transaction.description} (${i+1}/${installments})` : transaction.description,
              date: invoiceDate.toISOString(),
              paymentMethod: 'credit_card',
              cardId: card.id,
              cardName: card.name
           });
        }
      } else {
        await addDoc(collection(db, 'transactions'), {
          ...transaction,
          date: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const addSubscription = async (sub) => {
    try {
      await addDoc(collection(db, 'subscriptions'), {
        ...sub,
        createdAt: new Date().toISOString(),
        lastPaidMonth: null // formato "YYYY-MM"
      });
    } catch (e) {
      console.error("Error adding subscription: ", e);
    }
  };

  const addCreditCard = async (cardData) => {
    try {
      await addDoc(collection(db, 'credit_cards'), {
        ...cardData,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error adding credit card: ", e);
    }
  };

  // Função para aprovar uma assinatura e transformá-la em transação
  const approveSubscription = async (subId, subData) => {
    try {
      // 1. Adiciona a transação
      await addDoc(collection(db, 'transactions'), {
        type: 'expense',
        amount: subData.amount,
        category: subData.category,
        description: `(Assinatura) ${subData.description}`,
        date: new Date().toISOString()
      });
      
      // 2. Atualiza a assinatura dizendo que este mês já foi pago
      const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      await updateDoc(doc(db, 'subscriptions', subId), {
        lastPaidMonth: currentMonth
      });
    } catch (e) {
      console.error("Error approving subscription: ", e);
    }
  };

  const getBalance = () => {
    // "Todos os Tempos"
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') return acc + curr.amount;
      if (curr.type === 'expense') return acc - curr.amount;
      return acc;
    }, 0);
  };

  const getIncome = (selectedMonth) => {
    return transactions
      .filter(t => t.type === 'income' && (!selectedMonth || t.date.startsWith(selectedMonth)))
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpense = (selectedMonth) => {
    return transactions
      .filter(t => t.type === 'expense' && (!selectedMonth || t.date.startsWith(selectedMonth)))
      .reduce((acc, curr) => acc + curr.amount, 0);
  };
  
  const getExpensesByCategory = (selectedMonth) => {
    const expenses = transactions.filter(t => t.type === 'expense' && (!selectedMonth || t.date.startsWith(selectedMonth)));
    const grouped = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
        name: key,
        value: grouped[key]
    })).sort((a,b) => b.value - a.value);
  }

  // Identifica quais assinaturas estão pendentes para o mês atual
  const getPendingSubscriptions = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().getDate();

    return subscriptions.filter(sub => {
      // Se não foi paga neste mês e o dia de hoje é igual ou maior ao dia de vencimento
      const notPaidThisMonth = sub.lastPaidMonth !== currentMonth;
      const isDue = today >= sub.dueDay;
      return notPaidThisMonth && isDue;
    });
  };

  return {
    transactions,
    subscriptions,
    creditCards,
    loading,
    addTransaction,
    deleteTransaction,
    addSubscription,
    approveSubscription,
    addCreditCard,
    getPendingSubscriptions,
    getBalance,
    getIncome,
    getExpense,
    getExpensesByCategory
  };
}
