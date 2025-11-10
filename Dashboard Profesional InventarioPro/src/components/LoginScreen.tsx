import { useState } from 'react';
import { Package, Mail, Lock } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Elements */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(58, 134, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(76, 201, 240, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Login Card */}
      <div 
        className="w-full max-w-md rounded-2xl p-8 relative z-10"
        style={{
          background: 'rgba(28, 37, 65, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                boxShadow: '0 0 40px rgba(58, 134, 255, 0.6)'
              }}
            >
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 
            style={{ 
              color: '#E0E0E0',
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}
          >
            InventarioPro
          </h1>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
            Sistema de Control de Inventario
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label style={{ color: '#A8A8A8' }}>Email</Label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#A8A8A8' }}
              />
              <Input 
                type="email"
                placeholder="isaac.rubio@inventariopro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0',
                  paddingLeft: '2.5rem'
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#A8A8A8' }}>Contraseña</Label>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#A8A8A8' }}
              />
              <Input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0',
                  paddingLeft: '2.5rem'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '1.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(58, 134, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(58, 134, 255, 0.3)';
            }}
          >
            Entrar
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button 
            type="button"
            style={{ color: '#4CC9F0', fontSize: '0.875rem' }}
            className="hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div 
          className="mt-8 pt-6 border-t text-center"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <p style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>
            Desarrollado por Isaac Alexander Rubio Velarde
          </p>
          <p style={{ color: '#4CC9F0', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Versión 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
