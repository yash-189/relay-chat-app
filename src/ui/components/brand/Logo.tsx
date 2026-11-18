import { site } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="size-7" aria-hidden="true">
        <rect width="64" height="64" rx="15" className="fill-primary" />
        <g
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        >
          <path d="M41.2 22.8A13 13 0 1 0 41.2 41.2" />
          <path d="M23 41.5 18.5 47" />
        </g>
        <circle cx="44" cy="32" r="3.6" className="fill-primary-foreground" />
      </svg>
      <span className="font-semibold text-lg tracking-tight">{site.name}</span>
    </span>
  );
}
