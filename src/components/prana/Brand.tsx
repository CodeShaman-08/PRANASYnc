import Link from "next/link";

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="prana-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111111" />
          <stop offset="50%" stopColor="#555555" />
          <stop offset="100%" stopColor="#9a9a9a" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="20.5" fill="none" stroke="rgba(0,0,0,0.16)" />
      <circle cx="22" cy="22" r="14.5" fill="none" stroke="url(#prana-grad)" strokeWidth="1.4" opacity="0.9" />
      <path d="M22 7.5 L22 22" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 22 L34.6 29.25" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 22 L9.4 29.25" stroke="#9a9a9a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="7.5" r="2.1" fill="#111111" />
      <circle cx="34.6" cy="29.25" r="2.1" fill="#555555" />
      <circle cx="9.4" cy="29.25" r="2.1" fill="#9a9a9a" />
      <circle cx="22" cy="22" r="3" fill="#ffffff" stroke="#111111" strokeWidth="1.2" />
    </svg>
  );
}

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <BrandMark className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[120deg]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-950">
            Prana<span className="text-neutral-600">Sync</span>
          </span>
          <span className="mt-1 text-[7.5px] uppercase tracking-[0.24em] text-neutral-500">
            bio-environmental ayurveda
          </span>
        </span>
      )}
    </Link>
  );
}
