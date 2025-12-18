import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
    variant?: 'white' | 'blue' | 'yellow' | 'pink' | 'gradient';
}

export function Card({ className, children, hover = false, variant = 'white', ...props }: CardProps) {
    const variants = {
        white: 'bg-white',
        blue: 'bg-gradient-to-br from-[var(--primary-50)] to-white border border-[var(--primary-100)]',
        yellow: 'bg-gradient-to-br from-[var(--warning-50)] to-white border border-[var(--warning-100)]',
        pink: 'bg-gradient-to-br from-pink-50 to-white border border-pink-100',
        gradient: 'bg-[var(--gradient-primary)] text-white',
    };

    return (
        <div
            className={cn(
                'rounded-3xl shadow-[var(--shadow-soft-md)] p-6 sm:p-8 transition-all duration-300 relative overflow-hidden',
                variants[variant],
                hover && 'hover:shadow-[var(--shadow-soft-lg)] hover:-translate-y-2 hover:scale-[1.02] cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div className={cn('mb-3 sm:mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
    return (
        <h3
            className={cn('text-lg sm:text-xl font-bold text-[var(--gray-900)] font-[Poppins]', className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
    return (
        <p className={cn('text-xs sm:text-sm text-[var(--gray-600)] mt-2 leading-relaxed', className)} {...props}>
            {children}
        </p>
    );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-[var(--border)]', className)} {...props}>
            {children}
        </div>
    );
}
