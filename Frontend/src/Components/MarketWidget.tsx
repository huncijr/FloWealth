import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import useDarkMode from "./Mode";
import type { ReactNode } from "react";

interface MarketWidgetProps {
  title: string;
  icon: ReactNode;
  lastUpdated?: string;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}

const MarketWidget = ({
  title,
  icon,
  lastUpdated,
  onClick,
  href,
  children,
}: MarketWidgetProps) => {
  const { isDark } = useDarkMode();

  const content = (
    <Card
      className={`relative overflow-hidden border-2 border-divider bg-content1/80 backdrop-blur-sm h-full ${
        onClick || href
          ? "cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-reddit-condensed text-lg font-extrabold text-default-900 tracking-tight">
            {title}
          </h3>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-default-400">{lastUpdated}</span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">{children}</div>
    </Card>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="block h-full"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className="h-full"
    >
      {content}
    </motion.div>
  );
};

export default MarketWidget;
