const OcsLogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="white">
    <rect x="4" y="10" width="32" height="22" rx="3" />
    <rect x="14" y="32" width="12" height="3" fill="white" opacity="0.6" />
    <rect x="10" y="35" width="20" height="2" rx="1" fill="white" opacity="0.4" />
    <rect x="8" y="14" width="24" height="14" rx="1.5" fill="#0f172a" />
    <circle cx="20" cy="21" r="4" fill="white" opacity="0.9" />
  </svg>
);

function BrandPanel() {
  return (
    <div className="relative flex flex-col items-center justify-center bg-primary px-10 py-16 text-white overflow-hidden">
      {/* Dot-grid background */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Circuit decoration */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute bottom-0 right-0 h-64 w-64 opacity-[0.07] translate-x-16 translate-y-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="40" y="40" width="320" height="320" rx="8" stroke="white" strokeWidth="2" />
        <rect x="80" y="80" width="240" height="240" rx="4" stroke="white" strokeWidth="1.5" />
        <line x1="200" y1="40" x2="200" y2="80" stroke="white" strokeWidth="2" />
        <line x1="200" y1="320" x2="200" y2="360" stroke="white" strokeWidth="2" />
        <line x1="40" y1="200" x2="80" y2="200" stroke="white" strokeWidth="2" />
        <line x1="320" y1="200" x2="360" y2="200" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="200" r="40" stroke="white" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="20" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="200" r="4" fill="white" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <OcsLogoMark className="h-9 w-9" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight">OCS Nepal</h2>
        <p className="mt-2 text-sm font-medium text-white/50 uppercase tracking-widest">
          Computer Hardware
        </p>

        <div className="my-8 h-px w-16 bg-white/20" />

        <p className="text-base leading-relaxed text-white/70">
          Your trusted computer hardware partner in Nepal.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "10+", label: "Brands" },
            { value: "500+", label: "Products" },
            { value: "5K+", label: "Customers" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col">
              <span className="text-xl font-bold">{value}</span>
              <span className="text-xs text-white/50 mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%]">
        <BrandPanel />
      </div>

      {/* Mobile top banner */}
      <div className="lg:hidden bg-primary px-6 py-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
          <OcsLogoMark className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">OCS Nepal</p>
          <p className="text-xs text-white/60 mt-0.5">Computer Hardware</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12 sm:px-12">
        {children}
      </div>
    </div>
  );
}
