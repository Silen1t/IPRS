import { useState, useEffect, useMemo, useCallback } from 'react';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import useAuthStore from '@/stores/useAuthStore';
import useCategoryStore from '@/stores/useCategoryStore';
import useDepartmentStore from '@/stores/useDepartmentStore';
import { PurchaseRequestStatus, UserRole, WorkflowAction } from '@/types/enums';

import {
  managerApprovePurchaseRequest,
  managerRejectPurchaseRequest,
  financeApprovePurchaseRequest,
  financeRejectPurchaseRequest,
  cancelPurchaseRequest,
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
  error: boolean; //  Added to interface contract
  isAuthorizedForAction: boolean;
  showWorkflowPanel: boolean;
  resolvedCategory: CategoryLookupDto | null;
  resolvedDepartment: DepartmentResponseDto | null;
  handleWorkflowExecution: (
    actionType: WorkflowAction,
    payload?: WorkflowPayload
  ) => Promise<boolean>;
}

const useRequestDetailsWorkflow = (
  requestId: string | undefined
): UseRequestDetailsWorkflowReturn => {
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false); //  Added local error state tracking

  const { purchaseRequests, initPurchaseRequests, updateSingleRequestInStore } =
    usePurchaseRequestStore();
  const { role: currentUserRole, employeeId: currentUserEmpId } =
    useAuthStore();
  const {
    categories,
    fetchCategories,
    isLoading: isCategoryLoading,
  } = useCategoryStore();
  const {
    departments,
    fetchDepartments,
    isLoading: isDepartmentLoading,
  } = useDepartmentStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(false); // Reset error state on sync attempt
        const initializationPromises = [];

        if (purchaseRequests.length === 0)
          initializationPromises.push(initPurchaseRequests());
        if (categories.length === 0)
          initializationPromises.push(fetchCategories());
        if (departments.length === 0)
          initializationPromises.push(fetchDepartments());

        if (initializationPromises.length > 0) {
          await Promise.all(initializationPromises);
        }
      } catch (err) {
        console.error(
          '[Workflow Init Error]: Failed to populate core application caches.',
          err
        );
        setError(true); //  Trip the error flag if any core network call drops out
      } finally {
        setIsRequestsLoading(false);
      }
    };

    initializeData();
  }, [
    purchaseRequests.length,
    categories.length,
    departments.length,
    initPurchaseRequests,
    fetchCategories,
    fetchDepartments,
  ]);

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
        return (
          currentUserRole === UserRole.Manager ||
          currentUserRole === UserRole.Admin
        );

      case PurchaseRequestStatus.Pending_Finance:
        return (
          currentUserRole === UserRole.Finance ||
          currentUserRole === UserRole.Admin
        );

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

  const loading =
    isActionProcessing ||
    isCategoryLoading ||
    isDepartmentLoading ||
    isRequestsLoading;

  const handleWorkflowExecution = useCallback(
    async (
      actionType: WorkflowAction,
      payload?: WorkflowPayload
    ): Promise<boolean> => {
      if (!requestId || !request) return false;
      setIsActionProcessing(true);

      try {
        let updatedRequest: PurchaseRequestResponseDto;

        switch (actionType) {
          case WorkflowAction.Approve_Manager:
            updatedRequest = await managerApprovePurchaseRequest(
              Guid.parse(requestId),
              {
                note: payload?.note,
              }
            );
            break;

          case WorkflowAction.Approve_Finance:
            if (!payload?.purchaseOrderNumber) {
              toast.error(
                'A Purchase Order number is mandatory for financial clearance.'
              );
              return false;
            }
            updatedRequest = await financeApprovePurchaseRequest(
              Guid.parse(requestId),
              {
                purchaseOrderNumber: payload.purchaseOrderNumber,
                note: payload?.note,
              }
            );
            break;

          case WorkflowAction.Reject:
            if (request.status === PurchaseRequestStatus.Pending_Manager) {
              updatedRequest = await managerRejectPurchaseRequest(
                Guid.parse(requestId),
                {
                  note: payload?.note ?? 'Rejected by operational manager.',
                }
              );
            } else if (
              request.status === PurchaseRequestStatus.Pending_Finance
            ) {
              updatedRequest = await financeRejectPurchaseRequest(
                Guid.parse(requestId),
                {
                  note: payload?.note ?? 'Rejected during financial auditing.',
                }
              );
            } else {
              throw new Error(
                'This request cannot be rejected in its current workflow state.'
              );
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
        const clearErrorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to dispatch workflow modification.';
        toast.error(clearErrorMessage);

        if (import.meta.env.DEV)
          console.error(`[Workflow Pipeline Exception]:`, err);
        return false;
      } finally {
        setIsActionProcessing(false);
      }
    },
    [requestId, request, updateSingleRequestInStore]
  );

  return {
    request,
    loading,
    error, //  Now safely returning the error state to your page destructuring
    isAuthorizedForAction,
    showWorkflowPanel,
    resolvedCategory,
    resolvedDepartment,
    handleWorkflowExecution,
  };
};

export default useRequestDetailsWorkflow;
