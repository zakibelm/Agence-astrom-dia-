import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Cpu, 
  Sparkles, 
  Megaphone, 
  Clapperboard, 
  RotateCcw,
  Zap,
  Bot
} from 'lucide-react';
import { AgentConfig, AgentSettings } from '../types';

interface Props {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onBack: () => void;
}

const MODELS = [
  { id: "google/gemini-2.0-pro-exp-02-05:free", name: "Gemini 2.0 Pro", provider: "Google" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "openai/gpt-4o-2024-08-06", name: "GPT-4o", provider: "OpenAI" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "mistralai/mistral-large-2411", name: "Mistral Large 2", provider: "Mistral" },
  { id: "openai/dall-e-3", name: "DALL-E 3", provider: "OpenAI" },
  { id: "google/imagen-3", name: "Imagen 3", provider: "Google" }
];

const AgentLaboratory: React.FC<Props> = ({ config, onChange, onBack }) => {
  const handleUpdate = (agentKey: keyof AgentConfig, field: keyof AgentSettings, value: string) => {
    onChange({
      ...config,
      [agentKey]: {
        ...config[agentKey],
        [field]: value
      }
    });
  };

  const agents = [
    { 
      key: 'producer' as const, 
      label: 'Orchestrateur', 
      icon: Cpu, 
      color: 'text-indigo-400',
      description: 'Cœur stratégique et coordination multi-agents.'
    },
    { 
      key: 'screenwriter' as const, 
      label: 'Scénariste', 
      icon: Sparkles, 
      color: 'text-purple-400',
      description: 'Architecture narrative et ingénierie de rétention.'
    },
    { 
      key: 'marketer' as const, 
      label: 'Marketer', 
      icon: Megaphone, 
      color: 'text-amber-400',
      description: 'Psychologie de conversion et analyse de tendances.'
    },
    { 
      key: 'director' as const, 
      label: 'Réalisateur', 
      icon: Clapperboard, 
      color: 'text-emerald-400',
      description: 'Vision visuelle et cohérence esthétique.'
    },
    { 
      key: 'artist' as const, 
      label: 'Artiste (Image)', 
      icon: Sparkles, 
      color: 'text-pink-400',
      description: 'Génération visuelle et photoréalisme.'
    }
  ];

  return (
    <div className="flex-grow flex flex-col p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 uppercase">
            <Bot className="text-indigo-500" size={32} /> Agent Laboratory
          </h2>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            Configurez l'intelligence et la personnalité de votre studio de production virtuel.
          </p>
        </div>
        
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-white/5 active:scale-95"
        >
          <RotateCcw size={16} /> Sauvegarder & Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-12">
        {agents.map((agent) => (
          <motion.div 
            key={agent.key} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-white/10 transition-all shadow-2xl relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none`}>
              <agent.icon size={160} className={agent.color} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${agent.color}`}>
                  <agent.icon size={20} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">{agent.label}</h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{agent.description}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">IA Engine</span>
                <select 
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-black text-indigo-400 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none min-w-[160px] text-right"
                  value={config[agent.key].model}
                  onChange={(e) => handleUpdate(agent.key, 'model', e.target.value)}
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#111] text-white py-2">
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={10} className="text-indigo-400" /> SYSTEM PERSONA (PROMPT)
              </label>
              <textarea
                className="bg-black/60 border border-white/5 rounded-2xl p-6 text-[13px] min-h-[220px] focus:border-indigo-500 outline-none text-gray-300 leading-relaxed custom-scrollbar font-medium transition-all hover:bg-black/80 shadow-inner"
                placeholder={`Définissez les directives de l'agent ${agent.label}...`}
                value={config[agent.key].persona}
                onChange={(e) => handleUpdate(agent.key, 'persona', e.target.value)}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center justify-center py-10 opacity-30">
        <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent w-full max-w-md" />
      </div>
    </div>
  );
};

export default AgentLaboratory;
