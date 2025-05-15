
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
    // Save scroll position before entering edit mode
    const scrollPosition = window.scrollY;
    setEditing(true);
    // Restore scroll position after state update
    setTimeout(() => window.scrollTo(0, scrollPosition), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    // Save scroll position before exiting edit mode
    const scrollPosition = window.scrollY;
    setEditing(false);
    if (text !== value) {
      onChange(text);
    }
    // Restore scroll position after state updates
    setTimeout(() => window.scrollTo(0, scrollPosition), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      // Save scroll position before exiting edit mode
      const scrollPosition = window.scrollY;
      setEditing(false);
      onChange(text);
      // Restore scroll position after state updates
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
    } else if (e.key === "Escape") {
      // Save scroll position before exiting edit mode
      const scrollPosition = window.scrollY;
      setText(value);
      setEditing(false);
      // Restore scroll position after state updates
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
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
