import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../services/api'

export default function NewPackagePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    location: '',
    category: '',
    duration_days: 1,
    price_per_person: 0,
    primary_image: '',
    short_description: '',
    description: '',
    itinerary: '',
    facilities: '',
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    
    try {
      await adminApi.createPackage({
        ...form,
        duration_days: Number(form.duration_days),
        price_per_person: Number(form.price_per_person)
      })
      navigate('/admin/packages')
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal menyimpan paket')
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tambah Paket Wisata Baru</h1>
          <p className="mt-1 text-sm text-gray-500">Isi formulir di bawah untuk menambahkan paket wisata baru</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Paket</label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi</label>
                  <input
                    type="text"
                    id="location"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    id="category"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Domestik">Domestik</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Haji & Umroh">Haji & Umroh</option>
                    <option value="Private Tour">Private Tour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durasi (hari)</label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={form.duration_days}
                    onChange={(e) => setForm({...form, duration_days: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga per Orang (IDR)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
                      value={form.price_per_person}
                      onChange={(e) => setForm({...form, price_per_person: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="primary_image" className="block text-sm font-medium text-gray-700">URL Gambar Utama</label>
                <input
                  type="url"
                  id="primary_image"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.primary_image}
                  onChange={(e) => setForm({...form, primary_image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
                <textarea
                  id="short_description"
                  rows={2}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.short_description}
                  onChange={(e) => setForm({...form, short_description: e.target.value})}
                />
                <p className="mt-1 text-xs text-gray-500">Deskripsi singkat yang akan ditampilkan di halaman daftar paket</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Lengkap</label>
                <textarea
                  id="description"
                  rows={4}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
                <p className="mt-1 text-xs text-gray-500">Deskripsi lengkap paket wisata</p>
              </div>

              <div>
                <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700">Itinerary Perjalanan</label>
                <textarea
                  id="itinerary"
                  rows={6}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.itinerary}
                  onChange={(e) => setForm({...form, itinerary: e.target.value})}
                  placeholder="Contoh:\nHari 1: Penjemputan - Check-in Hotel\nHari 2: Tour Bromo - Sunrise - Kawah Bromo\n..."
                />
                <p className="mt-1 text-xs text-gray-500">Tuliskan detail itinerary perjalanan. Gunakan baris baru untuk setiap poin.</p>
              </div>

              <div>
                <label htmlFor="facilities" className="block text-sm font-medium text-gray-700">Fasilitas</label>
                <textarea
                  id="facilities"
                  rows={4}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.facilities}
                  onChange={(e) => setForm({...form, facilities: e.target.value})}
                  placeholder="Contoh:\n- Transportasi AC\n- Hotel Bintang 3\n- Makan 3x Sehari\n- ..."
                />
                <p className="mt-1 text-xs text-gray-500">Tuliskan fasilitas yang didapatkan. Gunakan baris baru untuk setiap fasilitas.</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate('/admin/packages')}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Paket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
