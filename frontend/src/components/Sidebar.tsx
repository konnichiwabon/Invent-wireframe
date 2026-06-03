import type { ReactNode } from "react";

interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
}

const navItems: SidebarItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    key: "assets",
    label: "Assets",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M4 7.5l4-4h8l4 4" />
        <path d="M9 12h6" />
      </svg>
    ),
  },
  {
    key: "people",
    label: "People",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "Reports",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19h16" />
        <path d="M7 16V8" />
        <path d="M12 16V5" />
        <path d="M17 16v-4" />
      </svg>
    ),
  },
  {
    key: "stock",
    label: "Stock",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    ),
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
];

const activeKey = "assets";

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const sidebarItemClass =
  "inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[18px] border-0 bg-transparent text-[inherit] transition-all duration-150 hover:bg-white/55 hover:text-gray-800 md:h-[42px] md:w-[42px] md:rounded-[20px]";
const activeSidebarItemClass =
  "bg-white text-blue-600 shadow-[0_8px_18px_rgba(15,23,42,0.1)] hover:bg-white hover:text-blue-600";
const sidebarIconClass =
  "inline-flex h-[22px] w-[22px] items-center justify-center [&>svg]:h-[17px] [&>svg]:w-[17px] md:h-6 md:w-6 md:[&>svg]:h-[19px] md:[&>svg]:w-[19px]";

export default function Sidebar() {
  return (
    <aside
      className="fixed bottom-3 left-3 top-[3.5rem] z-[150] flex w-[58px] flex-col items-center rounded-[18px] border border-white/65 bg-[#d4d4d4] px-[0.45rem] pb-3 text-slate-500 shadow-[0_18px_38px_rgba(15,23,42,0.12)] md:bottom-5 md:left-7 md:top-[3.5rem] md:w-[70px] md:rounded-[22px] md:px-[0.55rem] md:pb-[1.1rem]"
      aria-label="Primary navigation"
    >
      <div className="flex h-[54px] w-full shrink-0 items-end justify-center pb-2 md:h-[62px] md:pb-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-slate-50 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-150 hover:bg-white hover:text-gray-800 md:h-11 md:w-11"
          aria-label="User profile"
          title="User profile"
        >
          <svg
            className="h-5 w-5 md:h-[22px] md:w-[22px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0" />
          </svg>
        </button>
      </div>

      <nav
        className="flex w-full flex-1 flex-col items-center gap-[0.45rem] pt-1 md:gap-[0.35rem] md:pt-0"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cx(
              sidebarItemClass,
              item.key === activeKey && activeSidebarItemClass,
            )}
            aria-label={item.label}
            aria-current={item.key === activeKey ? "page" : undefined}
            title={item.label}
          >
            <span className={sidebarIconClass} aria-hidden="true">
              {item.icon}
            </span>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={cx(sidebarItemClass, "mt-auto text-slate-500")}
        aria-label="Settings"
        title="Settings"
      >
        <span className={sidebarIconClass} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V22a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H2a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.03a1.7 1.7 0 0 0 1-1.56V2a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.56h.03a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.03a1.7 1.7 0 0 0 1.56 1H22a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1z" />
          </svg>
        </span>
        <span className="sr-only">Settings</span>
      </button>
    </aside>
  );
}
