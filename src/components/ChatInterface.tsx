import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PromptInputBox } from './ui/ai-prompt-box';
import { Copy, User, Bot, Check } from 'lucide-react';
import * as puter from '@puter/js';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: File[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await puter.ai.chat(userMessage, {
        model: "claude-3-5-sonnet",
        stream: true
      });

      let fullResponse = '';
      for await (const part of response) {
        fullResponse += part?.text || "";
      }

      return fullResponse || "I apologize, but I didn't receive a proper response. Please try again.";
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      files
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get real AI response
      const aiResponse = await getAIResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error while processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-transparent">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-center items-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-black text-white tracking-wider select-none"
          style={{
            textShadow: `
              0 1px 0 #ccc,
              0 2px 0 #c9c9c9,
              0 3px 0 #bbb,
              0 4px 0 #b9b9b9,
              0 5px 0 #aaa,
              0 6px 1px rgba(0,0,0,.1),
              0 0 5px rgba(0,0,0,.1),
              0 1px 3px rgba(0,0,0,.3),
              0 3px 5px rgba(0,0,0,.2),
              0 5px 10px rgba(0,0,0,.25),
              0 10px 10px rgba(0,0,0,.2),
              0 20px 20px rgba(0,0,0,.15)
            `
          }}
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.05,
            textShadow: `
              0 1px 0 #ddd,
              0 2px 0 #d9d9d9,
              0 3px 0 #ccc,
              0 4px 0 #c9c9c9,
              0 5px 0 #bbb,
              0 6px 1px rgba(0,0,0,.2),
              0 0 8px rgba(0,0,0,.2),
              0 1px 3px rgba(0,0,0,.4),
              0 3px 5px rgba(0,0,0,.3),
              0 5px 10px rgba(0,0,0,.35),
              0 10px 10px rgba(0,0,0,.3),
              0 20px 20px rgba(0,0,0,.25)
            `,
            transition: { duration: 0.3 }
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            MANDOBOT
          </motion.span>
          {" "}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            PRIME
          </motion.span>
        </motion.h1>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#444444 transparent'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
            <p className="text-gray-400 max-w-md">
              Ask me anything! I can help with questions, provide information, or just have a friendly chat.
              Try using different modes like Search, Think, or Canvas.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-white text-black'
                    : 'bg-[#1F2023] text-gray-100 border border-[#333333]'
                }`}
              >
                {/* Message Files */}
                {message.files && message.files.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {message.files.map((file, index) => (
                      <div key={index} className="text-xs bg-black/20 px-2 py-1 rounded">
                        📎 {file.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                
                {/* Message Footer */}
                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                  message.sender === 'user' 
                    ? 'border-black/10' 
                    : 'border-white/10'
                }`}>
                  <span className={`text-xs ${
                    message.sender === 'user' 
                      ? 'text-black/60' 
                      : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </span>
                  
                  <button
                    onClick={() => copyMessage(message.content, message.id)}
                    className={`p-1 rounded transition-colors ${
                      message.sender === 'user'
                        ? 'hover:bg-black/10 text-black/60 hover:text-black'
                        : 'hover:bg-white/10 text-gray-400 hover:text-white'
                    }`}
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#1F2023] text-gray-100 border border-[#333333] rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-6">
        <PromptInputBox
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  );
};

export default ChatInterface;