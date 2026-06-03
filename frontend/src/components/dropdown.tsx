import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { ReactNode } from "react";

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  formatOption?: (option: string) => string;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  icon,
  formatOption = (option) => option,
}: DropdownProps) {
  const currentLabel = value === "All" ? label : formatOption(value);

  return (
    <Menu as="div" className="relative w-full md:w-[160px] md:min-w-[150px] md:max-w-[174px]">
      <MenuButton className="inline-flex h-10 w-full items-center gap-[0.45rem] rounded-[14px] border border-[#e8eaf0] bg-white px-[0.85rem] pr-3 font-[inherit] text-[0.85rem] font-semibold text-[#1a1a2e] shadow-[0_2px_6px_rgba(15,23,42,0.05)] transition-all duration-150 hover:border-[#cbd5f0] hover:shadow-[0_6px_14px_rgba(15,23,42,0.08)]">
        {icon && (
          <span className="inline-flex h-4 w-4 items-center justify-center text-[#8b92a5]" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
        <ChevronDownIcon aria-hidden="true" className="h-4 w-4 flex-none text-[#94a3b8]" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="z-[220] mt-2 w-48 origin-top-right rounded-[14px] border border-[#e8eaf0] bg-white p-1 shadow-[0_14px_30px_rgba(15,23,42,0.14)] outline-none transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {options.map((option) => (
          <MenuItem key={option}>
            <button
              type="button"
              className="block w-full rounded-[10px] px-3 py-2 text-left text-sm font-semibold text-[#5a6178] data-focus:bg-[#f1f5f9] data-focus:text-[#1a1a2e]"
              onClick={() => onChange(option)}
            >
              {option === "All" ? label : formatOption(option)}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
