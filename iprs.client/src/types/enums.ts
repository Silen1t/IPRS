export const UrgencyLevel = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
} as const;

export type UrgencyLevel = (typeof UrgencyLevel)[keyof typeof UrgencyLevel];

export const PurchaseRequestStatus = {
  Draft: 'Draft',
  Pending_Manager: 'Pending_Manager',
  Pending_Finance: 'Pending_Finance',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
} as const;

export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

export const UserRole = {
  Employee: 'Employee',
  Manager: 'Manager',
  Finance: 'Finance',
  Admin: 'Admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export enum LoginMethod {
  EmployeeId = 'Employee ID',
  Email = 'Email',
}
