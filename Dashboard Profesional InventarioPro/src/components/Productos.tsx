import { useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface ProductosProps {
  filter?: any;
  onNavigate: (section: string, filter?: any) => void;
}

export function Productos({ filter }: ProductosProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const productos = [
    { id: 1, nombre: 'Laptop Dell XPS 15', codigo: 'LAP-001', stock: 12, umbral: 5, costoPromedio: 24500, estado: 'normal' },
    { id: 2, nombre: 'Mouse Logitech MX Master', codigo: 'MOU-001', stock: 45, umbral: 15, costoPromedio: 1850, estado: 'normal' },
    { id: 3, nombre: 'Teclado Mecánico Keychron', codigo: 'TEC-001', stock: 8, umbral: 10, costoPromedio: 2100, estado: 'bajo' },
    { id: 4, nombre: 'Monitor LG UltraWide 34"', codigo: 'MON-001', stock: 3, umbral: 8, costoPromedio: 8900, estado: 'bajo' },
    { id: 5, nombre: 'Webcam Logitech C920', codigo: 'WEB-001', stock: 28, umbral: 12, costoPromedio: 1450, estado: 'normal' },
    { id: 6, nombre: 'Audífonos Sony WH-1000XM5', codigo: 'AUD-001', stock: 5, umbral: 10, costoPromedio: 6200, estado: 'bajo' },
    { id: 7, nombre: 'Tablet Samsung Galaxy Tab', codigo: 'TAB-001', stock: 15, umbral: 8, costoPromedio: 9800, estado: 'normal' },
    { id: 8, nombre: 'Router TP-Link AX6000', codigo: 'ROU-001', stock: 2, umbral: 5, costoPromedio: 3450, estado: 'bajo' },
  ];

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>
            Gestión de Productos
          </h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Administra tu inventario de productos
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200"
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
          <Plus className="w-5 h-5" />
          Agregar producto
        </button>
      </div>

      {/* Search and Filters */}
      <div 
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: '#A8A8A8' }}
            />
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3A86FF';
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.05)';
              }}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
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
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Stock Actual
                </th>
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Umbral
                </th>
                <th className="text-right py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Costo Promedio
                </th>
                <th className="text-center py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr 
                  key={producto.id}
                  className="transition-all duration-200"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(58, 134, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {producto.estado === 'bajo' && (
                        <AlertCircle className="w-5 h-5" style={{ color: '#F87171' }} />
                      )}
                      <span style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                        {producto.nombre}
                      </span>
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
                      {producto.codigo}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span 
                      className="px-4 py-1 rounded-full inline-block"
                      style={{
                        background: producto.estado === 'bajo' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                        color: producto.estado === 'bajo' ? '#F87171' : '#4ADE80',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {producto.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    {producto.umbral}
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    ${producto.costoPromedio.toLocaleString()} MXN
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          background: 'rgba(58, 134, 255, 0.15)',
                          color: '#3A86FF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(58, 134, 255, 0.3)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(58, 134, 255, 0.15)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button 
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          background: 'rgba(248, 113, 113, 0.15)',
                          color: '#F87171'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent 
          className="max-w-2xl"
          style={{
            background: '#1C2541',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#E0E0E0'
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#E0E0E0', fontSize: '1.25rem' }}>
              Agregar Nuevo Producto
            </DialogTitle>
            <DialogDescription style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
              Llena los campos para agregar un nuevo producto a tu inventario.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Nombre del Producto</Label>
                <Input 
                  placeholder="Ej: Laptop Dell XPS 15"
                  style={{
                    background: 'rgba(58, 134, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E0E0E0'
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Código</Label>
                <Input 
                  placeholder="Ej: LAP-001"
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
                <Label style={{ color: '#A8A8A8' }}>Stock Inicial</Label>
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
                <Label style={{ color: '#A8A8A8' }}>Umbral Mínimo</Label>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Costo (MXN)</Label>
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
              
              <div className="space-y-2">
                <Label style={{ color: '#A8A8A8' }}>Precio Sugerido (MXN)</Label>
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
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#A8A8A8'
                }}
              >
                Cancelar
              </Button>
              
              <Button
                style={{
                  background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                  color: '#FFFFFF',
                  border: 'none'
                }}
              >
                Guardar Producto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}