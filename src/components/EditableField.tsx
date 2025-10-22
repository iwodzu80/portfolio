
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Pencil } from "lucide-react";
import { sanitizeText } from "@/utils/securityUtils";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  tag?: "h1" | "h2" | "p" | "span";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  autoEdit?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  tag = "p",
  className = "",
  placeholder = "Click to edit",
  multiline = false,
  autoEdit = false,
  onEditingChange
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const scrollPosRef = useRef<number>(0);
  const localValueRef = useRef<string>(value);
  
  // Update internal state when prop value changes
  useEffect(() => {
    setText(value);
    localValueRef.current = value;
  }, [value]);
  
  // Focus input and select all text when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select all text to make replacement easier
      inputRef.current.select();
    }
  }, [editing]);

  // Capture scroll position before any state changes
  const captureScrollPosition = () => {
    scrollPosRef.current = window.scrollY;
  };
  
  // Restore scroll position after render
useLayoutEffect(() => {
  if (scrollPosRef.current > 0) {
    window.scrollTo(0, scrollPosRef.current);
  }
}, [editing, text]);

// If requested, automatically enter edit mode and focus
useEffect(() => {
  if (autoEdit) {
    captureScrollPosition();
    setEditing(true);
  }
}, [autoEdit]);

// Notify parent when editing state changes
useEffect(() => {
  onEditingChange?.(editing);
}, [editing, onEditingChange]);
  
  const handleClick = () => {
    captureScrollPosition();
    setEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    captureScrollPosition();
    setEditing(false);
    
    // Only trigger onChange if the value actually changed
    if (text !== localValueRef.current) {
      localValueRef.current = text;
      onChange(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      captureScrollPosition();
      setEditing(false);
      
      // Only trigger onChange if the value actually changed
      if (text !== localValueRef.current) {
        localValueRef.current = text;
        onChange(text);
      }
    } else if (e.key === "Escape") {
      captureScrollPosition();
      setText(localValueRef.current); // Restore to last committed value
      setEditing(false);
    }
  };

  const Tag = tag as keyof JSX.IntrinsicElements;

  // Separate rendering logic for edit mode vs display mode
  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 rounded border border-portfolio-blue bg-white !text-foreground ${className}`}
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
        className={`w-full p-2 rounded border border-portfolio-blue bg-white !text-foreground ${className}`}
        placeholder={placeholder}
      />
    );
  }

  // Display mode - sanitize the content for display
  const displayContent = localValueRef.current || placeholder;
  const sanitizedContent = sanitizeText(displayContent);

  return (
    <div className="editable-field relative group">
      <Tag 
        className={`pr-5 ${className}`} 
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      <span className="editable-field-indicator absolute top-0 right-0">
        <Pencil size={14} />
      </span>
    </div>
  );
};

export default EditableField;
