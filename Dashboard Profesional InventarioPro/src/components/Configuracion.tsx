import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';

interface ConfiguracionProps {
  section?: string;
}

export function Configuracion({ section }: ConfiguracionProps) {
  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div>
        <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>
          Configuración
        </h2>
        <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Personaliza tu experiencia en InventarioPro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(58, 134, 255, 0.2)', color: '#3A86FF' }}
            >
              <User className="w-5 h-5" />
            </div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>
              Perfil de Usuario
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#A8A8A8' }}>Nombre completo</Label>
              <Input 
                defaultValue="Isaac Alexander Rubio Velarde"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label style={{ color: '#A8A8A8' }}>Email</Label>
              <Input 
                type="email"
                defaultValue="isaac.rubio@inventariopro.com"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label style={{ color: '#A8A8A8' }}>Rol</Label>
              <Input 
                defaultValue="Administrador"
                disabled
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#A8A8A8'
                }}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(76, 201, 240, 0.2)', color: '#4CC9F0' }}
            >
              <Bell className="w-5 h-5" />
            </div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>
              Notificaciones
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Alertas de stock bajo', desc: 'Notificar cuando un producto esté bajo en stock' },
              { label: 'Reportes semanales', desc: 'Recibir resumen semanal por email' },
              { label: 'Movimientos importantes', desc: 'Alertas de transacciones grandes' },
              { label: 'Notificaciones de sistema', desc: 'Actualizaciones y mantenimiento' }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: 'rgba(58, 134, 255, 0.05)' }}
              >
                <div>
                  <div style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {item.desc}
                  </div>
                </div>
                <Switch defaultChecked={index < 2} />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80' }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>
              Seguridad
            </h3>
          </div>

          <div className="space-y-4">
            <button
              className="w-full py-3 rounded-lg transition-all duration-200 text-left px-4"
              style={{
                background: 'rgba(58, 134, 255, 0.1)',
                border: '1px solid rgba(58, 134, 255, 0.3)',
                color: '#3A86FF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
              }}
            >
              Cambiar contraseña
            </button>

            <button
              className="w-full py-3 rounded-lg transition-all duration-200 text-left px-4"
              style={{
                background: 'rgba(58, 134, 255, 0.1)',
                border: '1px solid rgba(58, 134, 255, 0.3)',
                color: '#3A86FF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
              }}
            >
              Configurar autenticación de dos factores
            </button>

            <button
              className="w-full py-3 rounded-lg transition-all duration-200 text-left px-4"
              style={{
                background: 'rgba(58, 134, 255, 0.1)',
                border: '1px solid rgba(58, 134, 255, 0.3)',
                color: '#3A86FF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
              }}
            >
              Ver sesiones activas
            </button>
          </div>
        </div>

        {/* Database */}
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24' }}
            >
              <Database className="w-5 h-5" />
            </div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>
              Base de Datos
            </h3>
          </div>

          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(58, 134, 255, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                  Última copia de seguridad
                </span>
                <span style={{ color: '#4ADE80', fontSize: '0.875rem', fontWeight: 600 }}>
                  Hace 2 horas
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                  Tamaño de BD
                </span>
                <span style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                  145.3 MB
                </span>
              </div>
            </div>

            <button
              className="w-full py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(74, 222, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
              }}
            >
              Crear copia de seguridad ahora
            </button>

            <button
              className="w-full py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: '#F87171'
              }}
            >
              Restaurar desde backup
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="px-8 py-3 rounded-lg transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(58, 134, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(58, 134, 255, 0.3)';
          }}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}