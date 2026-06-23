import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTenantDetail } from '../hooks/useTenantDetail';
import { useUpdateTenant } from '../hooks/useTenant'; 
import { usePayRent } from '../hooks/useTransaction'; // 👈 ✅ INTEGRASI: Import Custom Hook baru lo di sini
import { useQueryClient } from '@tanstack/react-query';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tenant, isPending, isError } = useGetTenantDetail(id);

  // Panggil Custom Hook Update Tenant
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant();
  
  // 👈 ✅ INTEGRASI: Gunakan Custom Hook Pembayaran Baru
  const { mutate: payRent, isPending: isPayingRent } = usePayRent();

  // State Kontrol Modal Bayar Sewa
  const [showPayModal, setShowPayModal] = useState(false);
  const [payDuration, setPayDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // ================= STATE MODAL EDIT DATA =================
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    emergencyContact: ''
  });

  // Sinkronisasi data awal tenant ke dalam form edit saat data berhasil di-fetch
  useEffect(() => {
    if (tenant) {
      setEditFormData({
        name: tenant.name || '',
        nik: tenant.nik || '',
        phone: tenant.phone || '',
        emergencyContact: tenant.emergencyContact || ''
      });
    }
  }, [tenant]);

  const indonesianRupiah = (value) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center">
        <h2 className="text-xl font-black text-rose-600 mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-rose-400 mb-6 font-medium">Data penyewa tidak dapat ditemukan atau terjadi gangguan pada server.</p>
        <button onClick={() => navigate('/dashboard/tenants')} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs">Kembali ke Daftar</button>
      </div>
    );
  }

  const rentPricePerMonth = tenant.roomDetail?.pricePerMonth || 0;
  const totalAmountToPay = rentPricePerMonth * payDuration;

  // 👈 ✅ INTEGRASI: Gunakan handler yang memicu custom hook `payRent`
  const handleConfirmPayment = (e) => {
    e.preventDefault();
    payRent(
      {
        tenantId: id,
        durationMonths: payDuration,
        amountPaid: totalAmountToPay,
        paymentMethod: paymentMethod
      },
      {
        onSuccess: () => {
          alert("🎉 Pembayaran sewa berhasil dicatat & masa sewa diperpanjang!");
          setShowPayModal(false);
          setPayDuration(1);
        },
        onError: (error) => {
          alert(error.response?.data?.message || "Gagal memproses pembayaran");
        }
      }
    );
  };

  // Handler Menggunakan Custom Hook Update Baru
  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateTenant(
      { id, updatedData: editFormData }, 
      {
        onSuccess: () => {
          alert("🎉 Data penghuni berhasil diperbarui!");
          setShowEditModal(false);
        },
        onError: (error) => {
          alert(error.response?.data?.message || "Gagal memperbarui data penghuni");
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2 md:p-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors mb-2"
          >
            ← Kembali
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Profil Penghuni</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {tenant.status === 'active' && (
            <button 
              onClick={() => setShowPayModal(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              💵 Bayar Sewa Bulanan
            </button>
          )}
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            Edit Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info & Room Card */}
        <div className="lg:col-span-1 space-y-8">
          {/* Identity Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-500 mb-4 border-4 border-indigo-100">
                {tenant.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{tenant.name.toUpperCase()}</h2>
              <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                tenant.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {tenant.status === 'active' ? 'Active Resident' : 'Moved Out'}
              </span>
            </div>
            
            <div className="space-y-5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIK (KTP)</span>
                <span className="text-sm font-bold text-slate-700">{tenant.nik}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp / Phone</span>
                <span className="text-sm font-bold text-slate-700">{tenant.phone || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</span>
                <span className="text-sm font-bold text-slate-700">{tenant.emergencyContact || '-'}</span>
              </div>
            </div>
          </div>

          {/* Room Details Card */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-lg text-white font-bold tracking-tight mb-6">Informasi Kamar</h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="text-5xl font-black tracking-tighter text-indigo-200">
                #{tenant.roomDetail?.roomNumber}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Tipe Unit</span>
                <span className="text-lg font-black">{tenant.roomDetail?.type}</span>
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-indigo-500/50">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-indigo-200">Check-in Awal</span>
                <span>{formatDate(tenant.startDate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-indigo-200 font-bold">Jatuh Tempo Berikutnya</span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs">{formatDate(tenant.endDate)}</span>
              </div>
              <div className="divider my-1 border-indigo-500/50"></div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-indigo-200">Biaya / Bulan</span>
                <span className="font-bold">{indonesianRupiah(rentPricePerMonth)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 lg:p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Riwayat Pembayaran</h2>
                <p className="text-xs font-medium text-slate-400">Daftar semua transaksi yang pernah dilakukan oleh penghuni.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-indigo-400 uppercase text-[10px] tracking-[0.2em]">
                    <th className="py-4 font-black bg-transparent">Keterangan / Notes</th>
                    <th className="py-4 font-black bg-transparent">Metode</th>
                    <th className="py-4 font-black bg-transparent text-right">Nominal</th>
                    <th className="py-4 font-black bg-transparent text-right">Tanggal Bayar</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {tenant.paymentHistory?.length > 0 ? (
                    tenant.paymentHistory.map((tx) => (
                      <tr key={tx._id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                        <td className="py-5">
                          <div className="font-bold text-slate-700">{tx.description || tx.notes || "Sewa Bulanan"}</div>
                        </td>
                        <td className="py-5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-100 rounded-md">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-5 text-right font-black text-slate-900">
                          {indonesianRupiah(tx.amount)}
                        </td>
                        <td className="py-5 text-slate-500 text-right font-medium">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <p className="text-slate-400 font-medium italic">Belum ada riwayat transaksi untuk penghuni ini.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DIALOG POP-UP EDIT DATA ================= */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md rounded-3xl p-6">
            <h3 className="font-black text-xl text-slate-900 tracking-tight mb-2">📝 Ubah Data Penghuni</h3>
            <p className="text-xs text-slate-400 mb-6">Pastikan data identitas penyewa di bawah ini valid.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK (No. KTP)</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl font-mono text-sm"
                  value={editFormData.nik}
                  onChange={(e) => setEditFormData({ ...editFormData, nik: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">No. WhatsApp / HP</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak Darurat</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={editFormData.emergencyContact}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                />
              </div>

              <div className="modal-action flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="btn btn-sm btn-ghost rounded-xl normal-case"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingTenant} 
                  className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 normal-case"
                >
                  {isUpdatingTenant ? <span className="loading loading-spinner loading-xs"></span> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DIALOG POP-UP BAYAR SEWA ================= */}
      {showPayModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md rounded-3xl p-6">
            <h3 className="font-black text-xl text-slate-900 tracking-tight mb-2">💵 Pencatatan Uang Sewa</h3>
            <p className="text-xs text-slate-400 mb-6">Perbarui jatuh tempo bulanan untuk <strong>{tenant.name.toUpperCase()}</strong>.</p>
            
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi Pembayaran</label>
                <select 
                  className="select select-bordered w-full rounded-xl font-semibold text-sm" 
                  value={payDuration} 
                  onChange={(e) => setPayDuration(Number(e.target.value))}
                >
                  <option value={1}>1 Bulan</option>
                  <option value={2}>2 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan (Setengah Tahun)</option>
                  <option value={12}>12 Bulan (1 Tahun)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran</label>
                <select 
                  className="select select-bordered w-full rounded-xl font-semibold text-sm" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">💵 Tunai / Cash</option>
                  <option value="Transfer">🏦 Transfer Bank</option>
                </select>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs font-semibold text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span>Sewa Bulanan:</span>
                  <span>{indonesianRupiah(rentPricePerMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Multiplier:</span>
                  <span>x {payDuration} Bulan</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>Total Penerimaan:</span>
                  <span className="text-emerald-600">{indonesianRupiah(totalAmountToPay)}</span>
                </div>
              </div>

              <div className="modal-action flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)} 
                  className="btn btn-sm btn-ghost rounded-xl normal-case"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPayingRent} 
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 normal-case"
                >
                  {isPayingRent ? <span className="loading loading-spinner loading-xs"></span> : "Konfirmasi & Perpanjang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetail;