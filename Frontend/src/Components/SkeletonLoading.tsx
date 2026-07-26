import { Skeleton } from "@heroui/react";
import useDarkMode from "./Mode";

const SkeletonLoading = () => {
  const { isDark } = useDarkMode();

  return (
    <div className="flex flex-col py-6 sm:py-10 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      {/* Welcome Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 sm:h-12 sm:w-80 rounded-lg mb-2" />
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>

      {/* Summary Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-36 rounded-lg mb-1" />
            <Skeleton className="h-4 w-28 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Statistics sticky button skeleton */}
      <div className="sticky top-4 md:top-5 lg:top-6 z-20 ml-0">
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* New Charts skeleton: LineChart + RadialBarChart side-by-side */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* LineChart placeholder */}
        <div
          className={`flex-1 rounded-xl border-2 p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <Skeleton className="h-6 w-44 rounded-lg mb-4" />
          <Skeleton className="h-[250px] sm:h-[300px] w-full rounded-xl" />
        </div>
        {/* RadialBarChart placeholder */}
        <div
          className={`flex-1 rounded-xl border-2 p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="relative w-[240px] h-[260px] sm:w-[280px] sm:h-[300px]">
              <Skeleton className="w-full h-full rounded-full" />
              <div
                className={`absolute inset-[20%] rounded-full ${isDark ? "bg-gray-800" : "bg-white"}`}
              />
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Skeleton className="h-8 w-16 rounded-lg mb-1" />
                <Skeleton className="h-4 w-12 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Pie Chart skeleton */}
      <div
        className={`rounded-xl border-2 p-8 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px]">
            <Skeleton className="w-full h-full rounded-full" />
            <div
              className={`absolute inset-[15%] rounded-full ${isDark ? "bg-gray-800" : "bg-white"}`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-24 rounded-lg mb-2" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Expenses skeleton */}
      <div className="mt-8">
        <Skeleton className="h-7 w-36 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-xl border-2 p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-44 rounded-lg mb-3" />
              <Skeleton className="h-8 w-24 rounded-lg mb-2" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
