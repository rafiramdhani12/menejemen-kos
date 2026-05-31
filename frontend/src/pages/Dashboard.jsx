import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionCards from '../components/QuickActionCards';
import { useGetAllRooms, useGetOccupied, useGetAvailable, useGetOmzet, useGetRecentActivity } from '../hooks/useDashboard';
import { useGetDashboardStats } from '../hooks/useDashboardStats';
import MetricsCards from '../components/MetricsCards';
import RevenueChart from '../components/RevenueChart';
import { quickActions } from "../constants/Dashboard";

const Dashboard = () => {
  const { data: availRooms } = useGetAvailable();
  const { data: allRooms } = useGetAllRooms();
  const { data: occupiedRooms } = useGetOccupied();
  const { data: omzet } = useGetOmzet();
  const { data: recentActivity } = useGetRecentActivity([]);
  const { data: statsData, isPending: statsLoading } = useGetDashboardStats();

  const indonesianRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const stats = {
    totalKamar: allRooms,
    kamarKosong: availRooms,
    kamarTerisi: occupiedRooms,
    pendapatanBulanIni: omzet
  };

  const overViewProps = [
    { id: 1, title: "Total Unit", value: stats.totalKamar?.length || 0, desc: "kamar" },
    { id: 2, title: "Tersedia", value: stats.kamarKosong?.count || 0, desc: "unit" },
    { id: 3, title: "Terhuni", value: stats.kamarTerisi?.count || 0, desc: "unit" },
    { id: 4, title: "Estimasi Omzet", value: indonesianRupiah(stats.pendapatanBulanIni?.total || 0), desc: null },
  ]

  return (
    <div className="space-y-10">
      {/* Header Konten */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Overview Properti</h1>
          <p className="text-sm font-medium text-slate-400">Kelola operasional dan pantau performa hunian Anda secara real-time.</p>
        </div>
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 text-right w-full">Hari Ini</span>
          <div className="text-sm font-bold bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-slate-700">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overViewProps?.map((item, idx) => (
          <MetricsCards
            key={item.id}
            index={idx}
            title={item.title}
            stats={item.value}
            desc={item.desc}
          />
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 aurora-card p-8 lg:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Tren Pendapatan</h2>
              <p className="text-xs font-medium text-slate-400">Statistik performa keuangan 6 bulan terakhir.</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                 <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Omzet
               </span>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <RevenueChart data={statsData?.revenueTrend} />
          )}
        </div>
      </div>

      {/* Main Grid: Transactions & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* TABLE DATA: Transaksi Terbaru */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 aurora-card p-8 lg:p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Aktivitas Pembayaran</h2>
              <p className="text-xs font-medium text-slate-400">Log transaksi masuk terbaru bulan ini.</p>
            </div>
            <button className="px-5 py-2.5 text-[11px] font-bold text-white bg-primary rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all duration-300 uppercase tracking-widest">Semua Histori</button>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-slate-100 text-indigo-400 uppercase text-[10px] tracking-[0.2em]">
                  <th className="py-4 font-black bg-transparent">Penghuni</th>
                  <th className="py-4 font-black bg-transparent">Unit</th>
                  <th className="py-4 font-black bg-transparent">Tipe</th>
                  <th className="py-4 font-black bg-transparent text-right">Tanggal</th>
                  <th className="py-4 font-black bg-transparent text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentActivity?.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                    <td className="py-5">
                      <div className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{tx.name}</div>
                    </td>
                    <td className="py-5 text-slate-500 font-medium">#{tx.roomNumber}</td>
                    <td className="py-5">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider px-2 py-1 bg-indigo-50 rounded-md">{tx.type}</span>
                    </td>
                    <td className="py-5 text-slate-500 text-right font-medium">{tx.startDate}</td>
                    <td className="py-5 text-right">
                      {tx?.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span> Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                          <span className="h-1 w-1 rounded-full bg-rose-500"></span> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE: Quick Actions */}
        <div className="space-y-6">
          <div className="px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Aksi Cepat</h2>
            <p className="text-xs font-medium text-slate-400">Tindakan operasional instan.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, idx) => (
              <QuickActionCards 
                key={idx}
                icon={action.icon} 
                title={action.title} 
                description={action.description} 
                navigate={action.navigate} 
                buttonText={action.buttonText} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;