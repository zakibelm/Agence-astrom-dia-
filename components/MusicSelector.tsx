
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { MusicTrack } from '../types';
import { Music, Upload, Check, X, Headphones, Sparkles } from 'lucide-react';

interface Props {
  selected: MusicTrack | null;
  onSelect: (track: MusicTrack | null) => void;
  recommendationId?: string;
}

export const PRESET_TRACKS: MusicTrack[] = [
  { id: 'cinematic', name: 'Elite Cinematic', genre: 'Epic / Orchestral', type: 'preset' },
  { id: 'urban', name: 'Urban Pulse', genre: 'Hip-Hop / Bass', type: 'preset' },
  { id: 'lofi', name: 'Midnight Lo-Fi', genre: 'Chill / Aesthetic', type: 'preset' },
  { id: 'energetic', name: 'Cyber Neon', genre: 'Electronic / Fast', type: 'preset' },
];

const MusicSelector: React.FC<Props> = ({ selected, onSelect, recommendationId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect({
        id: `upload-${Date.now()}`,
        name: file.name,
        genre: 'Custom Upload',
        type: 'upload',
        file: file,
        url: URL.createObjectURL(file)
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.4em] flex items-center gap-2">
          <Headphones size={14}/> Sound Design
        </h4>
        <button 
          type="button"
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${!selected ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-gray-500 border-white/5'}`}
        >
          <Sparkles size={10} /> Auto-Score
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESET_TRACKS.map((track) => {
          const isRecommended = track.id === recommendationId;
          const isSelected = selected?.id === track.id;
          
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelect(track)}
              className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all group ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl z-10'
                  : isRecommended 
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-100 hover:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Music size={14} className={isSelected ? 'text-white' : isRecommended ? 'text-indigo-400' : 'text-gray-700 group-hover:text-gray-400'} />
                {isSelected ? <Check size={14} className="text-white" /> : isRecommended && <Sparkles size={12} className="text-indigo-400 animate-pulse" />}
              </div>
              <p className={`text-[10px] font-black truncate w-full uppercase tracking-tight ${isRecommended && !isSelected ? 'text-indigo-200' : ''}`}>{track.name}</p>
              <p className="text-[8px] opacity-60 truncate w-full uppercase font-bold">{track.genre}</p>
              
              {isRecommended && (
                <div className="absolute -top-1 -right-1 bg-indigo-500 text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg text-white border border-indigo-400/50 flex items-center gap-1 z-20">
                  <Sparkles size={8} /> AI Pick
                </div>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border border-dashed transition-all ${
            selected?.type === 'upload'
              ? 'bg-indigo-600/10 border-indigo-500 text-white'
              : 'bg-white/5 border-white/5 text-gray-600 hover:border-indigo-500/30 hover:bg-indigo-500/5'
          }`}
        >
          <Upload size={16} className="mb-1" />
          <p className="text-[10px] font-black uppercase tracking-tighter">Upload</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
        </button>
      </div>

      {!selected && (
        <div className="mt-auto pt-4 bg-gradient-to-t from-black/20 to-transparent">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
             <Sparkles size={10} className="text-indigo-400 animate-pulse" /> 
             {recommendationId 
               ? `Recommandation IA : ${PRESET_TRACKS.find(t => t.id === recommendationId)?.name || 'Détectée'}`
               : 'Analyse sonore adaptative active'}
          </p>
        </div>
      )}

      {selected?.type === 'upload' && (
        <div className="mt-3 p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <p className="text-[9px] text-indigo-300 font-mono truncate">{selected.name}</p>
        </div>
      )}
    </div>
  );
};

export default MusicSelector;
