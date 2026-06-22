import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  // Fix typo properti dari 'muatte' jadi 'mutate'
  const { mutate: loginMutate, isPending } = useLogin();

  const handleOnchange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Ini butuh atribut name di tag input
    });
  };

  const handleLogin =  (e) => {
    e.preventDefault();

    // Fix struktur argumen mutate sesuai standar TanStack Query
    loginMutate(
      {
        email: formData.email,
        password: formData.password
      },
      {
        onSuccess: (data) => {
          console.log("Login sukses, data user didapat:", data);
          const {token , user} = data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate("/dashboard");
        },
        onError: (error) => {
          console.error("Login gagal:", error.response?.data?.message || error.message);
        }
      }
    );

    // Fix pemanggilan variabel dari state formData
    console.log('Mencoba login dengan:', { email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6 antialiased selection:bg-primary/10">
      <div className="w-full max-w-md flex flex-col">
        
        {/* BAGIAN JUDUL & LOGO */}
        <div className="flex flex-col items-start mb-8 pl-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-content font-black text-xl tracking-tight shadow-sm text-white">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral">Roomies.</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral mb-1.5">
            Selamat datang kembali
          </h1>
        </div>

        {/* FORM UTAMA */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5 p-2">
          
          {/* INPUT EMAIL */}
          <div className="form-control">
            <label className="label pt-0 pb-1.5 px-1">
              <span className="text-xs font-medium text-neutral/70 tracking-wide">Alamat Email</span>
            </label>
            <input 
              type="email" 
              name="email" // <-- DI SINI FIX-NYA: Ditambahin atribut name
              placeholder="nama@perusahaan.com" 
              className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 transition-all duration-200" 
              value={formData.email}
              onChange={handleOnchange}
              disabled={isPending}
              required 
            />
          </div>

          {/* INPUT PASSWORD */}
          <div className="form-control">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="label p-0">
                <span className="text-xs font-medium text-neutral/70 tracking-wide">Kata Sandi</span>
              </label>
              <a href="#" className="text-xs text-primary font-medium hover:underline transition-all">
                Lupa sandi?
              </a>
            </div>
            <input 
              type="password" 
              name="password" // <-- DI SINI FIX-NYA: Ditambahin atribut name
              placeholder="••••••••" 
              className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-sm h-11 transition-all duration-200" 
              value={formData.password}
              onChange={handleOnchange}
              disabled={isPending}
              required 
            />
          </div>

          {/* TOMBOL SIGN IN */}
          <button 
            type="submit" 
            disabled={isPending}
            className="btn btn-primary w-full text-sm font-medium h-11 min-h-[2.75rem] normal-case tracking-wide shadow-sm hover:shadow transition-all duration-250 mt-2 rounded-2xl border-0 bg-primary hover:bg-primary-focus text-white"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>

          <p className="text-center text-xs text-neutral/40 mt-6 tracking-wide">
            Belum memiliki akses? Hubungi <span className="text-primary font-medium cursor-pointer hover:underline">Super Admin</span>
          </p>
        </form>

      </div>
    </div>
  );
};

export default Login;