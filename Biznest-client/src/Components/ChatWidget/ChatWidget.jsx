import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  RiRobot2Line, 
  RiCloseLine, 
  RiSendPlaneFill, 
  RiChat1Line, 
  RiDeleteBin7Line, 
  RiHistoryLine 
} from 'react-icons/ri';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { AuthContext } from '../../AuthProvider/AuthContext';

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load history from session storage on mount
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('nestbot_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      // Intro message
      setMessages([
        { 
          role: 'assistant', 
          content: `Hi ${user?.name || 'there'}! I'm NestBot. How can I help you today with your orders, inventory, or queries?` 
        }
      ]);
    }
  }, [user]);

  // Save history to session storage on change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('nestbot_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 1. Update UI with user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 2. Call Backend AI Endpoint
      // We send only the last 10 messages for context to optimize performance/tokens
      const historyForAI = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await axiosSecure.post('/ai/chat', {
        message: userMessage,
        history: historyForAI
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        throw new Error(response.data.message || 'Failed to get reply');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again or contact support." 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = () => {
    if (window.confirm('Clear conversation history?')) {
      const intro = [{ role: 'assistant', content: `Hi ${user?.name || 'there'}! How can I help you?` }];
      setMessages(intro);
      sessionStorage.setItem('nestbot_history', JSON.stringify(intro));
    }
  };

  if (!user) return null; // Only show for logged-in users

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Chat window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 sm:w-[400px]">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1.5">
                <RiRobot2Line size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">NestBot</h3>
                <p className="text-[10px] opacity-80">AI Support Agent</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={clearHistory}
                className="rounded-full p-1.5 hover:bg-white/10" 
                title="Clear History"
              >
                <RiDeleteBin7Line size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 hover:bg-white/10"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm
                  ${m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                  }
                `}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="border-t border-slate-100 bg-white p-3"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask NestBot something..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-12 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`
                  absolute right-1.5 rounded-full p-2 transition-colors
                  ${!input.trim() || isLoading 
                    ? 'text-slate-300' 
                    : 'text-indigo-600 hover:bg-slate-100'
                  }
                `}
              >
                <RiSendPlaneFill size={20} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              NestBot can check orders, inventory and handle refunds.
            </p>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}
        `}
      >
        {isOpen ? (
          <RiCloseLine size={28} />
        ) : (
          <RiChat1Line size={28} />
        )}
        
        {!isOpen && (
            <span className="absolute -top-1 -left-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
            </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
