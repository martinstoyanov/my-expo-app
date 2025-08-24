import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FinanceData = {
  savings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  annualGrowthRate: number; // 0.07 => 7%
};

const DEFAULT_DATA: FinanceData = {
  savings: 10000,
  monthlyIncome: 6000,
  monthlyExpenses: 3500,
  annualGrowthRate: 0.07,
};

type Ctx = {
  data: FinanceData;
  setData: (d: FinanceData) => void;
};

const FinanceCtx = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = 'finance:data:v1';

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(DEFAULT_DATA);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setData({ ...DEFAULT_DATA, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  return <FinanceCtx.Provider value={{ data, setData }}>{children}</FinanceCtx.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceCtx);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

