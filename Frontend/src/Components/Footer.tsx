import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-4 px-6 flex items-center justify-center gap-2 border-t border-divider">
      <div className="flex items-center gap-1 text-sm ">
        <span>©</span>
        <span>{new Date().getFullYear()}</span>
        <span className="font-medium">FloWealth</span>
        <span>·</span>
        <span>All rights reserved</span>
      </div>
      <a
        href="https://github.com/huncijr/FloWealth"
        target="_blank"
        className="transition-opacity hover:opacity-100 opacity-70"
      >
        <Github className="w-5 h-5" />{" "}
      </a>
    </footer>
  );
};

export default Footer;
