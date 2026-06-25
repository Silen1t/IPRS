import { Checkbox } from '@/shadcn-ui/components/ui/checkbox';

interface DialogCheckboxProps {
  name: string;
  label: string;
  onChange?(checked: boolean): void;
  value: unknown;
}

export default function DialogCheckbox({
  name,
  label,
  onChange,
  value,
}: DialogCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 pt-2">
      <Checkbox id={name} checked={!!value} onCheckedChange={onChange} />
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none cursor-pointer text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}
