import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Case,
  CaseStatus,
  ViolationType,
  generateMockAnalysis,
} from "@/constants/violations";

const STORAGE_KEY = "@ticketburied_cases";

interface CasesContextValue {
  cases: Case[];
  loading: boolean;
  addCase: (params: {
    violationType: ViolationType;
    fineAmount: number;
    notes: string;
    meta: Record<string, string>;
  }) => Promise<Case>;
  updateCaseStatus: (id: string, status: CaseStatus, extra?: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  getCaseById: (id: string) => Case | undefined;
  totalRecovered: number;
  casesWon: number;
  casesLost: number;
  activeCount: number;
}

const CasesContext = createContext<CasesContextValue | null>(null);

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const analysisTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    loadCases();
    return () => {
      Object.values(analysisTimers.current).forEach(clearTimeout);
    };
  }, []);

  async function loadCases() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Case[] = JSON.parse(stored);
        setCases(parsed);
        parsed
          .filter((c) => c.status === "analysing")
          .forEach((c) => scheduleAnalysis(c.id, c.violationType, c.fineAmount, true));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function saveCases(updated: Case[]) {
    setCases(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function scheduleAnalysis(
    id: string,
    violationType: ViolationType,
    fineAmount: number,
    immediate = false
  ) {
    const delay = immediate ? 500 : 4000 + Math.random() * 4000;
    const timer = setTimeout(async () => {
      const analysis = generateMockAnalysis(violationType, fineAmount);
      setCases((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, status: "analysed" as CaseStatus, analysis } : c
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      delete analysisTimers.current[id];
    }, delay);
    analysisTimers.current[id] = timer;
  }

  const addCase = useCallback(
    async (params: {
      violationType: ViolationType;
      fineAmount: number;
      notes: string;
      meta: Record<string, string>;
    }): Promise<Case> => {
      const newCase: Case = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        violationType: params.violationType,
        status: "analysing",
        fineAmount: params.fineAmount,
        notes: params.notes,
        createdAt: new Date().toISOString(),
        meta: params.meta,
      };
      const updated = [newCase, ...cases];
      await saveCases(updated);
      scheduleAnalysis(newCase.id, params.violationType, params.fineAmount);
      return newCase;
    },
    [cases]
  );

  const updateCaseStatus = useCallback(
    async (id: string, status: CaseStatus, extra?: Partial<Case>) => {
      const updated = cases.map((c) =>
        c.id === id ? { ...c, status, ...extra } : c
      );
      await saveCases(updated);
    },
    [cases]
  );

  const deleteCase = useCallback(
    async (id: string) => {
      if (analysisTimers.current[id]) {
        clearTimeout(analysisTimers.current[id]);
        delete analysisTimers.current[id];
      }
      const updated = cases.filter((c) => c.id !== id);
      await saveCases(updated);
    },
    [cases]
  );

  const getCaseById = useCallback(
    (id: string) => cases.find((c) => c.id === id),
    [cases]
  );

  const totalRecovered = cases
    .filter((c) => c.status === "won")
    .reduce((sum, c) => sum + (c.recoveredAmount ?? c.fineAmount), 0);

  const casesWon = cases.filter((c) => c.status === "won").length;
  const casesLost = cases.filter((c) => c.status === "lost").length;
  const activeCount = cases.filter(
    (c) => !["won", "lost", "withdrawn"].includes(c.status)
  ).length;

  return (
    <CasesContext.Provider
      value={{
        cases,
        loading,
        addCase,
        updateCaseStatus,
        deleteCase,
        getCaseById,
        totalRecovered,
        casesWon,
        casesLost,
        activeCount,
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases must be used inside CasesProvider");
  return ctx;
}
