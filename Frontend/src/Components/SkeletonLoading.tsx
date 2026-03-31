import { Skeleton } from "@heroui/react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import useDarkMode from "./Mode";

const Skeletoncard = () => {
  const { isDark } = useDarkMode();
  return (
    <div className=" pl-4 pr-2 ">
      <div className="p-3 flex justify-center mb-3">
        <Skeleton className="h-8 w-32 rounded-lg">
          <div className="h-full w-full bg-gray-300" />
        </Skeleton>
      </div>
      <div
        className={`w-full  ${isDark ? "bg-gray-800" : "bg-gray-200"} 
                           rounded-lg  ${isDark ? "border-gray-700" : "border-gray-300"}
                           p-2 shadow-lg`}
      >
        <div className="flex  items-center justify-start pb-4">
          <div className="flex flex-col gap-3 w-full">
            <Skeleton className="h-7 w-32 sm:w-20 md:w-32 rounded-lg">
              <div className="h-full w-full bg-gray-300" />
            </Skeleton>
            <div className="p-2 flex justify-between w-full">
              <Skeleton className="h-6 w-24 rounded-lg">
                <div className="h-full w-full bg-gray-300" />
              </Skeleton>
              <Skeleton className="h-6 w-20 rounded-lg">
                <div className="h-full w-full bg-gray-300" />
              </Skeleton>
            </div>
            <Skeleton className="h-6 w-24 rounded-lg">
              <div className="h-full w-full bg-gray-300" />
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
};

const Skeletonloading = () => {
  const { isDark } = useDarkMode();
  return (
    <div className="min-h-screen">
      <div className="flex  flex-col sm:flex-row  min-w-0 overflow-y-auto ">
        <div
          className={`w-full mt-10 sm:w-[25%] shrink-0 border-2 rounded-lg p-4 shadow-lg ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"}`}
        >
          {" "}
          <div className="flex  sm:p-5  w-[30%]">
            <div className="flex flex-col w-full justify-around">
              <div className="flex mt-3 items-center gap-4">
                <div className="relative">
                  <motion.button
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-2 rounded-full transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"}`}
                  >
                    <Menu size={28} className="text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          <Skeletoncard />
          <Skeletoncard />
          <Skeletoncard />
        </div>
        <div
          className={`border-b-2 pt-4 ${isDark ? "border-gray-600" : "border-gray-300"}`}
        />

        <div className="px-3 pt-12 flex-1 ">
          <div
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl 
    border ${isDark ? "border-gray-700" : "border-gray-300"}
    p-8 shadow-lg relative`}
          >
            <div className="flex justify-start sm:justify-center items-center mb-8">
              <Skeleton className="h-8 w-36 rounded-full">
                <div className="h-full w-full bg-gray-300" />
              </Skeleton>
            </div>
            <Skeleton className="absolute right-3 top-2 h-8 w-28 rounded-full">
              <div className="h-full w-full bg-gray-300" />
            </Skeleton>

            <div className="flex flex-col sm:flex-row  gap-10 lg:gap-16 items-start">
              <div className="w-full h-full sm:w-[15%] md:w-[25%] lg:w-[35%] pt-4">
                <Skeleton className="h-9 w-72 max-w-full rounded-lg mb-6">
                  <div className="h-full w-full bg-gray-300" />
                </Skeleton>

                <Skeleton className="h-8 w-64 max-w-full rounded-lg mb-3">
                  <div className="h-full w-full bg-gray-300" />
                </Skeleton>

                <Skeleton className="h-8 w-44 max-w-full rounded-lg">
                  <div className="h-full w-full bg-gray-300" />
                </Skeleton>
              </div>

              <div
                className={`w-full lg:flex-1 flex justify-center border p-4
                   rounded-lg ${isDark ? "border-gray-700" : "border-gray-300"}`}
              >
                <div className="relative w-[320px] h-[320px] sm:w-[350px] sm:h-[350px]">
                  <Skeleton className="w-full h-full rounded-full">
                    <div className="h-full w-full bg-gray-300 rounded-full" />
                  </Skeleton>

                  <div
                    className={`absolute inset-[14%] rounded-full ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Skeleton className="h-10 w-28 rounded-lg mb-3">
                      <div className="h-full w-full bg-gray-300" />
                    </Skeleton>
                    <Skeleton className="h-8 w-24 rounded-lg">
                      <div className="h-full w-full bg-gray-300" />
                    </Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeletonloading;
