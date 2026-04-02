import { useEffect, useId, useState } from "react";
import "../../LogoLoading.css";
import { useLoading } from "../Context/LoadingContext";

const LoadingLogo: React.FC = () => {
  const { isLoading, setAnimationReady } = useLoading();
  const stripeGradientId = useId();
  const oArrowGradientId = useId();

  // Signals that animation assets are ready shortly after component mounts
  // This allows the parent context to coordinate with other loading states
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationReady();
    }, 100);
    return () => clearInterval(timer);
  }, []);

  if (!isLoading) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center  justify-center">
      <div className="loading-logo">
        <svg
          className="loading-logo__stripe"
          width="240"
          height="68"
          viewBox="0 0 240 68"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={stripeGradientId}
              x1="100%"
              y1="0%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F5BC47" />
              <stop offset="70%" stopColor="#A59F9F" />
              <stop offset="100%" stopColor="#918989" />
            </linearGradient>
          </defs>
          <path
            className="loading-logo__stripe-path"
            style={{ stroke: `url(#${stripeGradientId})` }}
            d="M 80 5 L 120 28 L 90 73 L 285 85"
          />
        </svg>

        <div className="loading-logo__text-row">
          <span className="loading-logo__letter-f">F</span>

          <span className="loading-logo__lo" data-text="lo">
            l
            <span className="loading-logo__lo-o" data-text="o">
              o
              <svg
                className="loading-logo__o-arrow"
                viewBox="0 0 40 70"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id={oArrowGradientId}
                    x1="0%"
                    y1="100%"
                    x2="0%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#56431B" stopOpacity="1" />
                    <stop offset="34%" stopColor="#896929" stopOpacity="1" />
                    <stop offset="57%" stopColor="#A88336" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FFBB32" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path
                  className="loading-logo__o-arrow-path"
                  d="M 10 81 C 20 72, 26 65, 23 57 C 21 51, 30 46, 27 38 C 26 33, 29 27, 30 21 L 31 14 M 31 14 L 22 25 M 31 14 L 40 26"
                  style={{ stroke: `url(#${oArrowGradientId})` }}
                />
              </svg>
            </span>
          </span>

          <span className="loading-logo__letter-w">W</span>
          <span className="loading-logo__ealth" data-text="ealth">
            ealth
          </span>
        </div>

        <p className="loading-logo__tagline">
          Flowing awareness is your real security
        </p>
      </div>
    </div>
  );
};

export default LoadingLogo;
