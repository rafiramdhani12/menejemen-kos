import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetRooms } from '../hooks/useRoom'; // Asumsi custom hook buat fetch semua kamar

const RoomList = () => {
  const navigate = useNavigate();
  const { data: rooms, isLoading, isError } = useGetRooms();

  // Helper warna badge untuk Status Kamar
  const getStatusBadge = (status) => {
    if (status === 'occupied') {
      return <span className="badge badge-error badge-xs text-[10px] font-bold px-2 py-2 text-white">Terisi</span>;
    }
    if (status === 'maintenance') {
      return <span className="badge badge-warning badge-xs text-[10px] font-bold px-2 py-2 text-white">Perbaikan</span>;
    }
    // Default 'available' / empty
    return <span className="badge badge-success badge-xs text-[10px] font-bold px-2 py-2 text-white">Kosong</span>;
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
          <span>❌ Gagal memuat data kamar. Coba refresh halaman.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral">
              Manajemen Kamar Kos
            </h1>
            <p className="text-xs text-neutral/50 mt-1">
              Pantau ketersediaan slot kamar, tipe fasilitas, harga sewa bulanan, dan identitas penghuni aktif.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-sm gap-2 normal-case text-neutral/60 hover:text-primary transition-all"
          >
            ⬅️ Kembali
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full text-sm">
              
              {/* THEAD */}
              <thead className="bg-base-200 text-neutral/70 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">No. Kamar</th>
                  <th>Tipe Kamar</th>
                  <th>Harga / Bulan</th>
                  <th>Status Slot</th>
                  <th className="pr-6">Penghuni Aktif</th>
                </tr>
              </thead>

              {/* TBODY */}
              <tbody className="divide-y divide-base-200">
                {rooms && rooms.length > 0 ? (
                  rooms.map((kamar) => (
                    <tr key={kamar._id} className="hover:bg-base-200/50 transition-colors">
                      
                      {/* Nomor Kamar */}
                      <td className="py-4 pl-6 font-mono font-bold text-base text-neutral">
                        #{kamar.roomNumber}
                      </td>

                      {/* Tipe / Fasilitas */}
                      <td className="text-neutral/80 font-medium">
                        {kamar.type || 'Standard'}
                      </td>

                      {/* Harga Sewa */}
                      <td className="font-semibold text-neutral">
                        Rp {kamar.pricePerMonth.toLocaleString('id-ID')}
                      </td>

                      {/* Status Terisi / Kosong */}
                      <td>
                        {getStatusBadge(kamar.status)}
                      </td>

                      {/* Penghuni Aktif (Hasil Lookup/Populate dari BE) */}
                      <td className="pr-6">
                        {kamar.status === 'occupied' && kamar.tenant ? (
                          <div>
                            <span className="font-bold text-emerald-700 block">
                              👤 {kamar.tenant.name}
                            </span>
                            <span className="text-[11px] text-neutral/40 font-mono">
                              📞 {kamar.tenant.phone || '-'}
                            </span>
                          </div>
                        ) : kamar.status === 'maintenance' ? (
                          <span className="text-xs text-warning italic font-medium">Sedang Diperbaiki</span>
                        ) : (
                          <span className="text-xs text-neutral/30 italic">Tidak ada penghuni</span>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-neutral/40 italic">
                      Belum ada data kamar yang dimasukkan ke sistem.
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

export default RoomList;