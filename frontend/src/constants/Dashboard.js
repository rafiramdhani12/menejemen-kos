 export const recentTransactions = [
    { id: 1, nama: "Budi Santoso", kamar: "A1", tanggal: "28 Mei 2026", status: "Lunas" },
    { id: 2, nama: "Andi Wijaya", kamar: "B3", tanggal: "26 Mei 2026", status: "Nunggak" },
    { id: 3, nama: "Siti Rahma", kamar: "A5", tanggal: "25 Mei 2026", status: "Lunas" },
  ];

  export const quickActions = [
    {id:1 , icon:"👤", title:"Check-In Tenant", description:"Daftarkan penghuni baru yang baru masuk kamar.", navigate:"tenant/registration" ,border:"border-primary/50" , buttonText: "Buka Formulir"},
    // {id:2 , icon:"💵", title:"bayar sewa", description:"Catat uang sewa masuk bulanan dari penghuni aktif", navigate:"transaction/pay-rent", border:"border-secondary/50" , buttonText: "Catat Transaksi"},
    {id:3 , icon:"🔑", title:"Tambah Kamar", description:"ubah status ketersediaan perbaikan atau fasilitas", navigate:"room/add-room" , border:"border-accent/50" , buttonText : "Lihat Kamar"},
  ]

//   export const overViewProps = [
//     { id: 1, title: "Total Kamar", value: stats.totalKamar?.length || 0 , desc: "unit" },
//     { id: 2, title: "Kamar Kosong", value: stats.kamarKosong?.count || 0 , desc: "tersedia"},
//     { id: 3, title: "Kamar Terisi", value: stats.kamarTerisi?.count || 0 , desc: "tersedia"},
//     { id: 4, title: "omzet bulan ini", value: indonesianRupiah(stats.pendapatanBulanIni?.total) || 0 , desc: null },
//   ]
