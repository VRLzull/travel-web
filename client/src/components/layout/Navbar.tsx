'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiShoppingCart, FiSearch, FiLogOut, FiSettings, FiClipboard } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type User = { id: number; name: string; email: string; role?: string };

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateNavbar = () => {
      try {
        // Update User
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          setUser(JSON.parse(userStr));
        } else {
          setUser(null);
        }

        // Update Cart Count
        const cartStr = localStorage.getItem('cart');
        if (cartStr) {
          const cart = JSON.parse(cartStr);
          const count = cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch {
        setUser(null);
        setCartCount(0);
      }
    };

    updateNavbar();
    // Tambahkan event listener untuk memantau perubahan storage
    window.addEventListener('storage', updateNavbar);
    return () => window.removeEventListener('storage', updateNavbar);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsUserMenuOpen(false);
      router.push('/login');
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  };

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Layanan Travel', href: '/paket-wisata' },
    { name: 'Tentang Kami', href: '/tentang-kami' },
    { name: 'Kontak', href: '/kontak' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/faraday-tour-and-travel.png" 
                alt="Faraday Tour Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari layanan travel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="mr-2" /> Profil Saya
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiClipboard className="mr-2" /> Pesanan Saya
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiUser className="mr-1" /> Masuk
              </Link>
            )}

            <Link
              href="/keranjang"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center relative"
            >
              <FiShoppingCart className="mr-1" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Buka menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Cari layanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-gray-500">
                      Halo, {user.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser className="mr-2" /> Profil Saya
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiClipboard className="mr-2" /> Pesanan Saya
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <FiLogOut className="mr-2" /> Keluar
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                )}
                <Link
                  href="/keranjang"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Keranjang
                  {cartCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
