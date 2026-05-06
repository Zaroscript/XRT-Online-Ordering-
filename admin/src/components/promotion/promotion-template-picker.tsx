import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PROMOTION_TEMPLATE_CATEGORIES,
  templatesByCategory,
  type PromotionTemplateDefinition,
  type PromotionTemplateCategoryId,
} from '@/config/promotionTemplates';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import Input from '@/components/ui/input';
import Card from '@/components/common/card';
import { normalizeColor } from '@/utils/color-utils';
import { CartIconBig } from '@/components/icons/cart-icon-bag';
import { ProductIcon } from '@/components/icons/product-icon';
import { DeliveryIcon } from '@/components/icons/delivery-icon';
import { SidebarCategoryIcon } from '@/components/icons/sidebar-category-icon';
import { SearchIcon } from '@/components/icons/search-icon';

const categoryIconMap: Record<PromotionTemplateCategoryId, React.ElementType> = {
  cart_discounts: CartIconBig,
  item_deals: ProductIcon,
  shipping: DeliveryIcon,
  bundles: SidebarCategoryIcon,
};

function TemplateCard({ 
  def, 
  categoryColor 
}: { 
  def: PromotionTemplateDefinition; 
  categoryColor: string 
}) {
  const Icon = categoryIconMap[def.category];
  const accentColor = normalizeColor(def.color || categoryColor);

  return (
    <Link
      href={`/promotions/create/${def.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border-200 bg-light p-6 transition-all duration-200 hover:border-accent hover:shadow-cardAction focus:outline-none focus:ring-2 focus:ring-accent/50"
    >
      {/* Dynamic Accent Bar */}
      <div 
        className="absolute left-0 top-0 h-full w-1" 
        style={{ backgroundColor: accentColor }}
      />

      <div className="mb-5 flex items-start">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-100 bg-gray-50 transition-colors group-hover:bg-white"
          style={{ color: accentColor }}
        >
          <Icon width="22" height="22" />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold text-heading group-hover:text-accent">
          {def.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-body">
          {def.summary}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border-100 pt-4">
        <span className="text-sm font-semibold text-accent flex items-center gap-1.5">
          Select Template
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function PromotionTemplatePicker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(PROMOTION_TEMPLATE_CATEGORIES[0].id);
  
  const byCat = useMemo(() => templatesByCategory(), []);

  const filteredItems = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const result: Record<string, PromotionTemplateDefinition[]> = {};
    
    PROMOTION_TEMPLATE_CATEGORIES.forEach(cat => {
      result[cat.id] = byCat[cat.id].filter(item => 
        item.title.toLowerCase().includes(search) || 
        item.summary.toLowerCase().includes(search)
      );
    });
    
    return result;
  }, [searchTerm, byCat]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header Section */}
      <Card className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between !p-6 sm:!p-8">
        <div>
          <h2 className="text-xl font-bold text-heading">Campaign Templates</h2>
          <p className="text-sm text-body mt-1">Select a template to start creating your promotion</p>
        </div>
        <div className="relative w-full md:w-80">
          <Input
            name="search"
            showLabel={false}
            placeholder="Search by template name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            inputClassName="pl-10 h-11"
          />
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </Card>

      <Tabs defaultTab={PROMOTION_TEMPLATE_CATEGORIES[0].id} onTabChange={setActiveTab}>
        <TabList className="mb-8 !border-b-border-200">
          {PROMOTION_TEMPLATE_CATEGORIES.map((cat) => (
            <Tab 
              key={cat.id} 
              id={cat.id}
              badge={filteredItems[cat.id]?.length}
            >
              {cat.title}
            </Tab>
          ))}
        </TabList>

        {PROMOTION_TEMPLATE_CATEGORIES.map((cat) => {
          const items = filteredItems[cat.id];
          return (
            <TabPanel key={cat.id} id={cat.id}>
              {/* Category Info */}
              <div className="mb-8 border-l-4 border-accent-300 pl-4 py-1">
                <h3 className="text-lg font-bold text-heading">{cat.title}</h3>
                <p className="text-sm text-body-dark/70 mt-0.5">{cat.description}</p>
              </div>
              
              {!items?.length ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-base bg-light/50">
                  <SearchIcon className="h-10 w-10 text-border-base mb-3" />
                  <p className="text-base font-medium text-body">No templates match your search</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Clear search filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((def) => (
                    <TemplateCard 
                      key={def.id} 
                      def={def} 
                      categoryColor={cat.color} 
                    />
                  ))}
                </div>
              )}
            </TabPanel>
          );
        })}
      </Tabs>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted">
          Templates define the logic and rules for your campaign.
        </p>
      </div>
    </div>
  );
}
