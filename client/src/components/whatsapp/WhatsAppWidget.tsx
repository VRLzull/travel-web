'use client';

import { useState } from 'react';
import { FiMessageCircle, FiX, FiPhone } from 'react-icons/fi';

const categories = [
  { key: 'travel_reguler', label: 'Travel Reguler' },
  { key: 'carter', label: 'Carter' },
  { key: 'sewa_mobil', label: 'Sewa Mobil' },
];

function buildWaUrl(text: string) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
  if (!number) return '';
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${number}?text=${encoded}`;
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');

  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
  if (!number) return null;

  const baseGreeting = `Halo, saya ingin bertanya mengenai layanan.`;

  const handleSend = () => {
    const label = categories.find(c => c.key === selected)?.label || 'Layanan';
    const page = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${baseGreeting}\nKategori: ${label}\nHalaman: ${page}${customText ? `\nPesan: ${customText}` : ''}`;
    const url = buildWaUrl(text);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition"
        >
          <FiMessageCircle className="h-5 w-5" />
          WhatsApp
        </button>
      )}
      {open && (
        <div className="w-80 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <FiPhone className="text-green-600" />
              </div>
              Chat WhatsApp
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
              <FiX />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-600">Pilih kategori chat:</div>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelected(c.key)}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    selected === c.key ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Tulis pesan tambahan (opsional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!selected}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-60"
            >
              Mulai Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

