import { Badge } from '@/shadcn-ui/components/ui/badge';
import useCategoryStore from '@/stores/useCategoryStore';

interface CategoryCellProps {
  categoryId: string | number;
}

export function CategoryCell({ categoryId }: CategoryCellProps) {
  const categories = useCategoryStore((state) => state.categories);
  const name = categories.find((c) => c.id == categoryId)?.name;

  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      {name || 'General'}
    </Badge>
  );
}