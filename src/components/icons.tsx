export function InboxIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 3h6l2-3h4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 5.5 3 12v6a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-6l-2.5-6.5A1.5 1.5 0 0 0 17.1 4H6.9a1.5 1.5 0 0 0-1.4 1.5Z"
      />
    </svg>
  );
}

export function TodayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v3M16 3v3M3.5 9.5h17" />
    </svg>
  );
}

export function ClockIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4.5l3 2" />
    </svg>
  );
}
