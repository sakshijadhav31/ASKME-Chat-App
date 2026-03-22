
/**
 * @file pages/ChatPage.jsx
 * @description Primary layout for the AI Chat interface.
 */

import React from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

import Sidebar from "../components/sidebar/Sidebar"; 
import ChatHeader from "../components/layout/ChatHeader"; 
import ChatMessage from "../components/chat/ChatMessage"; 
import ChatInput from "../components/chat/MessageInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import EmptyState from "../components/chat/EmptyState";

import { useChat } from "../hooks/useChat";

function ChatPage({ user, onLogout }) {
  const {
    chats, activeId, messages, isThinking, isLoadingHistory, isLoadingChats,
    selectedModel, setSelectedModel, scrollRef,handleDeleteChat,handleUpdateTitle,
    handleSend, handleSelectChat, setMessages, setActiveId, stopGeneration ,handleClearChat
  } = useChat(user, onLogout);

  /**
   * Resets the chat window to a fresh state.
   */
  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar 
        user={user}
        chats={chats} 
        activeId={activeId} 
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
        onUpdateTitle={handleUpdateTitle}
        onLogout={onLogout} 
        isLoadingChats={isLoadingChats}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-background relative shadow-2xl">
        <ChatHeader 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
          onClearChat={handleClearChat} 
          activeId={activeId}
        />

        {/* Scrollable Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar px-4">
          {isLoadingHistory ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <Loader2 size={32} className="text-primary animate-spin" />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Restoring Session
              </p>
            </div>
          ) : messages.length === 0 && !isThinking ? (
            <EmptyState onSuggestion={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto py-10 flex flex-col gap-2">
              {messages.map((m, i) => (
                <ChatMessage 
                  key={`${activeId}-${i}`} 
                  m={m} 
                  handleCopy={() => navigator.clipboard.writeText(m.message)} 
                />
              ))}
              {isThinking && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-background via-background">
          <ChatInput 
            onSend={handleSend} 
            isTyping={isThinking} 
            onStop={stopGeneration} 
          />
          <p className="text-[10px] text-center text-muted-foreground/40 mt-4 uppercase font-bold tracking-widest">
            AskMe AI can make mistakes. Verify important info.
          </p>
        </div>
      </main>
    </div>
  );
}

ChatPage.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string,
    name: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired,
};

export default ChatPage;