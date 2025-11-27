import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type Period = 'Hoy' | 'Semana' | 'Mes' | 'Rango';

interface DateRange {
  from: string;
  to: string;
}

interface GlobalFilterContextValue {
  period: Period;
  range: DateRange;
  setPeriod: (period: Period) => void;
  setCustomRange: (range: DateRange) => void;
}

const periodDays: Record<Exclude<Period, 'Rango'>, number> = {
  Hoy: 0,
  Semana: 6,
  Mes: 29
};

function computeRange(period: Exclude<Period, 'Rango'>): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - periodDays[period]);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10)
  };
}

const GlobalFilterContext = createContext<GlobalFilterContextValue | undefined>(undefined);

export function GlobalFilterProvider({ children }: { children: ReactNode }) {
  const [period, updatePeriod] = useState<Period>('Semana');
  const [range, setRange] = useState<DateRange>(computeRange('Semana'));

  const value = useMemo<GlobalFilterContextValue>(() => {
    return {
      period,
      range,
      setPeriod: (next) => {
        updatePeriod(next);
        if (next !== 'Rango') {
          setRange(computeRange(next));
        }
      },
      setCustomRange: (customRange) => {
        const { from, to } = customRange;
        if (from && to) {
          setRange({ from, to });
          updatePeriod('Rango');
        }
      }
    };
  }, [period, range]);

  return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}

export function useGlobalFilters(): GlobalFilterContextValue {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a GlobalFilterProvider');
  }
  return context;
}
