'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Hand, Rocket, Target, Sparkles, BookOpen, Gamepad2, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#FFF] font-[var(--font-fredoka)] overflow-hidden relative selection:bg-cyan-200">

      {/* Decorative Background Elements */}
      <div className="absolute top-[10%] right-[5%] w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-40 animate-pulse delay-1000" />
      <div className="absolute bottom-[20%] left-[5%] w-40 h-40 bg-pink-300 rounded-full blur-3xl opacity-40 animate-pulse delay-700" />
      <div className="absolute top-[40%] left-[20%] w-20 h-20 bg-blue-300 rounded-full blur-xl opacity-30 animate-bounce duration-[3000ms]" />

      {/* Navigation - Glassmorphism */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full px-6 py-3 flex items-center justify-between w-full max-w-4xl border-2 border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-[0_4px_0_#0369A1] border-2 border-white transform hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-[#0F172A] text-lg tracking-wide hidden sm:block">UMS Dental</span>
          </div>

          <div className="flex gap-3">
            <Link href="/auth/login">
              <button className="px-5 py-2 rounded-xl font-bold text-[#64748B] hover:text-[#0EA5E9] hover:bg-blue-50 transition-colors">
                Masuk
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="px-6 py-2 rounded-xl bg-[#0EA5E9] text-white font-bold border-b-4 border-[#0284C7] active:border-b-0 active:translate-y-1 hover:brightness-110 transition-all shadow-lg shadow-blue-200">
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 text-center z-10">
        <div className="max-w-5xl mx-auto">

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100 mb-8 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">Platform Edukasi Anak</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-[900] text-[#0F172A] mb-8 leading-tight tracking-tight drop-shadow-sm">
            Belajar Gigi jadi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6]">Petualangan Seru!</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Gabung bersama Dokter Gigi Cilik lainnya. Selesaikan misi, kumpulkan poin, dan jadilah pahlawan kesehatan gigi! 🦷✨
          </p>

          <Link href="/auth/register">
            <button className="px-10 py-5 text-2xl font-black text-white bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl border-b-[6px] border-[#B45309] active:border-b-0 active:translate-y-[6px] shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] transform hover:scale-105 transition-all flex items-center gap-3 mx-auto">
              <Rocket className="w-8 h-8 animate-pulse" />
              MULAI BERMAIN
            </button>
          </Link>

        </div>
      </section>

      {/* 3D Features Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Feature 1: Missions (Large) */}
          <div className="md:col-span-8 group">
            <div className="h-full bg-white rounded-[2rem] border-4 border-blue-100 border-b-[8px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-blue-100/50">
              <div className="text-left space-y-4 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-4xl mb-2">
                  🎯
                </div>
                <h3 className="text-3xl font-extrabold text-blue-950">Misi Harian</h3>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  Tantangan sikat gigi pagi & malam. Upload fotomu dan dapatkan Coin!
                </p>
                <div className="pt-2">
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">
                    +500 XP per Misi
                  </span>
                </div>
              </div>
              {/* Decorative Visual */}
              <div className="w-full md:w-64 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-inner border-4 border-white transform rotate-3 flex items-center justify-center">
                <span className="text-6xl filter drop-shadow-md">📸</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Leaderboard (Tall) */}
          <div className="md:col-span-4 row-span-2">
            <div className="h-full bg-gradient-to-b from-[#FFFBEB] to-white rounded-[2rem] border-4 border-yellow-200 border-b-[8px] p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-yellow-100/50">
              <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-4xl mb-6 ring-4 ring-yellow-50">
                🏆
              </div>
              <h3 className="text-2xl font-extrabold text-yellow-900 mb-2">Top Juara</h3>
              <p className="text-gray-500 text-sm mb-8 font-semibold">Siapa Pahlawan Minggu Ini?</p>

              <div className="space-y-3">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="bg-white p-3 rounded-xl border-2 border-yellow-100 flex items-center gap-3 shadow-sm">
                    <span className={`font-black text-lg w-6 ${rank === 1 ? 'text-yellow-500' : 'text-gray-400'}`}>#{rank}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="h-3 w-16 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: Comics (Small) */}
          <div className="md:col-span-4">
            <div className="h-full bg-white rounded-[2rem] border-4 border-pink-100 border-b-[8px] p-6 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-pink-100/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-pink-100 rounded-xl text-2xl">📚</div>
                <h3 className="text-xl font-extrabold text-pink-900">Komik Seru</h3>
              </div>
              <p className="text-gray-500 text-sm font-medium">Baca cerita petualangan gigi melawan kuman jahat.</p>
            </div>
          </div>

          {/* Feature 4: Games (Small) */}
          <div className="md:col-span-4">
            <div className="h-full bg-white rounded-[2rem] border-4 border-green-100 border-b-[8px] p-6 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-green-100/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-xl text-2xl">🎮</div>
                <h3 className="text-xl font-extrabold text-green-900">Mini Games</h3>
              </div>
              <p className="text-gray-500 text-sm font-medium">Main game sambil belajar cara merawat gigi.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-blue-300 font-bold tracking-widest text-sm uppercase bg-[#0F172A]">
        © 2024 UMS Dental Platform
      </footer>

    </div>
  );
}
