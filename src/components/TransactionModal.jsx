import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CATEGORIES = {
  expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Cartão de Crédito', 'Vestuário', 'Pets', 'Cuidados Pessoais', 'Outros'],
  income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Bônus', 'Vendas', 'Outros']
};

export default function TransactionModal({ onClose, onAdd, onAddSubscription, creditCards = [] }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [description, setDescription] = useState('');
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [dueDay, setDueDay] = useState(1);

  // Credit Card state
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(creditCards.length > 0 ? creditCards[0].id : '');
  const [installments, setInstallments] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    if (isRecurring && type === 'expense') {
      onAddSubscription({
        amount: parseFloat(amount),
        category,
        description,
        dueDay: parseInt(dueDay)
      });
    } else {
      const txData = {
        type,
        amount: parseFloat(amount),
        category,
        description
      };
      
      if (type === 'expense' && isCreditCard && selectedCardId) {
         txData.creditCardId = selectedCardId;
         txData.installments = parseInt(installments);
      }
      
      onAdd(txData);
    }
    
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: '25px',
          paddingBottom: '50px',
          background: 'var(--bg-secondary)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>Nova Transação</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button 
            type="button"
            onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); setIsRecurring(false); }}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '600',
              background: type === 'expense' ? 'var(--danger-bg)' : 'var(--bg-card)',
              color: type === 'expense' ? 'var(--danger)' : 'var(--text-secondary)',
              border: type === 'expense' ? '1px solid var(--danger-glow)' : '1px solid transparent'
            }}
          >
            Despesa
          </button>
          <button 
            type="button"
            onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); setIsRecurring(false); }}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '600',
              background: type === 'income' ? 'var(--success-bg)' : 'var(--bg-card)',
              color: type === 'income' ? 'var(--success)' : 'var(--text-secondary)',
              border: type === 'income' ? '1px solid var(--success-glow)' : '1px solid transparent'
            }}
          >
            Receita
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Valor (R$)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.5rem', fontWeight: '600',
                background: 'var(--bg-primary)', border: 'var(--glass-border)', color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem',
                background: 'var(--bg-primary)', border: 'var(--glass-border)', color: 'var(--text-primary)',
                outline: 'none', appearance: 'none'
              }}
            >
              {CATEGORIES[type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Descrição (Opcional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado da semana"
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem',
                background: 'var(--bg-primary)', border: 'var(--glass-border)', color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {type === 'expense' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Credit Card Section */}
              {creditCards.length > 0 && !isRecurring && (
                <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px', border: 'var(--glass-border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isCreditCard}
                      onChange={(e) => setIsCreditCard(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontWeight: '500' }}>Foi no Cartão de Crédito?</span>
                  </label>
                  
                  {isCreditCard && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '15px', display: 'flex', gap: '10px' }}
                    >
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Cartão</label>
                        <select 
                          value={selectedCardId}
                          onChange={(e) => setSelectedCardId(e.target.value)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.95rem',
                            background: 'var(--bg-card)', border: 'none', color: 'white', outline: 'none'
                          }}
                        >
                          {creditCards.map(card => (
                            <option key={card.id} value={card.id}>{card.name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '100px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Parcelas</label>
                        <select 
                          value={installments}
                          onChange={(e) => setInstallments(e.target.value)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.95rem',
                            background: 'var(--bg-card)', border: 'none', color: 'white', outline: 'none'
                          }}
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <option key={n} value={n}>{n}x</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Recurring Subscription Section */}
              {!isCreditCard && (
                <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px', border: 'var(--glass-border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontWeight: '500' }}>É uma assinatura mensal?</span>
                  </label>
              
              {isRecurring && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: '15px' }}
                >
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Dia do Vencimento</label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    required={isRecurring}
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px', fontSize: '1rem',
                      background: 'var(--bg-card)', border: 'none', color: 'white', outline: 'none'
                    }}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

          <button 
            type="submit"
            style={{
              width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600',
              background: 'var(--accent-primary)', color: 'white', marginTop: '10px'
            }}
          >
            {isRecurring ? 'Adicionar Assinatura' : 'Adicionar Transação'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
