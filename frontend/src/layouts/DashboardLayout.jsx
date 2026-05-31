import React, { useEffect, useState , } from 'react'
import {useLogout} from '../hooks/useAuth'
import { Link, Outlet, useNavigate } from 'react-router-dom'

const DashboardLayout = () => {
  const [user,setUser] = useState(null)
  const {mutate: logoutMutate , isPending} = useLogout();

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = (e) => {
    e.preventDefault();

    logoutMutate(null , {
      onSuccess: (data) => {
        console.log("Logout sukses, data user didapat:", data);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate("/");
      },
      onError: (error) => {
        console.error("Logout gagal:", error.response?.data?.message || error.message);
      }
    });    
  }
  
  const listLinks = [
    {id:1 , icon : "📊" , title:"dashboard", link:"/dashboard"},
    {id:2 , icon : "🛏️" , title:"manajemen kamar", link:"/dashboard/rooms"},
    {id:3 , icon : "👥" , title:"data penghuni", link:"/dashboard/tenants"},
    {id:4 , icon : "💸" , title:"transaksi", link:"/dashboard/transactions"},
  ]
  
  return (
    <>
    <div className="min-h-screen bg-base-200 flex antialiased text-neutral selection:bg-primary/10">
    <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <Link to="/dashboard">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-content font-black text-lg text-white">
              R
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral">Roomies.</span>
          </div>
          </Link>

          <nav className="flex flex-col gap-1">
            {listLinks?.map((link) => (
              <>
              <Link key={link.id} to={link.link} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral/70 hover:bg-base-200 hover:text-neutral font-medium text-sm text-left transition-all">
                <span>{link.icon}</span> {link.title}
              </Link>
              </>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              {user?<p className="text-xs font-semibold">{user.name}</p>:<p className="text-xs font-semibold">guest</p>}
              {user?<p className="text-xs font-semibold">{user.role}</p>:<p className="text-xs font-semibold">{null}</p>}
              {/* <p className="text-xs font-semibold">Admin Kos</p>
              <p className="text-[10px] text-neutral/50">Owner</p> */}
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm text-error hover:bg-error/10 p-1" title="Log Out">
            🚪
          </button>
        </div>
      </aside>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto"><Outlet /></div>
    </div>
    </>    
  )
}

export default DashboardLayout