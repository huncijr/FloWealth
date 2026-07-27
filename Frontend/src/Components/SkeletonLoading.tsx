import { Skeleton } from "@heroui/react";
import useDarkMode from "./Mode";

const widgetCardClass = (isDark: boolean) =>
  `rounded-2xl border-2 p-4 ${
    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  }`;

const skeletonRow = (key: number) => (
  <div key={key} className="flex items-center justify-between py-1.5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <Skeleton className="h-4 w-18 rounded" />
      <Skeleton className="h-3 w-12 rounded" />
    </div>
  </div>
);

const commoditySkeleton = (key: number) => (
  <div key={key} className="p-4 rounded-xl border border-default-200">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-12 rounded" />
      <Skeleton className="h-3 w-8 rounded" />
    </div>
    <Skeleton className="h-7 w-24 rounded mb-1" />
    <Skeleton className="h-4 w-20 rounded" />
  </div>
);

const SkeletonLoading = () => {
  const { isDark } = useDarkMode();

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* Welcome Header skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-12 sm:h-14 md:h-16 w-80 sm:w-96 rounded-lg" />
          <Skeleton className="h-5 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      {/* 4-column grid matching new layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Crypto (col-span-2) */}
        <div className={`lg:col-span-2 ${widgetCardClass(isDark)}`}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-lg" />
          </div>
          {[1, 2, 3].map((j) => skeletonRow(j))}
        </div>

        {/* Stocks (col-span-2) */}
        <div className={`lg:col-span-2 ${widgetCardClass(isDark)}`}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-lg" />
          </div>
          {[1, 2, 3].map((j) => skeletonRow(j))}
        </div>

        {/* Forex (col-span-1, row-span-2) */}
        <div className={`lg:row-span-2 ${widgetCardClass(isDark)}`}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-lg" />
          </div>
          {[1, 2, 3, 4].map((j) => (
            <div
              key={j}
              className="flex items-center justify-between py-2 border-b border-divider last:border-0"
            >
              <Skeleton className="h-4 w-14 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Commodities (col-span-1, row-span-2 — tall cards) */}
        <div className={`lg:row-span-2 ${widgetCardClass(isDark)}`}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-lg" />
          </div>
          {[1, 2, 3].map((j) => commoditySkeleton(j))}
        </div>

        {/* Compare Notes (col-span-2) */}
        <div className={`lg:col-span-2 ${widgetCardClass(isDark)}`}>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-lg" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
            <Skeleton className="h-12 w-40 rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
