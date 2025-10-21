
import React, { useState, useRef } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditableImageProps {
  src: string;
  alt: string;
  onChange: (image: string) => void;
  className?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onChange,
  className = ""
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Check if file is too large (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
    toast.success("Profile photo updated");
  };

  return (
    <div
      className="relative cursor-pointer mx-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className={`overflow-hidden ${className || "w-24 h-24"} rounded-full`}>
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      
      {isHovering && (
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
          <Pencil className="text-white" size={24} />
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default EditableImage;
