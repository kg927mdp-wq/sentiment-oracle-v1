
import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from './services/sentimentService';
import { ChatMessage, SentimentAnalysis, Attachment } from './types';
import SentimentResult from './components/SentimentResult';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // قراءة الملف كـ Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedFile({
        data: base64String,
        mimeType: file.type,
        name: file.name
      });
    };
    
    if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain') {
      reader.readAsDataURL(file);
    } else {
      alert('يرجى اختيار صورة أو ملف نصي/PDF فقط.');
    }
    // إعادة تعيين قيمة المدخل للسماح باختيار نفس الملف مجدداً
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      attachment: selectedFile || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMsg.text, messages, userMsg.attachment);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        sentimentResult: response.analysis,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "عذراً، واجهت مشكلة في معالجة هذا المرفق. تأكد من أن الملف سليم.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/20 backdrop-blur-xl border-b border-white/10 py-5 px-8 flex items-center justify-between sticky top-0 z-20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
              Sentiment <span className="text-indigo-400">Oracle v3</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Vision & Text Enabled</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all border border-white/10"
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </motion.header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                <i className="fa-solid fa-eye text-4xl text-indigo-400 opacity-50"></i>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white/90">مرحباً بك في أوراكل المطور</h2>
                <p className="max-w-xs text-white/40 text-sm leading-relaxed">يمكنك الآن إرسال صور، ملفات PDF، أو نصوص لتحليلها عاطفياً ورؤية ما يكمن خلفها.</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`relative max-w-[85%] group`}>
                <div className={`rounded-3xl p-5 shadow-2xl border ${
                  msg.role === 'user' 
                    ? 'bg-white/5 border-white/10 rounded-tr-none text-white/90 backdrop-blur-sm' 
                    : 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 border-white/20 rounded-tl-none text-white shadow-indigo-500/10'
                }`}>
                  {msg.attachment && msg.attachment.mimeType.startsWith('image/') && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-white/10">
                      <img 
                        src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                        alt="Attached" 
                        className="max-h-60 w-full object-cover"
                      />
                    </div>
                  )}
                  {msg.attachment && !msg.attachment.mimeType.startsWith('image/') && (
                    <div className="mb-3 flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                      <i className="fa-solid fa-file-pdf text-rose-400"></i>
                      <span className="text-xs font-medium truncate max-w-[150px]">{msg.attachment.name}</span>
                    </div>
                  )}
                  
                  <p className="text-[16px] leading-relaxed" dir="auto">{msg.text}</p>
                  
                  {msg.sentimentResult && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                       <SentimentResult result={msg.sentimentResult} />
                    </div>
                  )}
                  
                  <div className={`mt-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-30 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <span>{msg.role === 'user' ? 'You' : 'Oracle AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl rounded-tl-none p-5 flex items-center gap-3 border border-white/10">
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Oracle is Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <motion.footer 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 bg-black/40 backdrop-blur-2xl border-t border-white/10 z-20"
      >
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-3xl mx-auto mb-4"
            >
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedFile.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} 
                      className="w-12 h-12 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xl text-indigo-400">
                      <i className="fa-solid fa-file-lines"></i>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/80">{selectedFile.name}</span>
                    <span className="text-[10px] text-white/30 uppercase font-black">Ready to analyze</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf,text/plain" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white/50 rounded-2xl flex items-center justify-center transition-all border border-white/10 shadow-xl"
          >
            <i className="fa-solid fa-paperclip text-xl"></i>
          </button>
          
          <div className="flex-1 relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالة أو ارفع ملفاً..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white placeholder:text-white/20"
              dir="auto"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedFile) || isLoading}
            className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all border border-white/20 shadow-xl shadow-indigo-500/20"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrow-up"></i>}
          </button>
        </div>
      </motion.footer>
    </div>
  );
};

export default App;
