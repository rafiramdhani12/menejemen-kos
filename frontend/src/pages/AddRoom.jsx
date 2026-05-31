import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoom } from '../hooks/useRoom';

const AddRoom = () => {
  const navigate = useNavigate();
  const { mutate: createRoom, isPending } = useCreateRoom();

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Regular', 
    size: '',
    pricePerMonth: '',
    status: 'available', 
    description: ''
  });

  // State terpisah untuk menampung array of strings 'facilities'
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Daftar fasilitas standar kosan modern buat opsi checkbox
  const availableFacilities = ['AC', 'Kamar Mandi Dalam', 'Kasur Kasur Kasur', 'Lemari Pakaian', 'WiFi', 'Meja Kerja', 'Water Heater'];

  const handleOnChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handler khusus checkbox fasilitas
  const handleFacilityChange = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Bungkus semua data termasuk array facilities menjadi satu payload sesuai skema Mongoose
    const payload = {
      ...formData,
      pricePerMonth: Number(formData.pricePerMonth), // Pastikan formatnya Number sesuai schema
      facilities: selectedFacilities
    };

    createRoom(payload, {
      onSuccess: (data) => {
        console.log("Kamar berhasil dibuat:", data);
        alert("🎉 Kamar baru berhasil ditambahkan ke sistem!");
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error("Gagal menambahkan kamar:", error);
        alert(error.response?.data?.message || "Gagal menyimpan data, periksa kembali inputan.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      
      <main className="flex-1 p-6 md:p-12 max-w-3xl mx-auto">
        
        {/* Tombol Back */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-ghost btn-sm gap-2 normal-case mb-6 pl-0 hover:bg-transparent text-neutral/60 hover:text-primary transition-all"
        >
          ⬅️ Kembali ke Dashboard
        </button>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral">Tambah Unit Kamar Baru</h1>
          <p className="text-xs text-neutral/50 mt-1">
            Gunakan formulir ini untuk mendaftarkan aset kamar baru ke dalam database sistem operasional.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 md:p-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. NOMOR KAMAR (roomNumber) */}
            <div className="form-control">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Nomor Kamar</span>
              </label>
              <input 
                type="text" 
                name="roomNumber"
                placeholder="Contoh: A102, B205" 
                className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 transition-all"
                value={formData.roomNumber}
                onChange={handleOnChange}
                disabled={isPending}
                required 
              />
            </div>

            {/* 2. TIPE KAMAR (type - Enum) */}
            <div className="form-control">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Tipe Kelas Kamar</span>
              </label>
              <select 
                name="type"
                className="select select-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 min-h-[2.75rem] transition-all"
                value={formData.type}
                onChange={handleOnChange}
                disabled={isPending}
                required
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
              </select>
            </div>

            {/* 3. UKURAN KAMAR (size) */}
            <div className="form-control">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Dimensi / Ukuran Kamar</span>
              </label>
              <input 
                type="text" 
                name="size"
                placeholder="Contoh: 3x4 m, 4x5 m" 
                className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 transition-all"
                value={formData.size}
                onChange={handleOnChange}
                disabled={isPending}
                required 
              />
            </div>

            {/* 4. HARGA PER BULAN (pricePerMonth) */}
            <div className="form-control">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Tarif Sewa (Per Bulan)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm text-neutral/40 font-medium">Rp</span>
                <input 
                  type="number" 
                  name="pricePerMonth"
                  placeholder="Contoh: 1500000" 
                  className="input input-bordered w-full pl-11 bg-base-100 border-base-300 focus:border-primary text-sm h-11 transition-all"
                  value={formData.pricePerMonth}
                  onChange={handleOnChange}
                  disabled={isPending}
                  min="0"
                  required 
                />
              </div>
            </div>

            {/* 5. STATUS KONDISI KAMAR (status - Enum) */}
            <div className="form-control sm:col-span-2 hidden">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Status Kamar Awal</span>
              </label>
              <select 
                name="status"
                className="select select-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 min-h-[2.75rem] transition-all"
                value={formData.status}
                onChange={handleOnChange}
                disabled={isPending}
                required
              >
                <option value="available">Tersedia (Kosong)</option>
                <option value="occupied">Terisi (Ada Penghuni)</option>
                <option value="maintenance">Dalam Perbaikan (Maintenance)</option>
              </select>
            </div>

            {/* 6. FASILITAS (facilities - Array of Strings Checkbox) */}
            <div className="form-control sm:col-span-2 mt-2">
              <label className="label py-1 px-1 mb-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Fasilitas Kamar Yang Tersedia</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-base-200/50 p-4 rounded-xl border border-base-300">
                {availableFacilities.map((facility, index) => (
                  <label key={index} className="label cursor-pointer justify-start gap-3 p-1">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm rounded-md" 
                      checked={selectedFacilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      disabled={isPending}
                    />
                    <span className="text-xs font-medium text-neutral/70">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 7. DESKRIPSI TAMBAHAN (description) */}
            <div className="form-control sm:col-span-2">
              <label className="label py-1 px-1">
                <span className="text-xs font-semibold tracking-wide text-neutral/80">Deskripsi / Catatan Tambahan</span>
              </label>
              <textarea 
                name="description"
                placeholder="Tuliskan catatan khusus kamar jika ada (misal: AC merk Daikin, dekat tangga, token listrik mandiri)..." 
                className="textarea textarea-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-24 resize-none transition-all"
                value={formData.description}
                onChange={handleOnChange}
                disabled={isPending}
              />
            </div>

          </div>

          {/* BUTTON ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-base-300 pt-6 mt-4">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              disabled={isPending}
              className="btn btn-ghost normal-case text-sm tracking-wide"
            >
              Batalkan
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="btn btn-primary text-sm font-medium px-8 normal-case tracking-wide text-white rounded-xl shadow-sm"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Simpan Kamar"
              )}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
};

export default AddRoom;