const iconClass = "inline-flex h-4 w-4 items-center justify-center text-current";
const iconSvgClass = "h-4 w-4";
const buttonClass =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-[0.45rem] whitespace-nowrap rounded-[14px] border px-[0.95rem] font-[inherit] text-[0.85rem] font-semibold transition-all duration-150 md:w-auto";
const secondaryButtonClass = `${buttonClass} border-[#e8eaf0] bg-white text-[#5a6178] hover:border-[#cbd5f0] hover:text-[#1a1a2e] hover:shadow-[0_6px_14px_rgba(15,23,42,0.08)]`;
const filterButtonClass = `${secondaryButtonClass} md:w-[88px] md:min-w-[84px] md:max-w-[96px]`;

export default function FilterButton() {
  return (
    <button className={filterButtonClass} type="button">
      <span className={iconClass} aria-hidden="true">
        <svg
          className={iconSvgClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 4 21 4 14 12 14 19 10 21 10 12 3 4" />
        </svg>
      </span>
      Filter
    </button>
  );
}
