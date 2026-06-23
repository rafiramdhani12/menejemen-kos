import React, { useState } from 'react';
import { 
  useGetUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser 
} from '../hooks/useUser';

const Worker = () => {
  // Query & Mutation dari TanStack
  const { data: users, isLoading, isError } = useGetUsers();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // State Pengontrol Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // State Form Data (Menyesuaikan Schema Mongoose User)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: ''
  });

  // Buka Modal untuk Tambah Baru
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({ name: '', email: '', role: 'admin', password: '' });
    setShowFormModal(true);
  };

  // Buka Modal untuk Edit Data
  const handleOpenEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role || 'admin',
      password: '' // Kosongkan password, hanya diisi jika ingin ganti password
    });
    setShowFormModal(true);
  };

  // Handler Submit (Create / Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      // Logic Update Data
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Jika pass kosong, jangan kirim update password

      updateUser(
        { id: selectedUserId, userData: payload },
        {
          onSuccess: () => {
            alert("🎉 Data pegawai berhasil diperbarui!");
            setShowFormModal(false);
          },
          onError: (err) => alert(err.response?.data?.message || "Gagal mengupdate data")
        }
      );
    } else {
      // Logic Create Data Baru
      if (!formData.password) return alert("Password wajib diisi untuk pegawai baru!");
      createUser(formData, {
        onSuccess: () => {
          alert("🎉 Pegawai baru berhasil didaftarkan!");
          setShowFormModal(false);
        },
        onError: (err) => alert(err.response?.data?.message || "Gagal menambah pegawai")
      });
    }
  };

  // Handler Hapus Pegawai
  const handleDelete = (id, name) => {
    if (confirm(`⚠️ Yakin ingin menghapus akun pegawai "${name.toUpperCase()}"?`)) {
      deleteUser(id, {
        onSuccess: () => alert("🗑️ Pegawai berhasil dihapus dari sistem."),
        onError: (err) => alert(err.response?.data?.message || "Gagal menghapus pegawai")
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
          <span>❌ Gagal memuat daftar pegawai. Silakan coba lagi.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral">
              Daftar Pegawai / Pengelola Kos
            </h1>
            <p className="text-xs text-neutral/50 mt-1">
              Manajemen hak akses admin kos dan informasi akun pengelola terdaftar.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm text-xs font-semibold px-4 normal-case text-white rounded-xl shadow-sm"
          >
            ➕ Tambah Pegawai Baru
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full text-sm">
              
              <thead className="bg-base-200 text-neutral/70 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Nama Pegawai</th>
                  <th>Alamat Email</th>
                  <th>Role Akses</th>
                  <th>Tanggal Terdaftar</th>
                  <th className="pr-6 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-base-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-base-200/50 transition-colors">
                      
                      {/* Nama */}
                      <td className="py-4 pl-6 font-bold text-neutral">
                        {user.name}
                      </td>

                      {/* Email */}
                      <td className="font-medium text-neutral/80">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`badge badge-sm font-bold px-3 py-2.5 rounded-lg border uppercase tracking-wider text-[10px] ${
                          user.role === 'owner' 
                            ? 'bg-purple-50 border-purple-200 text-purple-700' 
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="text-xs text-neutral/60">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* Aksi */}
                      <td className="pr-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50 font-bold px-3 py-1 rounded-md normal-case"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            disabled={isDeleting}
                            className="btn btn-ghost btn-xs text-rose-600 hover:bg-rose-50 font-bold px-3 py-1 rounded-md normal-case"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-neutral/40 italic">
                      Belum ada data pegawai terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

      </main>

      {/* ================= MODAL TAMBAH & EDIT USER ================= */}
      {showFormModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md rounded-3xl p-6">
            <h3 className="font-black text-xl text-slate-900 tracking-tight mb-1">
              {isEditMode ? "📝 Edit Data Pegawai" : "➕ Registrasi Pegawai"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isEditMode ? "Ubah detail informasi profil pengelola." : "Daftarkan akun admin baru untuk mengelola sistem kos."}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Email</label>
                <input 
                  type="email" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">Otoritas Role</label>
                <select 
                  className="select select-bordered w-full rounded-xl font-semibold text-sm" 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin (Pengelola Toko / Kasir Kos)</option>
                  <option value="owner">Owner (Pemilik Utama)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Password {isEditMode && <span className="text-neutral/40 lowercase italic font-normal">(Kosongkan jika tak diubah)</span>}
                </label>
                <input 
                  type="password" 
                  className="input input-bordered w-full rounded-xl font-medium text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditMode}
                />
              </div>

              <div className="modal-action flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)} 
                  className="btn btn-sm btn-ghost rounded-xl normal-case"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || isUpdating} 
                  className="btn btn-sm btn-primary rounded-xl px-5 normal-case text-white"
                >
                  {isCreating || isUpdating ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    isEditMode ? "Simpan Perubahan" : "Daftarkan Pegawai"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worker;