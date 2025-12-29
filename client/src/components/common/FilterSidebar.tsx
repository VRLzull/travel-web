'use client';

import React, { useMemo, useState } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiMapPin, FiDollarSign, FiCalendar, FiTag } from 'react-icons/fi';

type PriceRange = [number, number];

interface FilterSidebarProps {
  locations: string[];
  categories: string[];
  durations: number[];
  onApply: (filters: {
    locations: string[];
    categories: string[];
    minPrice: number;
    maxPrice: number;
    durationDays?: number | null;
  }) => void;
  onReset: () => void;
}

export const FilterSidebar = ({ locations, categories, durations, onApply, onReset }: FilterSidebarProps) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>([0, 10000000]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const priceMaxFromData = useMemo(() => Math.max(10000000, ...[...locations, ...categories].map(() => 0)), [locations, categories]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Mobile filter header */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter</h3>
        <button
          type="button"
          className="-mr-2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-500"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        >
          <span className="sr-only">Filter</span>
          {isMobileFilterOpen ? (
            <FiX className="h-6 w-6" aria-hidden="true" />
          ) : (
            <FiFilter className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Desktop filter content */}
      <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}>
        {/* Location Filter */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleSection('location')}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700"
          >
            <span className="flex items-center">
              <FiMapPin className="mr-2 h-5 w-5 text-gray-400" />
              Lokasi
            </span>
            {openSection === 'location' ? (
              <FiChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {openSection === 'location' && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Cari lokasi..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="max-h-60 overflow-y-auto">
                {locations.map((location) => (
                  <div key={location} className="flex items-center mt-2">
                    <input
                      id={`location-${location}`}
                      name="location"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedLocations.includes(location)}
                      onChange={(e) => {
                        setSelectedLocations((prev) => e.target.checked ? [...prev, location] : prev.filter((l) => l !== location));
                      }}
                    />
                    <label htmlFor={`location-${location}`} className="ml-3 text-sm text-gray-600">
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700"
          >
            <span className="flex items-center">
              <FiDollarSign className="mr-2 h-5 w-5 text-gray-400" />
              Harga
            </span>
            {openSection === 'price' ? (
              <FiChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {openSection === 'price' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              <input
                type="range"
                min="0"
                max={priceMaxFromData}
                step="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Duration Filter */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleSection('duration')}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700"
          >
            <span className="flex items-center">
              <FiCalendar className="mr-2 h-5 w-5 text-gray-400" />
              Durasi
            </span>
            {openSection === 'duration' ? (
              <FiChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {openSection === 'duration' && (
            <div className="mt-2 space-y-2">
              {durations.map((duration) => (
                <div key={String(duration)} className="flex items-center">
                  <input
                    id={`duration-${duration}`}
                    name="duration"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedDuration === Number(duration)}
                    onChange={() => setSelectedDuration(Number(duration))}
                  />
                  <label htmlFor={`duration-${duration}`} className="ml-3 text-sm text-gray-600">
                    {Number(duration) >= 7 ? '7+ Hari' : `${duration} Hari`}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700"
          >
            <span className="flex items-center">
              <FiTag className="mr-2 h-5 w-5 text-gray-400" />
              Kategori
            </span>
            {openSection === 'category' ? (
              <FiChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {openSection === 'category' && (
            <div className="mt-2 space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id={`category-${category}`}
                      name="category"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        setSelectedCategories((prev) => e.target.checked ? [...prev, category] : prev.filter((c) => c !== category));
                      }}
                    />
                    <label htmlFor={`category-${category}`} className="ml-3 text-sm text-gray-600">
                      {category}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500"></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply and Reset Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onApply({
              locations: selectedLocations,
              categories: selectedCategories,
              minPrice: priceRange[0],
              maxPrice: priceRange[1],
              durationDays: selectedDuration,
            })}
          >
            Terapkan Filter
          </button>
          <button
            type="button"
            className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              setSelectedLocations([]);
              setSelectedCategories([]);
              setSelectedDuration(null);
              setPriceRange([0, 10000000]);
              onReset();
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
