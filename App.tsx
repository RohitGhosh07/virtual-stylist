import React, { useState, useCallback } from 'react';
import { OutfitStyle, OutfitResult, ImageUploadState } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { generateOutfit, editOutfit } from './services/geminiService';
import { OutfitCard } from './components/OutfitCard';
import { Loader } from './components/Loader';

// SVG Sticker Components
const StarSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<ImageUploadState>({
    file: null,
    previewUrl: null,
    base64: null,
  });

  const [outfits, setOutfits] = useState<Record<OutfitStyle, OutfitResult>>({
    [OutfitStyle.CASUAL]: { style: OutfitStyle.CASUAL, imageUrl: null, status: 'idle' },
    [OutfitStyle.BUSINESS]: { style: OutfitStyle.BUSINESS, imageUrl: null, status: 'idle' },
    [OutfitStyle.NIGHT_OUT]: { style: OutfitStyle.NIGHT_OUT, imageUrl: null, status: 'idle' },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setUploadedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
      });
      // Reset outfits when new image is uploaded
      setOutfits({
        [OutfitStyle.CASUAL]: { style: OutfitStyle.CASUAL, imageUrl: null, status: 'idle' },
        [OutfitStyle.BUSINESS]: { style: OutfitStyle.BUSINESS, imageUrl: null, status: 'idle' },
        [OutfitStyle.NIGHT_OUT]: { style: OutfitStyle.NIGHT_OUT, imageUrl: null, status: 'idle' },
      });
    } catch (error) {
      console.error("File reading error:", error);
      alert("Failed to read the file.");
    }
  };

  const handleGenerateAll = useCallback(async () => {
    if (!uploadedImage.base64) return;

    // Set all to loading
    setOutfits(prev => {
      const next = { ...prev };
      (Object.keys(next) as OutfitStyle[]).forEach(key => {
        next[key] = { ...next[key], status: 'generating', error: undefined };
      });
      return next;
    });

    const styles = [OutfitStyle.CASUAL, OutfitStyle.BUSINESS, OutfitStyle.NIGHT_OUT];

    // Trigger parallel requests
    styles.forEach(async (style) => {
      try {
        const generatedImage = await generateOutfit(uploadedImage.base64!, style);
        setOutfits(prev => ({
          ...prev,
          [style]: { ...prev[style], imageUrl: generatedImage, status: 'success' }
        }));
      } catch (err) {
        setOutfits(prev => ({
          ...prev,
          [style]: { ...prev[style], status: 'error', error: 'Could not generate outfit' }
        }));
      }
    });
  }, [uploadedImage.base64]);

  const handleEditOutfit = useCallback(async (style: OutfitStyle, prompt: string) => {
    const currentOutfit = outfits[style];
    if (!currentOutfit.imageUrl) return;

    setOutfits(prev => ({
      ...prev,
      [style]: { ...prev[style], status: 'generating' }
    }));

    try {
      const editedImage = await editOutfit(currentOutfit.imageUrl, prompt);
      setOutfits(prev => ({
        ...prev,
        [style]: { ...prev[style], imageUrl: editedImage, status: 'success' }
      }));
    } catch (err) {
      setOutfits(prev => ({
        ...prev,
        [style]: { ...prev[style], status: 'error', error: 'Failed to edit image' }
      }));
    }
  }, [outfits]);

  return (
    <div className="min-h-screen text-black pb-20 overflow-x-hidden">
      
      {/* Marquee Header */}
      <header className="sticky top-0 z-50 bg-[#ccff00] border-y-2 border-black">
        <div className="overflow-hidden whitespace-nowrap py-2 flex gap-8">
           <div className="animate-marquee inline-block font-bold font-mono text-sm uppercase tracking-widest">
              ★ VIRTUAL_STYLIST_AI_V2.0 ★ POWERED_BY_GEMINI ★ UPLOAD_YOUR_FIT ★ GENERATE_THE_VIBE ★ NO_MORE_BAD_OUTFITS ★ 
              VIRTUAL_STYLIST_AI_V2.0 ★ POWERED_BY_GEMINI ★ UPLOAD_YOUR_FIT ★ GENERATE_THE_VIBE ★ NO_MORE_BAD_OUTFITS ★
           </div>
        </div>
      </header>
      <style>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Main Nav Bar */}
      <div className="bg-white border-b-2 border-black p-4 md:px-8 flex justify-between items-center relative z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl border-2 border-transparent hover:border-black hover:bg-white hover:text-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            VS
          </div>
          <h1 className="font-bold text-2xl tracking-tighter uppercase hidden sm:block">
            Virtual<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">Stylist</span>
          </h1>
        </div>
        <div className="font-mono text-xs border-2 border-black px-3 py-1 bg-white shadow-[3px_3px_0px_0px_#000]">
          BETA_MODE // GEMINI-2.5-FLASH
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        
        {/* Floating Decorative Elements */}
        <StarSticker className="absolute top-10 left-0 w-12 h-12 text-[#ff00ff] animate-pulse hidden lg:block" />
        <StarSticker className="absolute top-40 right-10 w-16 h-16 text-[#ccff00] animate-bounce hidden lg:block" />

        {/* Intro / Upload Section */}
        <section className="mb-16 relative">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-0 md:flex items-stretch min-h-[400px]">
            
            <div className="p-8 md:w-1/2 flex flex-col justify-center relative z-10">
              <div className="inline-block bg-black text-white px-2 py-1 font-mono text-xs w-max mb-4 uppercase">
                Step 01: The Source
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase leading-[0.9]">
                Let's Get<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00cc00] stroke-black" style={{WebkitTextStroke: '2px black'}}>Styled</span>
              </h2>
              <p className="text-black font-mono mb-8 border-l-4 border-[#ff00ff] pl-4">
                Upload one piece. We'll generate a 3D human model rocking it in 3 distinct vibes. No more "I have nothing to wear."
              </p>
              
              <div className="space-y-4">
                <label className="block w-full cursor-pointer group relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <div className={`
                    border-2 border-black border-dashed p-8 text-center transition-all duration-200
                    ${uploadedImage.previewUrl 
                      ? 'bg-[#f0f0f0]' 
                      : 'bg-white hover:bg-[#ccff00]'
                    }
                  `}>
                    {uploadedImage.previewUrl ? (
                      <div className="flex items-center justify-center gap-4">
                        <img 
                          src={uploadedImage.previewUrl} 
                          alt="Uploaded Item" 
                          className="h-24 w-24 object-cover border-2 border-black shadow-[4px_4px_0px_0px_#000]"
                        />
                        <div className="text-left">
                          <p className="font-bold text-black uppercase">Source_Acquired</p>
                          <p className="text-xs font-mono underline decoration-2 decoration-pink-500">Change Source</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                         <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📂</div>
                         <div>
                           <p className="font-bold text-lg uppercase">Drop File Here</p>
                           <p className="text-xs font-mono mt-1 bg-black text-white inline-block px-1">JPG / PNG</p>
                         </div>
                      </div>
                    )}
                  </div>
                </label>

                {uploadedImage.base64 && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={Object.values(outfits).some((o: OutfitResult) => o.status === 'generating')}
                    className="w-full py-4 bg-black text-white font-bold text-xl uppercase border-2 border-black shadow-[4px_4px_0px_0px_#ccff00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#ccff00] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {Object.values(outfits).some((o: OutfitResult) => o.status === 'generating') ? (
                       <>
                        <Loader size="sm" /> 
                        <span>PROCESSING...</span>
                       </>
                    ) : (
                      <>
                        <span>✨ GENERATE LOOKS</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Hero Image / Placeholder */}
            <div className="hidden md:block md:w-1/2 border-l-2 border-black bg-[#ff00ff] relative overflow-hidden group">
               {uploadedImage.previewUrl ? (
                 <>
                   <img 
                      src={uploadedImage.previewUrl} 
                      className="w-full h-full object-cover opacity-50 mix-blend-multiply grayscale contrast-150" 
                      alt="Background"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <img 
                       src={uploadedImage.previewUrl} 
                       className="max-h-[60%] max-w-[60%] object-contain border-2 border-black shadow-[8px_8px_0px_0px_#fff] rotate-3 transition-transform group-hover:rotate-0" 
                       alt="Preview"
                     />
                   </div>
                 </>
               ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-9xl font-black text-black opacity-20 -rotate-12 select-none">
                      DRIP
                    </div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                  </div>
               )}
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section id="results" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-2">
            <h3 className="text-3xl font-black uppercase tracking-tighter transform skew-x-[-10deg] inline-block bg-[#ccff00] px-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              The Rotation
            </h3>
            <span className="font-mono text-xs hidden sm:block">3_VARIANTS_DETECTED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:mt-0">
               <OutfitCard
                style={outfits[OutfitStyle.CASUAL].style}
                imageUrl={outfits[OutfitStyle.CASUAL].imageUrl}
                status={outfits[OutfitStyle.CASUAL].status}
                error={outfits[OutfitStyle.CASUAL].error}
                onEdit={handleEditOutfit}
              />
            </div>
            <div className="md:mt-12">
               {/* Staggered grid effect */}
               <OutfitCard
                style={outfits[OutfitStyle.BUSINESS].style}
                imageUrl={outfits[OutfitStyle.BUSINESS].imageUrl}
                status={outfits[OutfitStyle.BUSINESS].status}
                error={outfits[OutfitStyle.BUSINESS].error}
                onEdit={handleEditOutfit}
              />
            </div>
            <div className="md:mt-24">
              <OutfitCard
                style={outfits[OutfitStyle.NIGHT_OUT].style}
                imageUrl={outfits[OutfitStyle.NIGHT_OUT].imageUrl}
                status={outfits[OutfitStyle.NIGHT_OUT].status}
                error={outfits[OutfitStyle.NIGHT_OUT].error}
                onEdit={handleEditOutfit}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-black text-white mt-24 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4">
             // SYSTEM_STATUS: ONLINE<br/>
             // MODEL: GEMINI-2.5-FLASH-IMAGE
          </p>
          <div className="flex justify-center gap-4 text-2xl">
             <span>👾</span><span>💿</span><span>👟</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;