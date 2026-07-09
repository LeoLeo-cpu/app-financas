import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export default function Login({ onLogin, error }) {
  return (
    <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '25px', padding: '20px', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex-center"
        style={{ width: '70px', height: '70px', borderRadius: '50%' }}
      >
        <Wallet color="var(--accent-primary)" size={32} />
      </motion.div>

      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minhas Finanças</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Entre para acessar seus dados financeiros</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onLogin}
        className="glass-panel"
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 24px', borderRadius: '14px', fontWeight: '600', fontSize: '1rem',
          color: 'var(--text-primary)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.2-5.6l-6.6-5.6C29.6 34.7 27 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.9 39.7 16.4 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36.1 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        Entrar com Google
      </motion.button>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  );
}
