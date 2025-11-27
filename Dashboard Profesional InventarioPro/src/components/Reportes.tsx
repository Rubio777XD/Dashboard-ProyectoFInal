import { useEffect, useMemo, useState } from 'react';
import { Download, Calendar, TrendingUp, DollarSign, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input } from './ui/input';
import { apiFetch } from '../lib/api';

interface ReportesProps {
  filter?: any;
}

interface ReportPoint {
  date: string;
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
}

interface ReportsResponse {
  ingresos_mxn: number;
  egresos_mxn: number;
  balance_mxn: number;
  ingresos_usd: number;
  egresos_usd: number;
  balance_usd: number;
  usd_rate: number;
  range: { from: string; to: string };
  series: ReportPoint[];
}

interface UsdRateResponse {
  rate: number;
}

interface MovementExportRow {
  id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  unit_price: number;
  date: string;
  product_detail?: { name?: string };
}

function formatCurrency(value: number, currency: 'MXN' | 'USD' = 'MXN') {
  if (!Number.isFinite(value)) {
    return currency === 'USD' ? '$0.00 USD' : '$0.00 MXN';
  }
  return value.toLocaleString('es-MX', { style: 'currency', currency });
}

function getDefaultStartDate(daysBack: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

export function Reportes({ filter }: ReportesProps) {
  const [fechaInicio, setFechaInicio] = useState(getDefaultStartDate(30));
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<ReportsResponse | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'ingresos' | 'egresos' | 'balance' | 'usd'>('ingresos');
  const [appliedRange, setAppliedRange] = useState({ from: fechaInicio, to: fechaFin });

  useEffect(() => {
    loadReport(fechaInicio, fechaFin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filter?.view) {
      setActiveMetric(filter.view);
    }
  }, [filter]);

  async function loadReport(from: string, to: string) {
    if (new Date(from) > new Date(to)) {
      setError('El rango de fechas no es válido');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ from, to });
      const [data, usdRateResponse] = await Promise.all([
        apiFetch<ReportsResponse>(`/api/reports/?${params.toString()}`),
        apiFetch<UsdRateResponse>('/api/usd-rate/')
      ]);
      setReportData(data);
      setUsdRate(usdRateResponse?.rate ?? data.usd_rate ?? null);
      setAppliedRange({ from, to });
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  }

  const handleApplyFilters = () => {
    loadReport(fechaInicio, fechaFin);
  };

  const chartData = useMemo(() => {
    if (!reportData) return [];
    return reportData.series.map((item) => ({
      mes: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: '2-digit' }),
      ingresos: item.ingresos_mxn,
      egresos: item.egresos_mxn
    }));
  }, [reportData]);

  const effectiveUsdRate = useMemo(() => {
    if (usdRate && usdRate > 0) return usdRate;
    if (reportData?.usd_rate && reportData.usd_rate > 0) return reportData.usd_rate;
    return 0;
  }, [reportData, usdRate]);

  const convertToUsd = (value: number) => {
    if (!effectiveUsdRate || effectiveUsdRate <= 0) return 0;
    return value / effectiveUsdRate;
  };

  async function handleExport() {
    if (!reportData) return;
    try {
      const params = new URLSearchParams({ start: appliedRange.from, end: appliedRange.to, limit: '1000' });
      const movements = await apiFetch<MovementExportRow[] | { results: MovementExportRow[] }>(
        `/api/movements/?${params.toString()}`
      );
      const movementList = Array.isArray(movements) ? movements : movements?.results ?? [];
      const rows = [
        ['Fecha', 'Tipo', 'Producto', 'Cantidad', 'Monto'],
        ...movementList.map((movement) => {
          const amount = movement.quantity * movement.unit_price;
          return [
            movement.date,
            movement.movement_type === 'IN' ? 'ingreso' : 'egreso',
            movement.product_detail?.name ?? 'Producto',
            movement.quantity.toString(),
            amount.toFixed(2)
          ];
        })
      ];
      const csvContent = rows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reportes_inventario_${appliedRange.from}_a_${appliedRange.to}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('No se pudo exportar el CSV');
    }
  }

  const stats = useMemo(() => {
    if (!reportData) return [];
    const ingresosUsd = convertToUsd(reportData.ingresos_mxn);
    const egresosUsd = convertToUsd(reportData.egresos_mxn);
    const balanceUsd = convertToUsd(reportData.balance_mxn);
    return [
      {
        id: 1,
        key: 'ingresos' as const,
        title: 'Total Ingresos',
        value: formatCurrency(reportData.ingresos_mxn, 'MXN'),
        change: formatCurrency(ingresosUsd, 'USD'),
        icon: TrendingUp,
        color: '#4ADE80'
      },
      {
        id: 2,
        key: 'egresos' as const,
        title: 'Total Egresos',
        value: formatCurrency(reportData.egresos_mxn, 'MXN'),
        change: formatCurrency(egresosUsd, 'USD'),
        icon: ArrowUpDown,
        color: '#F87171'
      },
      {
        id: 3,
        key: 'balance' as const,
        title: 'Balance Neto',
        value: formatCurrency(reportData.balance_mxn, 'MXN'),
        change: formatCurrency(balanceUsd, 'USD'),
        icon: DollarSign,
        color: '#4CC9F0'
      },
      {
        id: 4,
        key: 'usd' as const,
        title: 'Conversión USD',
        value: `${formatCurrency(balanceUsd, 'USD')}`,
        change: effectiveUsdRate ? `TC: ${effectiveUsdRate.toFixed(4)}` : 'TC no disponible',
        icon: DollarSign,
        color: '#FBBF24'
      }
    ];
  }, [convertToUsd, effectiveUsdRate, reportData]);

  return (
    <div className="p-8 space-y-6" style={{ background: '#0B132B', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#E0E0E0', fontSize: '1.5rem', fontWeight: 600 }}>Reportes y Análisis</h2>
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
          onClick={handleExport}
          disabled={!reportData}
        >
          <Download className="w-5 h-5" />
          Exportar CSV
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2" style={{ color: '#E0E0E0' }}>
            <Calendar className="w-5 h-5" style={{ color: '#3A86FF' }} />
            <span>Rango de fechas:</span>
          </div>

          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={fechaInicio}
              max={fechaFin}
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
              min={fechaInicio}
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
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Aplicar
          </button>
        </div>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeMetric === stat.key;
          return (
            <div
              key={stat.id}
              className="rounded-xl p-6 border transition-all duration-300 cursor-pointer"
              style={{
                background: '#1C2541',
                borderColor: isActive ? stat.color : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? `0 8px 24px ${stat.color}40` : '0 4px 6px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setActiveMetric(stat.key)}
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
                      background: 'rgba(74, 222, 128, 0.2)',
                      color: '#4ADE80',
                      fontSize: '0.75rem'
                    }}
                  >
                    {stat.change}
                  </span>
                </div>

                <div>
                  <div style={{ color: '#A8A8A8', fontSize: '0.875rem' }}>{stat.title}</div>
                  <div style={{ color: '#E0E0E0', fontSize: '1.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {stat.value}
                  </div>
                </div>
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
            <h3 style={{ color: '#E0E0E0', fontSize: '1.125rem' }}>Resumen por periodo</h3>
            <p style={{ color: '#A8A8A8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Comparativa de ingresos y egresos en el rango seleccionado
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="mes" stroke="#A8A8A8" style={{ fontSize: '0.75rem' }} />
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
            <Bar dataKey="ingresos" fill="#4ADE80" name="Ingresos (MXN)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="egresos" fill="#F87171" name="Egresos (MXN)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {loading && <p className="text-slate-300">Actualizando reportes...</p>}
    </div>
  );
}
