import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  category?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
  category,
}) => {
  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-300">
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      >
        <span className="flex items-center gap-3">
          {category && (
            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {category}
            </span>
          )}
          <span>{title}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = 'space-y-3' }) => {
  return <div className={className}>{children}</div>;
};
