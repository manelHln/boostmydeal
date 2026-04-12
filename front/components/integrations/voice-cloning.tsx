"use client"

import { useState, useRef } from "react"
import { Upload, Mic, Play, Pause, Trash2, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"

interface VoiceCloningProps {
  integrationId: string
}

interface AudioFile {
  id: string
  name: string
  size: number
  duration?: number
  file: File
}

export function VoiceCloning({ integrationId }: VoiceCloningProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [cloningStatus, setCloningStatus] = useState<"idle" | "success" | "error">("idle")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAudioFiles: AudioFile[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("audio/")) {
        const audioFile: AudioFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          file,
        }
        
        // Get duration
        const audio = new Audio(URL.createObjectURL(file))
        audio.onloadedmetadata = () => {
          audioFile.duration = audio.duration
          setAudioFiles(prev => prev.map(f => f.id === audioFile.id ? { ...f, duration: audio.duration } : f))
        }
        
        newAudioFiles.push(audioFile)
      }
    })

    setAudioFiles(prev => [...prev, ...newAudioFiles])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setAudioFiles(prev => prev.filter(f => f.id !== id))
  }

  const togglePlay = (audioFile: AudioFile) => {
    if (playingId === audioFile.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(audioFile.file)
        audioRef.current.play()
        setPlayingId(audioFile.id)
        
        audioRef.current.onended = () => {
          setPlayingId(null)
        }
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleCloneVoice = async () => {
    if (audioFiles.length === 0) return
    
    setIsCloning(true)
    setUploadProgress(0)
    setCloningStatus("idle")
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload first audio file for cloning
      await api.cloneVoice({
        name: audioFiles[0].name.replace(/\.[^/.]+$/, ""),
        audioFile: audioFiles[0].file,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setCloningStatus("success")
      
      // Reset after success
      setTimeout(() => {
        setAudioFiles([])
        setUploadProgress(0)
        setCloningStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Voice cloning failed:", error)
      setCloningStatus("error")
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <div className="space-y-3">
      <audio ref={audioRef} className="hidden" />
      
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">
          Click to upload audio files
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          MP3, WAV, M4A up to 25MB each
        </p>
      </div>

      {/* Uploaded Files */}
      {audioFiles.length > 0 && (
        <div className="space-y-2">
          {audioFiles.map((audioFile) => (
            <div 
              key={audioFile.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-xs"
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => togglePlay(audioFile)}
              >
                {playingId === audioFile.id ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{audioFile.name}</p>
                <p className="text-muted-foreground">
                  {formatFileSize(audioFile.size)} • {formatDuration(audioFile.duration)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => removeFile(audioFile.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isCloning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {uploadProgress < 100 ? "Uploading..." : "Processing..."}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}

      {/* Status Messages */}
      {cloningStatus === "success" && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Voice cloned successfully!
        </div>
      )}
      
      {cloningStatus === "error" && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4" />
          Failed to clone voice. Please try again.
        </div>
      )}

      {/* Clone Button */}
      {audioFiles.length > 0 && !isCloning && cloningStatus !== "success" && (
        <Button 
          size="sm" 
          className="w-full"
          onClick={handleCloneVoice}
        >
          <Mic className="mr-2 h-3 w-3" />
          Clone Voice
        </Button>
      )}
    </div>
  )
}
