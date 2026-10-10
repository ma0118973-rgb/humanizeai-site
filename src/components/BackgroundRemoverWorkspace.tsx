
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, Download, RefreshCw, AlertCircle, Image as ImageIcon, 
  CheckCircle2, Clock, Trash2, Sliders, Palette, Eye, ShieldCheck, 
  HelpCircle, ChevronRight, Zap, Layers, Sparkles
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MobileToolHero } from './MobileToolHero';
import { ToolGuideSection } from './ToolGuideSection';

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  progressText: string;
  resultUrl?: string;
  errorMsg?: string;
  bgType: 'transparent' | 'white' | 'color' | 'blur';
  bgColor: string;
}

export function BackgroundRemoverWorkspace({ selectedLanguage = 'en' }: { selectedLanguage?: LanguageCode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalBgType, setGlobalBgType] = useState<'transparent' | 'white' | 'color' | 'blur'>('transparent');
  const [globalBgColor, setGlobalBgColor] = useState<string>('#ffffff');
  
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelProgressText, setModelProgressText] = useState<string>('');
  const [modelError, setModelError] = useState<string | null>(null);
  
  const ortSessionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const tTitle = TRANSLATIONS[selectedLanguage]?.seo?.backgroundRemoverTitle || 'Free AI Background Remover';
  const tDesc = TRANSLATIONS[selectedLanguage]?.seo?.backgroundRemoverDesc || 'Remove image backgrounds directly in your browser with AI. 100% private, full resolution, free transparent PNG downloads.';

  // Load ONNX Runtime & Model
  const initModel = useCallback(async () => {
    if (modelStatus === 'ready' || modelStatus === 'loading') return;
    setModelStatus('loading');
    setModelProgress(5);
    setModelProgressText('Loading ONNX Runtime...');

    try {
      // 1. Load ort.min.js
      if (!(window as any).ort) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/ort/ort.min.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = () => {
            // Fallback to CDN
            const cdnScript = document.createElement('script');
            cdnScript.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort.min.js';
            cdnScript.async = true;
            cdnScript.onload = resolve;
            cdnScript.onerror = () => reject(new Error('Failed to load ONNX Runtime library.'));
            document.head.appendChild(cdnScript);
          };
          document.head.appendChild(script);
        });
      }

      const ort = (window as any).ort;
      if (!ort) throw new Error('ONNX Runtime failed to initialize.');

      ort.env.wasm.wasmPaths = location.origin + '/ort/';
      // Fallback wasm paths if local fails or isn't hosted
      ort.env.wasm.numThreads = 1;

      setModelProgress(30);
      setModelProgressText('Downloading AI Model (U2-Net ~45MB)...');

      // 2. Load Model
      let modelBuffer: ArrayBuffer;
      try {
        const localRes = await fetch(location.origin + '/models/u2netp.onnx');
        if (!localRes.ok) throw new Error('Local model not found');
        
        // Track progress if possible
        const total = Number(localRes.headers.get('content-length')) || 45000000;
        const reader = localRes.body?.getReader();
        if (reader) {
          let received = 0;
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            const pct = 30 + Math.floor((received / total) * 50);
            setModelProgress(Math.min(pct, 80));
            setModelProgressText(`Downloading AI Model... ${Math.round((received / total) * 100)}%`);
          }
          const blob = new Blob(chunks as BlobPart[]);
          modelBuffer = await blob.arrayBuffer();
        } else {
          modelBuffer = await localRes.arrayBuffer();
        }
      } catch (err) {
        // Fallback to HuggingFace
        const hfUrl = 'https://huggingface.co/Xenova/u2netp/resolve/main/onnx/model_quantized.onnx';
        const hfRes = await fetch(hfUrl);
        if (!hfRes.ok) throw new Error('Failed to download AI model from CDN.');
        
        const total = Number(hfRes.headers.get('content-length')) || 45000000;
        const reader = hfRes.body?.getReader();
        if (reader) {
          let received = 0;
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            const pct = 30 + Math.floor((received / total) * 50);
            setModelProgress(Math.min(pct, 80));
            setModelProgressText(`Downloading AI Model (CDN)... ${Math.round((received / total) * 100)}%`);
          }
          const blob = new Blob(chunks as BlobPart[]);
          modelBuffer = await blob.arrayBuffer();
        } else {
          modelBuffer = await hfRes.arrayBuffer();
        }
      }

      setModelProgress(85);
      setModelProgressText('Initializing Inference Session...');

      ortSessionRef.current = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm']
      });

      setModelProgress(100);
      setModelStatus('ready');
    } catch (err: any) {
      console.error(err);
      setModelStatus('error');
      setModelError(err.message || 'Failed to initialize AI background remover model.');
    }
  }, [modelStatus]);

  // Handle File Additions
  const handleFilesAdded = (files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
        progressText: 'Queued',
        bgType: globalBgType,
        bgColor: globalBgColor
      }));

    if (newItems.length === 0) return;

    setQueue(prev => {
      const updated = [...prev, ...newItems];
      if (!selectedId && updated.length > 0) {
        setSelectedId(updated[0].id);
      }
      return updated;
    });

    if (modelStatus !== 'ready') {
      initModel();
    }
  };

  // Process Queue Effect
  useEffect(() => {
    if (modelStatus !== 'ready') return;

    const pendingItem = queue.find(item => item.status === 'pending');
    if (pendingItem) {
      processItem(pendingItem.id);
    }
  }, [queue, modelStatus]);

  // Process Single Image with U2-Net
  const processItem = async (itemId: string) => {
    setQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: 'processing', progress: 10, progressText: 'Preparing image...' } : item));

    const item = queue.find(i => i.id === itemId);
    if (!item) return;

    try {
      const ort = (window as any).ort;
      if (!ort || !ortSessionRef.current) throw new Error('AI Model not ready.');

      updateItemProgress(itemId, 30, 'Resizing for AI (320x320)...');

      // 1. Load Image & Preprocess to 320x320 tensor
      const img = await loadImage(item.previewUrl);
      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');
      
      ctx.drawImage(img, 0, 0, 320, 320);
      const imgData = ctx.getImageData(0, 0, 320, 320);
      const pixels = imgData.data;

      // U2-Net normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
      const red = new Float32Array(320 * 320);
      const green = new Float32Array(320 * 320);
      const blue = new Float32Array(320 * 320);

      for (let i = 0; i < pixels.length / 4; i++) {
        const r = pixels[i * 4] / 255;
        const g = pixels[i * 4 + 1] / 255;
        const b = pixels[i * 4 + 2] / 255;

        red[i] = (r - 0.485) / 0.229;
        green[i] = (g - 0.456) / 0.224;
        blue[i] = (b - 0.406) / 0.225;
      }

      const inputTensor = new ort.Tensor('float32', Float32Array.from([...red, ...green, ...blue]), [1, 3, 320, 320]);

      updateItemProgress(itemId, 60, 'Running AI inference...');

      // 2. Run Inference
      const feeds = { [ortSessionRef.current.inputNames[0]]: inputTensor };
      const results = await ortSessionRef.current.run(feeds);
      const outputKey = ortSessionRef.current.outputNames[0];
      const outputTensor = results[outputKey];
      const outputData = outputTensor.data as Float32Array;

      updateItemProgress(itemId, 85, 'Generating transparent mask...');

      // 3. Post-process mask & apply to original image
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = 320;
      maskCanvas.height = 320;
      const maskCtx = maskCanvas.getContext('2d');
      const maskImgData = maskCtx!.createImageData(320, 320);

      // Find min/max for normalization of output mask
      let min = outputData[0];
      let max = outputData[0];
      for (let i = 1; i < outputData.length; i++) {
        if (outputData[i] < min) min = outputData[i];
        if (outputData[i] > max) max = outputData[i];
      }
      const range = max - min || 1;

      for (let i = 0; i < outputData.length; i++) {
        const norm = (outputData[i] - min) / range;
        const alphaVal = Math.floor(norm * 255);
        maskImgData.data[i * 4] = alphaVal;
        maskImgData.data[i * 4 + 1] = alphaVal;
        maskImgData.data[i * 4 + 2] = alphaVal;
        maskImgData.data[i * 4 + 3] = alphaVal;
      }
      maskCtx!.putImageData(maskImgData, 0, 0);

      // 4. Draw final composited image at full resolution
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = originalWidth;
      finalCanvas.height = originalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Final canvas context failed');

      // Apply Background
      if (item.bgType === 'white') {
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, originalWidth, originalHeight);
      } else if (item.bgType === 'color') {
        finalCtx.fillStyle = item.bgColor;
        finalCtx.fillRect(0, 0, originalWidth, originalHeight);
      } else if (item.bgType === 'blur') {
        finalCtx.filter = 'blur(20px)';
        finalCtx.drawImage(img, 0, 0, originalWidth, originalHeight);
        finalCtx.filter = 'none';
      }

      // Draw original image scaled
      const tempImgCanvas = document.createElement('canvas');
      tempImgCanvas.width = originalWidth;
      tempImgCanvas.height = originalHeight;
      const tempCtx = tempImgCanvas.getContext('2d');
      tempCtx!.drawImage(img, 0, 0, originalWidth, originalHeight);

      // Apply mask as globalCompositeOperation destination-in
      tempCtx!.globalCompositeOperation = 'destination-in';
      tempCtx!.drawImage(maskCanvas, 0, 0, originalWidth, originalHeight);

      finalCtx.drawImage(tempImgCanvas, 0, 0);

      finalCanvas.toBlob(blob => {
        if (!blob) throw new Error('Blob creation failed');
        const resultUrl = URL.createObjectURL(blob);
        setQueue(prev => prev.map(i => i.id === itemId ? {
          ...i,
          status: 'success',
          progress: 100,
          progressText: 'Completed',
          resultUrl
        } : i));
      }, 'image/png');

    } catch (err: any) {
      console.error(err);
      setQueue(prev => prev.map(i => i.id === itemId ? {
        ...i,
        status: 'error',
        progressText: 'Failed',
        errorMsg: err.message || 'Processing failed'
      } : i));
    }
  };

  const updateItemProgress = (id: string, progress: number, progressText: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, progress, progressText } : item));
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // Download ZIP
  const handleDownloadAll = async () => {
    const successItems = queue.filter(i => i.status === 'success' && i.resultUrl);
    if (successItems.length === 0) return;

    if (successItems.length === 1) {
      const a = document.createElement('a');
      a.href = successItems[0].resultUrl!;
      a.download = `removed-bg-${successItems[0].file.name.replace(/\.[^/.]+$/, '')}.png`;
      a.click();
      return;
    }

    // Load JSZip from CDN if needed
    let JSZip = (window as any).JSZip;
    if (!JSZip) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      JSZip = (window as any).JSZip;
    }

    const zip = new JSZip();
    const folder = zip.folder('toolvena-background-removed');

    for (const item of successItems) {
      const res = await fetch(item.resultUrl!);
      const blob = await res.blob();
      const filename = `removed-bg-${item.file.name.replace(/\.[^/.]+$/, '')}.png`;
      folder?.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolvena-background-remover.zip';
    a.click();
  };

  const removeItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQueue(prev => {
      const updated = prev.filter(i => i.id !== id);
      if (selectedId === id) {
        setSelectedId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const retryItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', progress: 0, progressText: 'Retrying...', errorMsg: undefined } : i));
  };

  const selectedItem = queue.find(i => i.id === selectedId);

  // Update background settings for selected item or globally
  const handleBgChange = (bgType: 'transparent' | 'white' | 'color' | 'blur', bgColor?: string) => {
    if (selectedId) {
      setQueue(prev => prev.map(i => i.id === selectedId ? {
        ...i,
        bgType,
        bgColor: bgColor || i.bgColor,
        status: 'pending', // re-trigger process
        progress: 0,
        progressText: 'Re-processing background...'
      } : i));
    }
    if (bgType) setGlobalBgType(bgType);
    if (bgColor) setGlobalBgColor(bgColor);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <MobileToolHero toolId="backgroundRemover" selectedLanguage={selectedLanguage} />

      {/* Main Workspace Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Model Loading / Error Banner */}
        {modelStatus === 'loading' && (
          <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center justify-between text-indigo-900">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <div>
                <p className="font-semibold text-sm">{modelProgressText}</p>
                <div className="w-48 bg-indigo-200 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${modelProgress}%` }} />
                </div>
              </div>
            </div>
            <span className="text-xs font-medium bg-indigo-200 px-2.5 py-1 rounded-full">{modelProgress}%</span>
          </div>
        )}

        {modelStatus === 'error' && (
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between text-rose-900">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <p className="text-sm"><strong>Model Error:</strong> {modelError}</p>
            </div>
            <button 
              onClick={() => { setModelStatus('idle'); initModel(); }}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload Area / DropZone */}
        <div 
          ref={dropZoneRef}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 transition-all cursor-pointer p-8 text-center m-6 rounded-xl flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Upload images to remove background</h3>
            <p className="text-sm text-slate-500 mt-1">Drag & drop images here, or <span className="text-indigo-600 font-semibold underline">browse files</span></p>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" /> 100% Private (Browser AI)</span>
            <span className="flex items-center"><Zap className="w-4 h-4 mr-1 text-amber-500" /> Full Resolution PNG</span>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={e => e.target.files && handleFilesAdded(e.target.files)}
          />
        </div>

        {/* Queue & Workspace Editor (if queue not empty) */}
        {queue.length > 0 && (
          <div className="border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 bg-slate-50/50">
            
            {/* Queue Sidebar */}
            <div className="p-4 border-r border-slate-100 space-y-3 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queue ({queue.length})</span>
                <button 
                  onClick={() => setQueue([])}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {queue.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${selectedId === item.id ? 'bg-white border-indigo-500 shadow-sm' : 'bg-white/60 border-slate-200 hover:bg-white'}`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img src={item.previewUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.file.name}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {item.status === 'success' && <span className="text-[10px] text-emerald-600 font-medium flex items-center"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Ready</span>}
                          {item.status === 'processing' && <span className="text-[10px] text-indigo-600 font-medium flex items-center"><RefreshCw className="w-3 h-3 mr-0.5 animate-spin" /> {item.progress}%</span>}
                          {item.status === 'pending' && <span className="text-[10px] text-amber-600 font-medium flex items-center"><Clock className="w-3 h-3 mr-0.5" /> Queued</span>}
                          {item.status === 'error' && <span className="text-[10px] text-rose-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-0.5" /> Failed</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {item.status === 'error' && (
                        <button onClick={e => retryItem(item.id, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                      )}
                      <button onClick={e => removeItem(item.id, e)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleDownloadAll}
                disabled={!queue.some(i => i.status === 'success')}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All as ZIP</span>
              </button>
            </div>

            {/* Main Preview & Editor Area */}
            <div className="lg:col-span-2 p-6 flex flex-col justify-between">
              {selectedItem ? (
                <div className="space-y-6">
                  
                  {/* Preview Canvas / Result Box */}
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center min-h-[320px] max-h-[420px] checkerboard-bg">
                    {selectedItem.status === 'success' && selectedItem.resultUrl ? (
                      <img src={selectedItem.resultUrl} alt="Background Removed" className="max-h-[400px] object-contain shadow-2xl" />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <img src={selectedItem.previewUrl} alt="Original" className="max-h-[220px] object-contain mx-auto opacity-40 rounded-lg" />
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                          <p className="font-semibold text-sm">{selectedItem.progressText}</p>
                          <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${selectedItem.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Customization Controls */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                      <Palette className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Background Options
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => handleBgChange('transparent')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${selectedItem.bgType === 'transparent' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Transparent
                      </button>
                      <button 
                        onClick={() => handleBgChange('white')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${selectedItem.bgType === 'white' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Pure White
                      </button>
                      <button 
                        onClick={() => handleBgChange('blur')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${selectedItem.bgType === 'blur' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Blur Bg
                      </button>
                      <div className="relative flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 px-2 py-1">
                        <input 
                          type="color" 
                          value={selectedItem.bgColor || '#ffffff'}
                          onChange={e => handleBgChange('color', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-bold text-slate-600 ml-1.5">Color</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end space-x-3">
                    {selectedItem.status === 'success' && selectedItem.resultUrl && (
                      <a 
                        href={selectedItem.resultUrl}
                        download={`removed-bg-${selectedItem.file.name.replace(/\.[^/.]+$/, '')}.png`}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download High-Res PNG</span>
                      </a>
                    )}
                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 py-16">
                  <p>Select an image from the queue to preview & edit.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Informational Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800">100% Private & Secure</h4>
          <p className="text-sm text-slate-500">Your images are processed entirely inside your browser using WebAssembly and ONNX Runtime. They never leave your device.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800">Instant AI Edge Cutting</h4>
          <p className="text-sm text-slate-500">Powered by advanced U2-Net deep learning models optimized for crisp hair strands, object boundaries, and transparent PNGs.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800">Batch Processing & ZIP</h4>
          <p className="text-sm text-slate-500">Upload multiple photos simultaneously, customize backgrounds individually, and download all results instantly in a single ZIP file.</p>
        </div>
      </div>

      {/* Tool Guide Section */}
      <ToolGuideSection toolId="backgroundRemover" selectedLanguage={selectedLanguage} />

      <style>{`
        .checkerboard-bg {
          background-image: linear-gradient(45deg, #1e293b 25%, transparent 25%), 
                            linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #1e293b 75%), 
                            linear-gradient(-45deg, transparent 75%, #1e293b 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}

