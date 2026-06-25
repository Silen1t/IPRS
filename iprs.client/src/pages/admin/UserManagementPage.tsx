import { DataDialog } from '@/components/management/DataDialog';
import { ManagementTable } from '@/components/management/ManagementTable';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import { Button } from '@/shadcn-ui/components/ui/button';
import useDepartmentStore from '@/stores/useDepartmentStore';
import useUserStore from '@/stores/useUserStore';
import { UserRole } from '@/types/enums';
import type { ManagementField } from '@/types/management';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/types/users';
import type { ColumnDef } from '@tanstack/react-table';
import { Guid } from 'guid-typescript';
import { Edit2, UserCheck, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { createUserSchema, updateUserSchema } from '@/schemas/user';
import type { FieldValues, Resolver } from 'react-hook-form';
import UserManagementToolbar from '@/components/management/toolbars/UserManagementToolbar';

export default function UserManagementPage() {
  const { setTitle } = useHeaderTitle();
  const { users, createUser, modifyUser, activateUser, deactivateUser } =
    useUserStore();

  const { departments } = useDepartmentStore();

  const [selectedUser, setSelectedUser] = useState<UserResponseDto | undefined>(
    undefined
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [trackedRole, setTrackedRole] = useState<UserRole | undefined>(
    undefined
  );

  useEffect(() => {
    setTitle('User Management');
  }, [setTitle]);

  const isEditMode = !!selectedUser;
  const dynamicFormResolver = useMemo(() => {
    const preprocessedDepartmentId = z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null;
      return Number(val);
    }, z.number().int().nullable().optional());

    if (isEditMode) {
      const extendedUpdateSchema = updateUserSchema.extend({
        departmentId: preprocessedDepartmentId,
      });

      return zodResolver(
        extendedUpdateSchema
      ) as unknown as Resolver<FieldValues>;
    } else {
      const extendedCreateSchema = createUserSchema.extend({
        departmentId: preprocessedDepartmentId,
      });

      return zodResolver(
        extendedCreateSchema
      ) as unknown as Resolver<FieldValues>;
    }
  }, [isEditMode]);

  const departmentsOptions = useMemo(() => {
    return departments.map((d) => ({
      label: d.name,
      value: d.id.toString(),
    }));
  }, [departments]);

  const userFormFields = useMemo<ManagementField[]>(() => {
    const activeRole =
      trackedRole ?? (selectedUser?.role as UserRole | undefined);

    const isFinanceOrHigher =
      activeRole === UserRole.Finance || activeRole === UserRole.Admin;

    const baseFields: ManagementField[] = [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        placeholder: 'e.g. Abdullah Ali',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'name@company.com',
      },
      {
        name: 'password',
        label: 'Security Password',
        type: 'password',
        placeholder: '••••••••',
        showOnEdit: false,
      },
      {
        name: 'role',
        label: 'System Access Role',
        type: 'select',
        options: [
          { label: 'Admin', value: UserRole.Admin },
          { label: 'Finance', value: UserRole.Finance },
          { label: 'Manager', value: UserRole.Manager },
          { label: 'Employee', value: UserRole.Employee },
        ],
      },
    ];

    if (!isFinanceOrHigher) {
      baseFields.push(
        {
          name: 'departmentId',
          label: 'Assigned Department',
          type: 'select',
          options: departmentsOptions,
        },
        {
          name: 'removeDepartment',
          label: 'Remove Department Alignment From Profile',
          type: 'checkbox',
          showOnCreate: false,
        }
      );
    }

    return baseFields;
  }, [departmentsOptions, trackedRole, selectedUser]);

  const handleToggleActive = (idString: string, isActive: boolean) => {
    const guidId = Guid.parse(idString);
    if (isActive) {
      deactivateUser(guidId);
    } else {
      activateUser(guidId);
    }
  };

  const handleFormSubmit = (data: Record<string, unknown>) => {
    if (selectedUser) {
      modifyUser(Guid.parse(selectedUser.id), data as UpdateUserDto);
    } else {
      createUser(data as CreateUserDto);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTrackedRole(undefined);
  };

  const columns: ColumnDef<UserResponseDto>[] = [
    { accessorKey: 'fullName', header: 'Full Name' },
    { accessorKey: 'employeeId', header: 'Employee ID' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        const variantStyles: Record<string, string> = {
          Admin:
            'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
          Finance:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
          Manager:
            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900',
          Employee:
            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-900',
        };
        const currentStyle =
          variantStyles[role] || 'bg-muted text-muted-foreground border-border';
        return (
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm ${currentStyle}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'departmentId',
      header: 'Department',
      filterFn: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId);

        if (filterValue === null) {
          return rowValue === null || rowValue === undefined;
        }

        return rowValue === filterValue;
      },
      cell: ({ row }) => {
        const departmentName = departments.find(
          (d) => d.id === row.original.departmentId
        )?.name;
        return (
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm`}
          >
            {departmentName ?? 'Unassigned'}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'}`}
        >
          {row.original.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              setSelectedUser(row.original);
              setTrackedRole(undefined);
              setIsModalOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 ${row.original.isActive ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
            onClick={() =>
              handleToggleActive(row.original.id, row.original.isActive)
            }
          >
            {row.original.isActive ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ManagementTable
        title="System Users"
        subtitle="Manage directory user definitions, system privileges, and department context links."
        addButtonLabel="Add User"
        onAddClick={() => {
          setSelectedUser(undefined);
          setTrackedRole(undefined);
          setIsModalOpen(true);
        }}
        columns={columns}
        data={users}
        customToolbar={(tabel) => <UserManagementToolbar table={tabel} />}
      />

      <DataDialog
        key={selectedUser?.id ?? (isModalOpen ? 'open' : 'closed')}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="User"
        fields={userFormFields}
        initialValues={
          selectedUser as unknown as Record<string, string | number | boolean>
        }
        onSubmit={handleFormSubmit}
        onValuesChange={(fieldName: string, value: unknown) => {
          if (fieldName === 'role') {
            setTrackedRole(value as UserRole);
          }
        }}
        resolver={dynamicFormResolver}
      />
    </>
  );
}
