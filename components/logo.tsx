"use client"

import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function LakonLogo({ size = 32, className = "" }: LogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/images/logo-kota-surakarta.png"
        alt="Logo Kota Surakarta"
        width={size}
        height={size}
        className="object-contain"
        style={{
          filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))",
        }}
      />
    </div>
  )
}
