import { Button } from "@heroui/react";
import { Trash, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (base64String: string | null) => void;
  initialImage?: string | null | undefined;
}

const ImageUpload = ({ onImageSelect, initialImage }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
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
              onImageSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <Trash className="h-4 sm:h-6 md:h-7 lg:h-8 " />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
