import { X, AlertTriangle, ArrowLeftRight, Database } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useState } from 'react';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string, filter?: any) => void;
}

export function NotificationDrawer({ open, onClose, onNavigate }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'alertas' | 'sistema'>('alertas');

  const alertas = [
    {
      id: 1,
      icon: AlertTriangle,
      iconColor: '#F87171',
      title: 'Stock bajo detectado',
      message: 'Monitor LG UltraWide tiene solo 3 unidades en stock',
      time: 'Hace 15 min',
      action: 'Ver producto',
      onAction: () => {
        onNavigate('productos', { filter: 'bajo-stock' });
        onClose();
      }
    },
    {
      id: 2,
      icon: ArrowLeftRight,
      iconColor: '#FBBF24',
      title: 'Movimiento grande detectado',
      message: 'Salida de 47 unidades de Laptop Dell XPS 15',
      time: 'Hace 1 hora',
      action: 'Ver movimientos',
      onAction: () => {
        onNavigate('movimientos', { filter: 'salidas' });
        onClose();
      }
    },
    {
      id: 3,
      icon: AlertTriangle,
      iconColor: '#F87171',
      title: 'Stock bajo detectado',
      message: 'Router TP-Link AX6000 tiene solo 2 unidades',
      time: 'Hace 3 horas',
      action: 'Ver producto',
      onAction: () => {
        onNavigate('productos', { filter: 'bajo-stock' });
        onClose();
      }
    }
  ];

  const sistema = [
    {
      id: 1,
      icon: Database,
      iconColor: '#4ADE80',
      title: 'Respaldo completado',
      message: 'Copia de seguridad automática completada exitosamente',
      time: 'Hace 2 horas',
      action: 'Ir al dashboard',
      onAction: () => {
        onNavigate('dashboard');
        onClose();
      }
    }
  ];

  const notifications = activeTab === 'alertas' ? alertas : sistema;

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <SheetContent 
        side="right"
        className="w-[400px] sm:w-[500px]"
        style={{
          background: '#1C2541',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E0E0E0'
        }}
      >
        <SheetHeader>
          <SheetTitle style={{ color: '#E0E0E0', fontSize: '1.25rem' }}>
            Notificaciones
          </SheetTitle>
          <SheetDescription style={{ color: '#A8A8A8' }}>
            Mantente al día con las últimas alertas y actualizaciones
          </SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 mb-4">
          {(['alertas', 'sistema'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg transition-all duration-200"
              style={{
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)'
                  : 'rgba(58, 134, 255, 0.1)',
                color: activeTab === tab ? '#FFFFFF' : '#A8A8A8',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: activeTab === tab 
                  ? '0 4px 12px rgba(58, 134, 255, 0.3)' 
                  : 'none'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 mt-6">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className="p-4 rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#3A86FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(58, 134, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `${notification.iconColor}20`,
                      color: notification.iconColor
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#E0E0E0', fontSize: '0.875rem', fontWeight: 600 }}>
                      {notification.title}
                    </div>
                    <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {notification.message}
                    </div>
                    <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      {notification.time}
                    </div>

                    <button
                      onClick={notification.onAction}
                      className="mt-3 px-4 py-2 rounded-lg transition-all duration-200"
                      style={{
                        background: 'rgba(58, 134, 255, 0.2)',
                        border: '1px solid rgba(58, 134, 255, 0.3)',
                        color: '#4CC9F0',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(58, 134, 255, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {notification.action}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
