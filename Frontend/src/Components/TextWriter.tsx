import { TextArea } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";

const useWordTypeWriter = (
  text: string,
  enabled: boolean,
  wordDelay: number = 220,
) => {
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= words.length) return c;
        return c + 1;
      });
    }, wordDelay);
    return () => clearInterval(id);
  }, [enabled, words.length, wordDelay]);
  return words.slice(0, count).join(" ");
};
type PromptInputProps = {
  currentinput: string;
  setCurrentinput: (v: string) => void;
  placeholderhint?: string;
};

const PromptInput = ({
  currentinput,
  setCurrentinput,
  placeholderhint = "Create a grocerie list and let AI handle your list, write down what product how many and how much money you expect that will be and the AI will handle it and put to your list",
}: PromptInputProps) => {
  const hasAnimated = useRef(false);
  const shouldAnimate = !hasAnimated.current && currentinput.length === 0;

  const typedPlaceholder = useWordTypeWriter(
    placeholderhint,
    shouldAnimate,
    120,
  );
  useEffect(() => {
    if (typedPlaceholder === placeholderhint) {
      hasAnimated.current = true;
    }
  }, [typedPlaceholder, placeholderhint]);
  return (
    <div className="relative w-full">
      {currentinput.length === 0 && (
        <div className="pointer-events-none absolute left-3 top-3">
          <span className="ml-0.5 inline-block w-[1px] h-4 align-middle "></span>
        </div>
      )}
      <TextArea
        placeholder={typedPlaceholder}
        className="w-full"
        value={currentinput}
        onChange={(e) => setCurrentinput(e.target.value)}
        rows={5}
        style={{ resize: "vertical" }}
      />
    </div>
  );
};

export default PromptInput;
