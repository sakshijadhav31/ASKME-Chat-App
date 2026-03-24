import React, { memo,useCallback } from "react";
import PropTypes from "prop-types";
import { Cpu, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";


/**
 * AVAILABLE_MODELS
 * Centralized configuration for supported AI models.
 */
const AVAILABLE_MODELS = [
   { id: "gemini-3-flash-preview", label: "gemini-3-flash-preview" },
   { id: "models/gemma-3-1b-it", label: "gemma-3-1b-it" },
 { id: "gemini-1.5-flash", label: "gemini-1.5-flash" },
   { id: "gemini-2.0-flash", label: "gemini-2.0-flash" },
];

/**
 * ChatHeader Component
 * Handles model switching, system status, and session management.
 */
const ChatHeader = ({ selectedModel, setSelectedModel, onClearChat }) => {
  
  const handleModelChange = (e) => {
    if (typeof setSelectedModel === "function") {
      setSelectedModel(e.target.value);
    }
  };
  

  const handleClear = () => {
    if (typeof onClearChat === "function") {
      // Logic for clearing can be handled by the parent 
      onClearChat();
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full flex justify-between items-center px-6 py-3 
                       bg-card/80 border-b border-border/40 backdrop-blur-md select-none">
      
      {/* Left Section: Model Selection & Status */}
      <div className="flex items-center gap-4">
        
        {/* Model Selector Dropdown */}
        <div className="relative group flex items-center gap-2 px-3 py-1.5 
                        bg-muted/50 rounded-xl border border-border/60 
                        hover:border-primary/30 transition-all duration-200">
          
          <Cpu 
            size={14} 
            className="text-primary group-hover:scale-110 transition-transform duration-200" 
            aria-hidden="true" 
          />
          
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className="bg-transparent text-[11px] font-bold text-foreground outline-none 
                       appearance-none pr-6 cursor-pointer tracking-wide z-10"
            aria-label="Select AI Model"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-card text-foreground">
                {model.label}
              </option>
            ))}
          </select>

          <ChevronDown 
            size={12} 
            className="absolute right-2 text-muted-foreground pointer-events-none 
                       group-hover:text-primary transition-colors" 
          />
        </div>

        {/* Real-time Status Indicator */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 
                     bg-green-500/5 border border-green-500/10 rounded-full"
          role="status"
          aria-live="polite"
        >
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest opacity-80">
            System Online
          </span>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center p-2 text-muted-foreground 
                     hover:text-destructive hover:bg-destructive/10 rounded-lg 
                     transition-all duration-200 group"
          title="Clear Conversation"
          aria-label="Clear Chat History"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
            
    </header>
  );
};

// --- Component Standards ---

ChatHeader.propTypes = {
  /** Current active model identifier */
  selectedModel: PropTypes.string.isRequired,
  /** Callback to update model state */
  setSelectedModel: PropTypes.func.isRequired,
  /** Callback to clear chat history */
  onClearChat: PropTypes.func,
};

ChatHeader.defaultProps = {
  onClearChat: () => console.warn("ChatHeader: onClearChat handler not provided"),
};

// Optimization: Header usually stays static while chat items move
export default memo(ChatHeader);
