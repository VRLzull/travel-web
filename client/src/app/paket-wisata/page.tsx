'use client';

import React, { useEffect, useState } from 'react';
import { SearchBar } from '@/components/common/SearchBar';
import { PackageCard } from '@/components/common/PackageCard';
import { FilterSidebar } from '@/components/common/FilterSidebar';
import { apiClient, type Package, type PackageDetail } from '@/lib/api';

export default function PaketWisata() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [filtered, setFiltered] = useState<Package[]>([]);
  const [packageDetails, setPackageDetails] = useState<Record<number, PackageDetail>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Menampilkan 3 paket per halaman sesuai permintaan user

  useEffect(() => {
    setMounted(true);
    const fetchPackages = async () => {
      try {
        const data = await apiClient.getPackages();
        setPackages(data);
        setFiltered(data);
        
        // Ambil detail untuk setiap layanan untuk mendapatkan gambar
        const details: Record<number, PackageDetail> = {};
        for (const pkg of data) {
          try {
            const detail = await apiClient.getPackageById(pkg.id);
            details[pkg.id] = detail;
          } catch (error) {
            console.error(`Gagal memuat detail layanan ${pkg.id}:`, error);
          }
        }
        setPackageDetails(details);
      } catch {
        setPackages([]);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : '');
        setErrorMsg(`Gagal memuat layanan dari ${apiBase}. Pastikan backend berjalan dan dapat diakses.`);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (!mounted) {
    return null;
  }

  const unique = <T extends string | number>(arr: T[]) => Array.from(new Set(arr));
  const locations = unique(packages.map((p) => p.location));
  const categories = unique(
    packages
      .map((p) => p.category)
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
  );
  const durations = unique(packages.map((p) => p.duration_days)).sort((a, b) => a - b);

  const applyFilters = (f: { locations: string[]; categories: string[]; minPrice: number; maxPrice: number; durationDays?: number | null }) => {
    const next = packages.filter((p) => {
      const byLoc = f.locations.length ? f.locations.includes(p.location) : true;
      const byCat = f.categories.length ? f.categories.includes(p.category) : true;
      const byPrice = (p.price >= f.minPrice) && (p.price <= f.maxPrice);
      const byDur = f.durationDays ? p.duration_days === f.durationDays : true;
      return byLoc && byCat && byPrice && byDur;
    });
    setFiltered(next);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  const resetFilters = () => {
    setFiltered(packages);
    setCurrentPage(1); // Reset to page 1 on reset
  };

  const handleAddToCart = (item: any) => {
    try {
      const cartStr = localStorage.getItem('cart');
      const cart = cartStr ? JSON.parse(cartStr) : [];
      
      // Cek apakah item sudah ada di keranjang
      const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Trigger event storage agar Navbar terupdate
      window.dispatchEvent(new Event('storage'));
      
      alert(`Berhasil menambahkan ${item.title} ke keranjang!`);
    } catch (err) {
      console.error('Gagal menambahkan ke keranjang:', err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Hero Section (tanpa video, stabil untuk SSR) */}
      {/* <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Temukan Petualangan Terbaikmu</h1>
            <div className="max-w-3xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
            {errorMsg}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="w-full md:w-1/4">
            <FilterSidebar 
              locations={locations}
              categories={categories}
              durations={durations}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Package List */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Katalog Layanan (Reguler, Carter, Sewa Mobil)</h2>
              <div className="text-sm text-gray-500">{loading ? 'Memuat...' : `Menampilkan ${filtered.length} layanan`}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((pkg) => {
                // Dapatkan detail paket jika ada
                const detail = packageDetails[pkg.id];
                let imageUrl = pkg.primary_image || '';
                
                // Jika ada detail dan images, cari gambar utama atau ambil yang pertama
                if (detail?.images?.length > 0) {
                  const primaryImage = detail.images.find(img => img.is_primary) || detail.images[0];
                  if (primaryImage?.image_url) {
                    imageUrl = primaryImage.image_url;
                  }
                }
                
                // Jika masih kosong, gunakan gambar default
                const category = (pkg.category || '').toLowerCase().trim();
                const categoryImageMap: Record<string, string> = {
                  travel_reguler: '/packages/bali.webp',
                  carter: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg',
                  sewa_mobil: '/packages/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg',
                };
                if (!imageUrl) {
                  imageUrl = categoryImageMap[category] || '/packages/placeholder-package.svg';
                }
                
                // Hapus priceRange karena tidak digunakan di PackageCard
                
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

            {/* Pagination */}
            <div className="mt-10 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map((page) => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === (totalPages || 1)}
                  className={`px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === (totalPages || 1) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
