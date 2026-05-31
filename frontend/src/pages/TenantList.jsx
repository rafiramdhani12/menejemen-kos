import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTenants } from '../hooks/useTenant'; // Asumsi custom hook buat fetch semua tenant

const TenantList = () => {
  const navigate = useNavigate();
  const { data: tenants, isLoading, isError } = useGetTenants();

  // Fungsi helper buat ngerapihin format tanggal di table
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <span>❌ Gagal memuat data penghuni. Coba refresh halaman.</span>
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
              Daftar Penghuni Kos
            </h1>
            <p className="text-xs text-neutral/50 mt-1">
              Manajemen data diri penyewa, nomor kamar, masa berlaku sewa, dan status aktif.
            </p>
          </div>
          <button
            onClick={() => navigate('/check-in')}
            className="btn btn-primary btn-sm text-xs font-semibold px-4 normal-case text-white rounded-xl shadow-sm"
          >
            ➕ Check-In Penghuni Baru
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full text-sm">
              
              {/* THEAD / JUDUL KOLOM */}
              <thead className="bg-base-200 text-neutral/70 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Nama / NIK</th>
                  <th>Kamar</th>
                  <th>No. Telepon</th>
                  <th>Mulai Sewa</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th className="pr-6 text-center">Aksi</th>
                </tr>
              </thead>

              {/* TBODY / ISI DATA */}
              <tbody className="divide-y divide-base-200">
                {tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-base-200/50 transition-colors">
                      
                      {/* Nama & NIK */}
                      <td className="py-4 pl-6">
                        <div className="font-bold text-neutral">{tenant.name}</div>
                        <div className="text-[11px] text-neutral/40 font-mono tracking-wide mt-0.5">
                          NIK: {tenant.nik}
                        </div>
                      </td>

                      {/* Info Kamar */}
                      <td>
                        {tenant.room ? (
                          <span className="badge badge-sm font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-3">
                            Kamar {tenant.room.roomNumber}
                          </span>
                        ) : (
                          <span className="text-neutral/30 italic text-xs">Tanpa Kamar</span>
                        )}
                      </td>

                      {/* No HP */}
                      <td className="font-mono text-xs text-neutral/80">
                        {tenant.phone}
                      </td>

                      {/* Tanggal Masuk */}
                      <td className="text-xs text-neutral/70">
                        {formatTanggal(tenant.startDate)}
                      </td>

                      {/* Tanggal Keluar */}
                      <td className="text-xs font-medium">
                        <span className={tenant.status === 'active' ? 'text-error' : 'text-neutral/40'}>
                          {formatTanggal(tenant.endDate)}
                        </span>
                      </td>

                      {/* Status Aktif */}
                      <td>
                        {tenant.status === 'active' ? (
                          <span className="badge badge-success badge-xs gap-1 text-[10px] font-bold px-2 py-2 text-white">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-xs gap-1 text-[10px] font-bold px-2 py-2 text-neutral/40 bg-base-200">
                            Moved Out
                          </span>
                        )}
                      </td>

                      {/* Tombol Navigasi Bayar */}
                      <td className="pr-6 text-center">
                        {tenant.status === 'active' ? (
                          <button
                            onClick={() => navigate(`/pay-rent/${tenant._id}`)}
                            className="btn btn-ghost btn-xs text-emerald-600 hover:bg-emerald-50 normal-case font-bold px-3 py-1 rounded-md"
                          >
                            💵 Bayar Sewa
                          </button>
                        ) : (
                          <span className="text-xs text-neutral/30 italic">-</span>
                        )}
                        <button className="btn btn-ghost btn-xs text-emerald-600 hover:bg-emerald-50 normal-case font-bold px-3 py-1 rounded-md">
                            edit
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  // State kalau data di MongoDB lu masih kosong melompong
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-neutral/40 italic">
                      Belum ada data penghuni kos yang terdaftar.
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

export default TenantList;