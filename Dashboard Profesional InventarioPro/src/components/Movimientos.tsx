import { useState } from 'react';
import { Save, Calendar, Package, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface MovimientosProps {
  filter?: any;
}

export function Movimientos({ filter }: MovimientosProps) {
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>(
    filter?.filter === 'salidas' ? 'salida' : 'entrada'
  );

  const recentMovements = [
    { id: 1, producto: 'Laptop Dell XPS 15', tipo: 'Entrada', cantidad: 5, fecha: '07 Nov 2024 14:30', total: 122500 },
    { id: 2, producto: 'Mouse Logitech MX', tipo: 'Salida', cantidad: 12, fecha: '07 Nov 2024 11:20', total: 22200 },
    { id: 3, producto: 'Teclado Keychron', tipo: 'Entrada', cantidad: 8, fecha: '06 Nov 2024 16:45', total: 16800 },
    { id: 4, producto: 'Monitor LG UltraWide', tipo: 'Salida', cantidad: 3, fecha: '06 Nov 2024 09:15', total: 26700 },
    { id: 5, producto: 'Webcam Logitech', tipo: 'Entrada', cantidad: 15, fecha: '05 Nov 2024 13:50', total: 21750 },
    { id: 6, producto: 'Audífonos Sony', tipo: 'Salida', cantidad: 7, fecha: '05 Nov 2024 10:30', total: 43400 },
  ];

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div>
        <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>
          Registro de Movimientos
        </h2>
        <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Gestiona entradas y salidas de inventario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
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
              <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Nuevo Movimiento
              </h3>
              <p style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                Registra una entrada o salida de productos
              </p>
            </div>

            {/* Movement Type Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setTipoMovimiento('entrada')}
                className="flex-1 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  background: tipoMovimiento === 'entrada' 
                    ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)'
                    : 'rgba(74, 222, 128, 0.1)',
                  border: tipoMovimiento === 'entrada' 
                    ? '2px solid #4ADE80' 
                    : '2px solid rgba(74, 222, 128, 0.3)',
                  color: tipoMovimiento === 'entrada' ? '#FFFFFF' : '#4ADE80',
                  boxShadow: tipoMovimiento === 'entrada' 
                    ? '0 4px 12px rgba(74, 222, 128, 0.3)' 
                    : 'none'
                }}
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
                  background: tipoMovimiento === 'salida' 
                    ? 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
                    : 'rgba(248, 113, 113, 0.1)',
                  border: tipoMovimiento === 'salida' 
                    ? '2px solid #F87171' 
                    : '2px solid rgba(248, 113, 113, 0.3)',
                  color: tipoMovimiento === 'salida' ? '#FFFFFF' : '#F87171',
                  boxShadow: tipoMovimiento === 'salida' 
                    ? '0 4px 12px rgba(248, 113, 113, 0.3)' 
                    : 'none'
                }}
              >
                <ArrowDownCircle className="w-6 h-6" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>Salida</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Retirar stock</div>
                </div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Producto</Label>
                <Select>
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
                    <SelectItem value="laptop">Laptop Dell XPS 15</SelectItem>
                    <SelectItem value="mouse">Mouse Logitech MX Master</SelectItem>
                    <SelectItem value="teclado">Teclado Mecánico Keychron</SelectItem>
                    <SelectItem value="monitor">Monitor LG UltraWide 34"</SelectItem>
                    <SelectItem value="webcam">Webcam Logitech C920</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label style={{ color: '#A8A8A8' }}>Cantidad</Label>
                  <Input 
                    type="number"
                    placeholder="0"
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
                  <Calendar 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: '#A8A8A8' }}
                  />
                  <Input 
                    type="date"
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
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <div 
              className="p-4 rounded-lg"
              style={{
                background: tipoMovimiento === 'entrada' 
                  ? 'rgba(74, 222, 128, 0.1)' 
                  : 'rgba(248, 113, 113, 0.1)',
                border: tipoMovimiento === 'entrada'
                  ? '1px solid rgba(74, 222, 128, 0.3)'
                  : '1px solid rgba(248, 113, 113, 0.3)'
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                  Total del movimiento:
                </span>
                <span 
                  style={{ 
                    color: tipoMovimiento === 'entrada' ? '#4ADE80' : '#F87171',
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                >
                  $0.00 MXN
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
                fontSize: '1rem',
                fontWeight: 600
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
              <Save className="w-5 h-5" />
              Guardar Movimiento
            </button>
          </div>
        </div>

        {/* Recent Movements List */}
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '1rem' }}>
            Movimientos Recientes
          </h3>
          
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '600px' }}>
            {recentMovements.map((movement) => (
              <div
                key={movement.id}
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
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {movement.tipo === 'Entrada' ? (
                      <ArrowUpCircle className="w-5 h-5" style={{ color: '#4ADE80' }} />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5" style={{ color: '#F87171' }} />
                    )}
                    <span style={{ color: '#E0E0E0', fontSize: '0.875rem', fontWeight: 600 }}>
                      {movement.producto}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>
                      Cantidad:
                    </span>
                    <span style={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                      {movement.cantidad} unidades
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>
                      Total:
                    </span>
                    <span 
                      style={{ 
                        color: movement.tipo === 'Entrada' ? '#4ADE80' : '#F87171',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      ${movement.total.toLocaleString()} MXN
                    </span>
                  </div>
                  
                  <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {movement.fecha}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}