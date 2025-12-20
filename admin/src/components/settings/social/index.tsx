import Card from '@/components/common/card';
import { SaveIcon } from '@/components/icons/save';
import * as socialIcons from '@/components/icons/social';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import SelectInput from '@/components/ui/select-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useUpdateSettingsMutation } from '@/data/settings';
import { socialIcon } from '@/settings/site.settings';
import { ContactDetailsInput, Settings, ShopSocialInput } from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { getIcon } from '@/utils/get-icon';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFieldArray, useForm } from 'react-hook-form';

type SocialFormValues = {
    contactDetails: {
        socials: ShopSocialInput[];
    };
};

type IProps = {
    settings?: Settings | null;
};

export const updatedIcons = socialIcon.map((item: any) => {
    item.label = (
        <div className="flex items-center text-body space-s-4">
            <span className="flex items-center justify-center w-4 h-4">
                {getIcon({
                    iconList: socialIcons,
                    iconName: item.value,
                    className: 'w-4 h-4',
                })}
            </span>
            <span>{item.label}</span>
        </div>
    );
    return item;
});

export default function SocialSettingsForm({ settings }: IProps) {
    const { mutate: updateSettingsMutation, isLoading: loading } =
        useUpdateSettingsMutation();
    const { t } = useTranslation();
    const { options } = settings ?? {};
    const { locale } = useRouter();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { dirtyFields },
    } = useForm<SocialFormValues>({
        shouldUnregister: true,
        defaultValues: {
            contactDetails: {
                socials: options?.contactDetails?.socials
                    ? options?.contactDetails?.socials.map((social: any) => ({
                        icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
                        url: social?.url,
                    }))
                    : [],
            },
        },
    });

    const {
        fields: socialFields,
        append: socialAppend,
        remove: socialRemove,
    } = useFieldArray({
        control,
        name: 'contactDetails.socials',
    });

    async function onSubmit(values: any) {
        const contactDetails = {
            ...options?.contactDetails,
            socials: values?.contactDetails?.socials
                ? values?.contactDetails?.socials?.map((social: any) => ({
                    icon: social?.icon?.value || social?.icon,
                    url: social?.url,
                }))
                : [],
        };

        updateSettingsMutation({
            language: locale,
            options: {
                ...options,
                contactDetails,
            },
        });
        reset(values, { keepValues: true });
    }

    const isDirty = Object.keys(dirtyFields).length > 0;
    useConfirmRedirectIfDirty({ isDirty });

    return (
        <form onSubmit={handleSubmit(onSubmit as any)}>
            <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8 sm:mt-8 sm:mb-3">
                <Description
                    title={t('form:social-settings')}
                    details={t('form:social-settings-helper-text')}
                    className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />

                <Card className="w-full sm:w-8/12 md:w-2/3">
                    {/* Social and Icon picker */}
                    <div>
                        {socialFields?.map(
                            (item: ShopSocialInput & { id: string }, index: number) => (
                                <div
                                    className="py-5 border-b border-dashed border-border-200 first:pt-0 last:border-b-0 md:py-8"
                                    key={item.id}
                                >
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                                        <div className="sm:col-span-2">
                                            <SelectInput
                                                name={`contactDetails.socials.${index}.icon` as const}
                                                control={control}
                                                options={updatedIcons}
                                                isClearable={true}
                                                defaultValue={item?.icon!}
                                                label={t('form:input-label-select-platform')}
                                                toolTipText={t(
                                                    'form:input-tooltip-company-social-platform',
                                                )}
                                            />
                                        </div>
                                        <Input
                                            className="sm:col-span-2"
                                            label={t('form:input-label-social-url')}
                                            toolTipText={t('form:input-tooltip-company-profile-url')}
                                            variant="outline"
                                            {...register(
                                                `contactDetails.socials.${index}.url` as const,
                                            )}
                                            defaultValue={item.url!}
                                        />
                                        <button
                                            onClick={() => {
                                                socialRemove(index);
                                            }}
                                            type="button"
                                            className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                                        >
                                            {t('form:button-label-remove')}
                                        </button>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                    <Button
                        type="button"
                        onClick={() => socialAppend({ icon: '', url: '' })}
                        className="w-full sm:w-auto"
                    >
                        {t('form:button-label-add-social')}
                    </Button>
                </Card>
            </div>

            <StickyFooterPanel className="z-0">
                <Button
                    loading={loading}
                    disabled={loading || !Boolean(isDirty)}
                    className="text-sm md:text-base"
                >
                    <SaveIcon className="relative w-6 h-6 top-px shrink-0 ltr:mr-2 rtl:pl-2" />
                    {t('form:button-label-save-settings')}
                </Button>
            </StickyFooterPanel>
        </form>
    );
}
