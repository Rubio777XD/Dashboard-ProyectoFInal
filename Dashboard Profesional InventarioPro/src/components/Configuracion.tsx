import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface ConfiguracionProps {
  section?: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'es-mx', label: 'Español (MX)' },
  { value: 'en', label: 'Inglés' },
];

export function Configuracion({ section }: ConfiguracionProps) {
  const [language, setLanguage] = useState('es-mx');
  const [pageSize, setPageSize] = useState('20');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dashboard.language');
    const savedPageSize = localStorage.getItem('dashboard.pageSize');
    const savedNotifications = localStorage.getItem('dashboard.notifications');

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedPageSize) setPageSize(savedPageSize);
    if (savedNotifications) setNotifications(savedNotifications === 'true');
  }, []);

  function handleSave() {
    localStorage.setItem('dashboard.language', language);
    localStorage.setItem('dashboard.pageSize', pageSize);
    localStorage.setItem('dashboard.notifications', String(notifications));
    toast.success('Preferencias guardadas. El tamaño de página se aplicará en listados.');
  }

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div>
        <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Configuración básica</h2>
        <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Ajustes mínimos para idioma, tamaño de página y alertas. {section ? `(Sección: ${section})` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 p-6 rounded-lg border border-white/10 bg-white/5">
          <Label className="text-white/80">Idioma</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', color: '#E0E0E0' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-white/60 text-sm">Afecta el formato de números y fechas en el panel.</p>
        </div>

        <div className="space-y-3 p-6 rounded-lg border border-white/10 bg-white/5">
          <Label className="text-white/80">Registros por página</Label>
          <Input
            type="number"
            min={5}
            max={100}
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#E0E0E0' }}
          />
          <p className="text-white/60 text-sm">Los filtros del sistema mantienen este límite de paginación.</p>
        </div>

        <div className="space-y-3 p-6 rounded-lg border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white/80">Alertas de inventario</Label>
              <p className="text-white/60 text-sm">Activa recordatorios de stock bajo y servicios activos.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Guardar preferencias</Button>
      </div>
    </div>
  );
}
