import { useState } from 'react';
import { Download, Calendar, TrendingUp, DollarSign, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input } from './ui/input';

interface ReportesProps {
  filter?: any;
}

export function Reportes({ filter }: ReportesProps) {
  const [fechaInicio, setFechaInicio] = useState('2024-11-01');
  const [fechaFin, setFechaFin] = useState('2024-11-07');

  const chartData = [
    { mes: 'Ene', ingresos: 85000, egresos: 42000 },
    { mes: 'Feb', ingresos: 92000, egresos: 51000 },
    { mes: 'Mar', ingresos: 114000, egresos: 48000 },
    { mes: 'Abr', ingresos: 89000, egresos: 63000 },
    { mes: 'May', ingresos: 123000, egresos: 55000 },
    { mes: 'Jun', ingresos: 108000, egresos: 49000 },
    { mes: 'Jul', ingresos: 132000, egresos: 61000 },
  ];

  const stats = [
    {
      id: 1,
      title: 'Total Ingresos',
      value: '$743,000 MXN',
      change: '+18.2%',
      icon: TrendingUp,
      color: '#4ADE80'
    },
    {
      id: 2,
      title: 'Total Egresos',
      value: '$369,000 MXN',
      change: '+12.5%',
      icon: ArrowUpDown,
      color: '#F87171'
    },
    {
      id: 3,
      title: 'Balance Neto',
      value: '$374,000 MXN',
      change: '+24.8%',
      icon: DollarSign,
      color: '#4CC9F0'
    },
    {
      id: 4,
      title: 'Conversión USD',
      value: '$21,350 USD',
      change: 'TC: $17.50',
      icon: DollarSign,
      color: '#FBBF24'
    }
  ];

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>
            Reportes y Análisis
          </h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Visualiza el desempeño de tu inventario
          </p>
        </div>
        
        <button
          className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200"
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
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Date Range Selector */}
      <div 
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" style={{ color: '#E0E0E0' }}>
            <Calendar className="w-5 h-5" style={{ color: '#3A86FF' }} />
            <span>Rango de fechas:</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Input 
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
            <span style={{ color: '#A8A8A8' }}>hasta</span>
            <Input 
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>
          
          <button
            className="px-6 py-2 rounded-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
            }}
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="rounded-xl p-6 border transition-all duration-300"
              style={{
                background: '#1C2541',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}40`;
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div 
                style={{ 
                  background: `radial-gradient(circle at top right, ${stat.color}20 0%, transparent 70%)`,
                  position: 'absolute',
                  inset: 0
                }}
              />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: `${stat.color}20`,
                      color: stat.color
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span 
                    className="px-2 py-1 rounded"
                    style={{ 
                      background: stat.change.includes('+') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(76, 201, 240, 0.2)',
                      color: stat.change.includes('+') ? '#4ADE80' : '#4CC9F0',
                      fontSize: '0.75rem'
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
                
                <div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                    {stat.title}
                  </div>
                  <div style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <div 
        className="rounded-xl p-6 border"
        style={{
          background: '#1C2541',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="mb-6">
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>
            Comparativa Ingresos vs Egresos
          </h3>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Análisis mensual del flujo de efectivo
          </p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
              <linearGradient id="barEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="mes" 
              stroke="#A8A8A8"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis 
              stroke="#A8A8A8"
              style={{ fontSize: '0.875rem' }}
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
            <Bar 
              dataKey="ingresos" 
              fill="url(#barIngresos)"
              radius={[8, 8, 0, 0]}
              name="Ingresos (MXN)"
            />
            <Bar 
              dataKey="egresos" 
              fill="url(#barEgresos)"
              radius={[8, 8, 0, 0]}
              name="Egresos (MXN)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h4 style={{ color: '#E0E0E0', fontSize: '1rem', marginBottom: '1rem' }}>
            Top 5 Productos Vendidos
          </h4>
          <div className="space-y-3">
            {[
              { nombre: 'Laptop Dell XPS 15', cantidad: 47, monto: 1151500 },
              { nombre: 'Monitor LG UltraWide', cantidad: 38, monto: 338200 },
              { nombre: 'Teclado Keychron', cantidad: 65, monto: 136500 },
              { nombre: 'Mouse Logitech MX', cantidad: 89, monto: 164650 },
              { nombre: 'Webcam Logitech', cantidad: 72, monto: 104400 },
            ].map((producto, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(58, 134, 255, 0.05)' }}
              >
                <div>
                  <div style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                    {producto.nombre}
                  </div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>
                    {producto.cantidad} unidades
                  </div>
                </div>
                <div style={{ color: '#4ADE80', fontSize: '0.875rem', fontWeight: 600 }}>
                  ${producto.monto.toLocaleString()}
                </div>
              </div>
            ))}
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
          <h4 style={{ color: '#E0E0E0', fontSize: '1rem', marginBottom: '1rem' }}>
            Métricas de Rendimiento
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Margen promedio', value: '51.2%', color: '#4ADE80' },
              { label: 'Rotación de inventario', value: '8.4x', color: '#4CC9F0' },
              { label: 'Productos activos', value: '247', color: '#3A86FF' },
              { label: 'Valor total inventario', value: '$2.1M', color: '#FBBF24' },
            ].map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                  {metric.label}
                </span>
                <span 
                  style={{ 
                    color: metric.color,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {metric.value}
                </span>
              </div>
            ))}
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
          <h4 style={{ color: '#E0E0E0', fontSize: '1rem', marginBottom: '1rem' }}>
            Resumen Semanal
          </h4>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)'
              }}
            >
              <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                Ingresos esta semana
              </div>
              <div style={{ color: '#4ADE80', fontSize: '1.5rem', fontWeight: 600 }}>
                $132,400
              </div>
              <div style={{ color: '#4ADE80', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                ↑ 18% vs semana anterior
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)'
              }}
            >
              <div style={{ color: '#A8A8A8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                Egresos esta semana
              </div>
              <div style={{ color: '#F87171', fontSize: '1.5rem', fontWeight: 600 }}>
                $61,200
              </div>
              <div style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                ↑ 12% vs semana anterior
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}