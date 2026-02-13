import cn from 'classnames';
import { ReactNode } from 'react';
import { NoDataFound } from '@/components/icons/no-data-found';
import Button from '@/components/ui/button';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            {/* Icon */}
            <div className="mb-4">
                {icon || <NoDataFound className="w-40 h-40 text-gray-300" />}
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-heading mb-2">{title}</h3>

            {/* Description */}
            {description && (
                <p className="text-sm text-body max-w-sm mb-6">{description}</p>
            )}

            {/* Action button */}
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

interface EmptySearchStateProps {
    searchTerm: string;
    onClear?: () => void;
    className?: string;
}

export function EmptySearchState({
    searchTerm,
    onClear,
    className,
}: EmptySearchStateProps) {
    return (
        <EmptyState
            title="No results found"
            description={`We couldn't find any results for "${searchTerm}". Try adjusting your search.`}
            actionLabel={onClear ? 'Clear search' : undefined}
            onAction={onClear}
            className={className}
        />
    );
}

interface EmptyListStateProps {
    itemName: string;
    onAdd?: () => void;
    className?: string;
}

export function EmptyListState({
    itemName,
    onAdd,
    className,
}: EmptyListStateProps) {
    return (
        <EmptyState
            title={`No ${itemName} yet`}
            description={`Get started by creating your first ${itemName.toLowerCase()}.`}
            actionLabel={onAdd ? `Add ${itemName}` : undefined}
            onAction={onAdd}
            className={className}
        />
    );
}
