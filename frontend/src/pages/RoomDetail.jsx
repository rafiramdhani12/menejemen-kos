import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomById, useUpdateRoom } from "../hooks/useRoom"; 
import {
  useFacilities,
  useCreateFacilities,
  useUpdateFacility,
  useDeleteFacility,
} from "../hooks/useFacility";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hooks Utama
  const { data: roomData, isLoading: roomLoading, refetch } = useRoomById(id);
  const { mutate: updateRoom, isPending: isUpdating } = useUpdateRoom();
  const { data: facilities = [], isLoading: facilityLoading } = useFacilities();

  // State Modal Edit Kamar & Kelola Fasilitas
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  
  // State Input Form Edit Kamar
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "Regular",
    size: "",
    pricePerMonth: "",
    status: "available",
    description: "",
  });
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Sync data ke form edit ketika roomData masuk
  useEffect(() => {
    if (roomData) {
      setFormData({
        roomNumber: roomData.roomNumber || "",
        type: roomData.type || "Regular",
        size: roomData.size || "",
        pricePerMonth: roomData.pricePerMonth || "",
        status: roomData.status || "available",
        description: roomData.description || "",
      });
      setSelectedFacilities(roomData.facilities || []);
    }
  }, [roomData]);

  // Handler update cepat status kamar (tanpa buka modal)
  const handleStatusQuickChange = (newStatus) => {
    updateRoom(
      { id, ...formData, status: newStatus, facilities: selectedFacilities },
      { onSuccess: () => refetch() }
    );
  };

  // Handler toggle checklist fasilitas langsung di page detail
  const handleFacilityToggle = (facId) => {
    const updated = selectedFacilities.includes(facId)
      ? selectedFacilities.filter((id) => id !== facId)
      : [...selectedFacilities, facId];
    
    setSelectedFacilities(updated);
    // Langsung simpan perubahan fasilitas ke server
    updateRoom(
      { id, ...formData, facilities: updated },
      { onSuccess: () => refetch() }
    );
  };

  // Submit Modal Edit Profil Kamar
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    updateRoom(
      { id, ...formData, pricePerMonth: Number(formData.pricePerMonth), facilities: selectedFacilities },
      {
        onSuccess: () => {
          alert("🎉 Data kamar berhasil diperbarui!");
          setShowEditModal(false);
          refetch();
        },
        onError: (err) => alert(err.response?.data?.message || "Gagal update"),
      }
    );
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Format IDR Rupiah utilitas
  const formatRupiah = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/dashboard")} className="btn btn-ghost btn-sm">⬅️ Dashboard</button>
          <button onClick={() => setShowEditModal(true)} className="btn btn-primary btn-sm md:btn-md">✏️ Edit Informasi Kamar</button>
        </div>

        {/* MAIN DISPLAY: Grid Info Kamar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kiri & Tengah: Detail Utama */}
          <div className="md:col-span-2 space-y-6">
            <div className="card bg-base-100 shadow-xl border">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-50">{roomData?.type} Room</span>
                    <h1 className="text-4xl font-black mt-1">Kamar {roomData?.roomNumber}</h1>
                  </div>
                  
                  {/* Badge Status Interaktif */}
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className={`btn btn-sm capitalize ${
                      roomData?.status === 'available' ? 'btn-success text-white' : 
                      roomData?.status === 'occupied' ? 'btn-info text-white' : 'btn-warning'
                    }`}>
                      {roomData?.status} ▾
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44 z-[1]">
                      <li><button onClick={() => handleStatusQuickChange('available')}>Available</button></li>
                      <li><button onClick={() => handleStatusQuickChange('occupied')}>Occupied</button></li>
                      <li><button onClick={() => handleStatusQuickChange('maintenance')}>Maintenance</button></li>
                    </ul>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  <div>
                    <p className="text-xs opacity-50">Ukuran Dimensi</p>
                    <p className="text-lg font-bold">{roomData?.size || "Belum diisi"}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-50">Biaya Sewa / Bulan</p>
                    <p className="text-lg font-bold text-primary">{formatRupiah(roomData?.pricePerMonth)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs opacity-50 mb-1">Deskripsi & Catatan Kamar</p>
                  <p className="text-sm bg-base-200 p-3 rounded-lg border italic">{roomData?.description || "Tidak ada catatan tambahan."}</p>
                </div>
              </div>
            </div>

            {/* BOX FASILITAS (Direct Action Toggle) */}
            <div className="card bg-base-100 shadow-xl border">
              <div className="card-body">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">🛋️ Fasilitas Unit</h3>
                  <button onClick={() => setShowFacilityModal(true)} className="btn btn-xs btn-outline">⚙️ Kelola Master</button>
                </div>
                <p className="text-xs opacity-60 -mt-2 mb-2">Centang langsung untuk menambahkan/mencabut fasilitas dari kamar ini.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {facilities.map((fac) => {
                    const isHas = selectedFacilities.includes(fac._id);
                    return (
                      <button
                        key={fac._id}
                        onClick={() => handleFacilityToggle(fac._id)}
                        className={`btn btn-sm justify-start gap-2 normal-case border ${isHas ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                      >
                        <input type="checkbox" checked={isHas} readOnly className="checkbox checkbox-xs pointer-events-none checkbox-primary" />
                        <span className="truncate">{fac.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Panel Penghuni Kos (Populated via virtual) */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl border">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-2">👤 Status Penghuni</h3>
                {roomData?.tenant ? (
                  <div className="space-y-3">
                    <div className="badge badge-info text-white">Active Resident</div>
                    <div>
                      <p className="text-xs opacity-50">Nama Penyewa</p>
                      <p className="font-bold text-md">{roomData.tenant.name}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-50">Kontak Handphone</p>
                      <p className="text-sm font-semibold">{roomData.tenant.phone}</p>
                    </div>
                    <div className="divider my-1"></div>
                    <button onClick={() => navigate(`/api/tenants/${roomData.tenant._id}`)} className="btn btn-xs btn-block btn-outline">Lihat Profil Penyewa</button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm opacity-50 italic mb-3">Kamar Kosong</p>
                    {roomData?.status === 'available' && (
                      <button onClick={() => navigate("/api/tenants/new")} className="btn btn-sm btn-outline btn-success">Check-In Penyewa</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MODAL EDIT UTAMA KAMAR ================= */}
      {showEditModal && (
        <div className="modal modal-open">
          <form onSubmit={handleRoomSubmit} className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">✏️ Edit Informasi Kamar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Nomor Kamar</span></label>
                <input type="text" className="input input-bordered w-full" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Ukuran</span></label>
                <input type="text" className="input input-bordered w-full" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Harga Bulanan (Rp)</span></label>
                <input type="number" className="input input-bordered w-full" value={formData.pricePerMonth} onChange={(e) => setFormData({...formData, pricePerMonth: e.target.value})} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Tipe Kamar</span></label>
                <select className="select select-bordered" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>
            </div>
            <div className="form-control mt-2">
              <label className="label"><span className="label-text">Deskripsi</span></label>
              <textarea className="textarea textarea-bordered h-20" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="modal-action">
              <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm">Batal</button>
              <button type="submit" disabled={isUpdating} className="btn btn-primary btn-sm">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL KELOLA MASTER FASILITAS (TETAP SAMA) ================= */}
      {/* ... code modal kelola fasilitas lo yang kemarin tinggal tempel di sini jika perlu ... */}

    </div>
  );
};

export default RoomDetail;