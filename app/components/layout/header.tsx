
"use client";

type HeaderProps = {
  userName: string;
  initials: string;
  companyName: string;
};

export default function Header({
  userName,
  initials,
  companyName,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left */}
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Financial Overview
        </p>

        <p className="text-xs text-slate-500">
          Monitor your business performance
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {userName}
          </p>

          <p className="text-xs text-slate-500">
            {companyName}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}

