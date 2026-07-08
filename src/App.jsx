import React, { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, History, PieChart, Home, Trash2, Settings, Download, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import TransactionModal from './components/TransactionModal';

const COLORS = ['#8B5CF6', '#10B981', '#F43F5E', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6'];

function App() {
  const { 
    transactions,
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
  } = useTransactions();

  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentMonthISO = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO);
  
  const [newCardName, setNewCardName] = useState('');
  const [newCardClosing, setNewCardClosing] = useState(1);
  const [newCardDue, setNewCardDue] = useState(10);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
  };

  const exportToCSV = () => {
    // fields: Data, Tipo, Categoria, Descrição, Valor
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Tipo,Categoria,Descricao,Valor\n";
    
    transactions.forEach(t => {
      // Remover vírgulas da descrição para não quebrar o CSV
      const desc = (t.description || '').replace(/,/g, '');
      const typeStr = t.type === 'income' ? 'Receita' : 'Despesa';
      let row = `${new Date(t.date).toLocaleDateString('pt-BR')},${typeStr},${t.category},${desc},${t.amount}`;
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevMonth = () => {
    const d = new Date(selectedMonth + "-01T00:00:00");
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const d = new Date(selectedMonth + "-01T00:00:00");
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const getMonthName = (isoMonth) => {
    const d = new Date(isoMonth + "-01T00:00:00");
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if(!newCardName) return;
    addCreditCard({
      name: newCardName,
      closingDay: parseInt(newCardClosing),
      dueDay: parseInt(newCardDue)
    });
    setNewCardName('');
    setIsAddingCard(false);
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '100vh', color: 'var(--text-secondary)' }}>Carregando dados da nuvem...</div>;
  }

  const balance = getBalance(); // All time
  const income = getIncome(selectedMonth); // Selected month
  const expense = getExpense(selectedMonth); // Selected month
  const expensesByCategory = getExpensesByCategory(selectedMonth); // Selected month
  const pendingSubs = getPendingSubscriptions();

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-between" style={{ marginBottom: '30px' }}
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bem-vindo de volta,</p>
          <h2 style={{ fontSize: '1.5rem' }}>Leonardo 👋</h2>
        </div>
        <div className="flex-center" style={{ gap: '15px' }}>
          <div className="glass-panel flex-between" style={{ padding: '8px 12px', borderRadius: '20px', gap: '10px' }}>
            <button onClick={handlePrevMonth} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><ChevronLeft size={18} /></button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize' }}>{getMonthName(selectedMonth)}</span>
            <button onClick={handleNextMonth} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><ChevronRight size={18} /></button>
          </div>
          <div className="glass-panel flex-center" style={{ width: '45px', height: '45px', borderRadius: '50%' }}>
            <Wallet color="var(--accent-primary)" />
          </div>
        </div>
      </motion.div>

      {/* Saldo Principal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel" 
        style={{ padding: '25px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-glow)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Saldo Total</p>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{formatCurrency(balance)}</h1>
        
        <div className="flex-between">
          <div className="flex-center" style={{ gap: '10px' }}>
            <div className="flex-center" style={{ background: 'var(--success-bg)', width: '36px', height: '36px', borderRadius: '12px' }}>
              <ArrowUpRight color="var(--success)" size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receitas</p>
              <p style={{ fontWeight: '600' }}>{formatCurrency(income)}</p>
            </div>
          </div>
          <div className="flex-center" style={{ gap: '10px' }}>
            <div className="flex-center" style={{ background: 'var(--danger-bg)', width: '36px', height: '36px', borderRadius: '12px' }}>
              <ArrowDownRight color="var(--danger)" size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Despesas</p>
              <p style={{ fontWeight: '600' }}>{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Dinâmico (Tabs) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'home' && (
            <div>
              {/* Banner de Assinaturas Pendentes */}
              {pendingSubs.length > 0 && (
                <div className="glass-panel" style={{ padding: '15px', marginBottom: '25px', border: '1px solid var(--accent-primary)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ Assinaturas Pendentes
                  </h3>
                  {pendingSubs.map(sub => (
                    <div key={sub.id} className="flex-between" style={{ marginBottom: '10px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{sub.description || sub.category}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Venceu dia {sub.dueDay}</p>
                      </div>
                      <div className="flex-center" style={{ gap: '15px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--danger)' }}>{formatCurrency(sub.amount)}</span>
                        <button 
                          onClick={() => approveSubscription(sub.id, sub)} 
                          style={{ background: 'var(--success)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                          Aprovar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-between" style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Transações Recentes</h3>
                <button style={{ background: 'transparent', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.9rem' }} onClick={() => setActiveTab('history')}>Ver tudo</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {transactions.filter(t => t.date.startsWith(selectedMonth)).slice(0, 5).map((t, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    key={t.id} 
                    className="glass-panel flex-between" 
                    style={{ padding: '15px', borderRadius: '16px' }}
                  >
                    <div className="flex-center" style={{ gap: '15px' }}>
                      <div className="flex-center" style={{ background: t.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)', width: '45px', height: '45px', borderRadius: '14px' }}>
                        {t.type === 'income' ? <ArrowUpRight color="var(--success)" /> : <ArrowDownRight color="var(--danger)" />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{t.category}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description || formatDate(t.date)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '600', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {transactions.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 0' }}>
                    Nenhuma transação na nuvem. Adicione uma!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div>
               <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Gastos por Categoria</h3>
               {expensesByCategory.length > 0 ? (
                 <>
                   <div className="glass-panel" style={{ padding: '20px', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                   </div>
                   
                   <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {expensesByCategory.map((cat, i) => (
                        <div key={cat.name} className="glass-panel flex-between" style={{ padding: '15px', borderRadius: '12px' }}>
                          <div className="flex-center" style={{ gap: '10px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span style={{ fontWeight: '500' }}>{cat.name}</span>
                          </div>
                          <span>{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                   </div>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 0' }}>
                    Sem gastos registrados para gerar o gráfico.
                 </div>
               )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Histórico do Mês</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {transactions.filter(t => t.date.startsWith(selectedMonth)).map((t) => (
                  <div key={t.id} className="glass-panel flex-between" style={{ padding: '15px', borderRadius: '16px' }}>
                    <div className="flex-center" style={{ gap: '15px' }}>
                      <div className="flex-center" style={{ background: t.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)', width: '45px', height: '45px', borderRadius: '14px' }}>
                        {t.type === 'income' ? <ArrowUpRight color="var(--success)" /> : <ArrowDownRight color="var(--danger)" />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{t.category}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <div className="flex-center" style={{ gap: '15px' }}>
                      <p style={{ fontWeight: '600', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} style={{ background: 'transparent', color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Sem histórico na nuvem.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Meus Cartões</h3>
                <button 
                  onClick={() => setIsAddingCard(!isAddingCard)}
                  style={{ background: 'var(--accent-primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  + Novo Cartão
                </button>
              </div>

              {isAddingCard && (
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '15px' }}>Cadastrar Cartão</h4>
                  <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Nome do Cartão (ex: Nubank)" required value={newCardName} onChange={e => setNewCardName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: 'none', color: 'white', outline: 'none' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dia Fechamento</label>
                        <input type="number" min="1" max="31" required value={newCardClosing} onChange={e => setNewCardClosing(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: 'none', color: 'white', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dia Vencimento</label>
                        <input type="number" min="1" max="31" required value={newCardDue} onChange={e => setNewCardDue(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: 'none', color: 'white', outline: 'none' }} />
                      </div>
                    </div>
                    <button type="submit" style={{ background: 'var(--accent-secondary)', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginTop: '5px' }}>Salvar Cartão</button>
                  </form>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {creditCards.map((card) => {
                  // Calcular o total de faturas deste cartão NO MÊS SELECIONADO
                  const invoiceTotal = transactions
                    .filter(t => t.paymentMethod === 'credit_card' && t.cardId === card.id && t.date.startsWith(selectedMonth))
                    .reduce((acc, curr) => acc + curr.amount, 0);

                  return (
                    <div key={card.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex-between" style={{ marginBottom: '15px' }}>
                        <div className="flex-center" style={{ gap: '10px' }}>
                          <CreditCard color="var(--accent-primary)" size={24} />
                          <h4 style={{ fontSize: '1.1rem' }}>{card.name}</h4>
                        </div>
                      </div>
                      <div className="flex-between" style={{ marginBottom: '15px' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fechamento</p>
                          <p style={{ fontWeight: '600' }}>Dia {card.closingDay}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vencimento</p>
                          <p style={{ fontWeight: '600' }}>Dia {card.dueDay}</p>
                        </div>
                      </div>
                      <div style={{ paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Fatura de {getMonthName(selectedMonth)}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{formatCurrency(invoiceTotal)}</p>
                      </div>
                    </div>
                  );
                })}
                {creditCards.length === 0 && !isAddingCard && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 0' }}>Nenhum cartão cadastrado.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Configurações</h3>
              
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '5px', fontSize: '1.05rem' }}>Backup de Dados</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    Exporte todas as suas transações para uma planilha do Excel (formato CSV).
                  </p>
                  <button 
                    onClick={exportToCSV}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: '600',
                      background: 'var(--bg-primary)', color: 'var(--text-primary)', border: 'var(--glass-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                  >
                    <Download size={20} />
                    Baixar Planilha CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Botão de Adicionar Flutuante */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          color: 'white',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40
        }}
      >
        <Plus size={30} />
      </motion.button>

      {/* Navegação Inferior (Menu Mobile) */}
      <div 
        className="glass-panel flex-between"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          height: '70px',
          zIndex: 30,
          padding: '0 15px',
          borderRadius: '24px'
        }}
      >
        <NavButton icon={<Home />} label="Início" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<PieChart />} label="Gráficos" isActive={activeTab === 'chart'} onClick={() => setActiveTab('chart')} />
        <NavButton icon={<History />} label="Histórico" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavButton icon={<CreditCard />} label="Cartões" isActive={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
        <NavButton icon={<Settings />} label="Config" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={addTransaction}
            onAddSubscription={addSubscription}
            creditCards={creditCards}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        background: 'transparent', 
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        width: '60px',
        opacity: isActive ? 1 : 0.6
      }}
    >
      {React.cloneElement(icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
      <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '600' : '500' }}>{label}</span>
    </button>
  );
}

export default App;
