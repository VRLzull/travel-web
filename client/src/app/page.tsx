'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, type Package } from '@/lib/api';
import { PackageCard } from '@/components/common/PackageCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Temukan Petualangan Terbaikmu',
    description: 'Jelajahi layanan pilihan dengan harga terjangkau dan pengalaman tak terlupakan.',
    image: '/packages/bali.webp',
    video: '/videos/WhatsApp Video 2026-01-08 at 5.34.04 PM.mp4',
  },
  {
    id: 2,
    title: 'Eksplorasi Keajaiban Alam Indonesia',
    description: 'Nikmati keindahan pantai, pegunungan, dan budaya lokal yang memukau.',
    image: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg',
    video: '/videos/WhatsApp Video 2026-01-08 at 5.36.59 PM.mp4',
  },
  {
    id: 3,
    title: 'Momen Tak Terlupakan Bersama Kami',
    description: 'Rencanakan perjalanan impianmu sekarang dengan layanan terbaik kami.',
    image: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg',
    video: '/videos/WhatsApp Video 2026-01-08 at 5.34.04 PM.mp4',
  }
];

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getPackages();
        setPackages(data.slice(0, 6));
      } catch {
        setErrorMsg('Gagal memuat layanan populer.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = (item: any) => {
    try {
      const cartStr = localStorage.getItem('cart');
      const cart = cartStr ? JSON.parse(cartStr) : [];
      const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      alert(`Berhasil menambahkan ${item.title} ke keranjang!`);
    } catch (err) {
      console.error('Gagal menambahkan ke keranjang:', err);
    }
  };

  const getHeroImage = (path: string) => {
    const api = process.env.NEXT_PUBLIC_API_URL as string | undefined;
    const origin = api ? api.replace(/\/api$/, '') : (typeof window !== 'undefined' ? `http://${window.location.hostname}:4000` : 'http://localhost:4000');
    return `${origin}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Carousel */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          loop={true}
          className="h-full w-full"
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                {/* Background Image or Video */}
                {slide.video ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={slide.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={getHeroImage(slide.image)}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 text-white">
                    <div className="max-w-2xl">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-blue-50/90 mb-8 animate-fade-in-up delay-100">
                        {slide.description}
                      </p>
                      <Link 
                        href="/paket-wisata" 
                        className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        Lihat Layanan
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Layanan Populer</h2>
            <p className="text-gray-600 mt-2">Pilihan terbaik untuk perjalanan tak terlupakan</p>
          </div>
          <Link href="/paket-wisata" className="text-blue-600 font-semibold hover:underline">
            Lihat semua &rarr;
          </Link>
        </div>
        
        {errorMsg && <div className="mb-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const category = (pkg.category || '').toLowerCase().trim();
              const categoryImageMap: Record<string, string> = {
                travel_reguler: '/packages/bali.webp',
                carter: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg',
                sewa_mobil: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg',
              };
              const imageUrl = pkg.primary_image || categoryImageMap[category] || '';
              return (
                <PackageCard
                  key={pkg.id}
                  id={pkg.id}
                  title={pkg.title}
                  location={pkg.location}
                  price={pkg.price}
                  duration={`${pkg.duration_days} Hari`}
                  imageUrl={imageUrl}
                  href={`/paket-wisata/${pkg.slug}`}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
