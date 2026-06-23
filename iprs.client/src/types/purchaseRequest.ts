import type {
  approvalStageSchema,
  createPurchaseRequestSchema,
  financeApproveSchema,
  financeRejectSchema,
  managerRejectSchema,
  managerReviewSchema,
  purchaseRequestResponseSchema,
  updatePurchaseRequestSchema,
} from '@/schemas/purchaseRequest';
import type { z } from 'zod';

export type FinanceRejectDto = z.infer<typeof financeRejectSchema>;

export type FinanceApproveDto = z.infer<typeof financeApproveSchema>;
export type ManagerRejectDto = z.infer<typeof managerRejectSchema>;
export type ManagerReviewDto = z.infer<typeof managerReviewSchema>;
export type PurchaseRequestResponseDto = z.infer<
  typeof purchaseRequestResponseSchema
>;
export type UpdatePurchaseRequestDto = z.infer<
  typeof updatePurchaseRequestSchema
>;
export type ApprovalStageDto = z.infer<typeof approvalStageSchema>;

export type CreatePurchaseRequestDto = z.infer<
  typeof createPurchaseRequestSchema
>;
