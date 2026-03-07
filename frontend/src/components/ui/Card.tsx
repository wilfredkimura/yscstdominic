import React from 'react';
import { motion } from 'framer-motion';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({
  children,
  className = '',
  hover = false,
  onClick
}: CardProps) {
  const baseClasses =
  'bg-softWhite rounded-xl shadow-soft overflow-hidden border border-cream-dark';
  const hoverClasses = hover ?
  'cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gold/30' :
  '';
  if (hover || onClick) {
    return (
      <motion.div
        whileHover={
        hover ?
        {
          y: -4
        } :
        {}
        }
        className={`${baseClasses} ${hoverClasses} ${className}`}
        onClick={onClick}>

        {children}
      </motion.div>);

  }
  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}