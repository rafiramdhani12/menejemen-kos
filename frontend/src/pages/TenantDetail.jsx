import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTenantDetail } from '../hooks/useTenantDetail';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tenant, isPending, isError } = useGetTenantDetail(id);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Edit Data</button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Kirim Notifikasi</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info & Room Card */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Identity Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 aurora-card p-8">
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
                <span className="text-indigo-200">Check-in</span>
                <span>{formatDate(tenant.startDate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-indigo-200">End Date</span>
                <span>{formatDate(tenant.endDate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-indigo-200">Sewa Bulanan</span>
                <span className="font-bold">{indonesianRupiah(tenant.roomDetail?.pricePerMonth || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment History */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 aurora-card p-8 lg:p-10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Riwayat Pembayaran</h2>
                <p className="text-xs font-medium text-slate-400">Daftar semua transaksi yang pernah dilakukan oleh penghuni.</p>
              </div>
              <button className="px-5 py-2.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 uppercase tracking-widest shadow-sm">Cetak Invoice</button>
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
                          <div className="font-bold text-slate-700">{tx.notes}</div>
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

          {/* Facility / Additional Info Section */}
          <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Fasilitas Kamar Terdaftar
            </h3>
            <div className="flex flex-wrap gap-2">
              {tenant.roomDetail?.facilities?.map((facility, i) => (
                <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                  ✓ {facility}
                </span>
              )) || <span className="text-slate-400 text-xs italic font-medium">Tidak ada fasilitas terdaftar</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TenantDetail;
