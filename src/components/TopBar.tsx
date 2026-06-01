import Dropdown from "./dropdown";

interface TopBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  departments: string[];
  activeDept: string;
  onDepartmentChange: (value: string) => void;
  onAddAsset: () => void;
}

const iconClass = "inline-flex h-4 w-4 items-center justify-center text-current";
const iconSvgClass = "h-4 w-4";
const inputClass =
  "min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-[0.88rem] text-[#1a1a2e] outline-none placeholder:text-[#8b92a5]";
const buttonClass =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-[0.45rem] whitespace-nowrap rounded-[14px] border px-[0.95rem] font-[inherit] text-[0.85rem] font-semibold transition-all duration-150 md:w-auto";
const secondaryButtonClass = `${buttonClass} border-[#e8eaf0] bg-white text-[#5a6178] hover:border-[#cbd5f0] hover:text-[#1a1a2e] hover:shadow-[0_6px_14px_rgba(15,23,42,0.08)]`;
const filterButtonClass = `${secondaryButtonClass} md:w-[88px] md:min-w-[84px] md:max-w-[96px]`;
const addAssetButtonClass = `${buttonClass} border-transparent bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)] hover:shadow-[0_14px_26px_rgba(37,99,235,0.3)] md:w-[128px] md:min-w-[122px] md:max-w-[144px] md:hover:-translate-y-px`;
const moreButtonClass = `${secondaryButtonClass} h-10 w-10 min-w-[40px] max-w-[40px] flex-none basis-auto px-0`;

export default function TopBar({
  searchTerm,
  onSearchTermChange,
  departments,
  activeDept,
  onDepartmentChange,
  onAddAsset,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-[160] bg-transparent pt-4">
      <div className="flex w-full flex-col items-stretch justify-between gap-[0.9rem] md:flex-row md:items-center">
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
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-[0.55rem] md:ml-auto md:w-auto md:flex-nowrap md:justify-end">
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
          <Dropdown
            label="Department"
            options={departments}
            value={activeDept}
            onChange={onDepartmentChange}
            icon={
              <svg
                className={iconSvgClass}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="13" y2="16" />
              </svg>
            }
          />
          <button
            id="add-device-btn"
            className={addAssetButtonClass}
            type="button"
            onClick={onAddAsset}
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
        </div>
      </div>
    </div>
  );
}
