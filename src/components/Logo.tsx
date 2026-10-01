export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-brand-600" />
      <circle cx="10" cy="10" r="3.6" fill="#fff" />
      <circle cx="22" cy="22" r="3.6" fill="#fff" />
      <path d="M22 5.5l4.5 4.5-4.5 4.5-4.5-4.5zM10 17.5l4.5 4.5-4.5 4.5-4.5-4.5z" fill="#fff" opacity=".55" />
    </svg>
  );
}
