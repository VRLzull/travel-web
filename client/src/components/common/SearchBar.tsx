'use client';

import React from 'react';
import { FiSearch, FiMapPin, FiDollarSign, FiCalendar, FiFilter } from 'react-icons/fi';

export const SearchBar = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Lokasi"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiDollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue=""
          >
            <option value="">Harga</option>
            <option value="0-500000">Rp 0 - 500.000</option>
            <option value="500000-1000000">Rp 500.000 - 1.000.000</option>
            <option value="1000000-2000000">Rp 1.000.000 - 2.000.000</option>
            <option value="2000000">&gt; Rp 2.000.000</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue=""
          >
            <option value="">Durasi</option>
            <option value="1">1 Hari</option>
            <option value="2">2 Hari 1 Malam</option>
            <option value="3">3 Hari 2 Malam</option>
            <option value="5">5 Hari 4 Malam</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue=""
          >
            <option value="">Kategori</option>
            <option value="beach">Pantai</option>
            <option value="mountain">Gunung</option>
            <option value="adventure">Petualangan</option>
            <option value="honeymoon">Honeymoon</option>
          </select>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiSearch className="mr-2 h-4 w-4" />
          Cari
        </button>
      </div>
    </div>
  );
};
