import { z } from 'zod';
import { purchaseRequestResponseSchema } from './purchaseRequest'; // Adjust path as needed

export const employeeDashboardStatsSchema = z.object({
  draftCount: z.number().int(),
  pendingCount: z.number().int(),
  approvedCount: z.number().int(),
  rejectedCount: z.number().int(),
});

export const managerDashboardStatsSchema = z.object({
  pendingApprovalsCount: z.number().int(),
  departmentSpendThisMonth: z.number(),
});

export const financeDashboardStatsSchema = z.object({
  pendingFinanceCount: z.number().int(),
  totalApprovedSpendThisMonth: z.number(),
});

export const adminDashboardStatsSchema = z.object({
  totalRequests: z.number().int(),
  totalUsers: z.number().int(),
  totalDepartments: z.number().int(),
});

export const dashboardStatsSchema = z.object({
  employeeStats: employeeDashboardStatsSchema.nullable(),
  managerStats: managerDashboardStatsSchema.nullable(),
  financeStats: financeDashboardStatsSchema.nullable(),
  adminStats: adminDashboardStatsSchema.nullable(),
});

export type DashboardStatsDto = z.infer<typeof dashboardStatsSchema>;

export const reportSummarySchema = z.object({
  requests: z.array(purchaseRequestResponseSchema), 
  totalSpendSum: z.number(),
});

export type ReportSummaryDto = z.infer<typeof reportSummarySchema>;
