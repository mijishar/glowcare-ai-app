import { useState, useRef, DragEvent, useEffect, useCallback } from 'react'
import { Camera, Upload, X, Scan, Sun, Moon, Leaf, ShoppingBag, CheckCircle, XCircle, AlertTriangle, Sparkles, Activity, Video, VideoOff, FlipHorizontal } from 'lucide-react'
import { analyzeSkin } from '../services/api'
import type { SkinAnalysisResult, SeverityLevel } from '../types'
import SkinTypeTag from '../components/SkinTypeTag'
import DermatologistAlert from '../components/DermatologistAlert'
import { useSkinScoreHistory } from '../hooks/useSkinScoreHistory'
import { useGamification } from '../hooks/useGamification'

// ─── Severity bar ─────────────────────────────────────────────────────────────
const severityConfig: Record<SeverityLevel, { label: string; color: string; bar: string; width: string }> = {
  none:   { label: 'None',   color: 'text-teal-500',  bar: 'bg-teal-300',  width: 'w-0' },
  low:    { label: 'Low',    color: 'text-green-600', bar: 'bg-green-400', width: 'w-1/4' },
  medium: { label: 'Medium', color: 'text-amber-500', bar: 'bg-amber-400', width: 'w-2/4' },
  high:   { label: 'High',   color: 'text-red-500',   bar: 'bg-red-400',   width: 'w-3/4' },
}

function SeverityRow({ label, value }: { label: string; value: SeverityLevel }) {
  const c = severityConfig[value]
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-teal-800">{label}</span>
        <span className={`font-bold text-xs ${c.color}`}>{c.label}</span>
      </div>
      <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${c.bar} ${c.width}`} />
      </div>
    </div>
  )
}

// ─── Health score ring ────────────────────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
  const color = score >= 75 ? '#14b8a6' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 38, circ = 2 * Math.PI * r, dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r={r} fill="none" stroke="#ccfbf1" strokeWidth="9" />
          <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-teal-700">{score}</span>
          <span className="text-xs text-teal-400 font-semibold">/100</span>
        </div>
      </div>
      <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Skin Score</p>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold text-teal-700">
        <span className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Item({ text, variant = 'default' }: { text: string; variant?: 'do' | 'dont' | 'default' }) {
  const s = {
    do:      { wrap: 'bg-teal-50 border-teal-200 text-teal-900',  icon: <CheckCircle size={12} className="text-teal-500 flex-shrink-0 mt-0.5" /> },
    dont:    { wrap: 'bg-red-50 border-red-200 text-red-800',      icon: <XCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" /> },
    default: { wrap: 'bg-cyan-50 border-cyan-100 text-teal-800',   icon: <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" /> },
  }[variant]
  return (
    <li className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${s.wrap}`}>
      {s.icon}<span>{text}</span>
    </li>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
type UploadMode = 'idle' | 'camera'

export default function PhotoAnalysis() {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { addScore } = useSkinScoreHistory()
  const { unlockBadge, addXp } = useGamification()
  const [mode, setMode] = useState<UploadMode>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Start camera
  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraError(null)
    } catch {
      setCameraError('Camera access denied. Please allow camera permission and try again.')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mode === 'camera') {
      startCamera(facingMode)
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [mode, facingMode, startCamera, stopCamera])

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const f = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setMode('idle')
      stopCamera()
      setSizeError(null)
      setResult(null)
      setAnalysisError(null)
    }, 'image/jpeg', 0.9)
  }

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
  }

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setSizeError('Only image files are supported.'); return }
    if (f.size > 5 * 1024 * 1024) {
      setSizeError(`Image too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Please reduce to under 5MB.`)
      return
    }
    setSizeError(null); setResult(null); setAnalysisError(null)
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }

  const clear = () => {
    setFile(null); setPreview(null); setSizeError(null)
    setResult(null); setAnalysisError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAnalyze = async () => {
    if (!file) return
    setIsLoading(true); setAnalysisError(null); setResult(null)
    try {
      const data = await analyzeSkin(file)
      if (data.healthScore === 0 && !data.skinType) {
        setAnalysisError(data.skinSummary || "⚠️ We couldn't analyze your image clearly.")
      } else {
        addScore(data.healthScore, data.skinType)
        unlockBadge('first_scan')
        if (data.healthScore >= 70) unlockBadge('score_70')
        if (data.healthScore >= 85) unlockBadge('score_85')
        addXp(15)
        setResult(data)
      }
    } catch {
      setAnalysisError("couldn't_analyze")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-500 to-cyan-400 text-white pt-10 pb-16 px-4 text-center">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-300/10 translate-x-1/3 translate-y-1/3 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 space-y-3 max-w-sm mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-bounce-soft border border-white/30">
              <Camera size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Skin Scanner 📸</h1>
          <p className="text-teal-100 text-sm">Upload or take a live photo for a full personalized skin analysis</p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {['Skin Type', 'Acne', 'Pigmentation', 'Dark Circles', 'Skin Score'].map(f => (
              <span key={f} className="bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">✦ {f}</span>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-xl px-4 -mt-6 pb-10 space-y-5">

        {/* Upload card */}
        <div className="glass rounded-3xl border border-teal-100 shadow-xl p-6 space-y-4 teal-glow animate-slide-up">

          {/* Mode toggle */}
          {!preview && (
            <div className="flex gap-2 p-1 bg-teal-50 rounded-2xl border border-teal-100">
              <button
                onClick={() => setMode('idle')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'idle' ? 'bg-white text-teal-700 shadow-sm' : 'text-teal-500 hover:text-teal-700'}`}
              >
                <Upload size={14} /> Upload Photo
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'camera' ? 'bg-white text-teal-700 shadow-sm' : 'text-teal-500 hover:text-teal-700'}`}
              >
                <Video size={14} /> Live Camera
              </button>
            </div>
          )}

          {/* Camera view */}
          {mode === 'camera' && !preview && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
                  <AlertTriangle size={20} className="mx-auto mb-2 text-red-400" />
                  {cameraError}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-teal-300 shadow-md bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-72 object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />
                  {/* Camera overlay guides */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-56 rounded-full border-2 border-white/40 border-dashed" />
                  </div>
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white/70 text-xs">Position your face in the circle</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  disabled={!!cameraError}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold py-3 transition-all shadow-md teal-glow active:scale-95"
                >
                  <Camera size={16} /> Take Photo
                </button>
                <button
                  onClick={flipCamera}
                  className="w-12 h-12 rounded-2xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center transition-colors"
                  title="Flip camera"
                >
                  <FlipHorizontal size={18} className="text-teal-600" />
                </button>
                <button
                  onClick={() => setMode('idle')}
                  className="w-12 h-12 rounded-2xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                  title="Stop camera"
                >
                  <VideoOff size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          )}

          {/* Upload drop zone */}
          {mode === 'idle' && !preview && !sizeError && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center transition-all duration-200 ${
                dragging ? 'border-teal-400 bg-teal-50 scale-[1.01]' : 'border-teal-200 hover:border-teal-400 hover:bg-teal-50/50'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center animate-bounce-soft">
                <Upload size={24} className="text-teal-500" />
              </div>
              <div>
                <p className="text-base font-bold text-teal-700">Upload a clear face photo</p>
                <p className="text-sm text-teal-500 mt-0.5">to get AI skincare advice</p>
                <p className="text-xs text-teal-400 mt-1">JPEG, PNG, WebP — max 5MB</p>
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          )}

          {/* Size error */}
          {sizeError && !preview && (
            <div onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-red-300 bg-red-50 p-8 flex flex-col items-center gap-3 text-center">
              <AlertTriangle size={28} className="text-red-400" />
              <p className="text-sm font-semibold text-red-600">{sizeError}</p>
              <p className="text-xs text-red-400">Click to choose a different image</p>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          )}

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 shadow-md animate-pop">
              <img src={preview} alt="Skin preview" className="w-full max-h-72 object-cover" />
              <button onClick={clear}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                aria-label="Remove photo">
                <X size={15} className="text-white" />
              </button>
              {isLoading && (
                <div className="absolute inset-0 bg-teal-900/50 flex flex-col items-center justify-center gap-3">
                  <div className="w-full h-0.5 bg-teal-400/80 animate-scan" />
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm font-bold">🔍 Analyzing your skin... Please wait</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analyze button */}
          <button
            type="button"
            onClick={file ? handleAnalyze : () => inputRef.current?.click()}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl font-bold py-3.5 text-base transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 active:scale-[0.98] ${
              isLoading ? 'bg-teal-200 text-teal-500 cursor-not-allowed'
              : file ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover:shadow-lg teal-glow'
              : 'bg-teal-100 text-teal-500 hover:bg-teal-200'
            }`}
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-teal-400 border-t-teal-600 rounded-full animate-spin" /> Analyzing...</>
            ) : file ? (
              <><Scan size={17} /> Analyze My Skin</>
            ) : (
              <><Upload size={17} /> Upload a Photo</>
            )}
          </button>

          {!file && !preview && !sizeError && mode === 'idle' && (
            <p className="text-center text-xs text-teal-400">⚠️ Please upload a photo to analyze your skin</p>
          )}
        </div>

        {/* Analysis error */}
        {analysisError && !isLoading && (
          <div className="animate-slide-up glass rounded-3xl border border-amber-200 px-5 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={17} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-2">Couldn't Analyze Your Image</p>
                <p className="text-sm text-amber-700 mb-2">We couldn't analyze your image clearly. Try this:</p>
                <ul className="space-y-1">
                  {['Use good lighting', 'Face the camera directly', 'Avoid filters', 'Upload a high-quality image'].map(t => (
                    <li key={t} className="flex items-center gap-1.5 text-sm text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && result.healthScore > 0 && (
          <div className="animate-pop glass rounded-3xl border border-teal-100 shadow-xl p-5 space-y-6 teal-glow-lg">
            <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 px-4 py-3">
              <Sparkles size={16} className="text-teal-500" />
              <p className="text-sm font-bold text-teal-700">✨ Analysis Complete! Here's your personalized skincare plan</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <HealthRing score={result.healthScore} />
              <div className="flex-1 w-full space-y-2.5">
                {result.skinType && <SkinTypeTag skinType={result.skinType} />}
                <SeverityRow label="Acne Level" value={result.acne} />
                <SeverityRow label="Pigmentation" value={result.pigmentation} />
                <SeverityRow label="Dark Circles" value={result.darkCircles} />
              </div>
            </div>

            {result.skinSummary && (
              <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3">
                <p className="text-sm text-teal-800 leading-relaxed">{result.skinSummary}</p>
              </div>
            )}

            <DermatologistAlert show={result.dermatologistFlag} />

            {result.routine && (result.routine.morning.length > 0 || result.routine.night.length > 0) && (
              <Section icon={<Sun size={13} className="text-amber-500" />} title="Daily Skincare Routine">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.routine.morning.length > 0 && (
                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-1.5">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1"><Sun size={10} /> Morning</p>
                      <ul className="space-y-1.5">{result.routine.morning.map((s, i) => <Item key={i} text={s} />)}</ul>
                    </div>
                  )}
                  {result.routine.night.length > 0 && (
                    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 space-y-1.5">
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide flex items-center gap-1"><Moon size={10} /> Night</p>
                      <ul className="space-y-1.5">{result.routine.night.map((s, i) => <Item key={i} text={s} />)}</ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {((result.dos?.length ?? 0) > 0 || (result.donts?.length ?? 0) > 0) && (
              <Section icon={<CheckCircle size={13} className="text-teal-500" />} title="Do's and Don'ts">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result.dos?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1.5">✅ Do's</p>
                      <ul className="space-y-1.5">{result.dos!.map((d, i) => <Item key={i} text={d} variant="do" />)}</ul>
                    </div>
                  )}
                  {(result.donts?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5">❌ Don'ts</p>
                      <ul className="space-y-1.5">{result.donts!.map((d, i) => <Item key={i} text={d} variant="dont" />)}</ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {(result.naturalRemedies?.length ?? 0) > 0 && (
              <Section icon={<Leaf size={13} className="text-teal-500" />} title="Natural Remedies">
                <ul className="space-y-1.5">{result.naturalRemedies!.map((r, i) => <Item key={i} text={r} />)}</ul>
              </Section>
            )}

            {(result.productSuggestions?.length ?? 0) > 0 && (
              <Section icon={<ShoppingBag size={13} className="text-teal-500" />} title="Product Suggestions">
                <ul className="space-y-1.5">{result.productSuggestions!.map((p, i) => <Item key={i} text={p} />)}</ul>
              </Section>
            )}

            {/* Detailed product recommendations */}
            {(result.productRecommendations?.length ?? 0) > 0 && (
              <Section icon={<ShoppingBag size={13} className="text-teal-500" />} title="Recommended Products">
                <div className="space-y-3">
                  {result.productRecommendations!.map((prod, i) => (
                    <div key={i} className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 space-y-2 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm font-bold text-teal-800">{prod.name}</p>
                      </div>
                      {prod.keyIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-8">
                          {prod.keyIngredients.map((ing, j) => (
                            <span key={j} className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full border border-teal-200">{ing}</span>
                          ))}
                        </div>
                      )}
                      <div className="pl-8 space-y-1.5">
                        <p className="text-xs text-teal-700"><span className="font-semibold">Why:</span> {prod.whySuitable}</p>
                        <p className="text-xs text-teal-600"><span className="font-semibold">How to use:</span> {prod.howToUse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <p className="flex items-start gap-1.5 text-xs text-teal-400 border-t border-teal-50 pt-3">
              <Activity size={11} className="flex-shrink-0 mt-0.5" />
              AI-based analysis for informational purposes only. Consult a dermatologist for medical advice.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
