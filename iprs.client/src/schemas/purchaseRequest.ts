import { z } from 'zod';
import { PurchaseRequestStatus, UrgencyLevel } from '../types/enums';
import { userSummaryResponseSchema } from './user';



export const approvalStageSchema = z.object({
  actionBy: userSummaryResponseSchema,
  actionAt: z.iso.datetime(),
  note: z.string().nullable(),
});



export const createPurchaseRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  categoryId: z.number().int(),
  quantity: z.number().int().gte(1, 'Quantity must be at least 1.'),
  unitPrice: z.number().gt(0, 'Unit price must be greater than 0.'),
  urgencyLevel: z.enum(UrgencyLevel),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .nullable()
    .optional(),
});


export const updatePurchaseRequestSchema = z.object({
  id: z.guid(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  categoryId: z.number().int(),
  quantity: z.number().int().gte(1, 'Quantity must be at least 1.'),
  unitPrice: z.number().gt(0, 'Unit price must be greater than 0.'),
  urgencyLevel: z.enum(UrgencyLevel),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .nullable()
    .optional(),
});


export const purchaseRequestResponseSchema = z.object({
  id: z.guid(),
  requestNumber: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  urgencyLevel: z.enum(UrgencyLevel),
  status: z.enum(PurchaseRequestStatus),
  departmentId: z.number().int(),
  categoryId: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  requestedBy: userSummaryResponseSchema,
  managerApproval: approvalStageSchema.nullable(),
  financeApproval: approvalStageSchema.nullable(),
  purchaseOrderNumber: z.string().nullable(),
});


export const managerReviewSchema = z.object({
  note: z.string().nullable().optional(),
});


export const managerRejectSchema = z.object({
  note: z.string().min(1, 'A rejection reason note is strictly required.'),
});


export const financeApproveSchema = z.object({
  purchaseOrderNumber: z
    .string()
    .min(1, 'Purchase Order (PO) number is required.'),
  note: z.string().nullable().optional(),
});

export const financeRejectSchema = z.object({
  note: z.string().min(1, 'A rejection reason note is strictly required.'),
});

