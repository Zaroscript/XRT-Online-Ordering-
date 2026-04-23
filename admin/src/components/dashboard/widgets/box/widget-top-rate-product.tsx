import { Product, ProductType } from '@/types';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import { siteSettings } from '@/settings/site.settings';
import { NoDataFound } from '@/components/icons/no-data-found';
import cn from 'classnames';
import Scrollbar from '@/components/ui/scrollbar';
import { isEmpty } from 'lodash';
import { IosArrowDown } from '@/components/icons/ios-arrow-down';

export type IProps = {
  products: Product[] | undefined;
  title: string;
  className?: string;
};

function LessSoldProductCard({ product, index }: { product: any; index: number }) {
  const {
    name,
    image,
    product_type,
    type,
    price,
    max_price,
    min_price,
    sale_price,
  } = product ?? {};

  const { price: currentPrice, basePrice } = usePrice({
    amount: sale_price ? sale_price : price!,
    baseAmount: price ?? 0,
  });
  const { price: minPrice } = usePrice({
    amount: min_price ?? 0,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price ?? 0,
  });

  return (
    <div className="group relative flex w-full flex-wrap items-center justify-between rounded-xl border border-border-200/50 bg-light p-3 shadow-sm transition-all duration-200 hover:border-red-500 hover:shadow-md">
      {/* Rank Badge - Red for Less Sold */}
      <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
        {index + 1}
      </div>

      <div className="flex w-full max-w-[calc(100%-120px)] items-center pe-2">
        <div className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border-200/60 bg-gray-100/50">
          <img
            alt={name || 'Product image'}
            src={image?.thumbnail ?? image?.original ?? siteSettings?.product?.placeholder}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="w-4/5 ps-4">
          <h4 className="-mb-px truncate text-[15px] font-semibold text-heading group-hover:text-red-500 transition-colors">
            {name}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-body">
              {type?.name || 'Product'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-500">
              <IosArrowDown className="w-3 h-3" />
              Sold {product.orders_count || 0} times
            </span>
          </div>
        </div>
      </div>

      {product_type === ProductType.Variable ? (
        <div className="mb-2 max-w-[120px] shrink-0 text-end">
          <span className="text-sm font-bold text-heading">
            {minPrice} - {maxPrice}
          </span>
        </div>
      ) : (
        <div className="mb-2 flex max-w-[120px] shrink-0 flex-col items-end text-end">
          <span className="text-sm font-bold text-heading">
            {currentPrice}
          </span>
          {basePrice && (
            <del className="text-[11px] text-muted ms-1">
              {basePrice}
            </del>
          )}
        </div>
      )}
    </div>
  );
}

const LessSoldProductWidget = ({ products, title, className }: IProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white p-6 shadow-sm md:p-8 border border-border-200 flex flex-col',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100/80 text-red-500">
            <IosArrowDown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-heading">
              {t('text-less-sold-products') || 'Less Sold Products'}
            </h3>
            <p className="text-sm text-body">
              {t('text-less-sold-guide') || 'Products that require attention'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {!Array.isArray(products) || products.length === 0 ? (
          <div className="flex h-[calc(100%-60px)] items-center justify-center">
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="pt-6 mb-1 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px] text-body">{t('table:empty-table-sorry-text')}</p>
            </div>
          </div>
        ) : (
          <div className="popular-product-scrollbar sidebar-scrollbar h-full max-h-[372px] w-[calc(100%+12px)] overflow-x-hidden lg:max-h-[420px] xl:max-h-[540px] 2xl:max-h-[368px]">
            <Scrollbar
              className="h-full w-full pe-3"
              options={{
                scrollbars: {
                  autoHide: 'never',
                },
              }}
            >
              <div className="space-y-4 pt-2 pb-4 px-2">
                {products.map((product: Product, index: number) => (
                  <LessSoldProductCard key={`less-sold-${product.id || index}`} product={product} index={index} />
                ))}
              </div>
            </Scrollbar>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessSoldProductWidget;
