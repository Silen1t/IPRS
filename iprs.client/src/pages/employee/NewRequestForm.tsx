import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shadcn-ui/components/ui/button';
import { Input } from '@/shadcn-ui/components/ui/input';
import { Textarea } from '@/shadcn-ui/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import { Field, FieldLabel, FieldError } from '@/shadcn-ui/components/ui/field';
import { SaudiRiyal } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { toast } from 'sonner';
import { Guid } from 'guid-typescript';

// 1. Adjusted the Zod Schema to handle empty string submissions gracefully via invalid_type_error
const formSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters.')
      .max(100, 'Title must be at most 100 characters.'),
    categoryId: z
      .number({ error: 'Please select a valid functional category.' })
      .min(1, 'Please select a valid functional category.'),
    quantity: z
      .number({ error: 'Quantity is required and must be a number.' })
      .min(1, 'Quantity must be at least 1.'),
    unitPrice: z
      .number({ error: 'Unit price is required and must be a number.' })
      .min(0, 'Unit price cannot be a negative value.'),
    urgencyLevel: z.enum(['Low', 'Medium', 'High', 'Critical'], {
      error: () => ({ message: 'Please select an urgency level.' }),
    }),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const calculatedTotal =
      (Number(data.quantity) || 0) * (Number(data.unitPrice) || 0);

    if (
      calculatedTotal > 50000 &&
      (!data.description || data.description.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'A justification description is required for requests exceeding 50,000 SAR.',
        path: ['description'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const hideNumberSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function NewRequestForm() {
  const navigate = useNavigate();
  const createRequest = usePurchaseRequestStore((state) => state.createRequest);
  const refreshPurchaseRequests = usePurchaseRequestStore(
    (state) => state.refreshPurchaseRequests
  );
  const submitRequest = usePurchaseRequestStore((state) => state.submitRequest);
  const categories = useCategoryStore((state) => state.categories);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    // 2. All values initialized to empty strings to trigger placeholder states cleanly
    defaultValues: {
      title: '',
      categoryId: '' as unknown as number,
      quantity: '' as unknown as number,
      unitPrice: '' as unknown as number,
      urgencyLevel: '' as unknown as 'Low' | 'Medium' | 'High' | 'Critical',
      description: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchQuantity = form.watch('quantity');
  const watchUnitPrice = form.watch('unitPrice');
  const totalPrice =
    (Number(watchQuantity) || 0) * (Number(watchUnitPrice) || 0);

  const onFormSubmit = async (data: FormValues, submit: boolean) => {
    try {
      const request = await createRequest(data);
      console.log(request);
      if (submit) {
        await submitRequest(Guid.parse(request.id));
        toast.success(
          <>
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  Request Has Been Submitted Successfully
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  "{data.title}" is now pending manager approval.
                </span>
              </div>
            </div>
          </>
        );
      } else {
        toast.success(
          <>
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  Request Saved Successfully
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  "{data.title}" is now recorded as a draft.
                </span>
              </div>
            </div>
          </>
        );
      }
      await refreshPurchaseRequests();

      navigate(ROUTES.requests.detail(request.id));
    } catch (error) {
      console.error('Procurement Form Error:', error);
      toast.error(
        <>
          <div className="flex flex-col gap-1">
            <div className="font-medium text-sm text-destructive">
              Form Submission Failed
            </div>
            <div className="text-xs text-muted-foreground">
              An unexpected issue stopped your submission. Please verify and try
              again.
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
          Create Purchase Request
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fill out the details below to submit a new procurement request.
        </p>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Title Field */}
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Development Team Workstations"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Category & Urgency Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value ? field.value.toString() : ''}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="urgencyLevel"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Urgency Level</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Quantity, Unit Price & Total Price Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Controller
            name="quantity"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="1"
                  value={field.value}
                  placeholder="e.g., 5"
                  className={hideNumberSpinners}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="unitPrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Unit Price</FieldLabel>
                <div className="relative flex items-center">
                  <SaudiRiyal className="absolute left-3 size-4 text-muted-foreground/70 pointer-events-none" />
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value}
                    className={`pl-9 ${hideNumberSpinners}`}
                    aria-invalid={fieldState.invalid}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="space-y-1.5">
            <FieldLabel>Total Price</FieldLabel>
            <div className="relative flex items-center">
              <SaudiRiyal className="absolute left-3 size-4 text-muted-foreground/50 pointer-events-none" />
              <div className="flex h-9 w-full rounded-md border border-input bg-muted/40 px-9 py-1 text-sm shadow-sm items-center font-mono text-muted-foreground select-none">
                {totalPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Provide specifications, justification, or supplier links..."
                rows={4}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit((data) => onFormSubmit(data, false))}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit((data) => onFormSubmit(data, true))}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
