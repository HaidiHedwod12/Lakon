"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ColorOption {
  name: string
  value: string
  hex: string
}

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

const colorOptions: ColorOption[] = [
  // Blues
  { name: "Biru Muda", value: "#E1F2F7", hex: "#E1F2F7" },
  { name: "Biru Es", value: "#E0F2F8", hex: "#E0F2F8" },
  { name: "Biru Terang", value: "#3B82F6", hex: "#3B82F6" },
  { name: "Biru Royal", value: "#1E40AF", hex: "#1E40AF" },
  { name: "Biru Navy", value: "#1F1D53", hex: "#1F1D53" },
  
  // Greens
  { name: "Hijau Muda", value: "#D9EAD0", hex: "#D9EAD0" },
  { name: "Hijau Segar", value: "#16A34A", hex: "#16A34A" },
  { name: "Hijau Hutan", value: "#32523F", hex: "#32523F" },
  { name: "Hijau Emerald", value: "#059669", hex: "#059669" },
  
  // Purples
  { name: "Ungu Muda", value: "#D8D2E9", hex: "#D8D2E9" },
  { name: "Ungu Lavender", value: "#8B5CF6", hex: "#8B5CF6" },
  { name: "Ungu Gelap", value: "#493656", hex: "#493656" },
  
  // Pinks & Reds
  { name: "Merah Muda", value: "#F9D1D7", hex: "#F9D1D7" },
  { name: "Merah Muda Terang", value: "#EC4899", hex: "#EC4899" },
  { name: "Merah", value: "#EF4444", hex: "#EF4444" },
  { name: "Merah Gelap", value: "#DC2626", hex: "#DC2626" },
  
  // Oranges
  { name: "Oranye Muda", value: "#F5D2B3", hex: "#F5D2B3" },
  { name: "Oranye", value: "#F97316", hex: "#F97316" },
  { name: "Oranye Gelap", value: "#EA580C", hex: "#EA580C" },
  
  // Yellows
  { name: "Kuning Muda", value: "#F7E9A0", hex: "#F7E9A0" },
  { name: "Kuning", value: "#EAB308", hex: "#EAB308" },
  { name: "Kuning Gelap", value: "#CA8A04", hex: "#CA8A04" },
  
  // Browns & Grays
  { name: "Cokelat Muda", value: "#D7C3A0", hex: "#D7C3A0" },
  { name: "Cokelat", value: "#A16207", hex: "#A16207" },
  { name: "Abu-abu Muda", value: "#D9D2D2", hex: "#D9D2D2" },
  { name: "Abu-abu", value: "#6B7280", hex: "#6B7280" },
  { name: "Hitam", value: "#202020", hex: "#202020" },
]

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const selectedColor = colorOptions.find(color => color.value === value) || colorOptions[0]

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor.value }}
              />
              <span className="text-sm">{selectedColor.name}</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm" style={{ zIndex: 99999 }}>
          <DialogHeader>
            <DialogTitle>Pilih Warna</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 p-4">
            {colorOptions.map((color) => (
              <Button
                key={color.value}
                variant="ghost"
                className={cn(
                  "h-16 w-full p-2 flex flex-col items-center justify-center gap-1",
                  value === color.value && "ring-2 ring-primary"
                )}
                onClick={() => {
                  onChange(color.value)
                  setOpen(false)
                }}
              >
                <div 
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs text-center leading-tight">
                  {color.name}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 