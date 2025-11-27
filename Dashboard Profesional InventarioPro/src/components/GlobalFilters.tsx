import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from './ui/input';
import { useGlobalFilters } from '../lib/filters';

const PERIOD_LABELS: Array<{ key: 'Hoy' | 'Semana' | 'Mes' | 'Rango'; label: string }> = [
  { key: 'Hoy', label: 'Hoy' },
  { key: 'Semana', label: 'Semana' },
  { key: 'Mes', label: 'Mes' },
  { key: 'Rango', label: 'Rango' }
];

export function GlobalFilters() {
  const { period, setPeriod, range, setCustomRange } = useGlobalFilters();

  const rangeLabel = useMemo(() => {
    const from = new Date(range.from);
    const to = new Date(range.to);
    const sameDay = from.toDateString() === to.toDateString();
    const format = (date: Date) =>
      date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
    return sameDay ? format(from) : `${format(from)} – ${format(to)}`;
  }, [range]);

  return (
    <div className="flex flex-wrap items-center gap-3 justify-end">
      <div className="flex items-center gap-2">
        {PERIOD_LABELS.map((option) => (
          <button
            key={option.key}
            onClick={() => setPeriod(option.key)}
            className="px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background:
                period === option.key
                  ? 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)'
                  : 'rgba(58, 134, 255, 0.1)',
              color: period === option.key ? '#FFFFFF' : '#A8A8A8',
              fontSize: '0.875rem',
              boxShadow: period === option.key ? '0 4px 12px rgba(58, 134, 255, 0.3)' : 'none'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <Calendar className="w-4 h-4" style={{ color: '#4CC9F0' }} />
        <span style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>{rangeLabel}</span>
      </div>

      {period === 'Rango' && (
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) =>
              setCustomRange({
                from: e.target.value,
                to: range.to < e.target.value ? e.target.value : range.to
              })
            }
            style={{
              background: 'rgba(58, 134, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#E0E0E0'
            }}
          />
          <Input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(e) =>
              setCustomRange({
                from: range.from,
                to: e.target.value
              })
            }
            style={{
              background: 'rgba(58, 134, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#E0E0E0'
            }}
          />
        </div>
      )}
    </div>
  );
}
