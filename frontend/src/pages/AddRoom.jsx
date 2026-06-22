import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateRoom } from "../hooks/useRoom";
import {
  useFacilities,
  useCreateFacilities,
  useUpdateFacility,
  useDeleteFacility,
} from "../hooks/useFacility";

const AddRoom = () => {
  const navigate = useNavigate();

  const { mutate: createRoom, isPending } = useCreateRoom();
  const { data: facilities = [], isLoading: facilityLoading } = useFacilities();
  
  // State untuk Modal Kelola Fasilitas
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [editingFacility, setEditingFacility] = useState(null);

  // Hook Mutate Fasilitas
  const { mutate: createFacility } = useCreateFacilities();
  const { mutate: updateFacility } = useUpdateFacility();
  const { mutate: deleteFacility } = useDeleteFacility();

  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "Regular",
    size: "",
    pricePerMonth: "",
    status: "available",
    description: "",
  });

  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const inputFields = [
    {
      label: "Nomor Kamar",
      name: "roomNumber",
      type: "text",
      placeholder: "Contoh: A101",
    },
    {
      label: "Ukuran Kamar",
      name: "size",
      type: "text",
      placeholder: "Contoh: 3x4 m",
    },
    {
      label: "Harga Per Bulan",
      name: "pricePerMonth",
      type: "number",
      placeholder: "Contoh: 1500000",
    },
  ];

  const handleOnChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFacilityChange = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  // Handler Submit Fasilitas Baru / Edit Fasilitas
  const handleFacilitySubmit = (e) => {
    e.preventDefault();
    if (!facilityName.trim()) return;

    if (editingFacility) {
      // Mode Edit
      updateFacility(
        { id: editingFacility._id, name: facilityName },
        {
          onSuccess: () => {
            setFacilityName("");
            setEditingFacility(null);
          },
        }
      );
    } else {
      // Mode Tambah Baru
      createFacility(
        { name: facilityName },
        {
          onSuccess: () => {
            setFacilityName("");
          },
        }
      );
    }
  };

  // Handler Hapus Fasilitas
  const handleFacilityDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus fasilitas ini?")) {
      deleteFacility(id, {
        onSuccess: () => {
          // Hapus dari list terpilih jika fasilitas yang dihapus sedang dicentang
          setSelectedFacilities((prev) => prev.filter((item) => item !== id));
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      pricePerMonth: Number(formData.pricePerMonth),
      facilities: selectedFacilities,
    };

    createRoom(payload, {
      onSuccess: () => {
        alert("🎉 Kamar berhasil ditambahkan!");
        navigate("/dashboard");
      },
      onError: (error) => {
        alert(error.response?.data?.message || "Gagal menambahkan kamar");
      },
    });
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-ghost btn-sm mb-6"
        >
          ⬅️ Kembali
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Tambah Unit Kamar</h1>
          <p className="text-sm opacity-60">Tambahkan kamar baru ke sistem.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-base-100 rounded-xl border p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inputFields.map((field) => (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text">{field.label}</span>
                </label>

                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  placeholder={field.placeholder}
                  onChange={handleOnChange}
                  disabled={isPending}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            ))}

            {/* TYPE */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipe Kamar</span>
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleOnChange}
                className="select select-bordered"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
              </select>
            </div>
          </div>

          {/* FACILITY */}
          <div className="form-control">
            <div className="flex justify-between items-center mb-2">
              <label className="label p-0">
                <span className="label-text">Fasilitas Kamar</span>
              </label>
              {/* TOMBOL MODAL */}
              <button
                type="button"
                onClick={() => setShowFacilityModal(true)}
                className="btn btn-xs btn-outline btn-primary"
              >
                ⚙️ Kelola Fasilitas
              </button>
            </div>

            <div className="border rounded-xl p-4 bg-base-200">
              {facilityLoading ? (
                <p className="text-sm opacity-60">Memuat fasilitas...</p>
              ) : facilities.length === 0 ? (
                <p className="text-sm opacity-50 text-center py-2">Belum ada fasilitas. Klik "Kelola Fasilitas" untuk menambahkan.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facilities.map((facility) => (
                    <label
                      key={facility._id}
                      className="cursor-pointer flex items-center gap-2 bg-base-100 p-2 rounded-lg border hover:bg-base-300 transition-all"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={selectedFacilities.includes(facility._id)}
                        onChange={() => handleFacilityChange(facility._id)}
                      />
                      <span className="text-sm truncate">{facility.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Deskripsi</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleOnChange}
              className="textarea textarea-bordered h-24"
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/dashboard")}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Simpan Kamar"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* ================= MODAL KELOLA FASILITAS ================= */}
      {showFacilityModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">⚙️ Kelola Master Fasilitas</h3>
            
            {/* Form Tambah/Edit */}
            <form onSubmit={handleFacilitySubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nama fasilitas baru..."
                className="input input-bordered flex-1 input-sm"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                {editingFacility ? "Simpan" : "Tambah"}
              </button>
              {editingFacility && (
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditingFacility(null);
                    setFacilityName("");
                  }}
                >
                  Batal
                </button>
              )}
            </form>

            {/* List Fasilitas yang Ada */}
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-xl p-2 bg-base-200">
              {facilities.length === 0 ? (
                <p className="text-xs text-center opacity-50 py-4">Belum ada data fasilitas.</p>
              ) : (
                facilities.map((fac) => (
                  <div key={fac._id} className="flex justify-between items-center bg-base-100 p-2 rounded-lg shadow-sm">
                    <span className="text-sm font-medium">{fac.name}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFacility(fac);
                          setFacilityName(fac.name);
                        }}
                        className="btn btn-ghost btn-xs text-info"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFacilityDelete(fac._id)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-action">
              <button 
                type="button" 
                className="btn btn-sm"
                onClick={() => {
                  setShowFacilityModal(false);
                  setEditingFacility(null);
                  setFacilityName("");
                }}
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRoom;