import { Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useState } from 'react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    // Simulación de cambio de contraseña
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        style={{
          background: '#1C2541',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E0E0E0'
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24' }}
            >
              <Lock className="w-5 h-5" />
            </div>
            <DialogTitle style={{ color: '#E0E0E0', fontSize: '1.25rem' }}>
              Cambiar Contraseña
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
            Por tu seguridad, ingresa tu contraseña actual y elige una nueva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label style={{ color: '#A8A8A8' }}>Contraseña actual</Label>
            <Input 
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#A8A8A8' }}>Nueva contraseña</Label>
            <Input 
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#A8A8A8' }}>Repetir nueva contraseña</Label>
            <Input 
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <p style={{ color: '#FBBF24', fontSize: '0.75rem' }}>
              La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#A8A8A8'
              }}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
              }}
            >
              Cambiar Contraseña
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
