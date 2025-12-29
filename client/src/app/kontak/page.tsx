'use client';

import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <FiPhone className="w-6 h-6 text-blue-600" />,
      title: 'Telepon',
      detail: '+62 812-3456-7890',
      description: 'Senin - Jumat, 09:00 - 17:00'
    },
    {
      icon: <FiMail className="w-6 h-6 text-blue-600" />,
      title: 'Email',
      detail: 'info@tourku.com',
      description: 'Kami balas dalam 24 jam'
    },
    {
      icon: <FiMapPin className="w-6 h-6 text-blue-600" />,
      title: 'Kantor Pusat',
      detail: 'Jl. Malioboro No. 123',
      description: 'Yogyakarta, Indonesia'
    },
    {
      icon: <FiClock className="w-6 h-6 text-blue-600" />,
      title: 'Jam Operasional',
      detail: 'Setiap Hari',
      description: '08:00 - 21:00 WIB'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan tentang paket wisata atau ingin merencanakan perjalanan kustom? Tim kami siap membantu Anda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="md:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg mr-4">
                    {info.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{info.title}</h3>
                </div>
                <p className="text-blue-600 font-medium mb-1">{info.detail}</p>
                <p className="text-gray-500 text-sm">{info.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="budi@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjek</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Tanya Paket Wisata Bali"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesan Anda</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
                  >
                    <span>Kirim Sekarang</span>
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[450px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.973595420364!2d110.3636236!3d-7.7924844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5742a17e3c3b%3A0xef72373307436577!2sJl.%20Malioboro%2C%20Sosromenduran%2C%20Gedong%20Tengen%2C%20Kota%20Yogyakarta%2C%20Daerah%20Istimewa%20Yogyakarta!5e0!3m2!1sid!2sid!4v1703312345678!5m2!1sid!2sid"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl"
            title="Lokasi Tourku"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
