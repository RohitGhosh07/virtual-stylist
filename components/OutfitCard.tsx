import React, { useState, useCallback } from 'react';
import { OutfitStyle, GenerationStatus } from '../types';
import { Loader } from './Loader';

interface OutfitCardProps {
  style: OutfitStyle;
  imageUrl: string | null;
  status: GenerationStatus;
  error?: string;
  onEdit: (style: OutfitStyle, prompt: string) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  style,
  imageUrl,
  status,
  error,
  onEdit,
}) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Map styles to Gen Z slang titles
  const displayTitle = {
    [OutfitStyle.CASUAL]: "THE_CHILL_FIT",
    [OutfitStyle.BUSINESS]: "CEO_ENERGY",
    [OutfitStyle.NIGHT_OUT]: "MAIN_CHARACTER"
  }[style];

  // Map styles to distinct accent colors
  const accentColor = {
    [OutfitStyle.CASUAL]: "bg-[#ccff00]", // Lime
    [OutfitStyle.BUSINESS]: "bg-[#4d4dff]", // Electric Blue
    [OutfitStyle.NIGHT_OUT]: "bg-[#ff00ff]" // Hot Pink
  }[style];

  const handleSubmitEdit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEdit(style, editPrompt);
      setEditPrompt('');
      setIsEditing(false);
    }
  }, [editPrompt, onEdit, style]);

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full transition-transform hover:-translate-y-1 duration-200">
      <div className={`p-3 border-b-2 border-black flex justify-between items-center ${accentColor}`}>
        <h3 className="font-bold text-black uppercase tracking-wider text-lg">{displayTitle}</h3>
        {status === 'generating' && (
           <span className="bg-black text-white text-xs font-bold px-2 py-1 animate-pulse">
             COOKING...
           </span>
        )}
      </div>

      <div className="relative aspect-[3/4] bg-white border-b-2 border-black flex items-center justify-center group overflow-hidden">
        {status === 'generating' ? (
          <div className="text-center p-4">
            <Loader size="lg" />
            <p className="mt-4 font-bold bg-black text-white inline-block px-2">RENDERING_DRIP...</p>
          </div>
        ) : status === 'error' ? (
          <div className="p-6 text-center">
             <div className="text-4xl mb-2">👾</div>
            <p className="font-bold text-red-600 bg-red-100 border border-red-600 p-2 uppercase">System Glitch</p>
            <p className="text-xs mt-2 font-mono">{error || "Try again later"}</p>
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`${style} Outfit`}
              className="w-full h-full object-cover"
            />
            {/* Retro sticker overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black text-white text-[10px] font-bold px-2 py-1 transform rotate-3">
                GENERATED_BY_GEMINI
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center">
            <div className="w-16 h-16 border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
               <span className="text-2xl opacity-50">?</span>
            </div>
            <span className="font-mono text-xs uppercase bg-slate-100 px-2">Waiting_Input</span>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto bg-white">
        {imageUrl && status === 'success' ? (
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 px-3 text-sm font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                <span>✏️</span>
                Remix Fit
              </button>
            ) : (
              <form onSubmit={handleSubmitEdit} className="space-y-2">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. 'Add bucket hat'"
                  className="w-full text-sm border-2 border-black p-2 font-mono focus:outline-none focus:bg-[#ccff00] transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!editPrompt.trim()}
                    className="flex-1 py-1 px-2 text-xs font-bold uppercase border-2 border-black bg-[#ccff00] hover:bg-[#b3e600] disabled:opacity-50 disabled:bg-gray-200"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-1 px-2 text-xs font-bold uppercase border-2 border-black bg-white hover:bg-gray-100"
                  >
                    X
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
           <div className="h-8 w-full bg-slate-100 border border-slate-200 repeating-linear-gradient-slate"></div>
        )}
      </div>
    </div>
  );
};