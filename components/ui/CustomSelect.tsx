'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, SlidersHorizontal } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ElementType;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  icon: Icon = SlidersHorizontal,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 hover:border-rose-500/50 text-slate-200 text-xs font-bold transition-all shadow-lg active:scale-95 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 truncate">
          <Icon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rose-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1.5 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-rose-600/20 text-rose-300 font-bold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
