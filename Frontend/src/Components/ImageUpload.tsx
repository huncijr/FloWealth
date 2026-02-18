import { Button } from "@heroui/react";
import { picture } from "framer-motion/client";
import { Trash, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

const ImageUpload = ({
  onImageSelect,
}: {
  onImageSelect: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelect(file);
    } else {
    }
  };
  return (
    <div className="flex justify-center items-center w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e)}
      />
      {!preview ? (
        <div className="flex flex-col mt-10 justify-center items-center w-fit border-2 p-3 rounded-lg">
          <Button
            variant="outline"
            className="flex justify-center items-center w-24 h-24 p-0"
            onClick={handleClick}
          >
            <Upload className="w-12 h-12 text-cyan-400" />
          </Button>
          <p className="font-bold text-blue-500 mt-2">Upload picture</p>
        </div>
      ) : (
        <div className="relative flex justify-center gap-2 mt-4">
          <div className="h-full w-[70%]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <Button
            variant="danger-soft"
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className=""
          >
            <Trash className="h-4 sm:h-6 md:h-7 lg:h-8 " />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
