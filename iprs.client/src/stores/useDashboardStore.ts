import { create } from 'zustand';
import { getReport, getStats } from '@/services/dashboardService';
import type { PurchaseRequestStatus } from '@/types/enums';
import type { DashboardStatsDto, ReportSummaryDto } from '@/types/dashboard';

interface DashboardState {
  stats: DashboardStatsDto | null;
  reportSummary: ReportSummaryDto | null;
  isLoadingStats: boolean;
  isLoadingReport: boolean;
  fetchStats: () => Promise<void>;
  fetchReportSummary: (
    startTime: string | null,
    endTime: string | null,
    status: PurchaseRequestStatus | null,
    departmentId: number | null
  ) => Promise<void>;
  resetDashboard: () => void;
}

const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  reportSummary: null,
  isLoadingStats: false,
  isLoadingReport: false,

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const data = await getStats();
      set({ stats: data });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to synchronize metric nodes:', err);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  fetchReportSummary: async (startTime, endTime, status, departmentId) => {
    set({ isLoadingReport: true });
    try {
      const data = await getReport(startTime, endTime, status, departmentId);
      set({ reportSummary: data });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Financial execution track aggregation failed:', err);
    } finally {
      set({ isLoadingReport: false });
    }
  },

  resetDashboard: () => set({ stats: null, reportSummary: null }),
}));

export default useDashboardStore;
