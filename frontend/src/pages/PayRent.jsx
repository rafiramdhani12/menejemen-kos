import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTenantById, useRecordPayment } from '../hooks/useTenant'; 

const PayRent = () => {
  const { id } = useParams(); // ✅ Mengambil ID Tenant dari URL dinamis Vite
  const navigate = useNavigate();

  // Memanggil hook untuk ambil data detail tenant & hook mutasi untuk bayar
  const { data: tenant, isLoading: isLoadingTenant } = useGetTenantById(id);
  const { mutate: recordPayment, isPending: isSubmitting } = useRecordPayment();

  const [formData, setFormData] = useState({
    periodMonth: '1 Bulan',
    paymentMethod: 'Cash',
    amount: '',
    notes: ''
  });

  // 🔄 EFFECT LOGIC: Hitung otomatis nominal bayar berdasarkan harga kamar tenant & durasi paket
  useEffect(() => {
    if (tenant && tenant.room) {
      let months = 1;
      if (formData.periodMonth.includes('3')) months = 3;
      else if (formData.periodMonth.includes('6')) months = 6;
      else if (formData.periodMonth.includes('1 Tahun')) months = 12;

      const totalAmount = tenant.room.pricePerMonth * months;
      
      setFormData(prev => ({
        ...prev,
        amount: totalAmount,
        notes: `Perpanjangan sewa Kamar ${tenant.room.roomNumber} untuk periode ${formData.periodMonth}`
      }));
    }
  }, [tenant, formData.periodMonth]);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isTransfer = formData.paymentMethod === 'Transfer Bank';

  // Format pesan WA konfirmasi perpanjangan sewa
  const buildWAMessage = () => {
    const hargaFormatted = `Rp ${Number(formData.amount).toLocaleString('id-ID')}`;
    return (
      `Halo Admin, saya *${tenant?.name || '-'}* ingin membayar sewa *Kamar ${tenant?.room?.roomNumber || '-'}* ` +
      `sebesar *${hargaFormatted}* untuk perpanjangan *${formData.periodMonth}*. Mohon konfirmasinya. Terima kasih 🙏`
    );
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();

    // Payload disesuaikan mentah-mentah agar klop dengan skema Model Transaction lu
    const transactionPayload = {
      tenant: id,
      room: tenant?.room?._id,
      tenantName: tenant?.name,
      amount: Number(formData.amount),
      notes: formData.notes,
      paymentMethod: formData.paymentMethod === 'Transfer Bank' ? 'Transfer' : 'Cash',
      status: 'Success' // Otomatis success karena dicatat manual oleh admin/owner
    };

    if (isTransfer) {
      const message = buildWAMessage();
      const wa_url = `https://wa.me/6281284418997?text=${encodeURIComponent(message)}`;
      window.open(wa_url, '_blank');
    }

    // Tembak API backend untuk save transaksi & majuin endDate tenant
    recordPayment(transactionPayload, {
      onSuccess: () => {
        alert('🎉 Pembayaran sewa berhasil dicatat! Masa tenggang sewa tenant otomatis diperpanjang.');
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Gagal memproses pembayaran:', error);
        alert(error.response?.data?.message || 'Terjadi kesalahan server saat memproses transaksi.');
      }
    });
  };

  if (isLoadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      <main className="flex-1 p-6 md:p-12 max-w-2xl mx-auto">
        
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-ghost btn-sm gap-2 normal-case mb-6 pl-0 hover:bg-transparent text-neutral/60 hover:text-primary transition-all"
        >
          ⬅️ Kembali ke Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral">Pembayaran & Perpanjang Sewa</h1>
          <p className="text-xs text-neutral/50 mt-1">
            Formulir pencatatan transaksi berkala sekaligus memperbarui tanggal jatuh tempo tenant secara otomatis.
          </p>
        </div>

        {/* INFO RINGKAS TENANT */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-5 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral/40">Nama Penghuni</span>
            <p className="text-base font-bold text-neutral">{tenant?.name}</p>
            <p className="text-xs text-neutral/60">Kamar: {tenant?.room?.roomNumber} ({tenant?.room?.type})</p>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral/40">Masa Sewa Saat Ini</span>
            <p className="text-xs text-neutral/80 mt-0.5">
              Selesai: <span className="font-semibold text-error">{new Date(tenant?.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
        </div>

        {/* CONTAINER FORM TRANSAKSI */}
        <form onSubmit={handleProcessPayment} className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 md:p-8 flex flex-col gap-6">
          
          <div className="form-control">
            <label className="label py-1 px-1"><span className="text-xs font-semibold text-emerald-800">Durasi Perpanjang</span></label>
            <select name="periodMonth" className="select select-bordered w-full text-sm h-11 border-emerald-200 bg-base-100" value={formData.periodMonth} onChange={handleOnChange} disabled={isSubmitting}>
              <option value="1 Bulan">1 Bulan (Normal)</option>
              <option value="3 Bulan">3 Bulan (Paket 3 Bln)</option>
              <option value="6 Bulan">6 Bulan (Paket 6 Bln)</option>
              <option value="1 Tahun">1 Tahun (Paket 12 Bln)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label py-1 px-1"><span className="text-xs font-semibold text-emerald-800">Total Tagihan (Auto-Calculate)</span></label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm text-emerald-600 font-bold">Rp</span>
              <input 
                type="number" 
                name="amount" 
                className="input input-bordered w-full pl-11 text-sm h-11 border-emerald-200 bg-base-200 font-bold text-neutral" 
                value={formData.amount} 
                readOnly 
                required 
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1 px-1"><span className="text-xs font-semibold text-emerald-800">Metode Pembayaran</span></label>
            <select name="paymentMethod" className="select select-bordered w-full text-sm h-11 border-emerald-200 bg-base-100" value={formData.paymentMethod} onChange={handleOnChange} disabled={isSubmitting}>
              <option value="Cash">Cash (Tunai)</option>
              <option value="Transfer Bank">Transfer Bank</option>
            </select>
          </div>

          {isTransfer && (
            <div className="bg-base-200 border border-dashed border-emerald-300 p-3 rounded-lg text-xs">
              <span className="font-bold text-emerald-700 block mb-1">💳 Mandiri Rekening Kos:</span>
              <p className="font-mono font-bold text-sm">4175-3191-93701</p>
              <p className="text-neutral/60">A/N Owner Kos</p>
            </div>
          )}

          <div className="form-control">
            <label className="label py-1 px-1"><span className="text-xs font-semibold text-neutral/80">Catatan Internal / Keterangan</span></label>
            <textarea 
              name="notes" 
              className="textarea textarea-bordered w-full text-sm min-h-[5rem]" 
              value={formData.notes} 
              onChange={handleOnChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-base-300 pt-6 mt-2">
            <button type="button" onClick={() => navigate('/dashboard')} disabled={isSubmitting} className="btn btn-ghost normal-case text-sm">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary text-sm font-medium px-8 normal-case text-white rounded-xl shadow-sm">
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : isTransfer ? (
                '📲 Kirim Bukti WA & Simpan'
              ) : (
                'Konfirmasi Bayar'
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default PayRent;