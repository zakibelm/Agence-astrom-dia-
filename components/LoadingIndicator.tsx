
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../types';

interface Props {
  state: AppState;
}

const getMessages = (state: AppState) => {
  switch(state) {
    case AppState.ORCHESTRATING: 
      return ["ORCHESTRATOR: Analyzing requirements...", "Building visual hierarchy...", "Enhancing cinematic prompts..."];
    case AppState.IMAGING: 
      return ["ARTIST: Generating high-fidelity assets...", "Applying global illumination...", "Rendering cinematic textures..."];
    case AppState.MARKETING: 
      return ["MARKETER: Analyzing visual impact...", "Drafting advertising copy...", "Defining brand voice..."];
    case AppState.SCRIPTING: 
      return ["DIRECTOR: Planning camera motion...", "Blocking the shot...", "Preparing cinematography..."];
    case AppState.VIDEO_GEN: 
      return ["VEO: Rendering the master clip...", "Applying temporal stability...", "Finalizing production..."];
    default: 
      return ["Workflow processing..."];
  }
};

const LoadingIndicator: React.FC<Props> = ({ state }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = getMessages(state);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-48 h-48 mb-16">
        {/* Elite Spinner Layers */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-[3rem] border border-indigo-500/10"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-[2rem] border border-purple-500/10"
        />
        
        {/* Active Rings */}
        <div className="absolute inset-0 rounded-full border-t border-indigo-500 animate-[spin_2s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border-b border-white/20 animate-[spin_3s_linear_infinite_reverse]" />
        
        {/* Central Core */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]"
           />
           <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2">Processing</div>
        </div>
      </div>

      <div className="h-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={messages[msgIdx]}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            className="text-indigo-400 font-display text-sm font-bold uppercase tracking-[0.4em] text-center"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingIndicator;
