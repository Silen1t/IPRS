import type {
  dashboardStatsSchema,
  reportSummarySchema,
} from '@/schemas/dashboard';
import type { z } from 'zod';

export type DashboardStatsDto = z.infer<typeof dashboardStatsSchema>;

export type ReportSummaryDto = z.infer<typeof reportSummarySchema>;
