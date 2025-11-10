import { useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Scale, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface DashboardProps {
  onNavigate: (section: string, filter?: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [chartView, setChartView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedPeriod, setSelectedPeriod] = useState('Semana');

  // Mock data for charts
  const chartData = [
    { date: '01 Nov', ingresos: 8500, egresos: 4200 },
    { date: '02 Nov', ingresos: 9200, egresos: 5100 },
    { date: '03 Nov', ingresos: 11400, egresos: 4800 },
    { date: '04 Nov', ingresos: 8900, egresos: 6300 },
    { date: '05 Nov', ingresos: 12300, egresos: 5500 },
    { date: '06 Nov', ingresos: 10800, egresos: 4900 },
    { date: '07 Nov', ingresos: 13200, egresos: 6100 },
  ];

  // Mock data for recent movements
  const recentMovements = [
    { id: 1, producto: 'Laptop Dell XPS 15', tipo: 'Entrada', cantidad: 5, precioUnitario: 24500, fecha: '07 Nov 2024', total: 122500 },
    { id: 2, producto: 'Mouse Logitech MX Master', tipo: 'Salida', cantidad: 12, precioUnitario: 1850, fecha: '07 Nov 2024', total: 22200 },
    { id: 3, producto: 'Teclado Mecánico Keychron', tipo: 'Entrada', cantidad: 8, precioUnitario: 2100, fecha: '06 Nov 2024', total: 16800 },
    { id: 4, producto: 'Monitor LG UltraWide', tipo: 'Salida', cantidad: 3, precioUnitario: 8900, fecha: '06 Nov 2024', total: 26700 },
    { id: 5, producto: 'Webcam Logitech C920', tipo: 'Entrada', cantidad: 15, precioUnitario: 1450, fecha: '05 Nov 2024', total: 21750 },
  ];

  const metrics = [
    {
      id: 1,
      title: 'Ingresos',
      value: '$74,300 MXN',
      change: '+12%',
      icon: DollarSign,
      color: '#4ADE80',
      bgGradient: 'radial-gradient(circle at top right, rgba(74, 222, 128, 0.15) 0%, transparent 70%)'
    },
    {
      id: 2,
      title: 'Egresos',
      value: '$36,800 MXN',
      change: '+8%',
      icon: TrendingDown,
      color: '#F87171',
      bgGradient: 'radial-gradient(circle at top right, rgba(248, 113, 113, 0.15) 0%, transparent 70%)'
    },
    {
      id: 3,
      title: 'Balance',
      value: '$37,500 MXN',
      change: '+15%',
      icon: Scale,
      color: '#4CC9F0',
      bgGradient: 'radial-gradient(circle at top right, rgba(76, 201, 240, 0.15) 0%, transparent 70%)'
    },
    {
      id: 4,
      title: 'Bajo Stock',
      value: '5 productos',
      change: '-2 productos',
      icon: AlertTriangle,
      color: '#FBBF24',
      bgGradient: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.15) 0%, transparent 70%)'
    }
  ];

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>
            Dashboard
          </h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Vista general de tu inventario
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {['Hoy', 'Semana', 'Mes', 'Rango'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                background: selectedPeriod === period
                  ? 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)'
                  : 'rgba(58, 134, 255, 0.1)',
                color: selectedPeriod === period ? '#FFFFFF' : '#A8A8A8',
                fontSize: '0.875rem',
                boxShadow: selectedPeriod === period 
                  ? '0 4px 12px rgba(58, 134, 255, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
                  e.currentTarget.style.color = '#E0E0E0';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
                  e.currentTarget.style.color = '#A8A8A8';
                }
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="rounded-xl p-6 transition-all duration-300 cursor-pointer border"
              style={{
                background: '#1C2541',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${metric.color}40`;
                e.currentTarget.style.borderColor = metric.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{ background: metric.bgGradient, position: 'absolute', inset: 0 }} />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: `${metric.color}20`,
                      color: metric.color
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span 
                    className="px-2 py-1 rounded"
                    style={{ 
                      background: metric.change.includes('+') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                      color: metric.change.includes('+') ? '#4ADE80' : '#F87171',
                      fontSize: '0.75rem'
                    }}
                  >
                    {metric.change}
                  </span>
                </div>
                
                <div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    {metric.title}
                  </div>
                  <div style={{ color: '#E0E0E0', fontSize: '1.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {metric.value}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (metric.id === 1) {
                      onNavigate('reportes', { view: 'ingresos' });
                    } else if (metric.id === 2) {
                      onNavigate('reportes', { view: 'egresos' });
                    } else if (metric.id === 3) {
                      onNavigate('reportes', { view: 'balance' });
                    } else if (metric.id === 4) {
                      onNavigate('productos', { filter: 'bajo-stock' });
                    }
                  }}
                  className="w-full py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: `${metric.color}15`,
                    color: metric.color,
                    fontSize: '0.875rem',
                    border: `1px solid ${metric.color}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${metric.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${metric.color}15`;
                  }}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div 
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>Movimientos de Inventario</h3>
            <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Seguimiento de ingresos y egresos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {(['day', 'week', 'month'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className="px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: chartView === view ? '#3A86FF' : 'rgba(58, 134, 255, 0.1)',
                  color: chartView === view ? '#FFFFFF' : '#A8A8A8',
                  fontSize: '0.875rem'
                }}
              >
                {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#A8A8A8"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis 
              stroke="#A8A8A8"
              style={{ fontSize: '0.75rem' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#1C2541', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#E0E0E0'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#E0E0E0' }}
            />
            <Area 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#4ADE80" 
              strokeWidth={2}
              fill="url(#colorIngresos)" 
              name="Ingresos (MXN)"
            />
            <Area 
              type="monotone" 
              dataKey="egresos" 
              stroke="#F87171" 
              strokeWidth={2}
              fill="url(#colorEgresos)" 
              name="Egresos (MXN)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '1rem' }}>
            Nivel de Inventario
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(58, 134, 255, 0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gaugeGradient1)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gaugeGradient1">
                    <stop offset="0%" stopColor="#3A86FF" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ color: '#E0E0E0', fontSize: '2rem', fontWeight: 600 }}>75%</span>
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>Capacidad</span>
              </div>
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
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '1rem' }}>
            Margen de Utilidad Promedio
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(76, 201, 240, 0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gaugeGradient2)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="37.68"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gaugeGradient2">
                    <stop offset="0%" stopColor="#4CC9F0" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ color: '#E0E0E0', fontSize: '2rem', fontWeight: 600 }}>85%</span>
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>Utilidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div 
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>Últimos Movimientos</h3>
            <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Historial reciente de transacciones
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
              style={{
                background: 'rgba(58, 134, 255, 0.1)',
                color: '#A8A8A8',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
                e.currentTarget.style.color = '#E0E0E0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
                e.currentTarget.style.color = '#A8A8A8';
              }}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            
            <button 
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
              }}
            >
              Ver todos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th className="text-left py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Producto
                </th>
                <th className="text-left py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Tipo
                </th>
                <th className="text-right py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Cantidad
                </th>
                <th className="text-right py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Precio Unit.
                </th>
                <th className="text-left py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Fecha
                </th>
                <th className="text-right py-3 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.map((movement) => (
                <tr 
                  key={movement.id}
                  className="transition-all duration-200"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(58, 134, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="py-4 px-4" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {movement.producto}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full"
                      style={{
                        background: movement.tipo === 'Entrada' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: movement.tipo === 'Entrada' ? '#4ADE80' : '#F87171',
                        fontSize: '0.75rem'
                      }}
                    >
                      {movement.tipo}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {movement.cantidad}
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    ${movement.precioUnitario.toLocaleString()}
                  </td>
                  <td className="py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    {movement.fecha}
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem', fontWeight: 600 }}>
                    ${movement.total.toLocaleString()} MXN
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}