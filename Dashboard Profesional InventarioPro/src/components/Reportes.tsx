import { useEffect, useMemo, useState } from 'react';
import { Download, Calendar, TrendingUp, DollarSign, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiFetch } from '../lib/api';
import { useGlobalFilters } from '../lib/filters';
import { GlobalFilters } from './GlobalFilters';

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

function formatCurrency(value: number, currency: 'MXN' | 'USD' = 'MXN') {
  if (!Number.isFinite(value)) {
    return currency === 'USD' ? '$0.00 USD' : '$0.00 MXN';
  }
  return value.toLocaleString('es-MX', { style: 'currency', currency });
}

export function Reportes({ filter }: ReportesProps) {
  const { range } = useGlobalFilters();
  const [reportData, setReportData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'ingresos' | 'egresos' | 'balance' | 'usd'>('ingresos');

  useEffect(() => {
    loadReport(range.from, range.to);
  }, [range]);

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
      const data = await apiFetch<ReportsResponse>(`/api/reports/?${params.toString()}`);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (!reportData) return [];
    return reportData.series.map((item) => ({
      mes: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: '2-digit' }),
      ingresos: item.ingresos_mxn,
      egresos: item.egresos_mxn
    }));
  }, [reportData]);

  function handleExport() {
    if (!reportData) return;
    const rows = [
      ['Fecha', 'Ingresos MXN', 'Egresos MXN', 'Balance MXN'],
      ...reportData.series.map((point) => [
        point.date,
        point.ingresos_mxn.toString(),
        point.egresos_mxn.toString(),
        point.balance_mxn.toString()
      ])
    ];
    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reportes_inventario_${range.from}_a_${range.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => {
    if (!reportData) return [];
    return [
      {
        id: 1,
        key: 'ingresos' as const,
        title: 'Total Ingresos',
        value: formatCurrency(reportData.ingresos_mxn, 'MXN'),
        change: formatCurrency(reportData.ingresos_usd, 'USD'),
        icon: TrendingUp,
        color: '#4ADE80'
      },
      {
        id: 2,
        key: 'egresos' as const,
        title: 'Total Egresos',
        value: formatCurrency(reportData.egresos_mxn, 'MXN'),
        change: formatCurrency(reportData.egresos_usd, 'USD'),
        icon: ArrowUpDown,
        color: '#F87171'
      },
      {
        id: 3,
        key: 'balance' as const,
        title: 'Balance Neto',
        value: formatCurrency(reportData.balance_mxn, 'MXN'),
        change: formatCurrency(reportData.balance_usd, 'USD'),
        icon: DollarSign,
        color: '#4CC9F0'
      },
      {
        id: 4,
        key: 'usd' as const,
        title: 'Conversión USD',
        value: `${formatCurrency(reportData.balance_usd, 'USD')}`,
        change: `USD→MXN: ${reportData.usd_rate.toFixed(4)}`,
        icon: DollarSign,
        color: '#FBBF24'
      }
    ];
  }, [reportData]);

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
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-2" style={{ color: '#E0E0E0' }}>
            <Calendar className="w-5 h-5" style={{ color: '#3A86FF' }} />
            <span>Filtros globales</span>
          </div>

          <GlobalFilters />
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
