export type FieldOption = {
  label: string;
  value: string;
};

export type ManagementField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select'  | 'checkbox';
  placeholder?: string;
  options?: FieldOption[];
  showOnEdit?: boolean;
  showOnCreate?: boolean;
};