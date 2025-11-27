import { useEffect, useState } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

const STORAGE_KEY = 'inventory_alerts_enabled';

export function Configuracion() {
  const [inventoryAlerts, setInventoryAlerts] = useState(true);

  useEffect(() => {
    const savedPreference = localStorage.getItem(STORAGE_KEY);
    if (savedPreference !== null) {
      setInventoryAlerts(savedPreference === 'true');
      return;
    }

    const legacyPreference = localStorage.getItem('dashboard.notifications');
    if (legacyPreference !== null) {
      setInventoryAlerts(legacyPreference === 'true');
    }
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, String(inventoryAlerts));
    localStorage.removeItem('dashboard.notifications');
    toast.success('Preferencia guardada para alertas de inventario.');
  }

  return (
    <div className="p-8" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold" style={{ color: '#E0E0E0' }}>
            Configuración básica
          </h2>
          <p className="text-sm" style={{ color: '#A8A8A8' }}>
            Ajustes mínimos para alertas de inventario.
          </p>
        </div>

        <Card className="max-w-xl bg-[#1C2541] border-white/10 text-white shadow-xl">
          <CardHeader>
            <CardTitle>Alertas de inventario</CardTitle>
            <CardDescription className="text-white/60">
              Activa recordatorios cuando algún producto tenga stock bajo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-white/70">Notifica cuando un producto esté por debajo de su umbral.</p>
              <p className="text-xs text-white/50">Esta preferencia se guarda en tu navegador.</p>
            </div>
            <Switch checked={inventoryAlerts} onCheckedChange={setInventoryAlerts} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>Guardar preferencias</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
