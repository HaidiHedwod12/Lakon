"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Download } from "lucide-react"
import Link from "next/link"
import { LakonLogo } from "@/components/logo"
import AuthProvider from "@/components/AuthProvider"
import {
  TimeDistributionChart,
  WeatherChart,
  CauseAnalysisChart,
  AccidentRadarChart,
} from "@/components/advanced-charts"
import { recommendationData } from "@/lib/dummy-data"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <AuthProvider>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analisis Mendalam</h1>
            <p className="text-slate-300">Analisis komprehensif data kecelakaan dan tren lalu lintas</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select defaultValue="2024">
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TimeDistributionChart />
          <WeatherChart />
          <CauseAnalysisChart />
          <AccidentRadarChart />
        </div>

        {/* Detailed Recommendations */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Rekomendasi Detail dengan ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recommendationData.map((rec, index) => (
                <div key={index} className="p-6 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{rec.location}</h3>
                      <p className="text-slate-300 mb-3">{rec.description}</p>
                    </div>
                    <Badge
                      className={
                        rec.priority === "Tinggi"
                          ? "bg-red-500"
                          : rec.priority === "Sedang"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                      }
                    >
                      {rec.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Timeline:</span>
                      <p className="text-blue-400 font-semibold">{rec.timeline}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Pengurangan Kecelakaan:</span>
                      <p className="text-green-400 font-semibold">{rec.expectedReduction}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tindakan:</span>
                      <p className="text-white font-semibold">{rec.action}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Prioritas:</span>
                      <p className="text-purple-400 font-semibold">{rec.priority}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </AuthProvider>
    </div>
  )
}
