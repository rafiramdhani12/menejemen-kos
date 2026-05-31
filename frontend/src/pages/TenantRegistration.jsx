import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterTenant } from '../hooks/useTenant';
import { useGetAvailable } from '../hooks/useRoom';

const TenantRegistration = () => {
  const navigate = useNavigate();
  const { mutate: registerTenant, isPending } = useRegisterTenant();
  const { data: rooms, isLoading: isLoadingRooms } = useGetAvailable();

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    emergencyContact: '',
    room: '',
    startDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    periodMonth: '1 Bulan',
    paymentMethod: 'Cash',
  });

  // Auto-calculate harga berdasarkan kamar & periode
  useEffect(() => {
    if (formData.room && rooms) {
      const selectedRoom = rooms.find((kamar) => kamar._id === formData.room);
      if (selectedRoom) {
        let months = 1;
        if (formData.periodMonth.includes('3')) months = 3;
        else if (formData.periodMonth.includes('6')) months = 6;
        else if (formData.periodMonth.includes('1 Tahun')) months = 12;

        setFormData((prev) => ({
          ...prev,
          amountPaid: selectedRoom.pricePerMonth * months,
        }));
      }
    }
  }, [formData.room, formData.periodMonth, rooms]);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ambil label kamar yang readable untuk WA message
  const getSelectedRoomLabel = () => {
    if (!formData.room || !rooms) return '-';
    const selectedRoom = rooms.find((kamar) => kamar._id === formData.room);
    return selectedRoom
      ? `Kamar ${selectedRoom.roomNumber} (${selectedRoom.type})`
      : '-';
  };

  const buildWAMessage = () => {
    const roomLabel = getSelectedRoomLabel();
    const harga = formData.amountPaid
      ? `Rp ${Number(formData.amountPaid).toLocaleString('id-ID')}`
      : '-';

    return (
      `Halo Admin, saya *${formData.name || '-'}* ingin mendaftar *${roomLabel}* ` +
      `dengan harga *${harga}* untuk periode *${formData.periodMonth}* ` +
      `dengan metode pembayaran *${formData.paymentMethod}*. Mohon konfirmasinya. Terima kasih 🙏`
    );
  };

  const handleSubmitCash = (e) => {
    e.preventDefault();
    registerTenant(formData, {
      onSuccess: (data) => {
        console.log('Response sukses dari server:', data);
        alert('🎉 Sukses! Data penghuni baru dan transaksi awal berhasil dicatat!');
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Gagal mendaftarkan tenant:', error);
        alert(
          error.response?.data?.message ||
            'Terjadi kesalahan, periksa kembali data input!'
        );
      },
    });
  };

  const handleSubmitTransfer = (e) => {
    e.preventDefault();

    // Validasi manual field wajib sebelum buka WA
    if (
      !formData.name ||
      !formData.nik ||
      !formData.phone ||
      !formData.emergencyContact ||
      !formData.room ||
      !formData.amountPaid
    ) {
      alert('Lengkapi semua data terlebih dahulu sebelum mengirim konfirmasi ke WhatsApp.');
      return;
    }

    const message = buildWAMessage();
    const wa_url = `https://wa.me/6281284418997?text=${encodeURIComponent(message)}`;
    window.open(wa_url, '_blank');

    // Tetap simpan data ke server setelah buka WA
    registerTenant(formData, {
      onSuccess: () => {
        alert('✅ Data berhasil disimpan! Konfirmasi transfer sudah dikirim via WhatsApp.');
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Gagal menyimpan data:', error);
        alert(
          error.response?.data?.message ||
            'WhatsApp sudah terbuka, tapi data gagal tersimpan. Coba simpan ulang.'
        );
      },
    });
  };

  const isTransfer = formData.paymentMethod === 'Transfer Bank';

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      <main className="flex-1 p-6 md:p-12 max-w-3xl mx-auto">

        {/* Tombol Kembali */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost btn-sm gap-2 normal-case mb-6 pl-0 hover:bg-transparent text-neutral/60 hover:text-primary transition-all"
        >
          ⬅️ Kembali ke Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral">
            Check-In Penghuni Baru
          </h1>
          <p className="text-xs text-neutral/50 mt-1">
            Satu formulir untuk mendaftarkan identitas penyewa sekaligus mencatat
            invoice pembayaran bulan pertama secara instan.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={isTransfer ? handleSubmitTransfer : handleSubmitCash}
          className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 md:p-8 flex flex-col gap-8"
        >

          {/* BAGIAN 1: DATA DIRI */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
              1. Profil Identitas Penghuni
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="form-control sm:col-span-2">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">Nama Lengkap Penyewa</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama sesuai KTP"
                  className="input input-bordered w-full text-sm h-11"
                  value={formData.name}
                  onChange={handleOnChange}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">NIK (Nomor Induk Kependudukan)</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  placeholder="16 Digit nomor NIK"
                  className="input input-bordered w-full text-sm h-11"
                  value={formData.nik}
                  onChange={handleOnChange}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">Nomor Telepon / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Contoh: 08123456789"
                  className="input input-bordered w-full text-sm h-11"
                  value={formData.phone}
                  onChange={handleOnChange}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">Kontak Darurat (Kerabat/Orang Tua)</span>
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  placeholder="Nama & No. HP kerabat"
                  className="input input-bordered w-full text-sm h-11"
                  value={formData.emergencyContact}
                  onChange={handleOnChange}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">Alokasi Kamar Kos</span>
                </label>
                <select
                  name="room"
                  className="select select-bordered w-full text-sm h-11 min-h-[2.75rem]"
                  value={formData.room}
                  onChange={handleOnChange}
                  disabled={isPending || isLoadingRooms}
                  required
                >
                  <option value="" disabled>
                    {isLoadingRooms ? 'Memuat kamar...' : 'Pilih nomor kamar...'}
                  </option>
                  {rooms?.map((kamar) => (
                    <option key={kamar._id} value={kamar._id}>
                      Kamar {kamar.roomNumber} ({kamar.type}) — Rp{' '}
                      {kamar.pricePerMonth.toLocaleString('id-ID')}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-neutral/80">Tanggal Mulai Sewa (Check-In)</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="input input-bordered w-full text-sm h-11"
                  value={formData.startDate}
                  onChange={handleOnChange}
                  disabled={isPending}
                  required
                />
              </div>

            </div>
          </div>

          <div className="border-t border-base-300"></div>

          {/* BAGIAN 2: PEMBAYARAN */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4">
              2. Detail Transaksi Pembayaran Pertama
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-emerald-50/30 p-5 rounded-xl border border-emerald-100">

              <div className="form-control sm:col-span-2">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-emerald-800">Durasi / Periode Sewa</span>
                </label>
                <select
                  name="periodMonth"
                  className="select select-bordered w-full text-sm h-11 min-h-[2.75rem] border-emerald-200 bg-base-100"
                  value={formData.periodMonth}
                  onChange={handleOnChange}
                  disabled={isPending}
                >
                  <option value="1 Bulan">1 Bulan (Normal)</option>
                  <option value="3 Bulan">3 Bulan (Paket 3 Bln)</option>
                  <option value="6 Bulan">6 Bulan (Paket 6 Bln)</option>
                  <option value="1 Tahun">1 Tahun (Paket 12 Bln)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-emerald-800">
                    Jumlah Yang Dibayar (Auto-Calculate)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm text-emerald-600 font-bold">Rp</span>
                  <input
                    type="number"
                    name="amountPaid"
                    placeholder="Pilih kamar & periode sewa..."
                    className="input input-bordered w-full pl-11 text-sm h-11 border-emerald-200 focus:border-emerald-500 bg-base-100 font-medium text-neutral"
                    value={formData.amountPaid}
                    onChange={handleOnChange}
                    disabled={isPending}
                    required
                  />
                </div>
                <label className="label py-0.5 px-1">
                  <span className="text-[10px] text-neutral/40">
                    Sistem mendeteksi otomatis harga sewa. Anda tetap bisa mengubah nilai jika ada diskon khusus.
                  </span>
                </label>
              </div>

              <div className="form-control hidden">
                <label className="label py-1 px-1">
                  <span className="text-xs font-semibold text-emerald-800">Metode Pembayaran</span>
                </label>
                <select
                  name="paymentMethod"
                  className="select select-bordered w-full text-sm h-11 min-h-[2.75rem] border-emerald-200 bg-base-100"
                  value={formData.paymentMethod}
                  onChange={handleOnChange}
                  disabled={isPending}
                >
                  <option value="Cash">Cash (Tunai)</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                </select>
              </div>

              {/* Info rekening — muncul saat Transfer Bank */}
              {isTransfer && (
                <div className="form-control sm:col-span-2 bg-base-100 border border-dashed border-emerald-300 p-3 rounded-lg mt-2">
                  <span className="text-[11px] uppercase font-bold text-emerald-700 tracking-wider block mb-1">
                    Informasi Rekening Kos:
                  </span>
                  <p className="text-sm font-mono font-bold text-neutral">4175-3191-93701</p>
                  <p className="text-xs text-neutral/70">Bank Mandiri A/N Owner Kos</p>
                  <p className="text-[10px] text-emerald-600 mt-2">
                    ✅ Tombol di bawah akan membuka WhatsApp dengan pesan konfirmasi transfer otomatis.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* ACTION BUTTONS */}
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
              ) : isTransfer ? (
                '📲 Kirim Konfirmasi WA & Simpan'
              ) : (
                'Finalisasi Pendaftaran'
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default TenantRegistration;