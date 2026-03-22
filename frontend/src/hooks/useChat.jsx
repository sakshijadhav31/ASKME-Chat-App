/**
 * @file hooks/useChat.js
 * @description Hooks to manage chat state, streaming logic, and API interactions.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { chatService } from "../api/chatService";

const CHATS_CACHE_KEY = "cached_user_chats";

export const useChat = (user, onLogout) => {
  // --- State ---
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem(CHATS_CACHE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(chats.length === 0);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");

  // --- Refs ---
  const abortControllerRef = useRef(null);
  const scrollRef = useRef(null);

  /**
   * Translates technical errors into user-friendly strings.
   */
  const getFriendlyErrorMessage = useCallback((error) => {
    const status = error.status || error.response?.status;
    const message = error.message?.toLowerCase() || "";

    if (status === 404 || message.includes("not found")) {
      return "The AI model is currently unavailable. Please try a different model.";
    }
    if (status === 429) {
      return "Rate limit reached. Please wait a moment.";
    }
    if (status === 503 || message.includes("overloaded")) {
      return "Servers are busy. Please try again shortly.";
    }
    return "An error occurred while generating a response. Please try again.";
  }, []);

  /**
   * Syncs the sidebar chat list from the server.
   */
  const loadChats = useCallback(async () => {
    if (!user?.token) return;
    try {
      const data = await chatService.getChats();
      setChats(data);
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error.response?.status === 401) onLogout();
    } finally {
      setIsLoadingChats(false);
    }
  }, [user?.token, onLogout]);

  /**
   * Fetches messages for a specific session.
   */
  const handleSelectChat = useCallback(async (id) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    if (!id) {
      setActiveId(null);
      setMessages([]);
      return;
    }

    setIsLoadingHistory(true);
    setActiveId(id);
    try {
      const data = await chatService.getMessages(id);
      setMessages(data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleClearChat = useCallback(async (chatId) => {
  // Use the passed ID or fallback to the current active session
  const targetId = chatId || activeId;
  
  // CRITICAL: If there is no ID, there is nothing to delete on the server
  if (!targetId) {
    console.warn("HandleClearChat: No ID available to delete.");
    setMessages([]); // Just clear the UI messages if it's an unsaved session
    return;
  }

  if (!window.confirm("Are you sure you want to delete this entire session?")) return;

  try {
    // Call the service
    await chatService.deleteChat(targetId);

    // Update Sidebar state
    setChats((prev) => {
      const filtered = prev.filter(chat => chat.id !== targetId);
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(filtered));
      return filtered;
    });

    // Reset UI if we deleted the current active chat
    if (activeId === targetId) {
      setActiveId(null);
      setMessages([]);
    }
  } catch (error) {
    console.error("Failed to delete session:", error);
    alert("Could not delete the session. Please try again.");
  }
}, [activeId, chats]);
  /**
   * Deletes a chat session with an optimistic UI update.
   */
  const handleDeleteChat = useCallback(async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    const previousChats = [...chats];
    setChats(prev => prev.filter(c => c.id !== chatId));

    if (activeId === chatId) {
      setActiveId(null);
      setMessages([]);
    }

    try {
      await chatService.deleteChat(chatId, user?.token);
      const updated = previousChats.filter(c => c.id !== chatId);
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updated));
    } catch (error) {
      setChats(previousChats); 
      alert("Failed to delete the chat. Please check your connection.");
    }
  }, [activeId, user?.token, chats]);

  /**
   * Updates chat title optimistically.
   */
  const handleUpdateTitle = useCallback(async (chatId, newTitle) => {
    if (!newTitle.trim()) return;

    const previousChats = [...chats];
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));

    try {
      await chatService.updateChat(chatId, { title: newTitle }, user?.token);
      const updatedChats = previousChats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      setChats(previousChats); 
      alert("Failed to update title. Please check your connection.");
    }
  }, [user?.token, chats]);

  /**
   * Core function to send messages and handle AI streaming.
   * FIX: Removed 'messages' from dependencies to prevent function re-creation during stream.
   */
  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;

    // 1. Snapshot the current messages to create history context
    // We use the functional setter to get the latest messages without putting 'messages' in deps
    let currentHistory = [];
    setMessages(prev => {
      currentHistory = prev.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [msg.message]
      }));
      return [...prev, { role: "user", message: text }];
    });
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsThinking(true);

    try {
      const payload = { 
        message: text, 
        model_name: selectedModel, 
        history: currentHistory 
      };

      const res = await chatService.streamChat(
        activeId, 
        payload, 
        user?.token, 
        abortControllerRef.current.signal
      );

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const err = new Error(errorBody.error?.message || "Request failed");
        err.status = res.status;
        throw err;
      }

      const newIdFromHeader = res.headers.get("x-chat-id");
      if (!activeId && newIdFromHeader) {
        setActiveId(newIdFromHeader);
        setChats(prev => [{ id: newIdFromHeader, title: text.substring(0, 30) }, ...prev]);
      }

      setIsThinking(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      // Add initial empty assistant message
      setMessages(prev => [...prev, { role: "assistant", message: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("__ERROR_JSON__")) {
          const errorObj = JSON.parse(chunk.split("__ERROR_JSON__")[1]);
          throw errorObj;
        }

        // Functional update ensures we append to the exact last message safely
        setMessages(prev => {
          const lastIdx = prev.length - 1;
          if (lastIdx < 0 || prev[lastIdx].role !== "assistant") return prev;

          const updated = [...prev];
          updated[lastIdx] = {
            ...updated[lastIdx],
            message: updated[lastIdx].message + chunk
          };
          return updated;
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') return;
      const friendlyMsg = getFriendlyErrorMessage(error);
      setMessages(prev => [...prev, { role: "assistant", message: friendlyMsg, isError: true }]);
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  }, [activeId, selectedModel, user?.token, getFriendlyErrorMessage]); 

  // Initial Load
  useEffect(() => { loadChats(); }, [loadChats]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return {
    chats, activeId, messages, isThinking, isLoadingHistory, isLoadingChats,
    selectedModel, setSelectedModel, scrollRef, handleDeleteChat, handleUpdateTitle,
    handleSend, handleSelectChat, setMessages, setActiveId,handleClearChat,
    stopGeneration: () => abortControllerRef.current?.abort()
  };
};