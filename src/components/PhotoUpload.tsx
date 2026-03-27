import { useRef, useState, DragEvent } from 'react'
import { Camera, Upload, X, Scan, AlertCircle } from 'lucide-react'

interface Props {
  onAnalyze: (file: File) => void
  isLoading: boolean
}

export default function PhotoUpload({ onAnalyze, isLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Only image files are supported (JPEG, PNG, WebP).')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(`Image is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Please reduce the size to under 5MB and try again.`)
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const clear = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-teal-700 font-bold text-base">
        <Camera size={16} className="text-teal-500" />
        Analyze Your Skin with a Photo
      </label>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center gap-3 text-center ${
            dragging
              ? 'border-teal-400 bg-teal-50 scale-[1.01]'
              : error
              ? 'border-red-300 bg-red-50/50'
              : 'border-teal-200 hover:border-teal-400 hover:bg-teal-50/50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center animate-bounce-soft">
            <Upload size={22} className="text-teal-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-700">Drop your photo here or click to upload</p>
            <p className="text-xs text-teal-400 mt-0.5">JPEG, PNG, WebP — max 5MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 shadow-md animate-pop">
          <img src={preview} alt="Skin preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            aria-label="Remove photo"
          >
            <X size={14} className="text-white" />
          </button>
          {isLoading && (
            <div className="absolute inset-0 bg-teal-900/40 flex flex-col items-center justify-center gap-2">
              <div className="w-full h-0.5 bg-teal-400/80 animate-scan" />
              <p className="text-white text-sm font-bold">Scanning skin...</p>
            </div>
          )}
        </div>
      )}

      {/* Size/type error */}
      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 animate-slide-up">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {file && !isLoading && (
        <button
          type="button"
          onClick={() => onAnalyze(file)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3.5 text-base transition-all duration-200 shadow-md hover:shadow-lg teal-glow focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 active:scale-[0.98] animate-slide-up"
        >
          <Scan size={17} />
          Analyze My Skin
        </button>
      )}

      {isLoading && (
        <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-100 text-teal-600 font-bold py-3.5 text-base">
          <div className="w-4 h-4 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
          Analyzing with AI...
        </div>
      )}
    </div>
  )
}
