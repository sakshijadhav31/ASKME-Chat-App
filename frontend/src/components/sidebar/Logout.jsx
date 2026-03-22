import React, { useState, memo, useCallback } from "react";
import PropTypes from "prop-types";
import { LogOut, AlertCircle, X, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Logout Component
 * * Provides a two-step verification process to prevent accidental logout.
 * Click 1: Shows confirmation UI.
 * Click 2: Executes the onLogout callback.
 */
const Logout = ({ onLogout, className }) => {
  // State to toggle between the default button and the confirmation alert
  const [isConfirming, setIsConfirming] = useState(false);
  // State to prevent double-clicks during the logout process
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handles the initial click to show the confirmation box.
   * Uses stopPropagation to ensure parent elements don't trigger a re-render.
   */
  const handleInitialClick = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsConfirming(true);
  }, []);

  /**
   * Reverts the UI back to the default 'Sign Out' state.
   */
  const handleCancel = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsConfirming(false);
  }, []);

  /**
   * Final execution of the logout logic.
   * Includes error handling and execution validation.
   */
  const handleFinalLogout = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (onLogout && typeof onLogout === "function") {
        // Execute the provided logout function (supports async)
        await onLogout();
      } else {
        throw new Error("The 'onLogout' prop is not a valid function.");
      }
    } catch (error) {
      console.error("[Logout Component Error]:", error);
      // Reset state if logout fails so the user can try again
      setIsConfirming(false);
    } finally {
      setIsProcessing(false);
    }
  }, [onLogout, isProcessing]);

  // --- RENDER: CONFIRMATION STATE ---
  if (isConfirming) {
    return (
      <div 
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 mt-auto rounded-xl",
          "border border-destructive/30 bg-destructive/10",
          "animate-in fade-in zoom-in-95 duration-200", // Tailwind animation
          className
        )}
        role="alert"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <AlertCircle size={14} className="text-destructive shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive truncate">
            {isProcessing ? "Processing..." : "Are you sure?"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Final Logout Confirmation Button */}
          <button 
            onClick={handleFinalLogout}
            disabled={isProcessing}
            className="flex items-center justify-center w-8 h-8 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
            type="button"
          >
            <LogOut size={14} />
          </button>
          
          {/* Cancel Button to return to normal state */}
          <button 
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex items-center justify-center w-8 h-8 bg-background/50 hover:bg-background rounded-lg text-muted-foreground transition-colors border border-border/40"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: DEFAULT SIGN OUT BUTTON ---
  return (
    <button 
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 mt-auto transition-all duration-300 group",
        "rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/5",
        "text-muted-foreground hover:text-destructive active:scale-[0.98]",
        className
      )}
      onClick={handleInitialClick}
      type="button"
      aria-expanded={false}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary group-hover:bg-destructive/10 transition-colors duration-300 border border-border/20">
        <LogOut size={16} className="group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-300" />
      </div>
      
      <div className="flex flex-col items-start leading-none text-left flex-1 overflow-hidden">
        <span className="text-[13px] font-bold tracking-tight text-foreground group-hover:text-destructive">
          Sign Out
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mt-1.5">
          End Session
        </span>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <ChevronRight size={14} className="text-destructive/40" />
      </div>
    </button>
  );
};

Logout.propTypes = {
  onLogout: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default memo(Logout);