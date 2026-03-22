import React from "react";
import PropTypes from "prop-types";
import { MessageSquare, Pencil, Trash2, Hash } from "lucide-react";

/**
 * ChatItem Component
 * * Represents an individual chat thread in the sidebar. 
 * Provides a visual indicator for the active state and allows users to 
 * trigger rename or delete actions.
 */
const ChatItem = ({ chat, isActive, onSelect, onEdit, onDelete }) => {
  
  /**
   * Prevents event bubbling to the parent container when clicking action icons.
   * This ensures clicking 'Rename' or 'Delete' doesn't accidentally select the chat.
   * * @param {React.MouseEvent} e - The click event object
   * @param {Function} action - The callback function to execute (onEdit or onDelete)
   */
  const handleAction = (e, action) => {
    e.stopPropagation();
    action(e, chat.id, chat.title);
  };

  // Dynamic CSS classes for the container based on active/hover states
  const containerClasses = `
    group relative flex items-center justify-between 
    px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mb-1
    ${isActive 
      ? "bg-[#272A2E] text-[#E1E2E7] shadow-sm border border-white/5" 
      : "text-[#9DA0A4] hover:bg-[#272A2E]/50 hover:text-[#E1E2E7]"
    }
  `.trim();

  // Dynamic CSS classes for the leading icon
  const iconClasses = `
    flex-shrink-0 transition-colors 
    ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400/70"}
  `.trim();

  return (
    <div 
      className={containerClasses}
      onClick={() => onSelect(chat.id)}
      role="button"
      aria-selected={isActive}
    >
      {/* 1. SECTION: CHAT METADATA (Icon & Title) */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={iconClasses}>
          {isActive ? <Hash size={16} /> : <MessageSquare size={16} />}
        </div>
        
        <span className="truncate text-sm font-medium tracking-tight whitespace-nowrap">
          {chat.title || "Untitled Thread"}
        </span>
      </div>
      
      {/* 2. SECTION: ACTION CONTROLS */}
      {/* Opacity is controlled by CSS 'group-hover' for a cleaner UI */}
      <div className={`
        flex items-center gap-1 transition-opacity duration-200 
        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
      `}>
        {/* Rename Button */}
        <button 
          className="p-1.5 hover:bg-gray-700 rounded-md text-gray-500 hover:text-blue-400 transition-all"
          onClick={(e) => handleAction(e, onEdit)}
          aria-label="Rename thread"
          title="Rename Thread"
          type="button"
        >
          <Pencil size={13} />
        </button>
        
        {/* Delete Button */}
        <button 
          className="p-1.5 hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-400 transition-all"
          onClick={(e) => handleAction(e, onDelete)}
          aria-label="Delete thread"
          title="Delete Thread"
          type="button"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* 3. SECTION: ACTIVE STATE INDICATOR */}
      {isActive && (
        <div 
          className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Define PropTypes to ensure data integrity during development
ChatItem.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ChatItem;