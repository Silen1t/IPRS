import { DataDialog } from '@/components/management/DataDialog';
import { ManagementTable } from '@/components/management/ManagementTable';
import CategoryManagementToolbar from '@/components/management/toolbars/CategoryManagementToolbar';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import { Button } from '@/shadcn-ui/components/ui/button';
import useCategoryStore from '@/stores/useCategoryStore';
import type {
  CategoryLookupDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/category';
import type { ManagementField } from '@/types/management';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CategoryManagement() {
  const { setTitle } = useHeaderTitle();
  const { categories, createCategory, modifyCategory } = useCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<
    CategoryLookupDto | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTitle('Category Management');
  }, [setTitle]);

  const categoryFormFields: ManagementField[] = [
    {
      name: 'name',
      label: 'Category Name',
      type: 'text',
      placeholder: 'e.g. Production Hardware',
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      showOnCreate: false,
    },
  ];

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (selectedCategory) {
      await modifyCategory(selectedCategory.id, data as UpdateCategoryDto);
    } else {
      await createCategory(data as CreateCategoryDto);
    }
  };

  const columns: ColumnDef<CategoryLookupDto>[] = [
    { accessorKey: 'name', header: 'Category Type' },
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
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => {
            setSelectedCategory(row.original);
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
        title="Asset Categories"
        subtitle="Organize catalog request item scopes, classification groups, and hardware fields."
        addButtonLabel="Add Category"
        onAddClick={() => {
          setSelectedCategory(undefined);
          setIsModalOpen(true);
        }}
        columns={columns}
        data={categories}
        customToolbar={(tabel) => <CategoryManagementToolbar table={tabel} />}
      />

      <DataDialog
        key={selectedCategory?.id ?? (isModalOpen ? 'open' : 'closed')}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Category"
        fields={categoryFormFields}
        initialValues={
          selectedCategory as unknown as Record<
            string,
            string | number | boolean
          >
        }
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
