import { useCallback, useEffect, useRef, useState } from "react";
import image1 from "../assets/themeshistorytransparent.png";
import image2 from "../assets/Analyzespending.png";
import image3 from "../assets/FloWealthUI.png";

const CustomCarousel = () => {
  const images: string[] = [image1, image2, image3];
  const [activeindex, setActiveIndex] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Starts or restarts the auto-advance timer
  // Clears any existing timer to prevent multiple intervals running simultaneously
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((current) =>
        current === images.length - 1 ? 0 : current + 1,
      );
    }, 5000);
  }, []);

  // Initialize timer on mount and cleanup on unmount
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Manual navigation that also resets the auto-advance timer
  const handleClick = (index: number) => {
    setActiveIndex(index);
    startTimer();
  };
  return (
    <div className="w-full h-full relative group">
      <div className="relative w-full h-full overflow-hidden aspect-video md:aspect-[4/3] md:h-full">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className={`absolute inset-0 w-full h-full transition-opacity 
              duration-700 ease-in-out ${index === activeindex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          />
        ))}
      </div>
      <div className="flex items-center absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
        {images.map((_, index) => {
          const isActive = index === activeindex;
          return (
            <div className="px-1">
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`cursor-pointer transition-all duration-300 ease-in-out  bg-secondary hover:bg-yellow-600 ${
                  isActive
                    ? "w-9 h-3 rounded-lg bg-red-600"
                    : "w-3 h-3 rounded-full"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCarousel;
