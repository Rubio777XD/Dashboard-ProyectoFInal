import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { apiFetch } from '../lib/api';

interface Service {
  id: number;
  name: string;
  code: string;
  category: string;
  description: string;
  price: number;
  status: string;
}

const CATEGORY_OPTIONS = [
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'installation', label: 'Instalación' },
  { value: 'warranty', label: 'Garantía' },
  { value: 'other', label: 'Otro' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' }
];

export function Servicios() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    code: '',
    category: CATEGORY_OPTIONS[0].value,
    description: '',
    price: '0',
    status: STATUS_OPTIONS[0].value,
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('name', search);
      if (statusFilter) params.set('status', statusFilter);
      const endpoint = `/api/services/${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiFetch<Service[]>(endpoint);
      setServices(data.map((item) => ({ ...item, price: Number(item.price) })));
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los servicios');
    }
  }

  function openModal(service?: Service) {
    if (service) {
      setEditing(service);
      setFormState({
        name: service.name,
        code: service.code,
        category: service.category,
        description: service.description,
        price: String(service.price),
        status: service.status,
      });
    } else {
      setEditing(null);
      setFormState({
        name: '',
        code: '',
        category: CATEGORY_OPTIONS[0].value,
        description: '',
        price: '0',
        status: STATUS_OPTIONS[0].value,
      });
    }
    setShowModal(true);
  }

  async function saveService(event: React.FormEvent) {
    event.preventDefault();
    try {
      const payload = { ...formState };
      if (editing) {
        await apiFetch(`/api/services/${editing.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Servicio actualizado');
      } else {
        await apiFetch('/api/services/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Servicio creado');
      }
      setShowModal(false);
      loadServices();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el servicio');
    }
  }

  async function deleteService(service: Service) {
    try {
      await apiFetch(`/api/services/${service.id}/`, { method: 'DELETE', skipJson: true });
      toast.success('Servicio eliminado');
      loadServices();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el servicio');
    }
  }

  const filteredServices = useMemo(() => {
    const term = search.toLowerCase();
    return services.filter((service) => {
      if (statusFilter && service.status !== statusFilter) return false;
      if (!term) return true;
      return service.name.toLowerCase().includes(term) || service.code.toLowerCase().includes(term);
    });
  }, [services, search, statusFilter]);

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Servicios</h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Catálogo de servicios con filtros y CRUD básico
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)', color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-lg border border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nombre o código"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={loadServices}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#E0E0E0', paddingLeft: '2.5rem' }}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); }}>
          <SelectTrigger className="w-48" style={{ background: 'rgba(255,255,255,0.05)', color: '#E0E0E0' }}>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={loadServices}>Aplicar filtros</Button>
      </div>

      <div className="overflow-x-auto bg-white/5 rounded-lg border border-white/10">
        <table className="w-full text-sm" style={{ color: '#E0E0E0' }}>
          <thead className="text-left bg-white/10">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-white/60 text-xs">{service.code}</div>
                </td>
                <td className="px-4 py-3">{CATEGORY_OPTIONS.find((c) => c.value === service.category)?.label ?? service.category}</td>
                <td className="px-4 py-3">${service.price.toFixed(2)} MXN</td>
                <td className="px-4 py-3">
                  {service.status === 'active' ? (
                    <span className="inline-flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /> Activo</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-orange-300"><XCircle className="w-4 h-4" /> Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(service)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteService(service)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-white/60">
                  No hay servicios con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1C2541] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
            <DialogDescription className="text-white/60">
              Define la información básica del servicio ofertado.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={saveService}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  required
                  value={formState.code}
                  onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState({ ...formState, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Precio (MXN)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formState.status}
                onValueChange={(value) => setFormState({ ...formState, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
