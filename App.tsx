
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import AgentLaboratory from './components/AgentLaboratory';
import { PRESET_TRACKS } from './components/MusicSelector';
import { orchestrate, generateArt, marketAnalysis, writeScript, generateCampaignVideo } from './services/aiService';
import {
  AppState,
  AspectRatio,
  SocialPlatform,
  AgentConfig,
  ProductionData,
  ImageFile,
  MusicTrack
} from './types';
import { 
  Settings, 
  Play, 
  Cpu, 
  Megaphone, 
  Clapperboard, 
  RotateCcw,
  ExternalLink,
  Search,
  Music,
  Volume2,
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [config, setConfig] = useState<AgentConfig>({
    producer: {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      persona: `You are ASTROMÉDIA ELITE — Executive Producer & Multi-Agent Orchestrator.

ROLE:
You are the strategic brain and operational commander of a premium AI-powered creative production studio specialized in high-performance advertising campaigns, cinematic storytelling, social content systems, and scalable media orchestration.

You do NOT generate random ideas.
You architect complete media strategies designed for: conversion, emotional retention, virality, brand positioning, and platform-native performance.

MISSION:
Transform a simple client objective into a fully orchestrated creative production pipeline.
You supervise: narrative direction, marketing strategy, visual identity, platform adaptation, production consistency, quality validation, and creative cohesion.

CORE THINKING MODEL:
Always think like an executive creative director, a growth strategist, a Hollywood producer, and a social-media performance architect.

STYLE:
Premium, strategic, concise, executive-level, cinematic, and highly intelligent. Maintain luxury-agency quality standards at all times.`
    },
    marketer: {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      persona: `You are ASTROMÉDIA ELITE — Multi-Channel Growth Strategist.

ROLE:
You are an elite advertising strategist specialized in: conversion psychology, performance marketing, audience behavior, direct response, and viral mechanics.

MISSION:
Design campaigns optimized for CTR, watch time, conversion, and emotional resonance.
Combine direct response marketing, luxury branding, and viral social engineering.

STRATEGY:
Analyze target emotions, psychological triggers, and platform-native behavior. 
Prioritize: 1. Attention, 2. Retention, 3. Emotion, 4. Conversion, 5. Scalability.`
    },
    director: {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      persona: `You are ASTROMÉDIA ELITE — Cinematic Visual Director & AI Film Architect.

ROLE:
You are a world-class cinematic director specialized in AI visual generation, cinematic composition, and premium aesthetics.

MISSION:
Transform scripts into cinematic visual systems, storyboard sequences, and emotionally immersive scenes.
Specializations: cyber-atmospheric aesthetics, neo-luxury visuals, cinematic realism, editorial framing, and Bento Brutalist design.

THINK LIKE:
Denis Villeneuve, David Fincher, or high-end luxury commercial directors. 
Focus on: Composition, Lighting, Emotional atmosphere, Texture, and Motion language.`
    },
    screenwriter: {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      persona: `You are ASTROMÉDIA ELITE — Performance Narrative Architect.

ROLE:
You are a high-performance cinematic storyteller specialized in: short-form storytelling, advertising psychology, emotional scripting, and social retention engineering.

MISSION:
Transform ideas into emotionally engineered narratives that maximize retention and curiosity.
Every script must: hook instantly, escalate emotionally, maintain rhythm, and end with momentum.

STRUCTURE: 
1. Hook, 2. Curiosity gap, 3. Emotional build-up, 4. Transformation, 5. Payoff, 6. CTA momentum.
Style: cinematic, visual, emotionally intelligent, rhythmic, and modern.`
    },
    artist: {
      model: "openai/dall-e-3",
      persona: "You are the ASTROMÉDIA ELITE Artist agent. Your role is to generate stunning, high-end cinematic visuals that serve as the key aesthetic anchor for the campaign. Prioritize photorealism, perfect lighting, and compositions that feel like professional film stills."
    }
  });
  
  const [prod, setProd] = useState<ProductionData>({
    initialPrompt: "",
    enhancedPrompt: "",
    targetPlatform: SocialPlatform.TIKTOK,
    groundingSources: []
  });
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startProduction = async (
    prompt: string, 
    ar: AspectRatio, 
    platform: SocialPlatform, 
    manualMusic: MusicTrack | null,
    productImages: ImageFile[],
    logo: ImageFile | null
  ) => {
    // Check for API key (Required for Veo/Imagen 3)
    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio?.openSelectKey();
        // Assuming success after trigger per skill instructions
      }
    } catch (err) {
      console.warn("API Key check skipped or failed:", err);
    }

    setAspectRatio(ar);
    setProd({ 
      initialPrompt: prompt, 
      enhancedPrompt: "", 
      targetPlatform: platform, 
      groundingSources: [],
      selectedMusic: manualMusic || undefined,
      productAssets: productImages,
      logo: logo || undefined
    });
    
    try {
      setAppState(AppState.ORCHESTRATING);
      
      // L'Orchestrateur décide du visuel ET de la recommandation musicale
      const { enhancedPrompt, musicMood, recommendedGenre } = await orchestrate(
        prompt, 
        config, 
        platform,
        productImages,
        logo || undefined
      );
      
      // Si l'utilisateur n'a pas forcé de musique, on prend celle du réalisateur
      let finalMusic = manualMusic;
      if (!manualMusic) {
        finalMusic = PRESET_TRACKS.find(t => t.id === recommendedGenre) || PRESET_TRACKS[0];
      }

      setProd(prev => ({ 
        ...prev, 
        enhancedPrompt, 
        selectedMusic: finalMusic || undefined,
        recommendedMusicId: recommendedGenre,
        musicMoodSuggestion: musicMood // On stocke l'intention pour l'affichage
      }));
      
      setAppState(AppState.IMAGING);
      const image = await generateArt(enhancedPrompt, ar, config);
      setProd(prev => ({ ...prev, image }));
      setAppState(AppState.MARKETING);
      
    } catch (e: any) {
      setErrorMessage(e.message);
      setAppState(AppState.ERROR);
    }
  };

  const approveImage = async () => {
    if (!prod.image) return;
    try {
      setAppState(AppState.MARKETING);
      const { copy, sources } = await marketAnalysis(
        prod.image, 
        prod.initialPrompt, 
        config, 
        prod.targetPlatform,
        prod.productAssets,
        prod.logo
      );
      setProd(prev => ({ ...prev, marketingCopy: copy, groundingSources: sources }));
      
      setAppState(AppState.SCRIPTING);
      const script = await writeScript(prod.initialPrompt, copy, config, prod.image);
      setProd(prev => ({ ...prev, script }));
      
      setAppState(AppState.VIDEO_GEN);
      const {url, video} = await generateCampaignVideo(
        prod.image, 
        script, 
        aspectRatio, 
        prod.targetPlatform,
        config,
        prod.musicMoodSuggestion || "Neutral cinematic"
      );
      setProd(prev => ({ ...prev, videoUrl: url, videoObject: video }));
      setAppState(AppState.SUCCESS);
      
    } catch (e: any) {
      setErrorMessage(e.message);
      setAppState(AppState.ERROR);
    }
  };

  const renderSettings = () => (
    <AgentLaboratory 
      config={config} 
      onChange={setConfig} 
      onBack={() => setAppState(AppState.IDLE)} 
    />
  );

  return (
    <div className="h-screen bg-[#050505] text-gray-200 flex flex-col font-sans overflow-hidden relative">
      <div className="noise-overlay" />
      
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 pro-inner-shadow"
          >
            <Clapperboard className="text-white" size={26} />
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase font-display">
              AGENCE ASTROMÉDIA <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded ml-2 font-black tracking-widest">ELITE</span>
            </h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
               <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold">Studio de Production Virtuelle</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setAppState(AppState.SETTINGS)} className="px-4 py-2 hover:bg-white/5 rounded-2xl transition-all border border-white/10 flex items-center gap-2 group bg-white/5">
            <Bot size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Agent Laboratory</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col overflow-y-auto custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          {appState === AppState.SETTINGS ? (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-grow"
            >
              {renderSettings()}
            </motion.div>
          ) : (
            <motion.div 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto w-full p-8 flex flex-col flex-grow"
            >
              {appState === AppState.IDLE && (
                <div className="flex-grow flex flex-col items-center justify-center py-10 relative">
                  <div className="text-center mb-16 relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                    >
                      <Sparkles size={12} /> Intelligence Créative de Pointe
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-7xl font-black text-white mb-6 tracking-tighter leading-none font-display uppercase"
                    >
                      CAMPAGNE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500">MÉDIA 3.0</span>
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                      Propulsez vos idées dans une dimension cinématographique dirigée par nos <span className="text-indigo-300 font-bold">agents spécialisés</span>.
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", damping: 20 }}
                    className="w-full"
                  >
                    <PromptForm 
                      onSubmit={startProduction} 
                      recommendationId={prod.recommendedMusicId}
                    />
                  </motion.div>
                </div>
              )}

            {(appState >= AppState.ORCHESTRATING && appState <= AppState.VIDEO_GEN) && (
              <div className="flex-grow flex flex-col items-center justify-center gap-12">
                <LoadingIndicator state={appState} />
                <div className="flex items-center gap-8 text-xs font-mono tracking-widest uppercase opacity-50">
                   Génération par Agent IA en cours...
                </div>
              </div>
            )}

            {appState === AppState.MARKETING && prod.image && (
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col gap-6 lg:sticky lg:top-8">
                  <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <img src={URL.createObjectURL(prod.image.file)} className="w-full object-contain" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                       <p className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">Génération Visuelle Director Pro</p>
                    </div>
                  </div>
                  
                  {(prod.logo || (prod.productAssets && prod.productAssets.length > 0)) && (
                    <div className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
                       <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                         <Sparkles size={14} className="text-indigo-400"/> Assets de Marque Intégrés
                       </h4>
                       <div className="flex flex-wrap gap-4">
                          {prod.logo && (
                            <div className="w-14 h-14 bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-center shadow-inner">
                              <img src={prod.logo.base64} className="max-w-full max-h-full object-contain" title="Logo de marque" />
                            </div>
                          )}
                          {prod.productAssets?.map((asset, i) => (
                            <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                              <img src={asset.base64} className="w-full h-full object-cover" title="Produit" />
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-8">
                  <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                    <div className="flex items-center gap-3 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                       <Search size={16} className="animate-pulse"/> Analyse Agent Marketer
                    </div>
                    <h3 className="text-3xl font-black text-white leading-[1.1] mb-8 tracking-tighter uppercase">
                      Stratégie de Campagne <span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8 decoration-4">{prod.targetPlatform}</span>
                    </h3>
                    
                    <p className="text-xl text-gray-300 leading-relaxed font-medium mb-10 border-l-4 border-indigo-500 pl-6">
                      Le visuel principal a été validé par le réalisateur. L'agent Marketing finalise maintenant le script de vente pour maximiser votre conversion.
                    </p>
                    
                    {prod.selectedMusic && (
                      <div className="mb-10 flex flex-col gap-4 bg-indigo-600/5 p-6 rounded-2xl border border-indigo-500/20">
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Sparkles size={16} />
                           <p className="text-[11px] uppercase font-black tracking-widest">Intention du Producteur</p>
                        </div>
                        <p className="text-sm text-white font-bold italic">"{prod.musicMoodSuggestion}"</p>
                        <div className="flex items-center gap-3 mt-2 border-t border-white/5 pt-4">
                           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                              <Volume2 size={16} className="text-white" />
                           </div>
                           <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{prod.selectedMusic.name} <span className="text-indigo-400 mx-2">/</span> {prod.selectedMusic.genre}</p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={approveImage}
                      className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-indigo-400 hover:text-white transition-all flex items-center justify-center gap-4 shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      DÉPLOYER LA PRODUCTION <Play size={20} fill="currentColor" />
                    </button>
                  </div>

                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] flex gap-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles size={24} className="text-indigo-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-white text-sm font-bold uppercase tracking-wider">Astromédia Intelligence</h4>
                       <p className="text-gray-400 text-xs leading-relaxed font-medium">Contenu optimisé pour une audience {prod.targetPlatform}. Le script sera généré en tenant compte des assets de marque fournis.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {appState === AppState.SUCCESS && prod.videoUrl && (
              <div className="flex-grow flex flex-col items-center gap-12 py-10 animate-in fade-in duration-1000">
                <div className="text-center">
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Campagne Finalisée</h2>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Astromédia Production Core v3.1</p>
                </div>

                <div className={`w-full ${aspectRatio === AspectRatio.PORTRAIT ? 'max-w-sm' : 'max-w-4xl'} rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 relative group`}>
                  <video src={prod.videoUrl} controls autoPlay loop className="w-full object-cover" />
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Master 4K Engine Ready</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                  <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                      <Sparkles size={120} className="text-indigo-400" />
                    </div>
                    <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                       <Sparkles size={16}/> Script Narratif (Le Scénariste)
                    </h4>
                    <div className="relative group/text">
                       <p className="text-gray-100 text-lg leading-relaxed whitespace-pre-line font-medium mb-8 p-8 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                         {prod.script}
                       </p>
                    </div>

                    <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Megaphone size={16}/> Strategie Social Media (Le Marketer)
                    </h4>
                    <p className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-line mb-10 bg-black/40 p-6 rounded-2xl border border-gray-800/50">
                      {prod.marketingCopy}
                    </p>
                    
                    {prod.selectedMusic && (
                      <div className="border-t border-gray-800 pt-8 mt-4">
                        <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                          <Music size={14} className="text-indigo-400" /> Soundtrack Masterisée :
                        </h5>
                        <div className="bg-gradient-to-r from-indigo-900/40 to-black p-6 rounded-2xl border border-indigo-500/20 flex items-center justify-between shadow-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                              <Volume2 size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white uppercase tracking-tight">{prod.selectedMusic.name}</span>
                              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{prod.selectedMusic.genre}</span>
                            </div>
                          </div>
                          {prod.selectedMusic.url && (
                            <audio controls className="h-8 filter invert hue-rotate-180 opacity-80 scale-90">
                              <source src={prod.selectedMusic.url} />
                            </audio>
                          )}
                        </div>
                      </div>
                    )}

                    {prod.groundingSources && prod.groundingSources.length > 0 && (
                      <div className="border-t border-gray-800 pt-8 mt-4">
                        <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                          <Search size={14} className="text-indigo-400" /> Sources & Contextes :
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {prod.groundingSources.map((s, i) => (
                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group">
                               <div className="flex items-center gap-3 overflow-hidden">
                                 <ExternalLink size={12} className="text-gray-500 group-hover:text-indigo-400 flex-shrink-0" />
                                 <span className="text-[11px] font-bold text-gray-300 group-hover:text-white truncate">{s.title}</span>
                               </div>
                               <ArrowRight size={12} className="text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="bg-indigo-600 p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 flex flex-col items-center text-center gap-8 relative overflow-hidden">
                       <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center shadow-inner border border-white/10">
                          <RotateCcw size={48} className="text-white" />
                       </div>
                       <div>
                          <h4 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Nouvelle Vision ?</h4>
                       </div>
                       <button 
                         onClick={() => setAppState(AppState.IDLE)}
                         className="w-full bg-white text-indigo-600 font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                       >
                         Retour au Studio <ArrowRight size={18} />
                       </button>
                    </div>

                    {(prod.logo || (prod.productAssets && prod.productAssets.length > 0)) && (
                      <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-gray-800 shadow-xl">
                         <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                           <Sparkles size={14} className="text-indigo-400"/> Assets de Marque Utilisés
                         </h4>
                         <div className="flex flex-wrap gap-4">
                            {prod.logo && (
                              <div className="w-14 h-14 bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-center shadow-inner">
                                <img src={prod.logo.base64} className="max-w-full max-h-full object-contain" title="Logo de marque" />
                              </div>
                            )}
                            {prod.productAssets?.map((asset, i) => (
                              <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                <img src={asset.base64} className="w-full h-full object-cover" title="Produit" />
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
