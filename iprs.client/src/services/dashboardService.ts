import type { DashboardStatsDto, ReportSummaryDto } from '@/types/dashboard';
import type { PurchaseRequestStatus } from '../types/enums';
import { api } from './api';

export async function getStats(): Promise<DashboardStatsDto> {
  const res = await api.get<DashboardStatsDto>('dashboard/stats');
  return res.data;
}

export async function getReport(
  from: string | null,
  to: string | null,
  status: PurchaseRequestStatus | null,
  departmentId: number | null
): Promise<ReportSummaryDto> {
  const res = await api.get<ReportSummaryDto>('reports/requests', {
    params: {
      from: from ?? undefined,
      to: to ?? undefined,
      status: status ?? undefined,
      departmentId: departmentId ?? undefined,
    },
  });

  return res.data;
}
