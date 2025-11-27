import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingDown, Scale, AlertTriangle, Package, Boxes, Wallet, Filter } from 'lucide-react';
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
import { Input } from './ui/input';

interface DashboardProps {
  onNavigate: (section: string, filter?: any) => void;
}

interface DashboardResponse {
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
  low_stock_count: number;
  product_count: number;
  total_stock_units: number;
  inventory_value_mxn: number;
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

interface UsdRateResponse {
  rate: number;
}

interface MovementResponse {
  id: number;
  product_detail: { name: string; category?: string; code?: string };
  movement_type: 'IN' | 'OUT';
  quantity: number;
  unit_price: number;
  date: string;
}

interface MetricCard {
  key: string;
  title: string;
  value: string;
  description: string;
  icon: typeof DollarSign;
  color: string;
  bgGradient: string;
  actionLabel?: string;
  onAction?: () => void;
}

const circumference = 2 * Math.PI * 40;

const periodMap: Record<string, { view: 'day' | 'week' | 'month'; days: number }> = {
  Hoy: { view: 'day', days: 0 },
  Semana: { view: 'week', days: 6 },
  Mes: { view: 'month', days: 29 },
  Rango: { view: 'month', days: 89 }
};

const CATEGORY_LABELS: Record<string, string> = {
  consoles: 'Consolas',
  gaming_pcs: 'PCs gamer',
  peripherals: 'Periféricos',
  components: 'Componentes',
  accessories: 'Merch & accesorios'
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

function getDefaultRange(daysBack: number) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10)
  };
}

function isRangeValid(range: { from: string; to: string }) {
  return new Date(range.from) <= new Date(range.to);
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'Hoy' | 'Semana' | 'Mes' | 'Rango'>('Semana');
  const [customRange, setCustomRange] = useState(getDefaultRange(periodMap['Semana'].days));
  const [rangeDraft, setRangeDraft] = useState(getDefaultRange(periodMap['Semana'].days));
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [reportData, setReportData] = useState<ReportsResponse | null>(null);
  const [recentMovements, setRecentMovements] = useState<MovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  const activeRange = useMemo(() => {
    if (selectedPeriod === 'Rango') {
      return customRange;
    }
    const { days } = periodMap[selectedPeriod];
    return getDefaultRange(days);
  }, [customRange, selectedPeriod]);

  useEffect(() => {
    function syncCardsPerPage() {
      if (window.innerWidth >= 1280) {
        setCardsPerPage(4);
      } else if (window.innerWidth >= 768) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(1);
      }
    }

    syncCardsPerPage();
    window.addEventListener('resize', syncCardsPerPage);
    return () => window.removeEventListener('resize', syncCardsPerPage);
  }, []);

  useEffect(() => {
    async function loadDashboard(range: { from: string; to: string }) {
      if (!isRangeValid(range)) {
        setError('El rango de fechas no es válido');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ from: range.from, to: range.to });
        const [dashboardResponse, movementResponse, reportResponse, usdRateResponse] = await Promise.all([
          apiFetch<DashboardResponse>(`/api/dashboard/?${params.toString()}`),
          apiFetch<MovementResponse[] | { results: MovementResponse[] }>(
            `/api/movements/?start=${range.from}&end=${range.to}&limit=10`
          ),
          apiFetch<ReportsResponse>(`/api/reports/?${params.toString()}`),
          apiFetch<UsdRateResponse>('/api/usd-rate/')
        ]);
        const movementList = Array.isArray(movementResponse)
          ? movementResponse
          : movementResponse?.results ?? [];
        setUsdRate(usdRateResponse?.rate ?? null);
        setDashboardData(dashboardResponse);
        setReportData(reportResponse);
        setRecentMovements(movementList.slice(0, 5));
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard(activeRange);
  }, [activeRange]);

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

  const effectiveUsdRate = useMemo(() => {
    if (usdRate && usdRate > 0) return usdRate;
    if (reportData?.usd_rate && reportData.usd_rate > 0) return reportData.usd_rate;
    if (dashboardData?.usd_rate && dashboardData.usd_rate > 0) return dashboardData.usd_rate;
    return 0;
  }, [dashboardData, reportData, usdRate]);

  const convertToUsd = (value: number) => {
    if (!effectiveUsdRate || effectiveUsdRate <= 0) return 0;
    return value / effectiveUsdRate;
  };

  const handlePeriodSelect = (period: 'Hoy' | 'Semana' | 'Mes' | 'Rango') => {
    setError(null);
    if (period === 'Rango') {
      setRangeDraft(customRange);
    }
    setSelectedPeriod(period);
  };

  const handleApplyCustomRange = () => {
    if (!isRangeValid(rangeDraft)) {
      setError('El rango de fechas no es válido');
      return;
    }
    setCustomRange(rangeDraft);
    setSelectedPeriod('Rango');
  };

  const financialMetrics = useMemo<MetricCard[]>(() => {
    if (!dashboardData) {
      return [];
    }
    const ingresosUsd = convertToUsd(dashboardData.ingresos_mxn);
    const egresosUsd = convertToUsd(dashboardData.egresos_mxn);
    const balanceUsd = convertToUsd(dashboardData.balance_mxn);
    return [
      {
        key: 'ventas',
        title: 'Ventas',
        value: formatCurrency(dashboardData.ingresos_mxn, 'MXN'),
        description: `${formatCurrency(ingresosUsd, 'USD')} USD`,
        icon: DollarSign,
        color: '#4ADE80',
        bgGradient: 'radial-gradient(circle at top right, rgba(74, 222, 128, 0.18) 0%, transparent 75%)',
        actionLabel: 'Ver ventas',
        onAction: () => onNavigate('reportes', { view: 'ingresos' })
      },
      {
        key: 'compras',
        title: 'Compras',
        value: formatCurrency(dashboardData.egresos_mxn, 'MXN'),
        description: `${formatCurrency(egresosUsd, 'USD')} USD`,
        icon: TrendingDown,
        color: '#F87171',
        bgGradient: 'radial-gradient(circle at top right, rgba(248, 113, 113, 0.18) 0%, transparent 75%)',
        actionLabel: 'Ver compras',
        onAction: () => onNavigate('reportes', { view: 'egresos' })
      },
      {
        key: 'balance',
        title: 'Balance',
        value: formatCurrency(dashboardData.balance_mxn, 'MXN'),
        description: `${formatCurrency(balanceUsd, 'USD')} USD`,
        icon: Scale,
        color: '#4CC9F0',
        bgGradient: 'radial-gradient(circle at top right, rgba(76, 201, 240, 0.18) 0%, transparent 75%)',
        actionLabel: 'Ver balance',
        onAction: () => onNavigate('reportes', { view: 'balance' })
      }
    ];
  }, [dashboardData, onNavigate]);

  const inventoryMetrics = useMemo<MetricCard[]>(() => {
    if (!dashboardData) {
      return [];
    }
    return [
      {
        key: 'productos',
        title: 'Productos',
        value: `${dashboardData.product_count}`,
        description: 'Catálogo gamer activo',
        icon: Package,
        color: '#38BDF8',
        bgGradient: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.18) 0%, transparent 75%)',
        actionLabel: 'Administrar',
        onAction: () => onNavigate('productos')
      },
      {
        key: 'stock',
        title: 'Stock disponible',
        value: `${dashboardData.total_stock_units.toLocaleString('es-MX', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })}`,
        description: 'Unidades en inventario',
        icon: Boxes,
        color: '#A855F7',
        bgGradient: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.18) 0%, transparent 75%)',
        actionLabel: 'Ver movimientos',
        onAction: () => onNavigate('movimientos')
      },
      {
        key: 'valor_inventario',
        title: 'Valor inventario',
        value: formatCurrency(dashboardData.inventory_value_mxn, 'MXN'),
        description: `Tasa USD ${effectiveUsdRate ? effectiveUsdRate.toFixed(4) : '—'}`,
        icon: Wallet,
        color: '#F97316',
        bgGradient: 'radial-gradient(circle at top right, rgba(249, 115, 22, 0.18) 0%, transparent 75%)',
        actionLabel: 'Ver reportes',
        onAction: () => onNavigate('reportes', { view: 'balance' })
      },
      {
        key: 'bajo_stock',
        title: 'Bajo stock',
        value: `${dashboardData.low_stock_count} productos`,
        description: 'Revisar existencias críticas',
        icon: AlertTriangle,
        color: '#FBBF24',
        bgGradient: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.2) 0%, transparent 75%)',
        actionLabel: 'Ver faltantes',
        onAction: () => onNavigate('productos', { filter: 'bajo-stock' })
      }
    ];
  }, [dashboardData, onNavigate]);

  const dashboardCards = useMemo<MetricCard[]>(() => {
    return [...financialMetrics, ...inventoryMetrics];
  }, [financialMetrics, inventoryMetrics]);

  useEffect(() => {
    setCurrentPage(0);
  }, [cardsPerPage, dashboardCards.length]);

  const totalPages = Math.max(1, Math.ceil(dashboardCards.length / cardsPerPage));
  const startIndex = currentPage * cardsPerPage;
  const visibleCards = dashboardCards.slice(startIndex, startIndex + cardsPerPage);

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
              onClick={() => handlePeriodSelect(period)}
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

      {selectedPeriod === 'Rango' && (
        <div className="flex items-center gap-3 flex-wrap" style={{ color: '#E0E0E0' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: '#A8A8A8' }}>Desde</span>
            <Input
              type="date"
              value={rangeDraft.from}
              max={rangeDraft.to}
              onChange={(e) => setRangeDraft((prev) => ({ ...prev, from: e.target.value }))}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#A8A8A8' }}>Hasta</span>
            <Input
              type="date"
              value={rangeDraft.to}
              min={rangeDraft.from}
              onChange={(e) => setRangeDraft((prev) => ({ ...prev, to: e.target.value }))}
              style={{
                background: 'rgba(58, 134, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0E0E0'
              }}
            />
          </div>
          <button
            onClick={handleApplyCustomRange}
            className="px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)'
            }}
          >
            Aplicar rango
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#A8A8A8' }}>
          <span>Métricas</span>
          <span style={{ color: '#E0E0E0' }}>
            {dashboardCards.length === 0
              ? '0 de 0'
              : `${startIndex + 1} - ${Math.min(startIndex + cardsPerPage, dashboardCards.length)} de ${dashboardCards.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded-lg border transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: currentPage === 0 ? '#556080' : '#E0E0E0',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ←
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-2 rounded-lg border transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: currentPage >= totalPages - 1 ? '#556080' : '#E0E0E0',
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {visibleCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className="rounded-xl p-6 transition-all duration-300 border"
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
                      background: `${metric.color}20`,
                      color: metric.color,
                      fontSize: '0.75rem'
                    }}
                  >
                    {metric.description}
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

                {metric.onAction && (
                  <button
                    onClick={metric.onAction}
                    className="w-full py-2 rounded-lg transition-all duration-200"
                    style={{
                      background: `${metric.color}15`,
                      color: metric.color,
                      fontSize: '0.875rem',
                      border: `1px solid ${metric.color}40`
                    }}
                  >
                    {metric.actionLabel ?? 'Ver detalles'}
                  </button>
                )}
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

          <div className="flex items-center gap-2" style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>
            <span>Rango activo:</span>
            <span style={{ color: '#E0E0E0' }}>
              {activeRange.from} → {activeRange.to}
            </span>
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
              onClick={() => onNavigate('movimientos', { period: selectedPeriod, range: activeRange })}
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
                      <div className="flex flex-col">
                        <span>{movement.product_detail?.name ?? 'Producto'}</span>
                        <span className="text-xs text-slate-400">
                          {movement.product_detail?.code ?? '—'} ·{' '}
                          {CATEGORY_LABELS[movement.product_detail?.category ?? ''] ?? 'Sin categoría'}
                        </span>
                      </div>
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
