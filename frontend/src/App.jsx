import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import TenantRegistration from './pages/TenantRegistration'
import AddRoom from './pages/AddRoom'
import PayRent from './pages/PayRent'
import TenantList from './pages/TenantList'
import TransactionList from './pages/TransactionList'
import RoomList from './pages/RoomList'
import TenantDetail from './pages/TenantDetail'
import RoomDetail from './pages/RoomDetail'
import Worker from './pages/Worker'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />} > 
        <Route index element ={<Dashboard />} />
        <Route path="tenant/registration" element={<TenantRegistration />} />
        <Route path="room/add-room" element={<AddRoom />} />
        <Route path="transaction/pay-rent" element={<PayRent />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="rooms" element={<RoomList />} />
        <Route path="tenant/:id" element={<TenantDetail />} />
        <Route path="room/:id" element={<RoomDetail />} />
        <Route path="worker" element={<Worker />} />
      </Route>
    </Routes>
  )
}

export default App