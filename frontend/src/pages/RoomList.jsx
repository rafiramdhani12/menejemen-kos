import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetRooms, useDeleteRooms } from '../hooks/useRoom';

const RoomList = () => {
  const navigate = useNavigate();
  const { data: rooms, isLoading, isError } = useGetRooms();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRooms();

  // Helper warna badge untuk Status Kamar
  const getStatusBadge = (status) => {
    if (status === 'occupied') {
      return <span className="badge badge-error badge-sm font-semibold text-white">Terisi</span>;
    }
    if (status === 'maintenance') {
      return <span className="badge badge-warning badge-sm font-semibold text-white">Perbaikan</span>;
    }
    return <span className="badge badge-success badge-sm font-semibold text-white">Kosong</span>;
  };

  // Fungsi Handler Hapus Kamar
  const handleDeleteRoom = (id, roomNumber) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Kamar #${roomNumber}? Data yang dihapus tidak bisa dikembalikan.`)) {
      deleteRoom(id, {
        onSuccess: () => {
          alert(`🎉 Kamar #${roomNumber} berhasil dihapus!`);
        },
        onError: (error) => {
          alert(error.response?.data?.message || "Gagal menghapus kamar");
        },
      });
    }
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
      <main className="flex-1 p-4 md:p-12 max-w-6xl mx-auto w-full">
        
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
            ⬅️ Kembali ke Dashboard
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full text-sm">
              
              {/* THEAD */}
              <thead className="bg-base-200 text-neutral/70 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">No. Kamar</th>
                  <th>Tipe Kamar</th>
                  <th>Harga / Bulan</th>
                  <th>Status Slot</th>
                  <th>Penghuni Aktif</th>
                  <th className="pr-6 text-center">Aksi</th>
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
                        Rp {kamar.pricePerMonth?.toLocaleString('id-ID')}
                      </td>

                      {/* Status Terisi / Kosong */}
                      <td>
                        {getStatusBadge(kamar.status)}
                      </td>

                      {/* Penghuni Aktif */}
                      <td>
                        {kamar.status === 'occupied' && kamar.tenant ? (
                          <div>
                            <span className="font-bold text-emerald-700 block">
                              👤 {kamar.tenant.name}
                            </span>
                            <span className="text-[11px] text-neutral/50 font-mono">
                              📞 {kamar.tenant.phone || '-'}
                            </span>
                          </div>
                        ) : kamar.status === 'maintenance' ? (
                          <span className="text-xs text-warning italic font-medium">🛠️ Sedang Diperbaiki</span>
                        ) : (
                          <span className="text-xs text-neutral/30 italic">Tidak ada penghuni</span>
                        )}
                      </td>

                      {/* Kolom Aksi */}
                      <td className="pr-6">
                        <div className="flex gap-2 justify-center items-center">
                          <Link to={`/dashboard/room/${kamar._id}`}>
                            <button className="btn btn-success btn-xs md:btn-sm text-white gap-1 normal-case font-medium">
                              🔍 Detail
                            </button>
                          </Link>
                          
                          <button 
                            className="btn btn-error btn-xs md:btn-sm text-white gap-1 normal-case font-medium"
                            onClick={() => handleDeleteRoom(kamar._id, kamar.roomNumber)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "❌ Hapus"
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* FIX: Diubah ke colSpan="6" agar pas menutup seluruh lebar kolom */}
                    <td colSpan="6" className="text-center py-16 text-neutral/40 italic">
                      📦 Belum ada data kamar yang dimasukkan ke sistem.
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