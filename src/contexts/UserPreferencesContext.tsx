import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IndicatorType } from '@/hooks/useIndicators';

const STORAGE_KEY = 'dashboard-visible-indicators';

const ALL_INDICATORS: IndicatorType[] = [
  'ipca', 'selic', 'igpm', 'pib', 'dolar', 'balanca_comercial', 'desemprego',
];

function loadPreferences(): IndicatorType[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

interface UserPreferencesContextType {
  selectedIndicators: IndicatorType[];
  toggleIndicator: (indicator: IndicatorType) => void;
  selectAll: () => void;
  allIndicators: IndicatorType[];
  hasCustomPreferences: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorType[]>(
    () => loadPreferences() ?? ALL_INDICATORS
  );

  const hasCustomPreferences = loadPreferences() !== null;

  const toggleIndicator = useCallback((indicator: IndicatorType) => {
    setSelectedIndicators((prev) => {
      const next = prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator];
      if (next.length === 0) return prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIndicators(ALL_INDICATORS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_INDICATORS));
  }, []);

  return (
    <UserPreferencesContext.Provider
      value={{ selectedIndicators, toggleIndicator, selectAll, allIndicators: ALL_INDICATORS, hasCustomPreferences }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return ctx;
}
