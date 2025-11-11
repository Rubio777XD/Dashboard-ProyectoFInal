import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Save, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { apiFetch } from '../lib/api';

interface MovimientosProps {
  filter?: any;
}

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
}

interface Movement {
  id: number;
  product: number;
  product_detail: { name: string; code: string; category?: string };
  movement_type: 'IN' | 'OUT';
  quantity: number;
  unit_price: number;
  date: string;
  note: string;
}

const typeMap: Record<'entrada' | 'salida', 'IN' | 'OUT'> = {
  entrada: 'IN',
  salida: 'OUT'
};

const CATEGORY_LABELS: Record<string, string> = {
  consoles: 'Consolas',
  gaming_pcs: 'PCs gamer',
  peripherals: 'Periféricos',
  components: 'Componentes',
  accessories: 'Merch & accesorios'
};

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return '$0.00 MXN';
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function Movimientos({ filter }: MovimientosProps) {
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>(
    filter?.filter === 'salidas' ? 'salida' : 'entrada'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productsResponse, movementsResponse] = await Promise.all([
          apiFetch<Product[]>('/api/products/'),
          apiFetch<Movement[] | { results: Movement[] }>('/api/movements/')
        ]);
        const movementList = Array.isArray(movementsResponse)
          ? movementsResponse
          : movementsResponse?.results ?? [];
        setProducts(productsResponse);
        setMovements(movementList);
        if (!selectedProduct && productsResponse.length > 0) {
          setSelectedProduct(String(productsResponse[0].id));
        }
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los datos de movimientos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filter?.filter === 'salidas') {
      setTipoMovimiento('salida');
    } else if (filter?.filter === 'entradas') {
      setTipoMovimiento('entrada');
    }
  }, [filter]);

  const total = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  }, [quantity, unitPrice]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) {
      toast.error('Selecciona un producto');
      return;
    }
    if (!quantity || !unitPrice) {
      toast.error('Ingresa cantidad y precio unitario');
      return;
    }

    try {
      const payload = {
        product: Number(selectedProduct),
        movement_type: typeMap[tipoMovimiento],
        quantity,
        unit_price: unitPrice,
        date: movementDate,
        note
      };
      await apiFetch<Movement>('/api/movements/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast.success('Movimiento registrado correctamente');
      const updatedMovements = await apiFetch<Movement[] | { results: Movement[] }>('/api/movements/');
      const movementList = Array.isArray(updatedMovements)
        ? updatedMovements
        : updatedMovements?.results ?? [];
      setMovements(movementList);
      setQuantity('');
      setUnitPrice('');
      setNote('');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo registrar el movimiento');
    }
  }

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div>
        <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Registro de Movimientos</h2>
        <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Gestiona entradas y salidas de inventario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="space-y-6">
            <div>
              <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Nuevo Movimiento</h3>
              <p style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                Registra una entrada o salida de productos
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTipoMovimiento('entrada')}
                className="flex-1 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  background:
                    tipoMovimiento === 'entrada'
                      ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)'
                      : 'rgba(74, 222, 128, 0.1)',
                  border:
                    tipoMovimiento === 'entrada'
                      ? '2px solid #4ADE80'
                      : '2px solid rgba(74, 222, 128, 0.3)',
                  color: tipoMovimiento === 'entrada' ? '#FFFFFF' : '#4ADE80',
                  boxShadow:
                    tipoMovimiento === 'entrada'
                      ? '0 4px 12px rgba(74, 222, 128, 0.3)'
                      : 'none'
                }}
                type="button"
              >
                <ArrowUpCircle className="w-6 h-6" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>Entrada</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Agregar stock</div>
                </div>
              </button>

              <button
                onClick={() => setTipoMovimiento('salida')}
                className="flex-1 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  background:
                    tipoMovimiento === 'salida'
                      ? 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
                      : 'rgba(248, 113, 113, 0.1)',
                  border:
                    tipoMovimiento === 'salida'
                      ? '2px solid #F87171'
                      : '2px solid rgba(248, 113, 113, 0.3)',
                  color: tipoMovimiento === 'salida' ? '#FFFFFF' : '#F87171',
                  boxShadow:
                    tipoMovimiento === 'salida'
                      ? '0 4px 12px rgba(248, 113, 113, 0.3)'
                      : 'none'
                }}
                type="button"
              >
                <ArrowDownCircle className="w-6 h-6" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>Salida</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Retirar stock</div>
                </div>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loading || products.length === 0}>
                  <SelectTrigger
                    style={{
                      background: 'rgba(58, 134, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E0E0E0'
                    }}
                  >
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: '#1C2541',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E0E0E0'
                    }}
                  >
                    {products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs opacity-70">
                            {product.code} • {CATEGORY_LABELS[product.category] ?? product.category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label style={{ color: '#A8A8A8' }}>Cantidad</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
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
                  <Label style={{ color: '#A8A8A8' }}>Precio Unitario (MXN)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(event) => setUnitPrice(event.target.value)}
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

              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#A8A8A8' }} />
                  <Input
                    type="date"
                    value={movementDate}
                    onChange={(event) => setMovementDate(event.target.value)}
                    style={{
                      background: 'rgba(58, 134, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E0E0E0',
                      paddingLeft: '2.5rem'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Nota (opcional)</Label>
                <Textarea
                  placeholder="Agrega comentarios o detalles adicionales..."
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0',
                    resize: 'none'
                  }}
                />
              </div>

              <div className="rounded-lg p-4" style={{ background: 'rgba(58, 134, 255, 0.08)' }}>
                <div className="flex items-center justify-between" style={{ color: '#E0E0E0' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total estimado</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatCurrency(total)}</div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
                    }}
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" />
                    Registrar
                  </button>
                </div>
              </div>
            </form>
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
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '1rem' }}>Historial reciente</h3>
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {movements.map((movement) => {
              const isEntrada = movement.movement_type === 'IN';
              const totalMovement = movement.quantity * movement.unit_price;
              const formattedDate = new Date(movement.date).toLocaleString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              return (
                <div
                  key={movement.id}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ color: '#E0E0E0', fontWeight: 600 }}>
                        {movement.product_detail?.name ?? 'Producto'}
                      </div>
                      <div style={{ color: '#7F8EA3', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {movement.product_detail?.code ?? '—'} ·{' '}
                        {CATEGORY_LABELS[movement.product_detail?.category ?? ''] ?? 'Sin categoría'}
                      </div>
                      <div style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>{formattedDate}</div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: isEntrada ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: isEntrada ? '#4ADE80' : '#F87171'
                      }}
                    >
                      {isEntrada ? 'Entrada' : 'Salida'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between" style={{ color: '#A8A8A8' }}>
                    <div>
                      <div>Cantidad: {movement.quantity}</div>
                      <div>Precio unitario: {formatCurrency(movement.unit_price)}</div>
                    </div>
                    <div style={{ color: '#E0E0E0', fontWeight: 600 }}>{formatCurrency(totalMovement)}</div>
                  </div>
                  {movement.note && (
                    <p style={{ color: '#7F8EA3', fontSize: '0.75rem', marginTop: '0.5rem' }}>{movement.note}</p>
                  )}
                </div>
              );
            })}
            {movements.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No hay movimientos registrados todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
