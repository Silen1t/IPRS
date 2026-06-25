import {
  useForm,
  Controller,
  type Resolver,
  type FieldValues,
} from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn-ui/components/ui/dialog';
import { Button } from '@/shadcn-ui/components/ui/button';
import { Input } from '@/shadcn-ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/shadcn-ui/components/ui/field'; 
import { type ManagementField } from '@/types/management';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import DialogCheckbox from './dialog-components/DialogCheckbox';

interface DataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: ManagementField[];
  initialValues?: Record<string, string | boolean | number>;
  onSubmit: (data: Record<string, unknown>) => void;
  onValuesChange?: (fieldName: string, value: unknown) => void;
  resolver?: Resolver<FieldValues>;
}

export function DataDialog({
  isOpen,
  onClose,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  onValuesChange,
  resolver,
}: DataDialogProps) {
  const isEdit = !!initialValues?.id;

  const { handleSubmit, control, reset, watch } = useForm<
    Record<string, unknown>
  >({
    defaultValues: initialValues ?? {},
    resolver: resolver,
  });

  useEffect(() => {
    reset(initialValues ?? {});
  }, [initialValues, reset]);

  useEffect(() => {
    if (!onValuesChange) return;

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((formValues, { name }) => {
      if (name) {
        onValuesChange(name, formValues[name]);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  const handleFormSubmit = (data: Record<string, unknown>) => {
    onSubmit(data);
    onClose();
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-106.25"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${title}` : `Create ${title}`}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* --- NEW: Wrapped fields container in FieldGroup for structural layout consistency --- */}
          <FieldGroup className="space-y-4 pt-2">
            {fields.map((field) => {
              if (isEdit && field.showOnEdit === false) return null;
              if (!isEdit && field.showOnCreate === false) return null;

              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: formField, fieldState }) => {
                    const rawError = fieldState.error?.message;
                    const cleanError = rawError
                      ? sanitizeErrorMessage(rawError, field.label)
                      : undefined;

                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={formField.name}>
                          {field.label}
                        </FieldLabel>

                        {field.type === 'checkbox' ? (
                          <DialogCheckbox
                            name={formField.name}
                            value={!!formField.value}
                            onChange={formField.onChange}
                            label={field.label}
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            value={formField.value?.toString() ?? ''}
                            onValueChange={formField.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  field.placeholder ?? `Select ${field.label}`
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'password' && !isEdit ? (
                          <div className="flex gap-2 items-center w-full">
                            <Input
                              {...formField}
                              id={formField.name}
                              type={showPassword ? 'text' : 'password'}
                              placeholder={field.placeholder}
                              aria-invalid={fieldState.invalid}
                              value={(formField.value as string) ?? ''}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="shrink-0 h-9 w-9"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Input
                            {...formField}
                            id={formField.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                            value={(formField.value as string | number) ?? ''}
                          />
                        )}

                        {fieldState.invalid && (
                          <FieldError
                            errors={[
                              { ...fieldState.error, message: cleanError },
                            ]}
                          />
                        )}
                      </Field>
                    );
                  }}
                />
              );
            })}
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function sanitizeErrorMessage(message: string, label: string): string {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('expected string') ||
    lowerMessage.includes('received undefined')
  ) {
    return `${label} is required.`;
  }

  if (
    lowerMessage.includes('expected one of') ||
    lowerMessage.includes('invalid option')
  ) {
    return `Please select a valid option for ${label}.`;
  }

  if (lowerMessage.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  return message;
}
