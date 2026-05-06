import React from "react";

const AdsCardSkeleton = () => {
  return (
    <div className="flex h-full min-h-[268px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[#eef5ef] to-[#dfe8e1] p-6 shadow-[0_10px_36px_-14px_rgba(47,62,48,0.2)] animate-pulse sm:min-h-[304px] lg:min-h-[360px] sm:p-7">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full bg-[var(--color-primary)]/25" />
        <div className="h-7 w-[88%] max-w-md rounded-lg bg-[var(--color-secondary)]/15" />
        <div className="h-4 w-[55%] rounded-lg bg-[var(--color-secondary)]/12" />
      </div>
      <div className="mt-6 h-12 w-full rounded-xl bg-[var(--color-primary)]/20" />
    </div>
  );
};

export default AdsCardSkeleton;
