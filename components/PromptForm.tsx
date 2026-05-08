
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AspectRatio, SocialPlatform, MusicTrack, ImageFile } from '../types';
import MusicSelector from './MusicSelector';
import { 
  ArrowRight, 
  Music as MusicIcon, 
  Instagram, 
  Youtube, 
  Facebook, 
  Linkedin, 
  Twitter,
  Smartphone,
  Monitor,
  Play,
  ImagePlus,
  Upload,
  X,
  Sparkles
} from 'lucide-react';

interface PromptFormProps {
  onSubmit: (
    prompt: string, 
    aspectRatio: AspectRatio, 
    platform: SocialPlatform, 
    music: MusicTrack | null,
    productImages: ImageFile[],
    logo: ImageFile | null
  ) => void;
  recommendationId?: string;
  placeholder?: string;
  buttonLabel?: string;
}

const PromptForm: React.FC<PromptFormProps> = ({ 
  onSubmit, 
  recommendationId,
  placeholder = "Décrivez votre vision publicitaire ou le produit à promouvoir...", 
  buttonLabel = "Lancer la Production"
}) => {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.TIKTOK);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);
  const [productImages, setProductImages] = useState<ImageFile[]>([]);
  const [logo, setLogo] = useState<ImageFile | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const base64 = await fileToBase64(files[i]);
      newImages.push({ file: files[i], base64 });
    }
    setProductImages(prev => [...prev, ...newImages].slice(0, 4));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setLogo({ file, base64 });
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const platforms = [
    { id: SocialPlatform.TIKTOK, icon: MusicIcon, color: "hover:text-pink-500", ar: AspectRatio.PORTRAIT },
    { id: SocialPlatform.INSTAGRAM, icon: Instagram, color: "hover:text-fuchsia-500", ar: AspectRatio.PORTRAIT },
    { id: SocialPlatform.YOUTUBE_SHORTS, icon: Play, color: "hover:text-red-500", ar: AspectRatio.PORTRAIT },
    { id: SocialPlatform.YOUTUBE, icon: Youtube, color: "hover:text-red-600", ar: AspectRatio.LANDSCAPE },
    { id: SocialPlatform.FACEBOOK, icon: Facebook, color: "hover:text-blue-600", ar: AspectRatio.LANDSCAPE },
    { id: SocialPlatform.LINKEDIN, icon: Linkedin, color: "hover:text-blue-700", ar: AspectRatio.LANDSCAPE },
    { id: SocialPlatform.X, icon: Twitter, color: "hover:text-gray-400", ar: AspectRatio.LANDSCAPE },
  ];

  const handlePlatformSelect = (p: typeof platforms[0]) => {
    setPlatform(p.id);
    setAspectRatio(p.ar);
  };

  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === AspectRatio.LANDSCAPE ? AspectRatio.PORTRAIT : AspectRatio.LANDSCAPE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, aspectRatio, platform, selectedMusic, productImages, logo);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="w-full max-w-5xl bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] focus-within:border-indigo-500/40 transition-all overflow-hidden mb-12"
    >
      <div className="flex flex-col">
        <div className="p-8 pb-0">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-3xl text-white placeholder-gray-700 font-bold focus:outline-none resize-none min-h-[140px] leading-tight font-display"
          />
        </div>
        
        {/* Brand Assets Section - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 p-1">
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black flex items-center gap-3">
                  <ImagePlus size={16} /> Assets de Produit
                </p>
                <span className="text-[9px] text-gray-600 font-black tracking-widest bg-white/5 px-2 py-1 rounded">STOCK: {productImages.length}/4</span>
             </div>
             
             <div className="grid grid-cols-4 gap-4 min-h-[100px]">
                {productImages.map((img, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl"
                  >
                    <img src={img.base64} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button 
                      type="button"
                      onClick={() => removeProductImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
                {productImages.length < 4 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Upload size={24} className="text-gray-600 group-hover:text-indigo-400 mb-2 transition-colors" />
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter group-hover:text-white">Importer</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleProductUpload} />
                  </label>
                )}
             </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black flex items-center gap-3">
               <Sparkles size={16} /> Identité Visuelle
            </p>
            <div className="flex flex-col items-center justify-center flex-grow gap-6">
              {logo ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group w-32 h-32 rounded-3xl overflow-hidden border border-indigo-500/30 bg-indigo-500/5 p-6 shadow-2xl"
                >
                  <img src={logo.base64} className="w-full h-full object-contain" />
                  <button 
                    type="button"
                    onClick={() => setLogo(null)}
                    className="absolute top-3 right-3 p-2 bg-black/80 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ) : (
                <label className="w-32 h-32 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Upload size={24} className="text-gray-600 group-hover:text-indigo-400 mb-2" />
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter group-hover:text-white">Logo PNG</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">Format transparent<br/>recommandé</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 p-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black">Ciblage Plateforme</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformSelect(p)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[10px] font-black tracking-[0.2em] transition-all uppercase ${
                    platform === p.id 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-600/40' 
                    : `bg-black/60 border-white/5 text-gray-500 hover:text-white hover:border-white/20 ${p.color}`
                  }`}
                >
                  <p.icon size={14} />
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <MusicSelector 
              selected={selectedMusic} 
              onSelect={setSelectedMusic} 
              recommendationId={recommendationId}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-8 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-6">
           <button 
              type="button"
              onClick={toggleAspectRatio}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
           >
             {aspectRatio === AspectRatio.LANDSCAPE ? (
               <Monitor size={16} className="text-indigo-400 transition-transform group-hover:scale-110"/>
             ) : (
               <Smartphone size={16} className="text-indigo-400 transition-transform group-hover:scale-110"/>
             )}
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FORMAT {aspectRatio}</span>
           </button>
           <div className="hidden md:flex flex-col gap-0.5">
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">{platform}</p>
              <p className="text-[9px] text-gray-600 font-bold">OPTIMISATION ALGORITHMIQUE ACTIVE</p>
           </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim()}
          className="relative group overflow-hidden px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale shadow-2xl shadow-white/5"
        >
          <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <span className="relative z-10 group-hover:text-white flex items-center gap-4 transition-colors">
            {buttonLabel} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
          </span>
        </button>
      </div>
    </motion.form>
  );
};

export default PromptForm;
