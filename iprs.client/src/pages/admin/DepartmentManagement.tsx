import { DataDialog } from '@/components/management/DataDialog';
import { ManagementTable } from '@/components/management/ManagementTable';
import DepartmentManagementToolbar from '@/components/management/toolbars/DepartmentManagementToolbar';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import { Button } from '@/shadcn-ui/components/ui/button';
import useDepartmentStore from '@/stores/useDepartmentStore';
import useUserStore from '@/stores/useUserStore';
import type {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from '@/types/department';
import { UserRole } from '@/types/enums';
import type { ManagementField } from '@/types/management';
import { formatDate } from '@/utils/date';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function DepartmentManagement() {
  const { setTitle } = useHeaderTitle();
  const { departments, createDepartment, modifyDepartment } =
    useDepartmentStore();
  const systemUsers = useUserStore((state) => state.users);

  const [selectedDept, setSelectedDept] = useState<
    DepartmentResponseDto | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTitle('Department Management');
  }, [setTitle]);

  const managerOptions = useMemo(() => {
    const managers = systemUsers.filter((u) => u.role === UserRole.Manager);
    const unassignedManagers = managers.filter(
      (u) => u.departmentId === null || u.departmentId === selectedDept?.id
    );

    return unassignedManagers.map((m) => ({
      label: m.fullName || 'Unknown User',
      value: m.id.toString(),
    }));
  }, [systemUsers, selectedDept]);

  const departmentFormFields: ManagementField[] = [
    {
      name: 'name',
      label: 'Department Name',
      type: 'text',
      placeholder: 'e.g. Operations Control Room',
    },
    {
      name: 'managerId',
      label: 'Assigned Department Manager',
      type: 'select',
      options: managerOptions,
    },
  ];

  const handleFormSubmit = (data: Record<string, unknown>) => {
    if (selectedDept) {
      modifyDepartment(selectedDept.id, data as UpdateDepartmentDto);
    } else {
      createDepartment(data as CreateDepartmentDto);
    }
  };

  const columns: ColumnDef<DepartmentResponseDto>[] = [
    { accessorKey: 'name', header: 'Department Name' },
    {
      accessorKey: 'managerId',
      header: 'Department Manager',
      filterFn: (row, columnId, filterValue: string) => {
        const searchStr = filterValue.toLowerCase().trim();
        if (!searchStr) return true;

        const deptName = (
          (row.getValue(columnId) as string) ?? ''
        ).toLowerCase();
        if (deptName.includes(searchStr)) return true;

        const managerId = row.original.managerId;
        const manager = systemUsers.find((u) => u.id === managerId);
        const managerName = manager
          ? manager.fullName.toLowerCase()
          : 'unassigned';

        return managerName.includes(searchStr);
      },
      cell: ({ row }) =>
        systemUsers.find((u) => u.id === row.original.managerId)?.fullName ??
        'Unassigned',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => {
            setSelectedDept(row.original);
            setIsModalOpen(true);
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <ManagementTable
        title="Corporate Departments"
        subtitle="Configure corporate cost centers, divisions, and direct operational leadership heads."
        addButtonLabel="Add Department"
        onAddClick={() => {
          setSelectedDept(undefined);
          setIsModalOpen(true);
        }}
        columns={columns}
        data={departments}
        customToolbar={(tabel) => <DepartmentManagementToolbar table={tabel} />}
      />

      <DataDialog
        key={selectedDept?.id ?? (isModalOpen ? 'open' : 'closed')}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Department"
        fields={departmentFormFields}
        initialValues={
          selectedDept as unknown as Record<string, string | number | boolean>
        }
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
