"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  minYear?: number;
  maxMonth?: number;
  maxYear?: number;
}

export default function MonthYearPicker({
  month,
  year,
  onChange,
  minYear = 2010,
  maxMonth,
  maxYear,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const ref = useRef<HTMLDivElement>(null);

  const now = new Date();
  const effectiveMaxMonth = maxMonth ?? now.getMonth() + 1;
  const effectiveMaxYear = maxYear ?? now.getFullYear();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isDisabled(m: number, y: number) {
    if (y > effectiveMaxYear) return true;
    if (y === effectiveMaxYear && m > effectiveMaxMonth) return true;
    if (y < minYear) return true;
    return false;
  }

  function handleSelect(m: number) {
    if (isDisabled(m, viewYear)) return;
    onChange(m, viewYear);
    setOpen(false);
  }

  function handlePrevYear() {
    if (viewYear > minYear) setViewYear(viewYear - 1);
  }

  function handleNextYear() {
    if (viewYear < effectiveMaxYear) setViewYear(viewYear + 1);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setViewYear(year);
          setOpen(!open);
        }}
        className="flex items-center gap-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-gray-900 hover:border-coral-400 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span>{MONTH_FULL_NAMES[month - 1]} {year}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevYear}
              disabled={viewYear <= minYear}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">{viewYear}</span>
            <button
              type="button"
              onClick={handleNextYear}
              disabled={viewYear >= effectiveMaxYear}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {MONTH_NAMES.map((name, idx) => {
              const m = idx + 1;
              const disabled = isDisabled(m, viewYear);
              const selected = m === month && viewYear === year;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(m)}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-coral-500 text-white"
                      : disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-coral-50 hover:text-coral-600"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
