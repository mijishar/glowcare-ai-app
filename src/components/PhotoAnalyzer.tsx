import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Sparkles, AlertCircle } from 'lucide-react'
import { analyzeSkin } from '../services/api'
import type { SkinAnalysisResult } from '../types'
import SkinAnalysisCard from './SkinAnalysisCard'

const ACCEPTED = 'image/jpeg,image/png,image/webp'

export default function PhotoAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeSkin(file)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center gap-4 text-center ${
            dragOver
              ? 'border-teal-400 bg-teal-50 scale-[1.01]'
              : 'border-teal-200 bg-white/50 hover:border-teal-400 hover:bg-teal-50/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center animate-float">
            <Camera size={28} className="text-teal-500" />
          </div>
          <div>
            <p className="font-bold text-teal-700 text-base">Upload your photo</p>
            <p className="text-sm text-teal-400 mt-1">Drag & drop or click to browse</p>
            <p className="text-xs text-teal-300 mt-0.5">JPEG, PNG, WebP · Max 5MB</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95">
            <Upload size={14} /> Choose Photo
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="animate-pop space-y-4">
          {/* Preview */}
          <div className="relative rounded-3xl overflow-hidden border border-teal-100 shadow-lg">
            <img src={preview} alt="Uploaded face" className="w-full max-h-72 object-cover" />
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all"
              aria-label="Remove photo"
            >
              <X size={14} className="text-white" />
            </button>
            {/* Overlay badge */}
            <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Camera size={12} className="text-teal-300" />
              <span className="text-xs text-white font-medium">{file?.name}</span>
            </div>
          </div>

          {/* Analyze button */}
          {!result && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3.5 text-base transition-all shadow-md hover:shadow-lg teal-glow focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 active:scale-[0.98]"
            >
              <Sparkles size={16} /> Analyze My Skin
            </button>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="animate-fade-in glass rounded-3xl border border-teal-100 shadow-md px-6 py-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <div className="w-10 h-10 rounded-full border-4 border-cyan-100 border-b-cyan-400 animate-spin absolute top-3 left-3" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={16} className="text-teal-500 animate-pulse-soft" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-teal-700 font-bold text-sm">Analyzing your skin...</p>
            <p className="text-teal-400 text-xs mt-1">Detecting skin type, acne, pigmentation & more</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isAnalyzing && (
        <div role="alert" className="animate-slide-up glass rounded-3xl border border-red-200 px-5 py-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !isAnalyzing && <SkinAnalysisCard result={result} />}
    </div>
  )
}
