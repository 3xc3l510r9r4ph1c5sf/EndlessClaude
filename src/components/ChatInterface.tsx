import React, { useState, useRef, useEffect } from 'react';
import { PromptInputBox } from './ui/ai-prompt-box';
import { Copy, User, Bot, Check } from 'lucide-react';

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

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    // Simple response logic based on message content
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! I'm Claude, your AI assistant. How can I help you today?";
    } else if (userMessage.toLowerCase().includes('weather')) {
      return "I don't have access to real-time weather data, but I'd be happy to help you find weather information or discuss climate topics in general.";
    } else if (userMessage.includes('[Search:')) {
      return "I understand you'd like me to search for information. In a real implementation, I would search the web for relevant results about your query.";
    } else if (userMessage.includes('[Think:')) {
      return "Let me think deeply about this... In this mode, I would provide more thoughtful, analytical responses with deeper reasoning and consideration of multiple perspectives.";
    } else if (userMessage.includes('[Canvas:')) {
      return "Canvas mode activated! In a real implementation, this would allow me to create visual content, diagrams, or interactive elements to help illustrate concepts.";
    } else if (userMessage.includes('[Voice message')) {
      return "I received your voice message! In a complete implementation, I would process the audio and respond accordingly.";
    } else {
      const responses = [
        "That's an interesting question! I'd be happy to help you explore that topic further.",
        "I understand what you're asking about. Let me provide some insights on that.",
        "Great question! Here's what I can tell you about that subject.",
        "I appreciate you sharing that with me. Let me offer some thoughts on this matter.",
        "That's a thoughtful inquiry. I'll do my best to provide you with a helpful response."
      ];
      return responses[Math.floor(Math.random() * responses.length)] + " (This is a demo response - in a real implementation, I would provide more specific and helpful answers based on your actual question.)";
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
      // Simulate AI response
      const aiResponse = await simulateAIResponse(content);
      
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
      <div className="flex-shrink-0 p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2">AI Chat Assistant</h1>
        <p className="text-gray-300">Chat with Claude AI - Your intelligent assistant</p>
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