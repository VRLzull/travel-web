'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiCalendar, FiUsers, FiAlertCircle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface PackageInfo {
  id: string;
  title: string;
  price: number;
  location: string;
  duration: number;
}

interface BookingFormProps {
  packageData: PackageInfo;
}

export const BookingForm = ({ packageData }: BookingFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    participantCount: 1,
    departureDate: new Date(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalPrice = packageData.price * formData.participantCount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participantCount' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    
    if (formData.participantCount < 1) {
      newErrors.participantCount = 'Jumlah peserta minimal 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    const dateStr = formData.departureDate.toISOString().slice(0, 10);
    router.push(`/booking/${packageData.id}?date=${dateStr}&participants=${formData.participantCount}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Form Pemesanan Paket Wisata</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Pemesanan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Data Pemesan</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="fullName">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`pl-10 w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Nama lengkap sesuai KTP"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="email@contoh.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="mr-1" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="phone">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`pl-10 w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="mr-1" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="departureDate">
                      Tanggal Keberangkatan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={formData.departureDate}
                        onChange={(date: Date | null) => 
                          setFormData(prev => ({ ...prev, departureDate: date || prev.departureDate }))
                        }
                        minDate={new Date()}
                        className={`pl-10 w-full p-2 border rounded-md border-gray-300`}
                        dateFormat="dd MMMM yyyy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="participantCount">
                      Jumlah Peserta <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUsers className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="participantCount"
                        name="participantCount"
                        min="1"
                        value={formData.participantCount}
                        onChange={handleChange}
                        className={`pl-10 w-full p-2 border rounded-md ${errors.participantCount ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.participantCount && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="mr-1" /> {errors.participantCount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="notes">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Contoh: Ada anggota yang vegetarian, ada alergi tertentu, dll."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                </button>
              </form>
            </div>
          </div>

          {/* Ringkasan Pemesanan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pemesanan</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-medium text-gray-800">{packageData.title}</h3>
                <p className="text-sm text-gray-600">{packageData.location}</p>
                <p className="text-sm text-gray-600">Durasi: {packageData.duration} Hari</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per orang</span>
                  <span>{formatPrice(packageData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Peserta</span>
                  <span>{formData.participantCount} orang</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total Harga</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                <p>Pembayaran dapat dilakukan melalui transfer bank atau kartu kredit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
