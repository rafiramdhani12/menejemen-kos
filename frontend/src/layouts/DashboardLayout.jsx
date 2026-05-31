import React, { useEffect, useState } from 'react'
import { useLogout } from '../hooks/useAuth'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

const DashboardLayout = () => {
  const [user, setUser] = useState(null)
  const { mutate: logoutMutate } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = (e) => {
    e.preventDefault();
    logoutMutate(null, {
      onSuccess: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate("/");
      }
    });
  }

  const listLinks = [
    { id: 1, title: "Dashboard", link: "/dashboard" },
    { id: 2, title: "Manajemen Kamar", link: "/dashboard/rooms" },
    { id: 3, title: "Data Penghuni", link: "/dashboard/tenants" },
    { id: 4, title: "Transaksi", link: "/dashboard/transactions" },
  ]

  return (
    <div className="min-h-screen bg-base-200 flex antialiased text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/dashboard" className="flex items-center gap-3 mb-12 group">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-content font-black text-xl transition-transform group-hover:scale-110 duration-300 shadow-lg shadow-primary/20">
              R
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">Roomies<span className="text-secondary">.</span></span>
          </Link>

          <nav className="flex flex-col gap-2">
            {listLinks?.map((link) => (
              <Link
                key={link.id}
                to={link.link}
                className={`flex items-center px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  location.pathname === link.link
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 m-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{user?.name || "Guest"}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.role || "Visitor"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-error hover:bg-error/5 hover:border-error/20 transition-all duration-200 shadow-sm"
            title="Log Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout