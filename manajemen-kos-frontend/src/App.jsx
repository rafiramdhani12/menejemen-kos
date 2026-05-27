import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function App() {
  // State Otentikasi & Session
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('role') || 'staff');
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || 'Pengguna');

  // State Data Utama dari Backend
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [staffs, setStaffs] = useState([]); 
  const [transactions, setTransactions] = useState([]); 

  // State Kendali UI Modal Pop-up
  const [modalType, setModalType] = useState(''); 
  const [selectedRoom, setSelectedRoom] = useState(null); 

  // Filter Status Tampilan Kamar ('all', 'available', 'occupied')
  const [roomFilter, setRoomFilter] = useState('all');

  // State Formulir Tambah Kamar (Admin)
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [newRoomStatus, setNewRoomStatus] = useState('available');

  // State Formulir Tambah Staf Baru (Admin)
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // State Formulir Check-In Penyewa Baru (Staff & Admin)
  const [tenantName, setTenantName] = useState('');
  const [tenantNik, setTenantNik] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmergency, setTenantEmergency] = useState('');

  // State Formulir Catat Transaksi Keuangan (Staff & Admin)
  const [trxAmount, setTrxAmount] = useState('');
  const [trxPeriod, setTrxPeriod] = useState('');
  const [trxMethod, setTrxMethod] = useState('Cash');

  // ==========================================
  // 1. FUNGSI AMBIL DATA DARI BACKEND
  // ==========================================
  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) setRooms(response.data);
    } catch (error) {
      console.error('Gagal mengambil data kamar:', error);
    }
  }, []);

  const fetchStaffs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // PERBAIKAN: Owner juga diberi izin memantau daftar staf
      if (!token || (localStorage.getItem('role') !== 'admin' && localStorage.getItem('role') !== 'owner')) return;
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        setStaffs(response.data.filter(u => u.role === 'staff'));
      }
    } catch (error) {
      console.error('Gagal mengambil data staf:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) setTransactions(response.data);
    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error);
    }
  }, []);

  // ==========================================
  // 2. FUNGSI OPERASIONAL CHECK-IN & TRANSAKSI
  // ==========================================
  const handleCheckInTenant = async (e) => {
    e.preventDefault();
    if (userRole === 'owner') return alert('Aksi Ditolak: Owner hanya memiliki akses Baca.');
    
    try {
      const token = localStorage.getItem('token');
      // SINKRONISASI URL & PROPERTI BACKEND
      await axios.post('http://localhost:5000/api/tenants/add', {
        name: tenantName,
        nik: tenantNik,
        phone: tenantPhone,
        emergencyContact: tenantEmergency,
        roomId: selectedRoom._id 
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTenantName(''); setTenantNik(''); setTenantPhone(''); setTenantEmergency(''); setModalType('');
      fetchRooms();
      alert(`Penyewa bernama ${tenantName} berhasil Check-In di Kamar ${selectedRoom.roomNumber}!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memproses data check-in penyewa.');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (userRole === 'owner') return alert('Aksi Ditolak: Owner hanya memiliki akses Baca.');

    try {
      const token = localStorage.getItem('token');
      // SINKRONISASI URL & PROPERTI BACKEND
      await axios.post('http://localhost:5000/api/transactions/add', {
        tenantId: selectedRoom.tenantId || selectedRoom._id, // Menyesuaikan relasi id penyewa
        amountPaid: Number(trxAmount),
        periodMonth: trxPeriod, 
        paymentMethod: trxMethod,
        status: 'Lunas'
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTrxAmount(''); setTrxPeriod(''); setModalType('');
      fetchTransactions();
      alert(`Sukses mencatat transaksi pembayaran Kamar ${selectedRoom.roomNumber}!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan catatan transaksi keuangan.');
    }
  };

  // ==========================================
  // 3. FUNGSI MANAJEMEN KAMAR & STAF
  // ==========================================
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/rooms/add', {
        roomNumber: newRoomNumber,
        pricePerMonth: Number(newRoomPrice), // Sesuai properti DB backend
        status: newRoomStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      setNewRoomNumber(''); setNewRoomPrice(''); setModalType('');
      fetchRooms();
      alert('Kamar baru berhasil ditambahkan!');
    } catch (error) { alert(error.response?.data?.message || 'Gagal menambahkan kamar.'); }
  };

  const handleToggleStatus = async (roomId, currentStatus) => {
    if (userRole === 'owner') return alert('Aksi Ditolak: Owner tidak bisa mengubah status.');
    try {
      const token = localStorage.getItem('token');
      const nextStatus = currentStatus === 'available' ? 'occupied' : 'available';
      await axios.put(`http://localhost:5000/api/rooms/${roomId}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (error) { alert('Gagal memperbarui status kamar.'); }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus Kamar ${roomNumber}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchRooms();
      } catch (error) { alert('Gagal menghapus kamar.'); }
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/register', { name: staffName, email: staffEmail, password: staffPassword, role: 'staff' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffName(''); setStaffEmail(''); setStaffPassword(''); setModalType('manage_staff');
      fetchStaffs();
      alert('Akun staf baru berhasil didaftarkan!');
    } catch (error) { alert('Gagal mendaftarkan staf.'); }
  };

  // ==========================================
  // 4. AUTENTIKASI LOGIN / LOGOUT
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user?.role || 'staff');
      localStorage.setItem('name', response.data.user?.name || 'Pengguna');
      
      setIsLoggedIn(true);
      setUserRole(response.data.user?.role || 'staff');
      setUserName(response.data.user?.name || 'Pengguna');
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal terhubung ke server');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false); setUserRole('staff'); setUserName('Pengguna');
    setRooms([]); setStaffs([]); setTransactions([]);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchRooms();
      fetchTransactions();
      if (localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'owner') fetchStaffs();
    }
  }, [isLoggedIn, fetchRooms, fetchTransactions, fetchStaffs]);

  const filteredRooms = rooms.filter(room => {
    if (roomFilter === 'available') return room.status === 'available';
    if (roomFilter === 'occupied') return room.status === 'occupied';
    return true;
  });

  const getRoleBadgeStyle = () => {
    if (userRole === 'admin') return { bg: '#E1F5FE', text: '#0288D1' };
    if (userRole === 'owner') return { bg: '#E8F5E9', text: '#2E7D32' };
    return { bg: '#FFF3E0', text: '#F57C00' };
  };

  // ==========================================
  // RENDER VIEW 1: DASHBOARD UTAMA KOS
  // ==========================================
  if (isLoggedIn) {
    return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        
        {/* Navigation Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>🏠 Aplikasi Sistem Kendali Operasional Kos</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Petugas Aktif: <b>{userName}</b> | Jabatan: <span style={{ padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', backgroundColor: getRoleBadgeStyle().bg, color: getRoleBadgeStyle().text, textTransform: 'uppercase' }}>{userRole}</span>
            </p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 15px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Keluar (Logout)</button>
        </div>

        {/* Panel Kontrol Manajemen (Hanya Admin / Owner) */}
        {(userRole === 'admin' || userRole === 'owner') && (
          <div style={{ marginTop: '25px', padding: '15px 20px', backgroundColor: userRole === 'owner' ? '#EBF8FF' : '#E8F5E9', borderRadius: '10px', border: '1px solid #cbd5e0', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>🛡️ Panel Manajemen [{userRole.toUpperCase()}]:</span>
            {userRole === 'admin' && (
              <button onClick={() => setModalType('add_room')} style={{ padding: '8px 16px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ Tambah Kamar Kos</button>
            )}
            <button onClick={() => { fetchStaffs(); setModalType('manage_staff'); }} style={{ padding: '8px 16px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>👥 Lihat Akun Staf ({staffs.length})</button>
          </div>
        )}

        {/* SEKSI MONITOR KAMAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '35px' }}>
          <h3 style={{ margin: 0, color: '#444' }}>📊 Monitoring Kondisi Kamar Realtime</h3>
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            <button onClick={() => setRoomFilter('all')} style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', backgroundColor: roomFilter === 'all' ? 'white' : 'transparent' }}>Semua ({rooms.length})</button>
            <button onClick={() => setRoomFilter('available')} style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#198754', backgroundColor: roomFilter === 'available' ? 'white' : 'transparent' }}>🟢 Kosong ({rooms.filter(r=>r.status==='available').length})</button>
            <button onClick={() => setRoomFilter('occupied')} style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#DC3545', backgroundColor: roomFilter === 'occupied' ? 'white' : 'transparent' }}>🔴 Terisi ({rooms.filter(r=>r.status==='occupied').length})</button>
          </div>
        </div>

        {/* Layout Grid Kamar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {filteredRooms.length === 0 ? (
            <p style={{ color: '#888', gridColumn: '1/-1' }}>Tidak ditemukan kamar dengan kategori filter ini.</p>
          ) : (
            filteredRooms.map((room) => (
              <div key={room._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>Kamar {room.roomNumber}</h3>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: 'white', backgroundColor: room.status === 'occupied' ? '#DC3545' : '#198754' }}>
                      {room.status === 'occupied' ? '🔴 TERISI' : '🟢 KOSONG'}
                    </span>
                  </div>
                  <p style={{ margin: '15px 0 2px 0', color: '#718096', fontSize: '12px' }}>Harga Sewa Bulanan:</p>
                  <h4 style={{ margin: 0, color: '#3182CE', fontSize: '17px' }}>Rp {room.pricePerMonth?.toLocaleString('id-ID')}/bln</h4>
                </div>

                {/* Tombol Operasional dengan Proteksi Mode Terpantau Sahaja */}
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userRole === 'owner' ? (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#A0AEC0', padding: '8px', background: '#F7FAFC', borderRadius: '6px', border: '1px dashed #E2E8F0', fontWeight: 'bold' }}>
                      Mode Pantau Sahaja
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {room.status === 'available' ? (
                          <button onClick={() => { setSelectedRoom(room); setModalType('checkin_tenant'); }} style={{ flex: 1, padding: '8px', background: '#198754', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>👤 Check-In</button>
                        ) : (
                          <button onClick={() => { setSelectedRoom(room); setModalType('add_transaction'); }} style={{ flex: 1, padding: '8px', background: '#F57C00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>💰 Transaksi</button>
                        )}
                        <button onClick={() => handleToggleStatus(room._id, room.status)} style={{ padding: '8px 10px', background: '#F7FAFC', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🔄 Status</button>
                      </div>
                      {userRole === 'admin' && (
                        <button onClick={() => handleDeleteRoom(room._id, room.roomNumber)} style={{ padding: '6px', background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Hapus Kamar</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* SEKSI BUKU TRANSAKSI FINANSIAL MASUK */}
        <div style={{ marginTop: '45px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🧾 Buku Jurnal Arus Kas Masuk Kos</h3>
          {transactions.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>Belum ada rekaman setoran bulanan yang dimasukkan.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '13px', color: '#4a5568' }}>Tanggal Pembayaran</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '13px', color: '#4a5568' }}>Nama Penyewa</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '13px', color: '#4a5568' }}>Metode</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: '13px', color: '#4a5568' }}>Jumlah Kas</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '13px', color: '#4a5568' }}>Keterangan Periode</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 10px', fontSize: '13px', color: '#718096' }}>{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                    {/* PERBAIKAN POPULATE FIELD */}
                    <td style={{ padding: '12px 10px', fontSize: '14px', fontWeight: 'bold' }}>{t.tenantId?.name || 'Penghuni Kos'}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', background: t.paymentMethod === 'Transfer' ? '#EBF8FF' : '#F0FFF4', color: t.paymentMethod === 'Transfer' ? '#2B6CB0' : '#22543D', fontWeight: 'bold' }}>{t.paymentMethod}</span>
                    </td>
                    {/* PERBAIKAN FIELD AMOUNTPAID */}
                    <td style={{ padding: '12px 10px', fontSize: '14px', textAlign: 'right', color: '#2F855A', fontWeight: 'bold' }}>Rp {t.amountPaid?.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 10px', fontSize: '13px', color: '#4a5568' }}>{t.periodMonth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL POP-UP LOGIC */}
        {modalType === 'checkin_tenant' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 150 }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '350px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>👤 Form Registrasi Kamar {selectedRoom?.roomNumber}</h3>
              <form onSubmit={handleCheckInTenant}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nama Lengkap:</label>
                  <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>NIK KTP:</label>
                  <input type="text" value={tenantNik} onChange={(e) => setTenantNik(e.target.value)} required placeholder="16 digit KTP" style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>No. HP Aktif:</label>
                  <input type="text" value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} required placeholder="0812xxxx" style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kontak Darurat:</label>
                  <input type="text" value={tenantEmergency} onChange={(e) => setTenantEmergency(e.target.value)} required placeholder="Nama & No HP Kerabat" style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType('')} style={{ flex: 1, padding: '10px', background: '#718096', color: 'white', border: 'none', borderRadius: '6px' }}>Batal</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#198754', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Simpan CheckIn</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'add_transaction' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 150 }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '340px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>💰 Catat Pembayaran Kamar {selectedRoom?.roomNumber}</h3>
              <form onSubmit={handleAddTransaction}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Besar Dana (Rp):</label>
                  <input type="number" value={trxAmount} onChange={(e) => setTrxAmount(e.target.value)} required placeholder={`Tarif: Rp ${selectedRoom?.pricePerMonth}`} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Metode Transaksi:</label>
                  <select value={trxMethod} onChange={(e) => setTrxMethod(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }}>
                    <option value="Cash">Cash (Tunai Fisik)</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Periode Bulan Sewa:</label>
                  <input type="text" value={trxPeriod} onChange={(e) => setTrxPeriod(e.target.value)} required placeholder="Misal: Juni 2026" style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType('')} style={{ flex: 1, padding: '10px', background: '#718096', color: 'white', border: 'none', borderRadius: '6px' }}>Batal</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#F57C00', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Simpan Log</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'add_room' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '360px' }}>
              <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>➕ Tambah Kamar Baru</h3>
              <form onSubmit={handleAddRoom}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Nomor Kamar:</label>
                  <input type="text" value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} required placeholder="Misal: 102" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Harga Sewa (IDR):</label>
                  <input type="number" value={newRoomPrice} onChange={(e) => setNewRoomPrice(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Status Default:</label>
                  <select value={newRoomStatus} onChange={(e) => setNewRoomStatus(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                    <option value="available">🟢 Kosong (Available)</option>
                    <option value="occupied">🔴 Terisi (Occupied)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType('')} style={{ flex: 1, padding: '10px', background: '#718096', color: 'white', border: 'none', borderRadius: '6px' }}>Batal</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px' }}>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'manage_staff' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>👥 Anggota Manajemen Staf Kos</h3>
                {userRole === 'admin' && (
                  <button onClick={() => setModalType('add_staff')} style={{ padding: '6px 12px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ Daftarkan Staf Baru</button>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Nama</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Email Sistem</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.map(s => <tr key={s._id} style={{ borderBottom: '1px solid #edf2f7' }}><td style={{ padding: '10px' }}>{s.name}</td><td style={{ padding: '10px' }}>{s.email}</td></tr>)}
                </tbody>
              </table>
              <button type="button" onClick={() => setModalType('')} style={{ width: '100%', padding: '10px', background: '#4a5568', color: 'white', border: 'none', borderRadius: '6px', marginTop: '20px', cursor: 'pointer' }}>Tutup Jendela</button>
            </div>
          </div>
        )}

        {modalType === 'add_staff' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 101 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '360px' }}>
              <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>👥 Registrasi Akun Staf Baru</h3>
              <form onSubmit={handleAddStaff}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px' }}>Nama Lengkap Karyawan:</label>
                  <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px' }}>Email Login:</label>
                  <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ fontSize: '13px' }}>Kata Sandi:</label>
                  <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType('manage_staff')} style={{ flex: 1, padding: '10px', background: '#718096', color: 'white', border: 'none', borderRadius: '6px' }}>Kembali</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '6px' }}>Buat Akun</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // VIEW 2: FORM LOGIN UTAMA
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto', marginTop: '100px' }}>
      <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Login Sistem Kos</h2>
        {message && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#0288D1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
}

export default App;