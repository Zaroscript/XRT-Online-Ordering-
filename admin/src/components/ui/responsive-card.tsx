import cn from 'classnames';
import { ReactNode } from 'react';

interface ResponsiveCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    isActive?: boolean;
    isDeleting?: boolean;
    isToggling?: boolean;
}

/** Mobile card replacing table rows; same styling/interactions. */
export function ResponsiveCard({
    children,
    className,
    onClick,
    isActive = true,
    isDeleting = false,
    isToggling = false,
}: ResponsiveCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white rounded-lg border border-border-200 p-4',
                'transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-md hover:border-accent/30',
                isDeleting && 'animate-pulse bg-red-50 border-red-200',
                isToggling && 'animate-pulse bg-accent/10 border-accent/30',
                !isActive && 'opacity-60',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-3', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('font-medium text-heading text-base', className)}>
            {children}
        </h3>
    );
}

interface CardBadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
}

export function CardBadge({ children, variant = 'default', className }: CardBadgeProps) {
    const variantStyles = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {children}
        </div>
    );
}

interface CardRowProps {
    label: string;
    value: ReactNode;
    className?: string;
}

export function CardRow({ label, value, className }: CardRowProps) {
    return (
        <div className={cn('flex items-center justify-between text-sm', className)}>
            <span className="text-body">{label}</span>
            <span className="text-heading font-medium">{value}</span>
        </div>
    );
}

interface CardActionsProps {
    children: ReactNode;
    className?: string;
}

export function CardActions({ children, className }: CardActionsProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 pt-3 mt-3 border-t border-border-100',
                className
            )}
        >
            {children}
        </div>
    );
}

export default ResponsiveCard;
