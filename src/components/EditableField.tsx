
import React, { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  tag?: "h1" | "h2" | "p" | "span";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  tag = "p",
  className = "",
  placeholder = "Click to edit",
  multiline = false
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setText(value);
  }, [value]);
  
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleClick = () => {
    setEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    if (text !== value) {
      onChange(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      setEditing(false);
      onChange(text);
    } else if (e.key === "Escape") {
      setText(value);
      setEditing(false);
    }
  };

  const Tag = tag as keyof JSX.IntrinsicElements;

  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 rounded border border-portfolio-blue bg-white ${className}`}
        placeholder={placeholder}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 rounded border border-portfolio-blue bg-white ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="editable-field relative group">
      <Tag className={`pr-5 ${className}`} onClick={handleClick}>
        {value || <span className="text-gray-400">{placeholder}</span>}
      </Tag>
      <span className="editable-field-indicator absolute top-0 right-0">
        <Pencil size={14} />
      </span>
    </div>
  );
};

export default EditableField;
