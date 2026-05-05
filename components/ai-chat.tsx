'use client';

import { Send, Bot, User, Loader2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function AIChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const currentInput = chatInput;
    setChatInput('');
    setIsLoading(true);
    setError(null);

    const userMsg = { id: Date.now().toString(), role: 'user', content: currentInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      console.log("🔥 [AIChat] Sending POST to /api/chat");
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${await res.text()}`);
      }
      
      if (!res.body) {
        throw new Error("No response body returned from server.");
      }

      console.log("🔥 [AIChat] Stream started");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let aiContent = "";
      const aiMsgId = (Date.now() + 1).toString();
      
      // Add empty AI message
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ') && !trimmedLine.includes('[DONE]')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              // Parse Gemini response format instead of OpenAI
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                aiContent += data.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
        
        // Update the last message (the AI's message) with new content
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = aiContent;
          return updated;
        });
      }
      console.log("🔥 [AIChat] Stream finished successfully");
    } catch (err: any) {
      console.error("🔥 [AIChat] Error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`transition-all duration-300 ease-in-out h-full shrink-0 relative z-20 flex bg-[#1e142e] ${isOpen ? 'w-[350px] border-l border-white/10 shadow-2xl' : 'w-0'}`}>
      
      {/* Toggle Button */}
      <button 
         onClick={() => setIsOpen(!isOpen)}
         className="absolute -left-[29px] top-1/2 -translate-y-1/2 bg-[#1e142e] border border-white/10 border-r-0 rounded-l-xl p-1.5 text-white/70 hover:text-white transition-all z-30 flex items-center justify-center shadow-[-4px_0_10px_rgba(0,0,0,0.2)]"
      >
         {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="overflow-hidden w-full h-full">
        <div className="w-[350px] h-full flex flex-col shrink-0">

      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#1e142e] z-10 sticky top-0">
        <div className="bg-[#8b5ff5] p-2 rounded-xl shadow-[0_0_15px_rgba(139,95,245,0.4)]">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">AI Tutor</h2>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Always here to help</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
            <Bot className="w-12 h-12 text-white/20" />
            <p className="text-white/40 text-xs font-medium px-4">
              Hi! I'm your AI Tutor. Ask me anything about this lesson.
            </p>
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-[#2a1d40]' : 'bg-[#8b5ff5]'}`}>
              {m.role === 'user' ? <User className="w-4 h-4 text-white/70" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm break-words ${
              m.role === 'user' 
                ? 'bg-[#2a1d40] text-white rounded-tr-sm' 
                : 'bg-white/5 text-white/90 rounded-tl-sm border border-white/5'
            }`}>
              {m.content || (m.role === 'assistant' && isLoading ? "..." : "")}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#8b5ff5]">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1 border border-white/5">
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        
        {/* Error State UI */}
        {error && (
          <div className="flex gap-3 items-center justify-center mt-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2 max-w-[90%]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>Error: {error.message}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#1e142e] border-t border-white/10 mt-auto sticky bottom-0 z-10">
        <div className="relative flex items-center">
          <input
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#8b5ff5]/50 focus:border-[#8b5ff5] transition-all"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            disabled={isLoading || !chatInput?.trim()}
            className="absolute right-1.5 p-2 rounded-full bg-[#8b5ff5] text-white hover:bg-[#7a4ee5] disabled:opacity-50 disabled:hover:bg-[#8b5ff5] transition-colors cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}
