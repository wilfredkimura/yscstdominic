import React from 'react';
import { Link } from 'react-router-dom';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'link';
  to?: string;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as = 'button',
  to,
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
    'bg-burgundy text-softWhite hover:bg-burgundy-light shadow-sm hover:shadow-md',
    secondary:
    'border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-softWhite',
    ghost: 'text-navy hover:text-burgundy hover:bg-cream-dark'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  if (as === 'link' && to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>);

  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>);

}