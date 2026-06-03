const iconClass = "inline-flex h-4 w-4 items-center justify-center text-current";
const iconSvgClass = "h-4 w-4";
const buttonClass =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-[0.45rem] whitespace-nowrap rounded-[14px] border px-[0.95rem] font-[inherit] text-[0.85rem] font-semibold transition-all duration-150 md:w-auto";
const secondaryButtonClass = `${buttonClass} border-[#e8eaf0] bg-white text-[#5a6178] hover:border-[#cbd5f0] hover:text-[#1a1a2e] hover:shadow-[0_6px_14px_rgba(15,23,42,0.08)]`;
const moreButtonClass = `${secondaryButtonClass} h-10 w-10 min-w-[40px] max-w-[40px] flex-none basis-auto px-0`;

export default function MoreOptionsButton() {
  return (
    <button
      className={moreButtonClass}
      type="button"
      aria-label="More options"
    >
      <span className={iconClass} aria-hidden="true">
        <svg className={iconSvgClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </span>
    </button>
  );
}
