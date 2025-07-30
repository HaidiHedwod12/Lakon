"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { timeDistributionData, weatherData, causeData } from "@/lib/dummy-data"

export function TimeDistributionChart() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Distribusi Waktu Kecelakaan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeDistributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="accidents" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WeatherChart() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Kecelakaan Berdasarkan Cuaca</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="weather" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Area type="monotone" dataKey="accidents" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CauseAnalysisChart() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Analisis Penyebab Kecelakaan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {causeData.map((cause, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm">{cause.cause}</span>
                  <span className="text-white font-semibold">{cause.accidents}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cause.percentage}%` }}
                  ></div>
                </div>
              </div>
              <Badge className="ml-3 bg-amber-500/20 text-amber-400 border-amber-500/30">{cause.percentage}%</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AccidentRadarChart() {
  const radarData = [
    { subject: "Pagi", A: 45, fullMark: 100 },
    { subject: "Siang", A: 67, fullMark: 100 },
    { subject: "Sore", A: 89, fullMark: 100 },
    { subject: "Malam", A: 26, fullMark: 100 },
    { subject: "Dini Hari", A: 12, fullMark: 100 },
  ]

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Pola Kecelakaan 24 Jam</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <Radar name="Kecelakaan" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
