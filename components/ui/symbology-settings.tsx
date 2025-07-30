"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Palette, Square, Eye, EyeOff } from "lucide-react"
import { ColorPicker } from "./color-picker"

interface SymbologySettings {
  fillColor: string
  borderColor: string
  borderWidth: number
  fillOpacity: number
  borderOpacity: number
  hollow: boolean
}

interface SymbologySettingsProps {
  boundarySettings: {
    kota: SymbologySettings
    kecamatan: SymbologySettings
    desa: SymbologySettings
  }
  boundaryVisibility: {
    kota: boolean
    kecamatan: boolean
    desa: boolean
  }
  onSettingsChange: (type: 'kota' | 'kecamatan' | 'desa', settings: SymbologySettings) => void
  onVisibilityChange: (type: 'kota' | 'kecamatan' | 'desa', visible: boolean) => void
}

export function SymbologySettings({
  boundarySettings,
  boundaryVisibility,
  onSettingsChange,
  onVisibilityChange
}: SymbologySettingsProps) {
  const [activeTab, setActiveTab] = useState<'kota' | 'kecamatan' | 'desa'>('kota')

  const boundaryLabels = {
    kota: "Batas Kota",
    kecamatan: "Batas Kecamatan", 
    desa: "Batas Desa"
  }

  const boundaryColors = {
    kota: "#3b82f6",
    kecamatan: "#16a34a",
    desa: "#ca8a04"
  }

  const handleSettingChange = (type: 'kota' | 'kecamatan' | 'desa', key: keyof SymbologySettings, value: any) => {
    const currentSettings = boundarySettings[type]
    const newSettings = { ...currentSettings, [key]: value }
    onSettingsChange(type, newSettings)
  }

  const handleReset = (type: 'kota' | 'kecamatan' | 'desa') => {
    const defaultSettings: SymbologySettings = {
      fillColor: boundaryColors[type],
      borderColor: boundaryColors[type],
      borderWidth: 2,
      fillOpacity: 0.3,
      borderOpacity: 0.8,
      hollow: false
    }
    onSettingsChange(type, defaultSettings)
  }

  const renderBoundarySettings = (type: 'kota' | 'kecamatan' | 'desa') => {
    const settings = boundarySettings[type]
    const isVisible = boundaryVisibility[type]

    return (
      <div className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Tampilkan Layer
          </Label>
          <Switch
            checked={isVisible}
            onCheckedChange={(visible) => onVisibilityChange(type, visible)}
          />
        </div>

        {/* Preview */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <Label className="text-sm font-medium mb-2 block">Preview</Label>
          <div 
            className="w-full h-16 rounded border-2"
            style={{
              backgroundColor: settings.hollow ? 'transparent' : settings.fillColor,
              borderColor: settings.borderColor,
              borderWidth: `${settings.borderWidth}px`,
              opacity: settings.hollow ? settings.borderOpacity : settings.fillOpacity
            }}
          />
        </div>

        {/* Fill Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Warna Isian
            </Label>
            <Switch
              checked={!settings.hollow}
              onCheckedChange={(checked) => handleSettingChange(type, 'hollow', !checked)}
            />
          </div>
          
                      {!settings.hollow && (
              <>
                <div className="space-y-2">
                  <ColorPicker
                    value={settings.fillColor}
                    onChange={(color) => handleSettingChange(type, 'fillColor', color)}
                    label="Warna Isian"
                  />
                </div>
              
              <div className="space-y-2">
                <Label>Transparansi Isian: {Math.round(settings.fillOpacity * 100)}%</Label>
                <Slider
                  value={[settings.fillOpacity]}
                  onValueChange={(value) => handleSettingChange(type, 'fillOpacity', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Border Settings */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            Pengaturan Garis Pinggir
          </Label>
          
          <div className="space-y-2">
            <ColorPicker
              value={settings.borderColor}
              onChange={(color) => handleSettingChange(type, 'borderColor', color)}
              label="Warna Garis Pinggir"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ketebalan Garis: {settings.borderWidth}px</Label>
            <Slider
              value={[settings.borderWidth]}
              onValueChange={(value) => handleSettingChange(type, 'borderWidth', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Transparansi Garis: {Math.round(settings.borderOpacity * 100)}%</Label>
            <Slider
              value={[settings.borderOpacity]}
              onValueChange={(value) => handleSettingChange(type, 'borderOpacity', value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={() => handleReset(type)} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Symbology</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md !z-[99999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Pengaturan Symbology
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kota' | 'kecamatan' | 'desa')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kota">Kota</TabsTrigger>
            <TabsTrigger value="kecamatan">Kecamatan</TabsTrigger>
            <TabsTrigger value="desa">Desa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kota" className="mt-4">
            {renderBoundarySettings('kota')}
          </TabsContent>
          
          <TabsContent value="kecamatan" className="mt-4">
            {renderBoundarySettings('kecamatan')}
          </TabsContent>
          
          <TabsContent value="desa" className="mt-4">
            {renderBoundarySettings('desa')}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 