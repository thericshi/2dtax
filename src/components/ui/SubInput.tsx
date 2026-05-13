import React, { memo } from 'react';

interface SubInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function SubInput({ label, value, onChange, onFocus, icon, disabled }: SubInputProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-black/20 p-3.5 rounded-2xl border border-white/[0.05] focus-within:border-white/20 focus-within:bg-white/[0.02] transition-all">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 font-black">$</span>
        <input
          type="text"
          inputMode="numeric"
          // Force value to empty if disabled so the placeholder shows
          value={disabled || value === 0 ? '' : value.toLocaleString('en-US')}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '');
            onChange(Number(digitsOnly.slice(0, 12)));
          }}
          onFocus={onFocus}
          disabled={disabled}
          className="w-full bg-transparent outline-none py-1 pl-6 pr-2 text-lg font-black text-white placeholder:text-white/10"
          placeholder="0"
        />
      </div>
    </div>
  );
}

export default memo(SubInput);