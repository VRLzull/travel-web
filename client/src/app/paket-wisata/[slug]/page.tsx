'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiMapPin, FiClock, FiCalendar, FiShoppingCart } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { apiClient, type PackageDetail, type Package } from '@/lib/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Interface untuk tipe data schedule
interface Schedule {
    id: number;
    package_id: number;
    start_date: string;
    departure_date: string;
    end_date: string;
    max_people: number;
    available_seats: number;
    available_quota: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function PackageDetail() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState<Date | null>(null);
  const [participants, setParticipants] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  // State untuk menyimpan jadwal yang tersedia
  const [availability, setAvailability] = useState<Array<{ 
    date: string; 
    quota: number;
    raw?: Schedule;
    isDefault?: boolean;
  }>>([]);
  // Use local placeholder image
  const placeholder = '/packages/placeholder-package.svg';

  useEffect(() => {
    const load = async () => {
      const slug = String(params?.slug || '');
      try {
        const list = await apiClient.getPackages();
        const base = list.find((p: Package) => p.slug === slug);
        if (!base) {
          setErrorMsg('Layanan tidak ditemukan');
          setIsLoading(false);
          return;
        }
        const d = await apiClient.getPackageById(base.id);
        console.log('Package detail from API:', d);
        setDetail(d);
        
        // Log informasi gambar yang diterima
        console.log('Primary image:', d.primary_image);
        console.log('Images array:', d.images);
        
        // Function to validate and process image URLs
        const processImageUrl = (url: string | undefined): string => {
          if (!url || typeof url !== 'string' || url.trim() === '') {
            return placeholder;
          }
          
          // If it's a data URL, use it as is
          if (url.startsWith('data:')) return url;
          
          const u = url.trim();
          if (u.startsWith('http://') || u.startsWith('https://')) return u;
          if (u.startsWith('//')) return `https:${u}`;

          const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : '');
          const origin = apiBase.replace(/\/api$/, '');

          if (u.startsWith('/')) {
            if (u.startsWith('/packages') || u.startsWith('/uploads')) return `${origin}${u}`;
            return u;
          }
          if (u.startsWith('packages') || u.startsWith('uploads')) return `${origin}/${u}`;
          return u.startsWith('/') ? u : `/${u}`;
        };
        
        // Function to validate if a URL is a valid image
        const isValidImageUrl = (url: string | undefined): boolean => {
          if (!url || typeof url !== 'string' || url.trim() === '') {
            return false;
          }
          
          // Allow data URLs
          if (url.startsWith('data:')) return true;
          
          try {
            const urlObj = new URL(url);
            
            // Allow http/https URLs (tanpa memaksa ekstensi)
            return ['http:', 'https:'].includes(urlObj.protocol);
          } catch (e) {
            // If it's not a valid URL but looks like a relative path, assume it's valid
            return /^\.?\//.test(url);
          }
        };

        // Process all valid images
        const allImages = [
          d.primary_image,
          ...(d.images?.map(img => img.image_url) || [])
        ]
          .filter((url): url is string => {
            if (!url) return false;
            const trimmed = String(url).trim();
            return trimmed !== '' && isValidImageUrl(trimmed);
          })
          .map(url => processImageUrl(url))
          // Remove duplicates
          .filter((url, index, self) => self.indexOf(url) === index);
        
        console.log('All valid images to display:', allImages);
        const categoryImageMap: Record<string, string> = {
          travel_reguler: '/packages/bali.webp',
          carter: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg',
          sewa_mobil: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg',
        };
        const cat = String((d as any)?.category || '').toLowerCase();
        const fallback = categoryImageMap[cat] || placeholder;
        setImages(allImages.length > 0 ? allImages : [fallback]);
        
        // Debug log untuk data lengkap dari API
        console.log('Data paket dari API:', d);
        
        // Pastikan schedules ada dan merupakan array
        const schedules = Array.isArray(d.schedules) ? d.schedules : [];
        console.log('Daftar jadwal mentah dari API:', schedules);
        
        // Proses data jadwal
        const availableSchedules = (schedules as Schedule[])
          .map(schedule => {
            try {
              const dateValue = schedule.start_date || schedule.departure_date;
              // Gunakan available_seats jika ada, jika tidak gunakan available_quota
              const quota = schedule.available_seats ?? schedule.available_quota ?? 0;
              
              // Format tanggal ke YYYY-MM-DD tanpa konversi zona waktu
              const toYMD = (val: string | Date) => {
                if (typeof val === 'string') {
                  const s = val.trim();
                  // Jika sudah format YYYY-MM-DD, gunakan langsung
                  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
                  // Jika ada waktu, format dengan locale en-CA agar hasil YYYY-MM-DD
                  const d = new Date(s);
                  return d.toLocaleDateString('en-CA');
                }
                return (val as Date).toLocaleDateString('en-CA');
              };
              const dateStr = toYMD(dateValue);
              
              return {
                date: dateStr,
                quota: Number(quota) || 0,
                raw: schedule,
                isDefault: false
              };
            } catch (error) {
              console.error('Error memproses jadwal:', error, schedule);
              return null;
            }
          })
          .filter((item): item is { 
            date: string; 
            quota: number; 
            raw: Schedule; 
            isDefault: boolean 
          } => item !== null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
        console.log('Jadwal yang akan ditampilkan:', availableSchedules);
        
        // Jangan buat jadwal dummy. Jika kosong, tampilkan info 'Tidak ada jadwal tersedia'

        setAvailability(availableSchedules);
      } catch {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : '');
        setErrorMsg(`Gagal memuat detail layanan dari ${apiBase}.`);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params, placeholder]);

  // Format price to IDR currency
  const formatPrice = (amount: number | string | undefined) => {
    const numAmount = typeof amount === 'string' 
      ? parseFloat(amount) 
      : (amount !== undefined && amount !== null ? amount : 0);
      
    if (isNaN(numAmount) || numAmount === 0) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Get price from detail or default to 0
  const price = detail?.price ?? 0;
  const totalPrice = Number(price) * participants;
  const formattedPrice = formatPrice(totalPrice);
  
  // Debug log to check price data
  useEffect(() => {
    if (detail) {
      console.log('Package detail:', {
        price: detail.price,
        totalPrice,
        formattedPrice,
        detail // Log full detail for debugging
      });
    }
  }, [detail]);
  
  // Format date to Indonesian format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleBooking = () => {
    if (!selectedDate || !detail) {
      alert('Silakan pilih tanggal keberangkatan terlebih dahulu');
      return;
    }
    window.location.href = `/booking/${detail.id}?date=${selectedDate}&participants=${participants}`;
  };

  const handleAddToCart = () => {
    if (!detail) return;
    try {
      const cartStr = localStorage.getItem('cart');
      const cart = cartStr ? JSON.parse(cartStr) : [];
      
      const item = {
        id: detail.id,
        title: detail.title,
        location: detail.location,
        price: detail.price,
        duration: `${detail.duration_days} Hari`,
        imageUrl: images[0] || placeholder,
        quantity: participants
      };

      const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += participants;
      } else {
        cart.push(item);
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      alert(`Berhasil menambahkan ${detail.title} ke keranjang!`);
    } catch (err) {
      console.error('Gagal menambahkan ke keranjang:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{detail?.title}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiMapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {detail?.location}
              <span className="mx-2">•</span>
              <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {detail ? `${detail.duration_days} Hari` : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
                {images[selectedImage] ? (
                  <>
                    <Image
                      src={images[selectedImage]}
                      alt={detail?.title || 'Gambar layanan'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== placeholder) {
                          console.error('Error loading image:', images[selectedImage]);
                          target.src = placeholder;
                        }
                      }}
                    />
                    {images[selectedImage] && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                        {(() => {
                          try {
                            return new URL(images[selectedImage]).hostname;
                          } catch (e) {
                            return 'Gambar';
                          }
                        })()}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="text-gray-500 mb-2">Gambar tidak tersedia</div>
                    <button 
                      className="text-blue-600 text-sm underline"
                      onClick={() => setSelectedImage(0)}
                    >
                      Muat Ulang
                    </button>
                  </div>
                )}
              </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-md overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image || placeholder}
                      alt={`${detail?.title || 'Gambar'} ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        // Ganti dengan placeholder jika gambar gagal dimuat
                        const target = e.target as HTMLImageElement;
                        target.src = placeholder;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi</h2>
              <p className="text-gray-600">{detail?.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>
              {(() => {
                type Item = { title?: string } | string;
                const raw = (detail as unknown as { itinerary?: Item[] | string })?.itinerary;
                let items: Item[] = [];
                if (Array.isArray(raw)) {
                  items = raw as Item[];
                } else if (typeof raw === 'string') {
                  items = raw
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(Boolean);
                }
                return items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item: Item, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium mr-2 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-600">{typeof item === 'string' ? item : item.title || ''}</span>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-gray-500">Itinerary belum tersedia.</div>
                );
              })()}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fasilitas</h2>
              {(() => {
                type Facility = { name?: string } | string;
                const raw = (detail as unknown as { facilities?: Facility[] | string })?.facilities;
                let facilities: Facility[] = [];
                if (Array.isArray(raw)) {
                  facilities = raw as Facility[];
                } else if (typeof raw === 'string') {
                  facilities = raw
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(Boolean);
                }
                return facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {facilities.map((f: Facility, idx: number) => (
                    <div key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-700">{typeof f === 'string' ? f : f.name || ''}</div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-gray-500">Fasilitas belum tersedia.</div>
                );
              })()}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pesan Sekarang</h3>
              <div className="mb-4">
                <div className="text-2xl font-bold text-blue-600">
                  {detail?.price ? formatPrice(detail.price) : 'Rp 0'}
                  <span className="text-sm font-normal text-gray-500"> / hari</span>
                </div>
                <div className="text-sm text-gray-500">Harga sudah termasuk PPN</div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1 text-xs text-gray-400">
                    Debug: price = {String(detail?.price)}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Tanggal Keberangkatan
                </label>
                <div className="mb-3">
                  <DatePicker
                    selected={manualDate}
                    onChange={(d) => {
                      setManualDate(d);
                      if (d) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${dd}`);
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Pilih tanggal bebas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Memuat jadwal...</p>
                    </div>
                  ) : availability.length > 0 ? (
                    availability.map((avail) => (
                      <button
                        key={avail.date}
                        type="button"
                        onClick={() => setSelectedDate(avail.date)}
                        className={`w-full text-left p-3 border rounded-lg transition-colors ${
                          selectedDate === avail.date
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {formatDate(avail.date)}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">
                            {avail.quota > 0 ? (
                              <span className="text-green-600">Tersedia {avail.quota} unit</span>
                            ) : (
                              <span className="text-red-600">Habis</span>
                            )}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatPrice(price)}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>Tidak ada jadwal tersedia, pilih tanggal bebas di atas</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi / Unit (Hari)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-l-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    -
                  </button>
                  <div className="flex-1 flex items-center justify-center border-t border-b border-gray-300 bg-white px-4 py-2 text-gray-900">
                    {participants}
                  </div>
                  <button
                    type="button"
                    onClick={() => setParticipants(participants + 1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-800">Harga per hari</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(price)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-900">{formattedPrice}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center"
                >
                  <FiCalendar className="mr-2" />
                  Lanjutkan ke Pembayaran
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 px-6 rounded-lg border border-blue-200 transition duration-300 flex items-center justify-center"
                >
                  <FiShoppingCart className="mr-2" />
                  Tambah ke Keranjang
                </button>
                <div className="mt-3 text-center text-sm text-gray-500">
                  <p>Pembayaran aman dan terjamin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
