import { useModalState } from '@/components/ui/modal/modal.context';
import { useItemQuery } from '@/data/item';
import { useTranslation } from 'next-i18next';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { siteSettings } from '@/settings/site.settings';
import { resolveImageUrl } from '@/utils/resolve-image-url';
import usePrice, { formatPrice } from '@/utils/use-price';
import { CloseIcon } from '@/components/icons/close-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useSettings } from '@/contexts/settings.context';

const ItemPreviewView = () => {
    const { data: itemData } = useModalState();
    const { closeModal } = useModalAction();
    const { t } = useTranslation();
    const router = useRouter();
    const { locale } = router;
    const { currency, currencyOptions } = useSettings();
    const { formation, fractions } = currencyOptions || { formation: siteSettings.defaultLanguage, fractions: 2 };

    const { item, isLoading, error } = useItemQuery(
        {
            id: itemData?.id,
            language: locale!,
        },
        {
            enabled: !!itemData?.id,
        }
    );

    // Type assertion for item
    const itemDataTyped = item as any;

    // Call usePrice hook unconditionally (before early returns) to follow Rules of Hooks
    const { price } = usePrice({
        amount: itemDataTyped?.base_price || 0,
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader simple={true} />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="p-6">
                <ErrorMessage message={error?.message || t('common:text-item-not-found')} />
            </div>
        );
    }

    // Get image source - prioritize original for better quality, especially for SVG
    const getImageSrc = () => {
        if (!itemDataTyped.image) return siteSettings.product.placeholder;
        if (typeof itemDataTyped.image === 'string') return itemDataTyped.image;
        // For Cloudinary, prefer original over thumbnail, especially for SVG
        const imageObj = itemDataTyped.image as any;
        return imageObj?.original || imageObj?.thumbnail || siteSettings.product.placeholder;
    };

    const rawSrc = getImageSrc();
    const imageSrc = rawSrc === siteSettings.product.placeholder ? rawSrc : resolveImageUrl(rawSrc) || rawSrc;
    const isSVG = imageSrc?.toLowerCase().endsWith('.svg') || imageSrc?.includes('.svg') || imageSrc?.includes('image/svg');

    return (
        <div className="relative m-auto w-full max-w-5xl rounded-lg bg-white shadow-xl">
            {/* Close Button */}
            <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none"
                aria-label={t('common:text-close')}
            >
                <CloseIcon width={18} />
            </button>

            <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="relative h-80 w-full overflow-hidden bg-gray-50 lg:h-auto lg:w-2/5">
                    <div className="relative flex h-full w-full items-center justify-center">
                        <img
                            src={imageSrc}
                            alt={itemDataTyped.name}
                            className={`h-full w-full ${
                                isSVG ? 'object-contain p-4' : 'object-cover'
                            }`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = siteSettings.product.placeholder;
                            }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}
                        />
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-6 md:p-8 lg:w-3/5">
                    {/* Title and Price Header */}
                    <div className="mb-6 border-b border-gray-200 pb-4">
                        <h2 className="mb-3 text-3xl font-bold text-heading">{itemDataTyped.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-accent">{price}</span>
                            {itemDataTyped.is_signature && (
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                                    {t('form:input-label-signature-dish')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {itemDataTyped.description && (
                        <div className="mb-6">
                            <h3 className="mb-3 text-lg font-semibold text-heading">
                                {t('form:input-label-description')}
                            </h3>
                            <div
                                className="prose prose-sm max-w-none text-body"
                                dangerouslySetInnerHTML={{ __html: itemDataTyped.description }}
                            />
                        </div>
                    )}

                    {/* Item Details Grid */}
                    <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                        {/* Status */}
                        <div className="flex flex-col">
                            <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('form:input-label-status')}
                            </span>
                            <span
                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                    itemDataTyped.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {itemDataTyped.is_active
                                    ? t('common:text-active')
                                    : t('common:text-inactive')}
                            </span>
                        </div>

                        {/* Availability */}
                        <div className="flex flex-col">
                            <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('form:input-label-availability')}
                            </span>
                            <span
                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                    itemDataTyped.is_available
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {itemDataTyped.is_available
                                    ? t('common:text-available')
                                    : t('common:text-unavailable')}
                            </span>
                        </div>

                        {/* Sizeable */}
                        {itemDataTyped.is_sizeable && (
                            <div className="flex flex-col">
                                <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t('form:input-label-sizeable')}
                                </span>
                                <span className="text-sm font-semibold text-heading">
                                    {itemDataTyped.sizes?.length || 0} {t('common:text-sizes')}
                                </span>
                            </div>
                        )}

                        {/* Customizable */}
                        {itemDataTyped.is_customizable && (
                            <div className="flex flex-col">
                                <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t('form:input-label-customizable')}
                                </span>
                                <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                    {t('common:text-yes')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sizes */}
                    {itemDataTyped.is_sizeable && itemDataTyped.sizes && itemDataTyped.sizes.length > 0 && (
                        <div className="mt-4">
                            <h3 className="mb-4 text-lg font-semibold text-heading">
                                {t('form:input-label-sizes')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {itemDataTyped.sizes.map((size: any, index: number) => {
                                    // Format price directly without using hook (hooks can't be in loops)
                                    const sizeAmount = size.price || itemDataTyped.base_price || 0;
                                    const formattedPrice = formatPrice({
                                        amount: sizeAmount,
                                        currencyCode: currency || 'USD',
                                        locale: formation || locale || siteSettings.defaultLanguage,
                                        fractions: fractions || 2,
                                    });
                                    return (
                                        <div
                                            key={index}
                                            className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-accent hover:shadow-md"
                                        >
                                            <div className="mb-2 font-semibold text-heading">{size.name}</div>
                                            <div className="text-lg font-bold text-accent">{formattedPrice}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemPreviewView;

