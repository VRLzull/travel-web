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
    description: 'Jelajahi paket wisata pilihan dengan harga terjangkau dan pengalaman tak terlupakan.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Eksplorasi Keajaiban Alam Indonesia',
    description: 'Nikmati keindahan pantai, pegunungan, dan budaya lokal yang memukau.',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Momen Tak Terlupakan Bersama Kami',
    description: 'Rencanakan perjalanan impianmu sekarang dengan layanan terbaik kami.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',
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
        setErrorMsg('Gagal memuat paket populer.');
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
                {/* Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
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
                        Lihat Paket
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
            <h2 className="text-3xl font-bold text-gray-900">Paket Populer</h2>
            <p className="text-gray-600 mt-2">Pilihan terbaik untuk liburan tak terlupakan</p>
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
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                title={pkg.title}
                location={pkg.location}
                price={pkg.price}
                duration={`${pkg.duration_days} Hari`}
                imageUrl={pkg.primary_image || ''}
                href={`/paket-wisata/${pkg.slug}`}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
