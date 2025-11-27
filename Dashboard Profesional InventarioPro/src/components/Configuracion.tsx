import { useEffect, useState } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface ConfiguracionProps {
  section?: string;
}

export function Configuracion({ section }: ConfiguracionProps) {
  const [inventoryAlerts, setInventoryAlerts] = useState(true);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('dashboard.notifications');
    if (savedNotifications) setInventoryAlerts(savedNotifications === 'true');
  }, []);

  function handleSave() {
    localStorage.setItem('dashboard.notifications', String(inventoryAlerts));
    toast.success('Preferencia guardada para alertas de inventario.');
  }

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="max-w-3xl mx-auto space-y-2">
        <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Configuración básica</h2>
        <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Activa o desactiva las alertas de inventario. {section ? `(Sección: ${section})` : ''}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/80 font-medium">Alertas de inventario</p>
              <p className="text-white/60 text-sm">Activa recordatorios de stock bajo en el panel.</p>
            </div>
            <Switch checked={inventoryAlerts} onCheckedChange={setInventoryAlerts} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto flex justify-end">
        <Button onClick={handleSave}>Guardar preferencias</Button>
      </div>
    </div>
  );
}
