import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2 font-[Poppins]">
                        {label}
                        {props.required && <span className="text-[var(--error-500)] ml-1">*</span>}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'w-full px-4 py-3 border-2 border-[var(--border)] rounded-md font-[Inter] text-base',
                        'transition-all duration-200',
                        'focus:outline-none focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-50)]',
                        'disabled:bg-[var(--gray-100)] disabled:cursor-not-allowed',
                        'placeholder-[var(--gray-400)]',
                        error && 'border-[var(--error-500)] focus:border-[var(--error-500)] focus:ring-[var(--error-50)]',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-[var(--error-500)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-[var(--gray-500)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
