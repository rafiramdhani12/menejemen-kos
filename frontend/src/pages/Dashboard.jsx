import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionCards from '../components/QuickActionCards';
import { useGetAllRooms, useGetOccupied , useGetAvailable , useGetOmzet, useGetRecentActivity} from '../hooks/useDashboard';
import MetricsCards from '../components/MetricsCards';
import {quickActions} from "../constants/Dashboard";

const Dashboard = () => {
  const navigate = useNavigate();

  const {data: availRooms , isPending} = useGetAvailable();
  const {data: allRooms} = useGetAllRooms();
  const {data: occupiedRooms} = useGetOccupied();
  const {data: omzet} = useGetOmzet()
  const {data: recentActivity} = useGetRecentActivity([]);

  console.log(availRooms, allRooms, occupiedRooms , omzet);

  const indonesianRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

  // MOCK DATA (Nanti diganti query asli)
  const stats = {
    totalKamar: allRooms,
    kamarKosong: availRooms,
    kamarTerisi: occupiedRooms,
    pendapatanBulanIni: omzet
  };

  console.log(`data recent activity : ${recentActivity}`);


  const overViewProps = [
    { id: 1, title: "Total Kamar", value: stats.totalKamar?.length || 0 , desc: "unit" },
    { id: 2, title: "Kamar Kosong", value: stats.kamarKosong?.count || 0 , desc: "tersedia"},
    { id: 3, title: "Kamar Terisi", value: stats.kamarTerisi?.count || 0 , desc: "tersedia"},
    { id: 4, title: "omzet bulan ini", value: indonesianRupiah(stats.pendapatanBulanIni?.total) || 0 , desc: null },
  ]

  return (

     <>
      {/* Header Konten */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview Properti</h1>
            <p className="text-xs text-neutral/50">Pantau status bisnis hunian sewa Anda hari ini.</p>
          </div>
          <div className="text-sm font-medium bg-base-100 px-4 py-2 rounded-xl border border-base-300 shadow-sm">
            📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {overViewProps?.map((item) => (
            <MetricsCards
              key={item.id}
              title={item.title}
              stats={item.value}
              desc={item.desc}
            />
          ))}
        </div>

        {/* TABLE DATA: Transaksi Terbaru */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Aktivitas Pembayaran Terbaru</h2>
              <p className="text-xs text-neutral/50">Histori mutasi uang masuk dari penghuni kos.</p>
            </div>
            <button className="btn btn-sm btn-ghost text-primary text-xs normal-case">Lihat Semua ➔</button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm w-full text-left">
              <thead>
                <tr className="border-b border-base-300 text-neutral/60 text-xs">
                  <th className="py-3 font-semibold">Nama Penghuni</th>
                  <th className="py-3 font-semibold">No. Kamar</th>
                  <th className="py-3 font-semibold">tipe Kamar</th>
                  <th className="py-3 font-semibold">Tanggal Bayar</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentActivity?.map((tx) => (
                  <tr key={tx.id} className="border-b border-base-200 hover:bg-base-200/50 transition-all">
                    <td className="py-3.5 font-medium">{tx.name}</td>
                    <td className="py-3.5 text-neutral/70">{tx.roomNumber}</td>
                    <td className="py-3.5 text-neutral/70">{tx.type}</td>
                    <td className="py-3.5 text-neutral/70">{tx.startDate}</td>
                    <td className="py-3.5">
                      {tx?.status === "active" ? (
                        <span className="badge badge-success badge-sm text-primary font-medium px-2.5 py-2">Lunas</span>
                      ) : (
                        <span className="badge badge-warning badge-sm text-white font-medium px-2.5 py-2">Menebus/Nunggak</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight">Aksi Cepat Operasional</h2>
            <p className="text-xs text-neutral/50">Lakukan tindakan harian manajemen kos secara instan.</p>
          </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
            {quickActions.map((action) => (
              <>
                <QuickActionCards icon={action.icon} title={action.title} description={action.description} border={action.border} navigate={action.navigate} buttonText={action.buttonText} />
              </>
            ))}
            </div>
          </div>
     </>
  );
};

export default Dashboard;