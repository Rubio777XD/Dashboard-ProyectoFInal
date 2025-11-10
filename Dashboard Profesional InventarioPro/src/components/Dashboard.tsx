import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingDown, Scale, AlertTriangle, Filter } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { apiFetch } from '../lib/api';

interface DashboardProps {
  onNavigate: (section: string, filter?: any) => void;
}

interface DashboardResponse {
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
  low_stock_count: number;
  usd_rate: number;
  ingresos_usd: number;
  egresos_usd: number;
  balance_usd: number;
}

interface ReportPoint {
  date: string;
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
}

interface ReportsResponse {
  series: ReportPoint[];
  range: { from: string; to: string };
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
  ingresos_usd: number;
  egresos_usd: number;
  balance_usd: number;
  usd_rate: number;
}

interface MovementResponse {
  id: number;
  product_detail: { name: string };
  movement_type: 'IN' | 'OUT';
  quantity: number;
  unit_price: number;
  date: string;
}

const circumference = 2 * Math.PI * 40;

const periodMap: Record<string, { view: 'day' | 'week' | 'month'; days: number }> = {
  Hoy: { view: 'day', days: 0 },
  Semana: { view: 'week', days: 6 },
  Mes: { view: 'month', days: 29 },
  Rango: { view: 'month', days: 89 }
};

function formatCurrency(value: number, currency: 'MXN' | 'USD' = 'MXN') {
  if (!Number.isFinite(value)) {
    return currency === 'USD' ? '$0.00 USD' : '$0.00 MXN';
  }
  return value.toLocaleString('es-MX', { style: 'currency', currency });
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('es-MX', { month: 'short', day: '2-digit' });
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'Hoy' | 'Semana' | 'Mes' | 'Rango'>('Semana');
  const [chartView, setChartView] = useState<'day' | 'week' | 'month'>(periodMap['Semana'].view);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [reportData, setReportData] = useState<ReportsResponse | null>(null);
  const [recentMovements, setRecentMovements] = useState<MovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashboardResponse, movementResponse] = await Promise.all([
          apiFetch<DashboardResponse>('/api/dashboard/'),
          apiFetch<MovementResponse[] | { results: MovementResponse[] }>(
            '/api/movements/?page_size=10'
          )
        ]);
        const movementList = Array.isArray(movementResponse)
          ? movementResponse
          : movementResponse?.results ?? [];
        setDashboardData(dashboardResponse);
        setRecentMovements(movementList.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadReport(period: 'Hoy' | 'Semana' | 'Mes' | 'Rango') {
      try {
        const { days, view } = periodMap[period];
        setChartView(view);
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - days);
        const params = new URLSearchParams({
          from: start.toISOString().slice(0, 10),
          to: end.toISOString().slice(0, 10)
        });
        const data = await apiFetch<ReportsResponse>(`/api/reports/?${params.toString()}`);
        setReportData(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el reporte');
      }
    }

    loadReport(selectedPeriod);
  }, [selectedPeriod]);

  const chartData = useMemo(() => {
    if (!reportData) return [];
    return reportData.series.map((point) => ({
      date: formatDateLabel(point.date),
      ingresos: point.ingresos_mxn,
      egresos: point.egresos_mxn,
      balance: point.balance_mxn
    }));
  }, [reportData]);

  const capacityPercent = useMemo(() => {
    if (!dashboardData) return 0;
    const penalty = Math.min(100, (dashboardData.low_stock_count || 0) * 5);
    return Math.max(0, 100 - penalty);
  }, [dashboardData]);

  const marginPercent = useMemo(() => {
    if (!dashboardData || dashboardData.ingresos_mxn === 0) return 0;
    return Math.max(0, Math.min(100, (dashboardData.balance_mxn / dashboardData.ingresos_mxn) * 100));
  }, [dashboardData]);

  const metrics = useMemo(() => {
    if (!dashboardData) {
      return [];
    }
    return [
      {
        id: 1,
        title: 'Ingresos',
        value: formatCurrency(dashboardData.ingresos_mxn, 'MXN'),
        change: `${formatCurrency(dashboardData.ingresos_usd, 'USD')} USD`,
        icon: DollarSign,
        color: '#4ADE80',
        bgGradient: 'radial-gradient(circle at top right, rgba(74, 222, 128, 0.15) 0%, transparent 70%)'
      },
      {
        id: 2,
        title: 'Egresos',
        value: formatCurrency(dashboardData.egresos_mxn, 'MXN'),
        change: `${formatCurrency(dashboardData.egresos_usd, 'USD')} USD`,
        icon: TrendingDown,
        color: '#F87171',
        bgGradient: 'radial-gradient(circle at top right, rgba(248, 113, 113, 0.15) 0%, transparent 70%)'
      },
      {
        id: 3,
        title: 'Balance',
        value: formatCurrency(dashboardData.balance_mxn, 'MXN'),
        change: `${formatCurrency(dashboardData.balance_usd, 'USD')} USD`,
        icon: Scale,
        color: '#4CC9F0',
        bgGradient: 'radial-gradient(circle at top right, rgba(76, 201, 240, 0.15) 0%, transparent 70%)'
      },
      {
        id: 4,
        title: 'Bajo Stock',
        value: `${dashboardData.low_stock_count} productos`,
        change: `Tasa USD ${dashboardData.usd_rate.toFixed(4)}`,
        icon: AlertTriangle,
        color: '#FBBF24',
        bgGradient: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.15) 0%, transparent 70%)'
      }
    ];
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="p-8" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
        <p className="text-slate-300">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Dashboard</h2>
          <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Vista general de tu inventario
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['Hoy', 'Semana', 'Mes', 'Rango'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                background:
                  selectedPeriod === period
                    ? 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)'
                    : 'rgba(58, 134, 255, 0.1)',
                color: selectedPeriod === period ? '#FFFFFF' : '#A8A8A8',
                fontSize: '0.875rem',
                boxShadow:
                  selectedPeriod === period ? '0 4px 12px rgba(58, 134, 255, 0.3)' : 'none'
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

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
                      background:
                        metric.id === 4
                          ? 'rgba(251, 191, 36, 0.2)'
                          : metric.id === 2
                          ? 'rgba(248, 113, 113, 0.2)'
                          : 'rgba(74, 222, 128, 0.2)',
                      color: metric.color,
                      fontSize: '0.75rem'
                    }}
                  >
                    {metric.change}
                  </span>
                </div>

                <div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>{metric.title}</div>
                  <div
                    style={{ color: '#E0E0E0', fontSize: '1.75rem', fontWeight: 600, marginTop: '0.25rem' }}
                  >
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
                >
                  Ver detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
                onClick={() => {
                  const entry = Object.entries(periodMap).find(([, value]) => value.view === view);
                  if (entry) {
                    setSelectedPeriod(entry[0] as 'Hoy' | 'Semana' | 'Mes' | 'Rango');
                  } else {
                    setChartView(view);
                  }
                }}
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
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" stroke="#A8A8A8" style={{ fontSize: '0.75rem' }} />
            <YAxis stroke="#A8A8A8" style={{ fontSize: '0.75rem' }} />
            <Tooltip
              contentStyle={{
                background: '#1C2541',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#E0E0E0'
              }}
            />
            <Legend wrapperStyle={{ color: '#E0E0E0' }} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6 border"
          style={{
            background: '#1C2541',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem', marginBottom: '1rem' }}>Nivel de Inventario</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(58, 134, 255, 0.2)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gaugeGradient1)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - capacityPercent / 100)}
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
                <span style={{ color: '#E0E0E0', fontSize: '2rem', fontWeight: 600 }}>
                  {capacityPercent.toFixed(0)}%
                </span>
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
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(76, 201, 240, 0.2)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gaugeGradient2)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - marginPercent / 100)}
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
                <span style={{ color: '#E0E0E0', fontSize: '2rem', fontWeight: 600 }}>
                  {marginPercent.toFixed(0)}%
                </span>
                <span style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>Utilidad</span>
              </div>
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
              onClick={() => onNavigate('movimientos', { period: selectedPeriod })}
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
              onClick={() => onNavigate('movimientos')}
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
              {recentMovements.map((movement) => {
                const total = movement.quantity * movement.unit_price;
                const formattedDate = new Date(movement.date).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <tr
                    key={movement.id}
                    className="transition-all duration-200"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <td className="py-4 px-4" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                      {movement.product_detail?.name ?? 'Producto'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-3 py-1 rounded-full"
                        style={{
                          background:
                            movement.movement_type === 'IN'
                              ? 'rgba(74, 222, 128, 0.15)'
                              : 'rgba(248, 113, 113, 0.15)',
                          color: movement.movement_type === 'IN' ? '#4ADE80' : '#F87171',
                          fontSize: '0.75rem'
                        }}
                      >
                        {movement.movement_type === 'IN' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right" style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
                      {movement.quantity}
                    </td>
                    <td className="py-4 px-4 text-right" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                      {formatCurrency(movement.unit_price)}
                    </td>
                    <td className="py-4 px-4" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
                      {formattedDate}
                    </td>
                    <td
                      className="py-4 px-4 text-right"
                      style={{ color: '#E0E0E0', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
