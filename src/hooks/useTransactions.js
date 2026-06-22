import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
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

  const addTransaction = async (transaction) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        date: new Date().toISOString()
      });
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
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') return acc + curr.amount;
      if (curr.type === 'expense') return acc - curr.amount;
      return acc;
    }, 0);
  };

  const getIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpense = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };
  
  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
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
    loading,
    addTransaction,
    deleteTransaction,
    addSubscription,
    approveSubscription,
    getPendingSubscriptions,
    getBalance,
    getIncome,
    getExpense,
    getExpensesByCategory
  };
}
