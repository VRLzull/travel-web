'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  imageUrl: string;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadCart = () => {
      const cartStr = localStorage.getItem('cart');
      if (cartStr) {
        setCartItems(JSON.parse(cartStr));
      }
    };
    loadCart();
    
    // Listen for storage changes
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!mounted) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <FiShoppingCart className="mr-3" /> Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
            <p className="text-gray-500 mb-8">Sepertinya Anda belum menambahkan layanan apa pun.</p>
            <Link
              href="/paket-wisata"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Jelajahi Layanan
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{item.location} • {item.duration}</p>
                    <p className="text-blue-600 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Hapus Item"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="pt-4">
                <Link
                  href="/paket-wisata"
                  className="inline-flex items-center text-blue-600 font-medium hover:underline"
                >
                  <FiArrowLeft className="mr-2" /> Tambah Layanan Lainnya
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} item)</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pajak (0%)</span>
                    <span>Rp 0</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Lanjut ke Pembayaran
                </button>
                <p className="text-center text-gray-400 text-xs mt-4">
                  Harga sudah termasuk asuransi dan pajak layanan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
