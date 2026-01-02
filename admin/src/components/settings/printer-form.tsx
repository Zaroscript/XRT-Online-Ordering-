import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useUpdateSettingsMutation } from '@/data/settings';
import { Settings } from '@/types';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { settingsValidationSchema } from './settings-validation-schema';

type FormValues = {
    printer: {
        printer_id: string;
        public_key: string;
        private_key: string;
    };
};

type IProps = {
    settings?: Settings | null;
};

export default function PrinterSettingsForm({ settings }: IProps) {
    const { t } = useTranslation();
    const { locale } = useRouter();
    const { mutate: updateSettingsMutation, isLoading: loading } =
        useUpdateSettingsMutation();
    const { options } = settings ?? {};

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        shouldUnregister: true,
        //@ts-ignore
        resolver: yupResolver(settingsValidationSchema),
        defaultValues: {
            printer: options?.printer ?? {
                printer_id: '',
                public_key: '',
                private_key: '',
            },
        },
    });

    async function onSubmit(values: FormValues) {
        updateSettingsMutation({
            language: locale!,
            options: {
                ...options,
                printer: values.printer,
            },
        });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit as any)}>
            <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                    title={t('form:form-title-printer-settings')}
                    details={t('form:printer-settings-help-text')}
                    className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />

                <Card className="w-full sm:w-8/12 md:w-2/3">
                    <Input
                        label={t('Printer ID')}
                        toolTipText={t('Your Star Micronics printer device ID')}
                        {...register('printer.printer_id')}
                        error={t(errors.printer?.printer_id?.message!)}
                        variant="outline"
                        className="mb-5"
                    />
                    <Input
                        label={t('Public Key')}
                        toolTipText={t('API public key from Star Micronics CloudPRNT')}
                        {...register('printer.public_key')}
                        error={t(errors.printer?.public_key?.message!)}
                        variant="outline"
                        className="mb-5"
                    />
                    <Input
                        label={t('Private Key')}
                        toolTipText={t('API private key from Star Micronics CloudPRNT')}
                        {...register('printer.private_key')}
                        error={t(errors.printer?.private_key?.message!)}
                        variant="outline"
                        className="mb-5"
                    />
                </Card>
            </div>

            <div className="mb-4 text-end">
                <Button loading={loading} disabled={loading}>
                    {t('form:button-label-save-settings')}
                </Button>
            </div>
        </form>
    );
}
