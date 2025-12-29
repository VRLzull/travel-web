'use client';

import React from 'react';
import Image from 'next/image';
import { FiCheckCircle, FiUsers, FiAward, FiMapPin } from 'react-icons/fi';

export default function AboutPage() {
  const stats = [
    { icon: <FiUsers className="w-8 h-8 text-blue-600" />, value: '10K+', label: 'Wisatawan Puas' },
    { icon: <FiMapPin className="w-8 h-8 text-blue-600" />, value: '50+', label: 'Destinasi Populer' },
    { icon: <FiAward className="w-8 h-8 text-blue-600" />, value: '15+', label: 'Tahun Pengalaman' },
  ];

  const features = [
    'Harga Terjangkau & Transparan',
    'Pemandu Wisata Profesional',
    'Layanan Pelanggan 24/7',
    'Proses Pemesanan Mudah',
    'Asuransi Perjalanan Terjamin',
    'Paket Wisata Bisa Kustom',
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang TourKu</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Kami adalah mitra perjalanan terpercaya Anda, menghadirkan pengalaman liburan yang tak terlupakan di seluruh penjuru nusantara.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              TourKu didirikan dengan visi untuk membuat keindahan Indonesia dapat dinikmati oleh semua orang. Kami percaya bahwa setiap perjalanan bukan sekadar perpindahan tempat, melainkan penciptaan kenangan yang abadi.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Sejak tahun 2010, kami telah membantu ribuan keluarga dan traveler solo untuk menjelajahi destinasi impian mereka dengan aman, nyaman, dan terjangkau.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000"
              alt="Travel Team"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section (Optional/Simple) */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Mengapa Memilih Kami?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Pengalaman Luas</h3>
            <p className="text-gray-600 text-sm">Lebih dari satu dekade melayani berbagai jenis perjalanan wisata.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Destinasi Terkurasi</h3>
            <p className="text-gray-600 text-sm">Hanya menawarkan tempat-tempat terbaik yang telah kami survei sebelumnya.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Keamanan Utama</h3>
            <p className="text-gray-600 text-sm">Keselamatan Anda adalah prioritas nomor satu kami di setiap langkah.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
