import { useState, createContext, useContext, ReactNode } from 'react';
import cn from 'classnames';

type TabsContextType = {
    activeTab: string;
    setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

// Main Tabs container
interface TabsProps {
    defaultTab: string;
    children: ReactNode;
    className?: string;
    onChange?: (tabId: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleSetActiveTab = (id: string) => {
        setActiveTab(id);
        onChange?.(id);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

// Tab list container (for tab buttons)
interface TabListProps {
    children: ReactNode;
    className?: string;
}

export function TabList({ children, className }: TabListProps) {
    return (
        <div
            className={cn(
                'flex flex-nowrap gap-1 sm:gap-2 border-b border-border-200 mb-4 sm:mb-6',
                'overflow-x-auto scrollbar-hide',
                'scroll-smooth', // Smooth scrolling
                'min-w-0 max-w-full', // Prevent flex items from overflowing
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

// Individual tab button
interface TabProps {
    id: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    badge?: number;
}

export function Tab({ id, children, className, icon, badge }: TabProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === id;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3',
                'text-xs sm:text-sm font-medium whitespace-nowrap',
                'border-b-2 -mb-px transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                'flex-shrink-0 min-w-fit', // Prevent tabs from shrinking
                isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-body hover:text-heading hover:border-border-base',
                className
            )}
        >
            {icon && <span className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">{icon}</span>}
            <span className="truncate max-w-[120px] sm:max-w-none">{children}</span>
            {badge !== undefined && badge > 0 && (
                <span
                    className={cn(
                        'inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs rounded-full flex-shrink-0',
                        isActive ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

// Tab panel (content area)
interface TabPanelProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === id;

    // Keep content mounted but hidden to preserve form state
    return (
        <div
            id={`tabpanel-${id}`}
            role="tabpanel"
            aria-labelledby={id}
            aria-hidden={!isActive}
            className={cn(
                isActive ? 'animate-fade-in' : 'hidden',
                className
            )}
        >
            {children}
        </div>
    );
}

// Mobile-friendly tabs as dropdown
interface MobileTabSelectProps {
    tabs: Array<{ id: string; label: string; badge?: number }>;
    className?: string;
}

export function MobileTabSelect({ tabs, className }: MobileTabSelectProps) {
    const { activeTab, setActiveTab } = useTabsContext();

    return (
        <div className={cn('sm:hidden mb-4', className)}>
            <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full rounded-md border-border-base bg-white py-2.5 pl-3 pr-10 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            >
                {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                        {tab.label} {tab.badge !== undefined && tab.badge > 0 ? `(${tab.badge})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Tabs;
