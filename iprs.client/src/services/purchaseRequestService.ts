import type { Guid } from 'guid-typescript';
import type {
  CreatePurchaseRequestDto,
  FinanceApproveDto,
  FinanceRejectDto,
  ManagerRejectDto,
  ManagerReviewDto,
  PurchaseRequestResponseDto,
  UpdatePurchaseRequestDto,
} from '../schemas/purchaseRequest';
import type { PurchaseRequestStatus } from '../types/enums';
import { api } from './api';

export async function getAllPurchaseRequests(
  from: string | null,
  to: string | null,
  status: PurchaseRequestStatus | null,
  departmentId: number | null
): Promise<PurchaseRequestResponseDto[]> {
  const res = await api.get<PurchaseRequestResponseDto[]>('requests', {
    params: {
      from: from ?? undefined,
      to: to ?? undefined,
      status: status ?? undefined,
      departmentId: departmentId ?? undefined,
    },
  });

  return res.data;
}

export async function getPurchaseRequestById(
  id: Guid
): Promise<PurchaseRequestResponseDto> {
  const res = await api.get<PurchaseRequestResponseDto>(`requests/${id}`);
  return res.data;
}

export async function createPurchaseRequest(
  dto: CreatePurchaseRequestDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>('requests', dto);
  return res.data;
}

export async function editPurchaseRequest(
  id: Guid,
  dto: UpdatePurchaseRequestDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.put<PurchaseRequestResponseDto>(`requests/${id}`, dto);
  return res.data;
}

export async function submitPurchaseRequest(
  id: Guid
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/submit`
  );
  return res.data;
}
export async function cancelPurchaseRequest(
  id: Guid
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/cancel`
  );
  return res.data;
}

export async function managerApprovePurchaseRequest(
  id: Guid,
  dto: ManagerReviewDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/manager-approve`,
    dto
  );
  return res.data;
}

export async function managerRejectPurchaseRequest(
  id: Guid,
  dto: ManagerRejectDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/manager-reject`,
    dto
  );
  return res.data;
}

export async function financeApprovePurchaseRequest(
  id: Guid,
  dto: FinanceApproveDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/finance-approve`,
    dto
  );
  return res.data;
}

export async function financeRejectPurchaseRequest(
  id: Guid,
  dto: FinanceRejectDto
): Promise<PurchaseRequestResponseDto> {
  const res = await api.post<PurchaseRequestResponseDto>(
    `requests/${id}/finance-reject`,
    dto
  );
  return res.data;
}


