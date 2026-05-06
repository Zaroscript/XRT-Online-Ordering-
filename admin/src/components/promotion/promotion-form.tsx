import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import TextArea from '@/components/ui/text-area';
import SwitchInput from '@/components/ui/switch-input';
import DatePicker from '@/components/ui/date-picker';
import FileInput from '@/components/ui/file-input';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import cn from 'classnames';
import {
  Promotion,
  PromotionInput,
  PromotionTemplateId,
  Attachment,
} from '@/types';
import {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from '@/data/promotion';
import { toast } from 'react-toastify';
import { getPromotionTemplateDefinition } from '@/config/promotionTemplates';
import { promotionFormDefaults, type PromotionFormValues } from './promotion-form-values';
import { buildPromotionRules, parseIds } from './promotion-rules';
import PromotionTemplateRuleFields from './promotion-template-rule-fields';
import { normalizeColor, getSoftColor } from '@/utils/color-utils';

type Props = {
  initialValues?: Promotion;
  /** When set (wizard step 2), template cannot be changed */
  lockedTemplateId?: PromotionTemplateId;
};

function mergeInitialPromotion(initialValues: Promotion): PromotionFormValues {
  return {
    ...promotionFormDefaults,
    template: initialValues.template,
    headline: initialValues.headline,
    description: initialValues.description || '',
    image_url: initialValues.image_url || '',
    image: initialValues.image_url ? ({
      thumbnail: initialValues.image_url,
      original: initialValues.image_url,
      id: 'existing',
    } as Attachment) : null,
    minimum_cart_amount: initialValues.minimum_cart_amount ?? 0,
    max_conversions: initialValues.max_conversions ?? '',
    is_active_on_website: initialValues.is_active_on_website ?? false,
    sort_order: initialValues.sort_order ?? 0,
    active_from: new Date(initialValues.active_from),
    expire_at: new Date(initialValues.expire_at),
    percentage: initialValues.rules?.percentage ?? '',
    amount: initialValues.rules?.amount ?? '',
    free_quantity: initialValues.rules?.free_quantity ?? 1,
    n: initialValues.rules?.n ?? 2,
    bundle_price: initialValues.rules?.bundle_price ?? '',
    menu_item_ids_csv:
      initialValues.template === 'meal_bundle'
        ? (initialValues.rules?.components || [])
            .map((component) => component.menu_item_id)
            .filter(Boolean)
            .join(', ')
        : (initialValues.rules?.menu_item_ids || []).join(', '),
    group_a_csv: (initialValues.rules?.group_a_ids || []).join(', '),
    group_b_csv: (initialValues.rules?.group_b_ids || []).join(', '),
    discount_cheapest_percent: initialValues.rules?.discount_cheapest_percent ?? 100,
    restrict_delivery_only:
      !!(initialValues.rules?.order_types &&
        initialValues.rules.order_types.length === 1 &&
        initialValues.rules.order_types[0] === 'delivery'),
    coupon_code: initialValues.rules?.coupon_code ?? '',
    cta_label: initialValues.cta_label?.trim() || 'Redeem',
  };
}

function StorefrontPreview({ 
  headline, 
  description, 
  image, 
  templateColor,
  ctaLabel,
}: { 
  headline: string; 
  description: string; 
  image: Attachment | null;
  templateColor?: string;
  ctaLabel: string;
}) {
  const accent = normalizeColor(templateColor, '#009f7f');
  const softAccent = getSoftColor(accent, 0.15);

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-muted-black font-bold text-sm">Storefront Preview</Label>
      <div className="overflow-hidden rounded-xl border border-border-200 bg-light shadow-sm transition-all">
        {/* Card Header/Image */}
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          {image?.original ? (
            <img 
              src={image.original} 
              alt="Preview" 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Badge */}
          <div 
            className="absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            Special Offer
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h4 className="text-base font-bold text-heading line-clamp-1">
            {headline || 'Offer Headline Goes Here'}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-body line-clamp-2 min-h-[32px]">
            {description || 'Provide a short, catchy description of what customers get with this promotion.'}
          </p>
          
          <div className="mt-4 flex items-center justify-between border-t border-border-100 pt-3">
            <span className="text-[10px] font-medium text-muted">Limited time deal</span>
            <div 
              className="rounded-full px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: softAccent, color: accent }}
            >
              {(ctaLabel || 'Redeem').trim() || 'Redeem'}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-light italic">
        * This is an approximation of how the card appears on the storefront.
      </p>
    </div>
  );
}

const STEPS = [
  { id: 1, title: 'Storefront Appearance', sub: 'Visuals & Copy' },
  { id: 2, title: 'Reward Logic', sub: 'Rules & Discount' },
  { id: 3, title: 'Schedule & Launch', sub: 'Timing & Limits' },
];

export default function PromotionForm({ initialValues, lockedTemplateId }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const { mutate: createPromotion, isPending: creating } = useCreatePromotionMutation();
  const { mutate: updatePromotion, isPending: updating } = useUpdatePromotionMutation();

  const form = useForm<PromotionFormValues>({
    defaultValues: initialValues
      ? mergeInitialPromotion(initialValues)
      : {
          ...promotionFormDefaults,
          ...(lockedTemplateId ? { template: lockedTemplateId } : {}),
        },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (lockedTemplateId && !initialValues) {
      setValue('template', lockedTemplateId, { shouldValidate: false });
    }
  }, [lockedTemplateId, initialValues, setValue]);

  const template = watch('template');
  const headline = watch('headline');
  const description = watch('description');
  const image = watch('image');
  const cta_label = watch('cta_label');
  const [active_from, expire_at] = watch(['active_from', 'expire_at']);

  const templateMeta = getPromotionTemplateDefinition(template);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['headline', 'description', 'cta_label'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fix the errors in this step first.');
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (values: PromotionFormValues) => {
    if (currentStepRef.current !== 3) return;

    let rules: Promotion['rules'];
    try {
      rules = buildPromotionRules(values.template, values);
      if (['percent_selected_items', 'percent_combo', 'free_item', 'buy_n_get_one_free'].includes(values.template)) {
        if (!rules.menu_item_ids?.length) {
          toast.error('Add at least one menu item ID for this promotion type.');
          return;
        }
      }
      if (values.template === 'meal_bundle') {
        if (!Array.isArray(rules.components) || !rules.components.length) {
          toast.error('Meal bundle requires components.');
          return;
        }
      }
      if (values.template === 'bogo') {
        const ga = parseIds(values.group_a_csv);
        const gb = parseIds(values.group_b_csv);
        const ids = parseIds(values.menu_item_ids_csv);
        if (!((ga.length && gb.length) || ids.length)) {
          toast.error('BOGO needs item IDs or two groups (A and B).');
          return;
        }
      }
      if (values.template === 'linked_coupon') {
        const code = String(values.coupon_code || '').trim();
        if (!code) {
          toast.error('Enter the coupon code this promotion should apply (must exist under Coupon codes).');
          return;
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Invalid promotion rules');
      return;
    }

    const payload: PromotionInput = {
      template: values.template,
      headline: values.headline.slice(0, 35),
      description: values.description?.slice(0, 100),
      image_url: values.image?.original || undefined,
      rules,
      active_from: new Date(values.active_from).toISOString(),
      expire_at: new Date(values.expire_at).toISOString(),
      minimum_cart_amount: Number(values.minimum_cart_amount) || 0,
      max_conversions: values.max_conversions === '' ? null : Number(values.max_conversions),
      is_active_on_website: values.is_active_on_website,
      sort_order: Number(values.sort_order) || 0,
      cta_label:
        String(values.cta_label || '').trim().slice(0, 24) || 'Redeem',
    };

    if (!initialValues) {
      createPromotion(payload as any);
    } else {
      updatePromotion({ id: initialValues.id, ...(payload as any) });
    }
  };

  const handleCancel = () => {
    if (lockedTemplateId && !initialValues) {
      void router.push('/promotions/create');
    } else {
      router.back();
    }
  };

  const persistPromotion = () => {
    if (currentStepRef.current !== 3) return;
    void handleSubmit(onSubmit)();
  };

  return (
    <div className="promotion-form-wizard">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start my-8">
        {/* Left Column: Persistent Preview */}
        <div className="w-full lg:w-[320px] lg:sticky lg:top-8 order-2 lg:order-1">
          <StorefrontPreview 
            headline={headline}
            description={description}
            image={image}
            templateColor={templateMeta?.color}
            ctaLabel={cta_label || 'Redeem'}
          />
        </div>

        {/* Right Column: Multi-step Form */}
        <div className="flex-1 space-y-6 order-1 lg:order-2">
          {/* Visual Stepper */}
          <div className="mb-10 flex justify-between items-center px-4 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -z-10 -translate-y-1/2 mx-8 hidden sm:block" />
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 group">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all shadow-sm",
                    currentStep === step.id 
                      ? "bg-accent border-accent text-white scale-110" 
                      : currentStep > step.id 
                        ? "bg-accent/10 border-accent text-accent" 
                        : "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
                <div className="text-center">
                  <p className={cn("text-[11px] font-bold uppercase tracking-wide", currentStep >= step.id ? "text-heading" : "text-gray-400")}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted hidden sm:block">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* STEP 1: Appearance */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="w-full p-6 sm:p-8">
                <div className="mb-8 border-b border-dashed border-border-200 pb-5">
                  <h2 className="text-lg font-semibold text-heading">Card Appearance</h2>
                  <p className="mt-1 text-sm text-body">Control how your promotion appears to customers on the storefront home page.</p>
                </div>

                <div className="mb-6">
                  <FileInput
                    label="Promotion Image"
                    name="image"
                    control={control}
                    multiple={false}
                    helperText="Recommended size 800x450px"
                  />
                </div>

                <Input
                  label="Headline (Display Text)"
                  {...register('headline', { required: 'Headline is required', maxLength: 35 })}
                  error={(errors.headline?.message as string) || ''}
                  variant="outline"
                  className="mb-5"
                  placeholder="e.g. 20% Off Your First Order"
                  required
                />

                <TextArea
                  label="Short Description"
                  {...register('description', { maxLength: 100 })}
                  variant="outline"
                  className="mb-5"
                  placeholder="Briefly explain the benefit..."
                  note="Maximum 100 characters."
                />

                <Input
                  label="Card button text"
                  {...register('cta_label', { maxLength: 24 })}
                  variant="outline"
                  className="mb-0"
                  placeholder="Redeem"
                  note="Shown on the storefront promotion card (e.g. Redeem, Claim offer)."
                />
              </Card>
            </div>
          )}

          {/* STEP 2: Logic */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="w-full p-6 sm:p-8">
                <div className="mb-8 border-b border-dashed border-border-200 pb-5">
                  <h2 className="text-lg font-semibold text-heading">Promotion Logic</h2>
                  <p className="mt-1 text-sm text-body">Configure the specific rules for the selected template.</p>
                </div>

                <div 
                  className="mb-6 rounded-lg border-l-4 p-4" 
                  style={{ borderColor: templateMeta?.color || '#1e40af', backgroundColor: getSoftColor(templateMeta?.color || '#1e40af', 0.05) }}
                >
                  <h4 className="text-sm font-bold text-heading">{templateMeta?.title}</h4>
                  <p className="mt-1 text-xs text-body">{templateMeta?.summary}</p>
                </div>

                <PromotionTemplateRuleFields
                  template={template}
                  register={register}
                  control={control}
                />
              </Card>
            </div>
          )}

          {/* STEP 3: Schedule */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <Card className="w-full p-6 sm:p-8">
                <div className="mb-8 border-b border-dashed border-border-200 pb-5">
                  <h2 className="text-lg font-semibold text-heading">Usage Conditions</h2>
                  <p className="mt-1 text-sm text-body">Set limits on who can use this promotion and when.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Minimum Cart Total"
                    type="number"
                    step="0.01"
                    {...register('minimum_cart_amount', { valueAsNumber: true })}
                    variant="outline"
                    placeholder="0.00"
                    note="Amount required before discount applies."
                  />
                  <Input
                    label="Usage Limit (Total Conversions)"
                    type="number"
                    {...register('max_conversions')}
                    variant="outline"
                    placeholder="Unlimited if empty"
                    note="Total number of times this can be used."
                  />
                </div>
              </Card>

              <Card className="w-full p-6 sm:p-8">
                <div className="mb-8 border-b border-dashed border-border-200 pb-5">
                  <h2 className="text-lg font-semibold text-heading">Scheduling & Visibility</h2>
                  <p className="mt-1 text-sm text-body">Control when the promotion is active and if it's visible on the public website.</p>
                </div>

                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <DatePicker
                    control={control as any}
                    name="active_from"
                    label="Launch Date"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    error={(errors.active_from?.message as string) || ''}
                    required
                  />
                  <DatePicker
                    name="expire_at"
                    label="Expiry Date"
                    control={control as any}
                    dateFormat="dd/MM/yyyy"
                    minDate={active_from ? new Date(active_from) : new Date()}
                    error={(errors.expire_at?.message as string) || ''}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-start">
                  <Input
                    label="Display Priority (Sort Order)"
                    type="number"
                    {...register('sort_order', { valueAsNumber: true })}
                    variant="outline"
                    note="Lower numbers appear first on the site."
                  />
                  <div className="flex flex-col justify-center border border-border-100 rounded-lg p-4 bg-gray-50/50 mt-1">
                    <div className="flex items-center gap-3">
                      <SwitchInput name="is_active_on_website" control={control as any} />
                      <div>
                        <Label className="mb-0 text-sm font-semibold">Publish on Website</Label>
                        <p className="text-xs text-muted mt-1">Make this deal visible on the storefront.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation — Bottom */}
          <div className="flex items-center justify-between pt-6 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleCancel : prevStep}
              className="h-12 px-8 bg-transparent"
            >
              {currentStep === 1 ? 'Discard' : 'Back'}
            </Button>

            <div className="flex gap-4">
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} className="h-12 px-10">
                  Next Step: {STEPS[currentStep].title}
                </Button>
              ) : (
                <Button
                  type="button"
                  loading={creating || updating}
                  onClick={persistPromotion}
                  className="h-12 px-10 bg-accent hover:bg-accent-hover text-white font-semibold"
                >
                  {initialValues ? 'Update Promotion' : 'Launch Promotion'}
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
