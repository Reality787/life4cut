import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ResultView } from './components/ResultView';
import { AppState, PhotoFrame, IdolInfo } from './types';
import { identifyIdol } from './services/geminiService';

const TOTAL_FRAMES = 4;

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  // Initialize with 4 empty slots
  const [idolImages, setIdolImages] = useState<(string | null)[]>([null, null, null, null]);
  const [userImages, setUserImages] = useState<string[]>([]);
  const [idolInfo, setIdolInfo] = useState<IdolInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSingleUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
            setIdolImages(prev => {
                const newImages = [...prev];
                newImages[index] = result;
                return newImages;
            });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const startPhotobooth = async () => {
    // Ensure all images are present
    if (idolImages.some(img => !img)) return;

    setAppState(AppState.PROCESSING);
    
    try {
        // Identify using the first image
        const firstImage = idolImages[0] as string;
        const info = await identifyIdol(firstImage);
        setIdolInfo(info);
    } catch (err) {
        console.error("Identity failed", err);
    }
    
    setAppState(AppState.CAPTURE);
  };

  const handleUserCapture = useCallback((imageSrc: string) => {
    setUserImages(prev => [...prev, imageSrc]);
    
    if (currentStep < TOTAL_FRAMES - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setAppState(AppState.RESULT);
    }
  }, [currentStep]);

  const resetApp = () => {
    setAppState(AppState.SETUP);
    setIdolImages([null, null, null, null]);
    setUserImages([]);
    setIdolInfo(null);
    setCurrentStep(0);
  };

  // Combine images into frame objects
  // We cast idolImages to string[] because we only proceed if all are filled
  const frames: PhotoFrame[] = (idolImages as string[]).map((img, idx) => ({
      id: idx,
      idolImage: img,
      userImage: userImages[idx] || null
  }));

  const allImagesUploaded = idolImages.every(img => img !== null);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center font-sans">
      <Header />
      
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4">
        
        {appState === AppState.SETUP && (
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl text-center max-w-4xl w-full border border-pink-100">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Idol 4-Cut</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">Upload 4 different photos of your idol (or 1 photo 4 times). We will analyze them and help you match the poses!</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {idolImages.map((img, idx) => (
                    <label key={idx} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 hover:bg-pink-100 transition cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group">
                        {img ? (
                            <>
                                <img src={img} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <span className="text-white text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Change</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center font-bold mb-2">{idx + 1}</span>
                                <span className="text-xs text-pink-400 font-medium uppercase tracking-wide">Upload</span>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleSingleUpload(idx, e)} className="hidden" />
                    </label>
                ))}
            </div>

            <button 
                onClick={startPhotobooth}
                disabled={!allImagesUploaded}
                className={`w-full max-w-md mx-auto font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 ${
                    allImagesUploaded 
                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200 hover:-translate-y-1' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <span>Start Photobooth</span>
              {allImagesUploaded && (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                 </svg>
              )}
            </button>
          </div>
        )}

        {appState === AppState.PROCESSING && (
           <div className="text-center animate-pulse">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-xl font-bold text-gray-700">Analyzing Star Power...</h2>
           </div>
        )}

        {appState === AppState.CAPTURE && (
          <CameraView 
            onCapture={handleUserCapture} 
            currentStep={currentStep + 1} 
            totalSteps={TOTAL_FRAMES}
            idolImage={idolImages[currentStep] as string}
          />
        )}

        {appState === AppState.RESULT && (
          <ResultView 
            frames={frames} 
            idolInfo={idolInfo} 
            onReset={resetApp} 
          />
        )}

      </main>
      
      {appState === AppState.CAPTURE && (
          <div className="pb-8 text-gray-400 text-sm">
             Mimic the pose on the left!
          </div>
      )}
    </div>
  );
}