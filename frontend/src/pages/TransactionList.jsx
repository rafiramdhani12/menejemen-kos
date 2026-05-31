import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTransactions } from '../hooks/useTransaction'; // Asumsi custom hook buat fetch semua transaksi

const TransactionList = () => {
  const navigate = useNavigate();
  const { data: transactions, isLoading, isError } = useGetTransactions();

  // Helper format tanggal (Tanggal + Jam Menit)
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // Helper badge warna untuk Status Transaksi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return <span className="badge badge-success badge-xs text-[10px] font-bold px-2 py-2 text-white">Success</span>;
      case 'Pending':
        return <span className="badge badge-warning badge-xs text-[10px] font-bold px-2 py-2 text-white">Pending</span>;
      case 'Failed':
        return <span className="badge badge-error badge-xs text-[10px] font-bold px-2 py-2 text-white">Failed</span>;
      default:
        return <span className="badge badge-ghost badge-xs text-[10px] font-bold px-2 py-2">{status}</span>;
    }
  };

  // Helper badge warna untuk Metode Pembayaran
  const getPaymentMethodBadge = (method) => {
    return method === 'Transfer' 
      ? <span className="badge badge-outline badge-info text-[10px] font-semibold px-2 py-1.5">💳 Transfer</span>
      : <span className="badge badge-outline badge-success text-[10px] font-semibold px-2 py-1.5">💵 Cash</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-error max-w-md shadow-sm">
          <span>❌ Gagal memuat riwayat transaksi. Coba refresh halaman.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral">
              Riwayat Transaksi Keuangan
            </h1>
            <p className="text-xs text-neutral/50 mt-1">
              Catatan mutasi uang masuk dari pembayaran awal check-in dan perpanjangan sewa penghuni.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-sm gap-2 normal-case text-neutral/60 hover:text-primary transition-all"
          >
            ⬅️ Kembali ke Dashboard
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full text-sm">
              
              {/* THEAD */}
              <thead className="bg-base-200 text-neutral/70 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Tanggal / Waktu</th>
                  <th>Nama Penghuni</th>
                  <th>Kamar</th>
                  <th>Jumlah Bayar</th>
                  <th>Metode</th>
                  <th>Keterangan / Notes</th>
                  <th className="pr-6 text-center">Status</th>
                </tr>
              </thead>

              {/* TBODY */}
              <tbody className="divide-y divide-base-200">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-base-200/50 transition-colors">
                      
                      {/* Tanggal Transaksi */}
                      <td className="py-4 pl-6 text-xs text-neutral/70 font-medium">
                        {formatTanggal(tx.createdAt)}
                      </td>

                      {/* Nama Tenant */}
                      <td className="font-bold text-neutral">
                        {tx.tenantName}
                      </td>

                      {/* Nomor Kamar */}
                      <td>
                        {tx.room ? (
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            #{tx.room.roomNumber || 'Kamar'}
                          </span>
                        ) : (
                          <span className="text-neutral/30 italic text-xs">N/A</span>
                        )}
                      </td>

                      {/* Nominal Uang */}
                      <td className="font-bold text-neutral">
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </td>

                      {/* Metode Pembayaran */}
                      <td>
                        {getPaymentMethodBadge(tx.paymentMethod)}
                      </td>

                      {/* Catatan / Notes */}
                      <td className="text-xs text-neutral/60 max-w-xs truncate" title={tx.notes}>
                        {tx.notes}
                      </td>

                      {/* Status Sukses/Pending */}
                      <td className="pr-6 text-center">
                        {getStatusBadge(tx.status)}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-neutral/40 italic">
                      Belum ada riwayat transaksi masuk.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default TransactionList;