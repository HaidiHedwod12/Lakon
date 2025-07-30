"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LakonLogo } from "@/components/logo"
import { Target, Users, BarChart3, Shield, ArrowRight, CheckCircle, Lightbulb, MapPin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
  const timeline = [
    {
      year: "2023",
      title: "Konsep Awal",
      description: "Identifikasi kebutuhan platform digital untuk analisis kecelakaan lalu lintas",
    },
    {
      year: "2024 Q1",
      title: "Pengembangan",
      description: "Mulai pengembangan sistem dengan fokus pada visualisasi data geospasial",
    },
    {
      year: "2024 Q2",
      title: "Pilot Testing",
      description: "Uji coba terbatas dengan data historis kecelakaan Surakarta",
    },
    {
      year: "2024 Q3",
      title: "Launch Beta",
      description: "Peluncuran versi beta dengan fitur pelaporan masyarakat",
    },
  ]

  const features = [
    {
      icon: MapPin,
      title: "Peta Analisis Kecelakaan",
      description:
        "Visualisasi lokasi kecelakaan dengan analisis spasial dan identifikasi blackspot untuk pengambilan keputusan yang tepat",
    },
    {
      icon: BarChart3,
      title: "Dashboard Komprehensif",
      description:
        "Statistik mendalam dan rekomendasi berbasis data untuk membantu Dishub dalam perencanaan infrastruktur",
    },
    {
      icon: Users,
      title: "Partisipasi Masyarakat",
      description:
        "Platform pelaporan interaktif yang memungkinkan masyarakat berpartisipasi aktif dalam keselamatan lalu lintas",
    },
    {
      icon: Shield,
      title: "Sistem Keamanan Data",
      description: "Perlindungan data yang ketat dengan sistem verifikasi berlapis untuk menjaga integritas informasi",
    },
  ]

  const benefits = [
    {
      title: "Untuk Dishub",
      items: [
        "Pengambilan keputusan berbasis data real-time",
        "Identifikasi prioritas perbaikan infrastruktur",
        "Monitoring efektivitas program keselamatan",
        "Alokasi sumber daya yang lebih efisien",
      ],
    },
    {
      title: "Untuk Masyarakat",
      items: [
        "Pelaporan masalah yang mudah dan cepat",
        "Transparansi penanganan laporan",
        "Informasi keselamatan lalu lintas terkini",
        "Partisipasi dalam pembangunan kota",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-start space-x-3">
              <div className="relative -top-1">
                <LakonLogo size={36} />
              </div>
              <div>
                <span className="text-xl font-bold text-white">LAKON</span>
                <p className="text-xs text-slate-400 -mt-1">Laporan Kecelakaan Online</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/map">
                <Button className="text-slate-300 hover:text-amber-400 bg-transparent hover:bg-slate-700">
                  Peta Interaktif
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="text-slate-300 hover:text-amber-400 bg-transparent hover:bg-slate-700">
                  Dashboard
                </Button>
              </Link>
              <Link href="/report">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">Lapor Masalah</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">Tentang LAKON</Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Laporan Kecelakaan
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {" "}
                Online
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Platform digital berbasis peta yang menampilkan data kecelakaan lalu lintas dan isu-isu lalu lintas yang
              dilaporkan masyarakat secara interaktif dan real-time untuk mendukung pengambilan keputusan Dishub.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Target className="w-8 h-8 text-amber-400 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Visi</h2>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Menjadikan LAKON sebagai pondasi data geospasial untuk menciptakan sistem lalu lintas yang lebih
                    aman, lancar, dan adaptif di Kota Surakarta.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Lightbulb className="w-8 h-8 text-amber-400 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Misi</h2>
                  </div>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Menampilkan data kecelakaan dan infrastruktur lalu lintas secara komprehensif
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Menyediakan analisis spasial untuk identifikasi titik rawan
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Mendorong pelaporan aktif dari masyarakat
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Memfasilitasi pengambilan keputusan berbasis bukti oleh Dishub
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Fitur Utama LAKON</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Solusi terintegrasi untuk analisis, monitoring, dan pelaporan lalu lintas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800 border-slate-700 h-full hover:bg-slate-800/80 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-500/20 rounded-lg">
                        <feature.icon className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                        <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Perjalanan LAKON</h2>
            <p className="text-xl text-slate-300">Timeline pengembangan platform dari konsep hingga implementasi</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-500/30"></div>

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-amber-500/20 text-amber-400 border-amber-500/30">{item.year}</Badge>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-300">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-amber-500 rounded-full border-4 border-slate-900"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Manfaat LAKON</h2>
            <p className="text-xl text-slate-300">Dampak positif untuk berbagai stakeholder</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">{benefit.title}</h3>
                    <ul className="space-y-4">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <ArrowRight className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Bergabunglah dengan LAKON</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Mari bersama-sama menciptakan sistem lalu lintas yang lebih aman dan efisien untuk Surakarta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 text-lg">
                <Link href="/map" className="flex items-center">
                  Jelajahi Platform <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent px-6 py-3 text-lg"
              >
                <Link href="/report">Laporkan Masalah</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
