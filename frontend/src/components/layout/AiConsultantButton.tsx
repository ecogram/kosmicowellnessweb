import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, User, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function AiConsultantButton() {
  const [showTooltip, setShowTooltip] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'hinglish' | 'english'>('hinglish');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! 🙏 Main Kosmico AI Consultant hoon. Main aapki health & wellness journey mein kaise madad kar sakta hoon?',
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Dynamic Draggable Position State
  const [hasDragged, setHasDragged] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });
  const hasMovedRef = useRef(false);

  const quickPromptsHinglish = [
    'Hair Fall Problem',
    'Pet ki samasya',
    'Weight Loss Tips',
    'Skin Glow',
  ];

  const quickPromptsEnglish = [
    'Hair Loss Advice',
    'Digestion Health',
    'Weight Loss Guide',
    'Skin Glow Tips',
  ];

  const quickPrompts = language === 'hinglish' ? quickPromptsHinglish : quickPromptsEnglish;

  const handleLanguageChange = (lang: 'hinglish' | 'english') => {
    if (lang === language) return;
    setLanguage(lang);
    
    const newGreeting = lang === 'hinglish'
      ? 'Namaste! 🙏 Main Kosmico AI Consultant hoon. Main aapki health & wellness journey mein kaise madad kar sakta hoon?'
      : 'Hello! 👋 I am your Kosmico AI Health Consultant. How can I assist you with your wellness journey today?';

    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ ...prev[0], text: newGreeting }];
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: lang === 'hinglish'
            ? '🇮🇳 [Language changed to Hinglish]\nNamaste! Poochhiye apna sawal.'
            : '🇬🇧 [Language changed to English]\nHello! Feel free to ask your health query in English.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  };

  // Keep inside bounds on window resize if dragged
  useEffect(() => {
    const handleResize = () => {
      if (hasDragged) {
        setPosition((prev) => ({
          x: Math.min(prev.x, window.innerWidth - 70),
          y: Math.min(prev.y, window.innerHeight - 70),
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasDragged]);

  // Mouse & Touch Drag Handlers
  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    let currentX = position.x;
    let currentY = position.y;

    if (!hasDragged && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;
      setPosition({ x: currentX, y: currentY });
    }

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: currentX,
      posY: currentY,
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - dragStartRef.current.mouseX;
    const deltaY = clientY - dragStartRef.current.mouseY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
      if (!hasDragged) {
        setHasDragged(true);
      }
    }

    const newX = Math.max(10, Math.min(window.innerWidth - 70, dragStartRef.current.posX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  // Global mousemove/mouseup listener during drag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [position, hasDragged]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMovedRef.current) {
      setShowTooltip(false);
      setIsOpen(!isOpen);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = language === 'english'
        ? 'Thank you for asking! Kosmico Wellness products are 100% natural with zero glycemic index. For specific medical advice, please consult your physician.'
        : 'Poochhne ke liye dhanyawad! Kosmico Wellness products 100% natural hain zero glycemic index ke saath. Specific medical advice ke liye physician se consult karein.';
      
      const lower = text.toLowerCase();
      if (lower.includes('hair')) {
        replyText = language === 'english'
          ? 'For hair fall, our Ayurvedic Hair Oil enriched with Bhringraj & Amla is highly recommended. It nourishes roots and stimulates natural hair growth.'
          : 'Hair fall ke liye humara Ayurvedic Hair Oil (Bhringraj & Amla) best hai. Yeh roots ko nourish karke hair growth stimulate karta hai.';
      } else if (lower.includes('pet') || lower.includes('digestion') || lower.includes('stomach')) {
        replyText = language === 'english'
          ? 'For stomach and digestion wellness, we recommend our Liver Care Supplement along with replacing refined sugar with 100% natural Sweet Monk fruit drops.'
          : 'Pet ki samasya ke liye humara Liver Care Supplement aur Sugar-free diet recommended hai. Monk fruit sweetener drops 0 calories offer karte hain.';
      } else if (lower.includes('weight') || lower.includes('loss') || lower.includes('fat')) {
        replyText = language === 'english'
          ? 'For healthy weight loss, eliminating refined sugar is key. Kosmico Sweet Monk drops offer zero calories and zero net carbohydrates.'
          : 'Weight loss ke liye refined sugar completely eliminate karna zaroori hai. Sweet Monk drops 0 calories aur 0 net carbs offer karte hain.';
      } else if (lower.includes('skin')) {
        replyText = language === 'english'
          ? 'For clean and glowing skin, maintain adequate daily hydration (+2L water daily) and consume pure plant-based antioxidants.'
          : 'Clean, glowing skin ke liye adequate hydration (+2L paani) aur pure plant-based antioxidants best hain.';
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Dynamic Draggable Floating Action Button Container */}
      <div 
        ref={containerRef}
        className="fixed z-50 flex flex-col items-end gap-2 select-none touch-none"
        style={
          hasDragged
            ? { left: `${position.x}px`, top: `${position.y}px` }
            : { bottom: '96px', right: '24px' }
        }
      >
        {/* Tooltip / Chat Bubble */}
        {showTooltip && !isOpen && (
          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 p-3.5 max-w-[220px] animate-fade-in-up -translate-y-2">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5 transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 text-neutral-600" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 text-xs font-bold shadow-xs">
                🤖
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-900 leading-tight">AI Consultant</p>
                <p className="text-[9px] text-emerald-700 font-semibold">Drag anywhere to move ✋</p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600 leading-snug">
              Namaste! 🙏 Ask any health query!
            </p>
          </div>
        )}

        {/* Draggable AI Button */}
        <div
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleButtonClick}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-900 shadow-2xl hover:shadow-emerald-900/40 transition-shadow hover:scale-105 active:scale-95 border-2 border-emerald-500 cursor-grab active:cursor-grabbing text-amber-300"
          title="Drag to move anywhere • Click to open AI Chat"
        >
          <span className="absolute inset-0 rounded-full animate-ping opacity-25 bg-emerald-400"></span>
          <Bot className="w-7 h-7 relative z-10 text-amber-300 pointer-events-none" />
          <Sparkles className="w-3.5 h-3.5 absolute top-1 right-1 text-amber-400 animate-pulse pointer-events-none" />
          <GripVertical className="w-3 h-3 absolute bottom-1 text-emerald-400 opacity-60 group-hover:opacity-100 pointer-events-none" />
        </div>

      </div>

      {/* Floating AI Chat Window Modal (Positioned dynamically near button) */}
      {isOpen && (
        <div 
          className="fixed z-50 w-[92vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-fade-in flex flex-col max-h-[480px]"
          style={
            hasDragged
              ? {
                  left: `${Math.min(Math.max(10, position.x - 300), window.innerWidth - 390)}px`,
                  top: `${Math.max(10, Math.min(position.y - 480, window.innerHeight - 490))}px`,
                }
              : {
                  bottom: '160px',
                  right: '24px',
                }
          }
        >
          
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 text-sm font-bold shrink-0">
                🤖
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs text-white">Kosmico AI Consultant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] text-emerald-200 uppercase font-extrabold">{language === 'hinglish' ? 'Hinglish Mode' : 'English Mode'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher Button */}
              <div className="flex items-center bg-emerald-950/80 p-0.5 rounded-lg border border-emerald-700/60 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('hinglish')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    language === 'hinglish'
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Switch to Hinglish language"
                >
                  🇮🇳 Hi
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('english')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    language === 'english'
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Switch to English language"
                >
                  🇬🇧 En
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-3 space-y-2.5 overflow-y-auto flex-1 bg-surface text-xs max-h-[280px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl leading-relaxed max-w-[240px] ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-tr-none'
                      : 'bg-background text-neutral-900 border border-neutral-200 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                  🤖
                </div>
                <div className="bg-background border border-neutral-200 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto bg-background scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-surface hover:bg-emerald-100 text-[10px] font-bold text-neutral-700 whitespace-nowrap transition-colors border border-neutral-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-neutral-200 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask health query..."
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4 text-amber-300" />
            </button>
            <Link
              to="/ai-consultant"
              onClick={() => setIsOpen(false)}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors text-[10px] font-extrabold flex items-center gap-0.5"
              title="Full Page Mode"
            >
              Full Page
            </Link>
          </div>

        </div>
      )}
    </>
  );
}
