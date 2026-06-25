import { create } from 'zustand';
import { getReport, getStats } from '@/services/dashboardService';
import type { PurchaseRequestStatus } from '@/types/enums';
import type { DashboardStatsDto, ReportSummaryDto } from '@/types/dashboard';
import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';

interface DashboardState {
  stats: DashboardStatsDto | null;
  reportSummary: ReportSummaryDto | null;
  isLoadingStats: boolean;
  isLoadingReport: boolean;
  connection: HubConnection | null;
  initSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
  refreshDashboard: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchReportSummary: (
    startTime: string | null,
    endTime: string | null,
    status: PurchaseRequestStatus | null,
    departmentId: number | null
  ) => Promise<void>;
  resetDashboard: () => void;
}

const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  reportSummary: null,
  isLoadingStats: false,
  isLoadingReport: false,
  connection: null,

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

  refreshDashboard: async () => {
    await get().fetchStats();
    await get().fetchReportSummary(null, null, null, null);
  },

  resetDashboard: () => set({ stats: null, reportSummary: null }),

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

    if (existingConnection && existingConnection.state !== 'Disconnected') {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/dashboard', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('UpdateDashboard', async () => {
      await get().refreshDashboard();
    });

    try {
      await connection.start();
      set({ connection });
      if (import.meta.env.DEV) {
        console.log('SignalR Connected securely via Zustand store.');
      }
    } catch (err) {
      set({ connection: null });
      if (import.meta.env.DEV) {
        console.error('SignalR Hub initialization failed:', err);
      }
    }
  },

  disconnectSignalR: () => {
    const { connection } = get();
    if (connection) {
      connection.stop();
      set({ connection: null });
    }
  },
}));

export default useDashboardStore;
