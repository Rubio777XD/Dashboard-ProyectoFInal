import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { apiFetch } from '../lib/api';

interface ProductosProps {
  filter?: any;
  onNavigate: (section: string, filter?: any) => void;
}

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  stock: number;
  low_threshold: number;
  avg_cost: number;
  suggested_price: number;
  is_low_stock: boolean;
  created_at: string;
}

interface ProductFormState {
  name: string;
  code: string;
  category: string;
  stock: string;
  low_threshold: string;
  avg_cost: string;
  suggested_price: string;
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return '$0.00 MXN';
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'consoles', label: 'Consolas' },
  { value: 'gaming_pcs', label: 'PCs gamer' },
  { value: 'peripherals', label: 'Periféricos' },
  { value: 'components', label: 'Componentes' },
  { value: 'accessories', label: 'Merch & accesorios' }
];

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const defaultFormState: ProductFormState = {
  name: '',
  code: '',
  category: CATEGORY_OPTIONS[0].value,
  stock: '',
  low_threshold: '',
  avg_cost: '',
  suggested_price: ''
};

export function Productos({ filter }: ProductosProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyLowStock, setOnlyLowStock] = useState(filter?.filter === 'bajo-stock');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (filter?.filter === 'bajo-stock') {
      setOnlyLowStock(true);
    }
  }, [filter]);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await apiFetch<Product[]>('/api/products/');
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedProduct(null);
    setFormState(defaultFormState);
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setFormState({
      name: product.name,
      code: product.code,
      category: product.category,
      stock: String(product.stock),
      low_threshold: String(product.low_threshold),
      avg_cost: String(product.avg_cost),
      suggested_price: String(product.suggested_price)
    });
    setShowModal(true);
  }

  async function handleDelete(product: Product) {
    try {
      await apiFetch<void>(`/api/products/${product.id}/`, { method: 'DELETE', skipJson: true });
      toast.success('Producto eliminado correctamente');
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el producto');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formState.name || !formState.code) {
      toast.error('Nombre y código son obligatorios');
      return;
    }

    const payload = {
      name: formState.name,
      code: formState.code,
      category: formState.category,
      stock: formState.stock || '0',
      low_threshold: formState.low_threshold || '0',
      avg_cost: formState.avg_cost || '0',
      suggested_price: formState.suggested_price || '0'
    };

    try {
      if (selectedProduct) {
        await apiFetch<Product>(`/api/products/${selectedProduct.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        toast.success('Producto actualizado');
      } else {
        await apiFetch<Product>('/api/products/', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        toast.success('Producto creado');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el producto');
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (onlyLowStock && !product.is_low_stock) {
        return false;
      }
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm, onlyLowStock, categoryFilter]);

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Gestión de Productos</h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Administra tu inventario de productos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
          }}
        >
          <Plus className="w-5 h-5" />
          Agregar producto
        </button>
      </div>

      <div
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#A8A8A8' }} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0',
                outline: 'none'
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="sm:w-56"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              >
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: '#1C2541',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              >
                <SelectItem value="all">
                  Todas las categorías
                </SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={onlyLowStock ? 'default' : 'outline'}
              onClick={() => setOnlyLowStock((value) => !value)}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {onlyLowStock ? 'Mostrando bajo stock' : 'Solo bajo stock'}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th className="text-left py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Producto
                </th>
                <th className="text-left py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Código
                </th>
                <th className="text-left py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Categoría
                </th>
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Stock Actual
                </th>
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Umbral
                </th>
                <th className="text-right py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Costo Promedio
                </th>
                <th className="text-right py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Precio sugerido
                </th>
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="transition-all duration-200"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {product.is_low_stock && <AlertCircle className="w-5 h-5" style={{ color: '#F87171' }} />}
                      <span style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1 rounded"
                      style={{
                        background: 'rgba(76, 201, 240, 0.15)',
                        color: '#4CC9F0',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {product.code}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(58, 134, 255, 0.12)',
                        color: '#A5B4FC',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.02em'
                      }}
                    >
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className="px-4 py-1 rounded-full inline-block"
                      style={{
                        background: product.is_low_stock
                          ? 'rgba(248, 113, 113, 0.2)'
                          : 'rgba(74, 222, 128, 0.2)',
                        color: product.is_low_stock ? '#F87171' : '#4ADE80',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    {product.low_threshold}
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {formatCurrency(product.avg_cost)}
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {formatCurrency(product.suggested_price)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          background: 'rgba(58, 134, 255, 0.15)',
                          color: '#3A86FF'
                        }}
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          background: 'rgba(248, 113, 113, 0.15)',
                          color: '#F87171'
                        }}
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && !loading && (
            <p className="text-center py-6 text-slate-400">No se encontraron productos con los filtros actuales.</p>
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{
            background: '#1C2541',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#E0E0E0'
          }}
        >
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>Completa los datos para guardar el producto.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formState.name}
                onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
                placeholder="Nombre del producto"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={formState.code}
                onChange={(event) => setFormState((state) => ({ ...state, code: event.target.value }))}
                placeholder="Código único"
                style={{
                  background: 'rgba(58, 134, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E0E0E0'
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formState.category}
                onValueChange={(value) => setFormState((state) => ({ ...state, category: value }))}
              >
                <SelectTrigger
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                >
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: '#1C2541',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock inicial</Label>
                <Input
                  type="number"
                  value={formState.stock}
                  onChange={(event) => setFormState((state) => ({ ...state, stock: event.target.value }))}
                  min="0"
                  step="0.01"
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Umbral bajo stock</Label>
                <Input
                  type="number"
                  value={formState.low_threshold}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, low_threshold: event.target.value }))
                  }
                  min="0"
                  step="0.01"
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Costo promedio (MXN)</Label>
                <Input
                  type="number"
                  value={formState.avg_cost}
                  onChange={(event) => setFormState((state) => ({ ...state, avg_cost: event.target.value }))}
                  min="0"
                  step="0.01"
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio sugerido (MXN)</Label>
                <Input
                  type="number"
                  value={formState.suggested_price}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, suggested_price: event.target.value }))
                  }
                  min="0"
                  step="0.01"
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
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
