import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    isLoading?: boolean;
    fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, isLoading, disabled, fullWidth = false, ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';

        const variants = {
            primary:
                'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-[var(--shadow-glow)] hover:shadow-lg hover:-translate-y-1 focus-visible:ring-[var(--primary-200)]',
            secondary:
                'bg-white text-[var(--primary-600)] border-2 border-[var(--primary-100)] hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)] shadow-sm hover:-translate-y-1 focus-visible:ring-[var(--primary-100)]',
            success:
                'bg-gradient-to-r from-[var(--success-500)] to-[var(--success-600)] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 focus-visible:ring-[var(--success-200)]',
            danger:
                'bg-gradient-to-r from-[var(--error-500)] to-[var(--error-600)] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 focus-visible:ring-[var(--error-200)]',
            ghost:
                'text-[var(--gray-600)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)] font-medium',
        };

        const sizes = {
            sm: 'text-xs px-5 py-2.5',
            md: 'text-sm px-8 py-3.5',
            lg: 'text-base px-10 py-5',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
