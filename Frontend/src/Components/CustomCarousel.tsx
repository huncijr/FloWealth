import { useCallback, useEffect, useRef, useState } from "react";
import image1 from "../assets/ImageTest1.png";
import image2 from "../assets/ImageTest2.png";
import image3 from "../assets/ImageTest3.png";

const CustomCarousel = () => {
  const images: string[] = [image1, image2, image3];
  const [activeindex, setActiveIndex] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((current) =>
        current === images.length - 1 ? 0 : current + 1,
      );
    }, 5000);
  }, []);
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);
  const handleClick = (index: number) => {
    setActiveIndex(index);
    startTimer();
  };
  return (
    <div className="w-full h-full relative group">
      <div className="relative w-full h-full overflow-hidden aspect-video">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className={`absolute inset-0 w-full h-full object-cover ${index === activeindex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
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
