import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi, getBackendOrigin } from '../../../services/api'

const CATEGORIES = [
  'Domestik',
  'Internasional',
  'Haji & Umroh',
  'Private Tour'
];

export default function EditPackagePage() {
  const params = useParams()
  const navigate = useNavigate()
  const id = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [pkg, setPkg] = useState<any>(null)
  
  // Form states
  const [form, setForm] = useState({
    title: '',
    location: '',
    category: '',
    duration_days: 1,
    price_per_person: 0,
    short_description: '',
    description: '',
    itinerary: '',
    facilities: ''
  })
  
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [primaryImageEditFile, setPrimaryImageEditFile] = useState<File | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleQuota, setScheduleQuota] = useState<number>(10)

  const load = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await adminApi.getPackageById(id)
      setPkg(data)
      
      // Update form with package data
      if (data) {
        setForm({
          title: data.title || '',
          location: data.location || '',
          category: data.category || '',
          duration_days: Number(data.duration_days) || 1,
          price_per_person: Number((data as any).price_per_person ?? data.price ?? 0),
          short_description: (data as any).short_description || '',
          description: data.description || '',
          itinerary: (data as any).itinerary || '',
          facilities: (data as any).facilities || ''
        })
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal memuat paket')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) load() }, [id])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => {
      // For number fields, ensure we store them as numbers
      if (name === 'duration_days' || name === 'price_per_person') {
        // Remove any non-numeric characters and convert to number
        const numericValue = Number(value.toString().replace(/\D/g, '')) || 0;
        return {
          ...prev,
          [name]: numericValue
        };
      }
      
      // For other fields, just update as is
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      await adminApi.updatePackage(id, {
        ...form,
        price_per_person: Number(form.price_per_person),
        duration_days: Number(form.duration_days),
        primary_image_file: primaryImageEditFile || undefined
      });
      setPrimaryImageEditFile(null);
      // Reset input file if it exists
      const fileInput = document.getElementById('primary-image-edit') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await load();
      alert('Perubahan berhasil disimpan');
    } catch (e: any) {
      alert(e?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    try {
      if (!imageFile && !imageUrl) {
        alert('Pilih file gambar atau masukkan URL gambar');
        return;
      }
      await adminApi.addImage(id, imageFile || imageUrl, false)
      setImageUrl('')
      setImageFile(null)
      // Reset input file
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await load()
    } catch (e: any) {
      alert(e?.message || 'Gagal menambah gambar')
    }
  }

  const addSchedule = async () => {
    try {
      await adminApi.addSchedule(id, scheduleDate, scheduleQuota)
      setScheduleDate('')
      setScheduleQuota(10)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Gagal menambah jadwal')
    }
  }

  return (
    <div className="p-6">
      <button onClick={()=>navigate('/admin/packages')} className="mb-4 px-3 py-2 rounded-md border">Kembali</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Layanan</h1>
      {errorMsg && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>}
      {loading ? (
        <div>Memuat...</div>
      ) : !pkg ? (
        <div>Paket tidak ditemukan</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Layanan</label>
                <input 
                  name="title"
                  type="text"
                  className="w-full border rounded-md px-3 py-2" 
                  value={form.title} 
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input 
                  name="location"
                  type="text"
                  className="w-full border rounded-md px-3 py-2" 
                  value={form.location} 
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  name="category"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  <option value="">Pilih Kategori</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (hari)</label>
                <input 
                  name="duration_days"
                  type="number" 
                  min="1"
                  className="w-full border rounded-md px-3 py-2" 
                  value={form.duration_days} 
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga per Hari (IDR)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    name="price_per_person"
                    type="number"
                    min="0"
                    step="1000"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                    value={form.price_per_person}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/hari</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Gambar Utama (Thumbnail)</label>
                <input 
                  id="primary-image-edit"
                  type="file" 
                  accept="image/*"
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setPrimaryImageEditFile(e.target.files[0]);
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">Pilih file baru untuk mengganti gambar utama paket ini.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Deskripsi</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
              <textarea
                name="short_description"
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                value={form.short_description}
                onChange={handleFormChange}
                placeholder="Deskripsi singkat yang akan ditampilkan di halaman daftar layanan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
              <textarea
                name="description"
                rows={5}
                className="w-full border rounded-md px-3 py-2"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Deskripsi lengkap layanan travel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary</label>
              <textarea
                name="itinerary"
                rows={6}
                className="w-full border rounded-md px-3 py-2"
                value={form.itinerary}
                onChange={handleFormChange}
                placeholder="Tuliskan detail itinerary perjalanan. Gunakan baris baru untuk setiap poin."
              />
              <p className="mt-1 text-xs text-gray-500">Gunakan baris baru untuk setiap poin itinerary</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas</label>
              <textarea
                name="facilities"
                rows={4}
                className="w-full border rounded-md px-3 py-2"
                value={form.facilities}
                onChange={handleFormChange}
                placeholder="Tuliskan fasilitas yang didapatkan. Gunakan baris baru untuk setiap fasilitas."
              />
              <p className="mt-1 text-xs text-gray-500">Gunakan baris baru untuk setiap fasilitas</p>
            </div>
            <div className="pt-4">
              <button 
                onClick={saveChanges} 
                disabled={saving}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Gambar Utama</h2>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(pkg?.images || []).map((img: any) => (
                    <div key={img.id} className={`border rounded-md overflow-hidden ${img.is_primary ? 'ring-2 ring-indigo-500' : ''}`}>
                      <img 
                        src={img.image_url.startsWith('/') ? `${getBackendOrigin()}${encodeURI(img.image_url)}` : img.image_url} 
                        alt="Gambar layanan" 
                        className="w-full h-32 object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src.indexOf('placeholder-package.svg') === -1) {
                            target.src = '/admin/images/placeholder-package.svg';
                          }
                        }}
                      />
                      <div className="p-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {img.is_primary ? 'Gambar Utama' : ''}
                          </span>
                          <div className="flex space-x-1">
                            {!img.is_primary && (
                              <button 
                                onClick={async()=>{ 
                                  await adminApi.setPrimaryImage(id, img.id); 
                                  await load(); 
                                }} 
                                className="p-1 text-indigo-600 hover:text-indigo-800"
                                title="Jadikan gambar utama"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </button>
                            )}
                            <button 
                              onClick={async()=>{ 
                                if (confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
                                  await adminApi.deleteImage(img.id); 
                                  await load(); 
                                }
                              }} 
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Hapus gambar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Tambah Gambar Baru</h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="image-upload"
                      type="file" 
                      accept="image/*"
                      className="flex-1 border rounded-md px-3 py-2 text-sm" 
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <button 
                      onClick={addImage} 
                      disabled={!imageFile && !imageUrl}
                      className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Unggah & Tambah
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-xs text-gray-500 uppercase font-medium">Atau masukkan URL (opsional)</span>
                    </div>
                  </div>

                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2 text-sm" 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Format yang didukung: JPG, PNG, WEBP. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Jadwal Keberangkatan</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kuota</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(pkg?.schedules || []).map((s: any) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2">
                        {(() => {
                          const v = s.departure_date;
                          if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
                          try {
                            const d = new Date(v);
                            return d.toISOString().slice(0, 10);
                          } catch {
                            return String(v).slice(0, 10);
                          }
                        })()}
                      </td>
                      <td className="px-4 py-2">{s.available_quota}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={async()=>{ await adminApi.deleteSchedule(s.id); await load(); }} className="px-3 py-2 rounded-md bg-red-600 text-white">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-md font-medium mb-3">Tambah Jadwal Keberangkatan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full border rounded-md px-3 py-2" 
                    value={scheduleDate} 
                    onChange={e => setScheduleDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuota</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full border rounded-md px-3 py-2" 
                    value={scheduleQuota} 
                    onChange={e => setScheduleQuota(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addSchedule} 
                    disabled={!scheduleDate || scheduleQuota < 1}
                    className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tambah Jadwal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
