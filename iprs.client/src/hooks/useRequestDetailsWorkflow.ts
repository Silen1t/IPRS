import { useState, useEffect, useMemo, useCallback } from 'react';
import usePurchaseRequestStore from '../stores/usePurchaseRequestStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useDepartmentStore } from '../stores/useDepartmentStore';
import { PurchaseRequestStatus, UserRole, WorkflowAction } from '@/types/enums';

import {
  managerApprovePurchaseRequest,
  managerRejectPurchaseRequest,
  financeApprovePurchaseRequest,
  financeRejectPurchaseRequest,
  cancelPurchaseRequest
} from '@/services/purchaseRequestService';

import type { PurchaseRequestResponseDto } from '@/schemas/purchaseRequest';
import type { CategoryLookupDto } from '@/schemas/category';
import type { DepartmentResponseDto } from '@/schemas/department';
import { toast } from 'sonner';
import { Guid } from 'guid-typescript';

export interface WorkflowPayload {
  note?: string;
  purchaseOrderNumber?: string;
}

interface UseRequestDetailsWorkflowReturn {
  request: PurchaseRequestResponseDto | null;
  loading: boolean;
  isAuthorizedForAction: boolean;
  showWorkflowPanel: boolean;
  resolvedCategory: CategoryLookupDto | null;
  resolvedDepartment: DepartmentResponseDto | null;
  handleWorkflowExecution: (actionType: WorkflowAction, payload?: WorkflowPayload) => Promise<boolean>;
}

export const useRequestDetailsWorkflow = (requestId: string | undefined): UseRequestDetailsWorkflowReturn => {
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);

  const { purchaseRequests, initPurchaseRequests, updateSingleRequestInStore } = usePurchaseRequestStore();
  const { role: currentUserRole, employeeId: currentUserEmpId } = useAuthStore();
  const { categories, fetchCategories, isLoading: isCategoryLoading } = useCategoryStore();
  const { departments, fetchDepartments, isLoading: isDepartmentLoading } = useDepartmentStore();

  useEffect(() => {
    if (purchaseRequests.length === 0) initPurchaseRequests();
    if (categories.length === 0) fetchCategories();
    if (departments.length === 0) fetchDepartments();
  }, [purchaseRequests.length, categories.length, departments.length, initPurchaseRequests, fetchCategories, fetchDepartments]);

  const request = useMemo(() => {
    if (!requestId) return null;
    return purchaseRequests.find((r) => r.id === requestId) || null;
  }, [purchaseRequests, requestId]);

  const resolvedCategory = useMemo(() => {
    if (!request) return null;
    return categories.find((c) => c.id === request.categoryId) || null;
  }, [categories, request]);

  const resolvedDepartment = useMemo(() => {
    if (!request) return null;
    return departments.find((d) => d.id === request.departmentId) || null;
  }, [departments, request]);

  const isAuthorizedForAction = useMemo(() => {
    if (!request || !currentUserRole) return false;

    switch (request.status) {
      case PurchaseRequestStatus.Pending_Manager:
        return currentUserRole === UserRole.Manager || currentUserRole === UserRole.Admin;
        
      case PurchaseRequestStatus.Pending_Finance:
        return currentUserRole === UserRole.Finance || currentUserRole === UserRole.Admin;
        
      case PurchaseRequestStatus.Draft:
        return request.requestedBy.employeeId === currentUserEmpId;
        
      default:
        return false;
    }
  }, [request, currentUserRole, currentUserEmpId]);

  const showWorkflowPanel = useMemo(() => {
    if (!request) return false;
    const isTerminalState = 
      request.status === PurchaseRequestStatus.Approved ||
      request.status === PurchaseRequestStatus.Rejected ||
      request.status === PurchaseRequestStatus.Cancelled;
      
    return !isTerminalState && isAuthorizedForAction;
  }, [request, isAuthorizedForAction]);

  const loading = isActionProcessing || isCategoryLoading || isDepartmentLoading || (purchaseRequests.length === 0);

  const handleWorkflowExecution = useCallback(async (
    actionType: WorkflowAction, 
    payload?: WorkflowPayload
  ): Promise<boolean> => {
    if (!requestId || !request) return false;
    setIsActionProcessing(true);

    try {
      let updatedRequest: PurchaseRequestResponseDto;

      switch (actionType) {
        case WorkflowAction.Approve_Manager:
          updatedRequest = await managerApprovePurchaseRequest(Guid.parse(requestId), {
            note: payload?.note
          });
          break;

        case WorkflowAction.Approve_Finance:
          if (!payload?.purchaseOrderNumber) {
            throw new Error('A Purchase Order number is mandatory for financial clearance.');
          }
          updatedRequest = await financeApprovePurchaseRequest(Guid.parse(requestId), {
            purchaseOrderNumber: payload.purchaseOrderNumber,
            note: payload?.note
          });
          break;

        case WorkflowAction.Reject:
          // Smart-route rejections based on the current step in the lifecycle state machine
          if (request.status === PurchaseRequestStatus.Pending_Manager) {
            updatedRequest = await managerRejectPurchaseRequest(Guid.parse(requestId), {
              note: payload?.note ?? 'Rejected by operational manager.'
            });
          } else if (request.status === PurchaseRequestStatus.Pending_Finance) {
            updatedRequest = await financeRejectPurchaseRequest(Guid.parse(requestId), {
              note: payload?.note ?? 'Rejected during financial auditing.'
            });
          } else {
            throw new Error('This request cannot be rejected in its current workflow state.');
          }
          break;

        case WorkflowAction.Cancel:
          updatedRequest = await cancelPurchaseRequest(Guid.parse(requestId));
          break;

        default:
          throw new Error(`Unmapped action context: ${actionType}`);
      }

      updateSingleRequestInStore(updatedRequest);
      toast.success(`Request successfully moved to the next workflow state.`);
      return true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { 
      const clearErrorMessage = err.response?.data?.message || err.message || 'Failed to dispatch workflow modification.';
      toast.error(clearErrorMessage);
      
      if (import.meta.env.DEV) console.error(`[Workflow Pipeline Exception]:`, err);
      return false;
    } finally {
      setIsActionProcessing(false);
    }
  }, [requestId, request, updateSingleRequestInStore]);

  return {
    request,
    loading,
    isAuthorizedForAction,
    showWorkflowPanel,
    resolvedCategory,
    resolvedDepartment,
    handleWorkflowExecution,
  };
};