import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
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
import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/config/routes';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import useCategoryStore from '@/stores/useCategoryStore';
import { toast } from 'sonner';
import { Guid } from 'guid-typescript';
import RequestNotFoundState from '@/components/requests/detaill/RequestNotFoundState';
import { updatePurchaseRequestSchema } from '@/schemas/purchaseRequest';
import { useEffect } from 'react';
import { formatMoney } from '@/utils/money';

type FormValues = z.infer<typeof updatePurchaseRequestSchema>;

const hideNumberSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function EditRequestForm() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const request = usePurchaseRequestStore(
    (state) => state.purchaseRequests
  ).find((r) => r.id === requestId);

  const updateRequest = usePurchaseRequestStore((state) => state.updateRequest);
  const submitRequest = usePurchaseRequestStore((state) => state.submitRequest);

  const categories = useCategoryStore((state) => state.categories);

  const validationSchema = updatePurchaseRequestSchema.superRefine(
    (data, ctx) => {
      const calculatedTotal =
        (Number(data.quantity) || 0) * (Number(data.unitPrice) || 0);

      if (
        calculatedTotal > 50000 &&
        (!data.description || data.description.trim() === '')
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'A justification description is required for requests exceeding 50,000 SAR.',
          path: ['description'],
        });
      }
    }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      id: request?.id,
      title: request?.title,
      categoryId: request?.categoryId,
      quantity: request?.quantity,
      unitPrice: request?.unitPrice,
      urgencyLevel: request?.urgencyLevel,
      description: request?.description || '',
    },
  });

  useEffect(() => {
    if (request && !form.formState.isDirty) {
      form.reset({
        id: request.id,
        title: request.title,
        categoryId: request.categoryId,
        quantity: request.quantity,
        unitPrice: request.unitPrice,
        urgencyLevel: request.urgencyLevel,
        description: request.description || '',
      });
    }
  }, [request, form, form.formState.isDirty]);

  const watchQuantity = useWatch({ control: form.control, name: 'quantity' });
  const watchUnitPrice = useWatch({ control: form.control, name: 'unitPrice' });
  const totalPrice =
    (Number(watchQuantity) || 0) * (Number(watchUnitPrice) || 0);

  const onFormSubmit = async (data: FormValues, submit: boolean) => {
    if (!request) return;

    try {
      await updateRequest(data);

      if (submit) {
        await submitRequest(Guid.parse(request?.id ?? ''));
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
                  Changes Saved Successfully
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  "{data.title}" updates have been committed to draft.
                </span>
              </div>
            </div>
          </>
        );
      }
      navigate(ROUTES.requests.detail(request?.id ?? ''));
    } catch (error) {
      console.error('Procurement Form Error:', error);
      toast.error(
        <>
          <div className="flex flex-col gap-1">
            <div className="font-medium text-sm text-destructive">
              Form Update Failed
            </div>
            <div className="text-xs text-muted-foreground">
              An unexpected issue stopped your update parameters. Please verify
              your fields and try again.
            </div>
          </div>
        </>
      );
    }
  };

  if (!request) {
    return (
      <RequestNotFoundState
        onReturn={() => navigate(ROUTES.dashboard.home, { replace: true })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
          Edit Purchase Request
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Modify your draft parameters below before entering the approval
          lifecycle routing.
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
                {formatMoney(totalPrice)}
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
                value={field.value ?? ''}
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
            Save Changes
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
