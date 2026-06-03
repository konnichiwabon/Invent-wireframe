interface AddAssetButtonProps {
  onClick: () => void;
}

const iconClass = "inline-flex h-4 w-4 items-center justify-center text-current";
const iconSvgClass = "h-4 w-4";
const buttonClass =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-[0.45rem] whitespace-nowrap rounded-[14px] border px-[0.95rem] font-[inherit] text-[0.85rem] font-semibold transition-all duration-150 md:w-auto";
const addAssetButtonClass = `${buttonClass} border-transparent bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)] hover:shadow-[0_14px_26px_rgba(37,99,235,0.3)] md:w-[128px] md:min-w-[122px] md:max-w-[144px] md:hover:-translate-y-px`;

export default function AddAssetButton({ onClick }: AddAssetButtonProps) {
  return (
    <button
      id="add-device-btn"
      className={addAssetButtonClass}
      type="button"
      onClick={onClick}
    >
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
      Add Asset
    </button>
  );
}
