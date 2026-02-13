
import React from 'react';
import { SentimentAnalysis } from '../types';
import { motion } from 'framer-motion';

interface Props {
  result: SentimentAnalysis;
  isCompact?: boolean;
}

const SentimentResult: React.FC<Props> = ({ result, isCompact }) => {
  const getGradient = () => {
    switch (result.sentiment) {
      case 'إيجابي': return 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30';
      case 'سلبي': return 'from-rose-500/20 to-orange-600/20 border-rose-500/30';
      default: return 'from-amber-500/20 to-orange-400/20 border-amber-500/30';
    }
  };

  const getIconColor = () => {
    switch (result.sentiment) {
      case 'إيجابي': return 'text-emerald-400 shadow-emerald-500/20';
      case 'سلبي': return 'text-rose-400 shadow-rose-500/20';
      default: return 'text-amber-400 shadow-amber-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-4 rounded-2xl border bg-gradient-to-br ${getGradient()} backdrop-blur-md relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-10 -mt-10 rounded-full group-hover:bg-white/10 transition-colors"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl shadow-2xl transform group-hover:rotate-6 transition-transform`}>
          {result.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold text-lg ${getIconColor()}`}>مشاعر {result.sentiment}</span>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Confidence Index</span>
                <span className="text-xl font-black text-white/80 tabular-nums leading-none">
                {(result.confidence * 100).toFixed(0)}%
                </span>
            </div>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${result.confidence * 100}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={`h-full bg-gradient-to-r ${result.sentiment === 'إيجابي' ? 'from-emerald-400 to-teal-500' : result.sentiment === 'سلبي' ? 'from-rose-400 to-orange-500' : 'from-amber-400 to-orange-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'}`}
             ></motion.div>
          </div>
          {!isCompact && (
            <p className="text-sm mt-4 text-white/70 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                {result.explanation}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentResult;
