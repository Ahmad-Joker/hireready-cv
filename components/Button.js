import Link from "next/link";

const variants = {
  primary:
    "bg-ink text-white border-ink hover:bg-slate-800 hover:border-slate-800 shadow-sm",
  secondary:
    "bg-white text-ink border-slate-300 hover:border-ink hover:bg-slate-50 shadow-sm",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-slate-100",
};

export default function Button({
  children,
  href,
  variant = "primary",
  disabled,
  onClick,
}) {
  const className = [
    "inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition",
    "focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2",
    disabled ? "pointer-events-none cursor-not-allowed opacity-45" : "",
    variants[variant] || variants.primary,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={className} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
