interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const iconClass = "inline-flex h-4 w-4 items-center justify-center text-current";
const iconSvgClass = "h-4 w-4";
const inputClass =
  "min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-[0.88rem] text-[#1a1a2e] outline-none placeholder:text-[#8b92a5]";

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex h-10 min-w-[220px] items-center gap-[0.55rem] rounded-[14px] border border-[#e8eaf0] bg-white px-[0.85rem] shadow-[0_2px_6px_rgba(15,23,42,0.05)] md:w-[min(42vw,560px)]">
      <span className={`${iconClass} text-[#8b92a5]`} aria-hidden="true">
        <svg
          className={iconSvgClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        id="search-inventory"
        type="text"
        className={inputClass}
        placeholder="Search assets..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
