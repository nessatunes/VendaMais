import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-white/5 border-white/20" disabled={isLoading} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
           <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 bg-white/5 border-white/20" disabled={isLoading} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Não tem uma conta?{' '}
          <button type="button" onClick={onSwitch} className="font-semibold text-blue-400 hover:underline" disabled={isLoading}>Cadastre-se</button>
        </p>
      </form>
    </motion.div>
  );
};

const RegisterForm = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(email, password);
    setIsLoading(false);
    if (success) {
        onSwitch();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-white/5 border-white/20" disabled={isLoading} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="reg-password" type="password" placeholder="Crie uma senha forte" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 bg-white/5 border-white/20" disabled={isLoading} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700" disabled={isLoading}>
          {isLoading ? 'Criando...' : 'Criar Conta'}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <button type="button" onClick={onSwitch} className="font-semibold text-blue-400 hover:underline" disabled={isLoading}>Faça login</button>
        </p>
      </form>
    </motion.div>
  );
};

function Login() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 animate-float">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">{isLoginView ? 'Bem-vindo de Volta!' : 'Crie sua Conta'}</h1>
            <p className="text-gray-400 mt-2">{isLoginView ? 'Faça login para continuar' : 'Comece a gerenciar suas vendas'}</p>
          </div>
          
          {isLoginView ? <LoginForm onSwitch={() => setIsLoginView(false)} /> : <RegisterForm onSwitch={() => setIsLoginView(true)} />}
        </div>
      </motion.div>
    </div>
  );
}

export default Login;