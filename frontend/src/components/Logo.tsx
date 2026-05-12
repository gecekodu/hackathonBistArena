export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="10" fill="#4f46e5" />
          <path
            d="M9 25L15 16L19.5 21L27 11"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="27" cy="11" r="2" fill="#fbbf24" />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold leading-tight text-white tracking-tight">
            BorsaArena
          </span>
          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            Trading Platform
          </span>
        </div>
      )}
    </div>
  );
}
