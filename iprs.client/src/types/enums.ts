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

export const WorkflowAction = {
  Approve_Manager: 'Approve_Manager',
  Approve_Finance: 'Approve_Finance',
  Reject: 'Reject',
  Cancel: 'Cancel',
  Edit: 'Edit',
} as const;

export type WorkflowAction =
  (typeof WorkflowAction)[keyof typeof WorkflowAction];

export const UserRole = {
  Employee: 'Employee',
  Manager: 'Manager',
  Finance: 'Finance',
  Admin: 'Admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const LoginMethod = {
  EmployeeId: 'employee ID',
  Email :'email',
}  as const;

export type LoginMethod = (typeof LoginMethod)[keyof typeof LoginMethod];
