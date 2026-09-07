import React, { useState, useRef, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiConsultantPage: React.FC = () => {
  const [language, setLanguage] = useState<'hinglish' | 'english'>('hinglish');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! 🙏 Main Kosmico AI Consultant hoon. Main aapki wellness journey mein kaise madad kar sakta hoon?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPromptsHinglish = [
    'Hair Fall Problem',
    'Pet ki samasya',
    'Weight Loss Tips',
    'Skin Glow',
    'Order kab aayega?',
    'Monk Fruit Sweetener Benefits',
  ];

  const quickPromptsEnglish = [
    'Hair Loss Advice',
    'Digestion Health',
    'Weight Loss Guide',
    'Skin Glow Tips',
    'Track My Order',
    'Monk Fruit Sweetener Benefits',
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // AI Smart Response Simulation
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
      } else if (lower.includes('order') || lower.includes('track')) {
        replyText = language === 'english'
          ? 'For real-time tracking of your order, please check Profile > Orders section on the website or mobile app.'
          : 'Aapne jo order place kiya hai uski real-time tracking ke liye aap Profile > My Orders section dekh sakte hain.';
      } else if (lower.includes('monk') || lower.includes('sweetener')) {
        replyText = language === 'english'
          ? 'Sweet Monk fruit drops are 100% plant-based liquid sweeteners that do not spike blood sugar levels and leave zero aftertaste.'
          : 'Sweet Monk fruit drops 100% plant-based sweetener hain jo blood sugar spike nahi karta aur zero aftertaste deta hai.';
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
    <div className="py-6 md:py-10 bg-background min-h-screen flex flex-col">
      <Container className="flex-1 flex flex-col max-w-4xl mx-auto">
        
        {/* Top Title Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-xl bg-surface hover:bg-neutral-100 border border-border">
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-serif text-neutral-900">Kosmico AI Health Consultant</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Online</span>
              </div>
              <p className="text-xs text-neutral-500">Instant AI Powered Health Assistance</p>
            </div>
          </div>

          {/* Language Switcher Toggle Button */}
          <div className="flex items-center bg-emerald-950/10 p-1 rounded-xl border border-emerald-800/20 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => handleLanguageChange('hinglish')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                language === 'hinglish'
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('english')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                language === 'english'
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 bg-surface rounded-3xl p-6 border border-border shadow-xs overflow-y-auto space-y-4 min-h-[420px] max-h-[550px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-800 text-white rounded-tr-none'
                    : 'bg-background text-neutral-900 border border-border rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`text-[9px] mt-1.5 font-semibold text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div className="bg-background border border-border p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="my-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-neutral-400 uppercase flex-shrink-0">Quick Topics:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-surface hover:bg-emerald-800/10 border border-border text-xs font-semibold text-neutral-700 whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your health query..."
            className="flex-1 px-5 py-3.5 rounded-2xl bg-surface border border-border text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-amber-400" />
          </button>
        </div>

      </Container>
    </div>
  );
};
