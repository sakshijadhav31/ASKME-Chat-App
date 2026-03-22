/**
 * @file components/chat/MessageInput.jsx
 * @description UI component for chat input with generation controls.
 */
import React, { useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { SendHorizonal, Sparkles, Square } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAutoResize } from "../../hooks/useAutoResize";

const MessageInput = ({ onSend, isTyping, onStop }) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useAutoResize(inputValue);

  const resetInput = useCallback(() => {
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
    }
  }, [textareaRef]);

  const handleSendMessage = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isTyping) return;

    try {
      if (typeof onSend === "function") {
        onSend(trimmedValue);
        resetInput();
      }
    } catch (error) {
      console.error("MessageInput: Failed to send message:", error);
    }
  }, [inputValue, isTyping, onSend, resetInput]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div
        className={cn(
          "relative flex items-end gap-3 p-3 transition-all duration-500 rounded-[2rem] border shadow-2xl",
          "bg-card/40 backdrop-blur-2xl border-border/40 shadow-black/20",
          "focus-within:border-primary/40 focus-within:bg-card/60 focus-within:shadow-primary/5",
          isTyping ? "opacity-90 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="pb-2.5 pl-2 text-muted-foreground/40" aria-hidden="true">
          <Sparkles size={18} />
        </div>

        <textarea
          ref={textareaRef}
          className={cn(
            "flex-1 max-h-[200px] min-h-[44px] bg-transparent text-foreground px-1 py-2.5",
            "outline-none resize-none text-[15px] leading-relaxed font-sans",
            "placeholder:text-muted-foreground/30 custom-scrollbar"
          )}
          rows="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTyping ? "Generating response..." : "Ask me anything..."}
          disabled={isTyping}
        />

        <div className="flex items-center">
          {isTyping ? (
            <ActionButton 
              onClick={onStop} 
              icon={<Square size={18} fill="currentColor" />} 
              variant="stop" 
            />
          ) : (
            <ActionButton 
              onClick={handleSendMessage} 
              icon={<SendHorizonal size={20} strokeWidth={2.5} />} 
              variant="send" 
              disabled={!inputValue.trim()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Internal Helper Component for Buttons to keep JSX clean.
 */
const ActionButton = ({ onClick, icon, variant, disabled }) => {
  const baseClass = "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 shadow-lg outline-none focus-visible:ring-2";
  
  const variants = {
    stop: "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive/50",
    send: cn(
      "text-primary-foreground bg-primary shadow-primary/20 focus-visible:ring-primary/50",
      disabled ? "text-muted-foreground/30 bg-muted/50 cursor-not-allowed shadow-none" : "hover:scale-105 active:scale-95 hover:shadow-primary/40"
    )
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseClass, variants[variant])}>
      {icon}
    </button>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  isTyping: PropTypes.bool.isRequired,
  onStop: PropTypes.func,
};

export default memo(MessageInput);