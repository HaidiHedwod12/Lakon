"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

interface FullscreenButtonProps {
  targetRef: React.RefObject<HTMLElement>
  className?: string
}

export function FullscreenButton({ targetRef, className }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!targetRef.current) return

    try {
      if (!isFullscreen) {
        await targetRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  return (
    <Button
      onClick={toggleFullscreen}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
      title={isFullscreen ? "Keluar dari Fullscreen" : "Masuk ke Fullscreen"}
    >
      {isFullscreen ? (
        <Minimize2 className="w-4 h-4" />
      ) : (
        <Maximize2 className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isFullscreen ? "Keluar" : "Fullscreen"}
      </span>
    </Button>
  )
} 