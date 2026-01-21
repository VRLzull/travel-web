import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FiMapPin, FiClock, FiStar, FiShoppingCart } from 'react-icons/fi';
import Image from 'next/image';

type PackageCardProps = {
  id?: number;
  title?: string;
  location?: string;
  price?: number | string;
  duration?: string;
  rating?: number;
  imageUrl?: string;
  href?: string;
  onAddToCart?: (item: any) => void;
};

const DEFAULT_IMAGE_URL = '/packages/placeholder-package.svg';

function resolveBackendOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL as string | undefined;
  if (api) return api.replace(/\/api$/, '');
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:4000`;
  return 'http://localhost:4000';
}

function processImageUrl(url?: string): string {
  if (!url || url.trim() === '') return DEFAULT_IMAGE_URL;
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const origin = resolveBackendOrigin();
  if (u.startsWith('/')) {
    if (u.startsWith('/packages') || u.startsWith('/uploads')) return `${origin}${u}`;
    return u;
  }
  if (u.startsWith('packages') || u.startsWith('uploads')) return `${origin}/${u}`;
  return u.startsWith('/') ? u : `/${u}`;
}

export const PackageCard = ({
  id,
  title = 'Layanan',
  location = 'Lokasi',
  price = 0,
  duration = '0 Hari',
  rating = 0,
  imageUrl = '',
  href,
  onAddToCart,
}: PackageCardProps) => {
  const baseSrc = useMemo(() => processImageUrl(imageUrl), [imageUrl]);
  const [errorForSrc, setErrorForSrc] = useState<string | null>(null);

  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === null) return 'Rp 0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(isNaN(numPrice) ? 0 : numPrice);
  };

  const formattedPrice = formatPrice(price);

  const resolvedSrc = errorForSrc === baseSrc ? DEFAULT_IMAGE_URL : baseSrc;
  const handleImageError = () => setErrorForSrc(baseSrc);
  const isExternal = resolvedSrc.startsWith('http') || resolvedSrc.startsWith('//');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({ id, title, location, price, duration, imageUrl: resolvedSrc });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={resolvedSrc}
          alt={title || 'Gambar layanan'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={errorForSrc !== baseSrc}
          onError={handleImageError}
          loading="eager"
          unoptimized={isExternal}
        />
        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
          <FiStar className="mr-1" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={title}>
          {title}
        </h3>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <FiMapPin className="mr-1.5 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <FiClock className="mr-1.5 flex-shrink-0" />
          <span>{duration}</span>
        </div>

        <div className="mt-auto">
          <div className="mb-2">
            <p className="text-xs text-gray-500">Mulai dari</p>
            <p className="text-lg font-bold text-blue-600">{formattedPrice}</p>
            <p className="text-xs text-gray-500">per hari</p>
          </div>
          <div className="flex gap-2">
            {href ? (
              <Link
                href={href}
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Lihat Detail
              </Link>
            ) : (
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Lihat Detail
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center"
              title="Tambah ke Keranjang"
            >
              <FiShoppingCart />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
