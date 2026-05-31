import React from 'react'
import { useNavigate } from 'react-router-dom'

const QuickActionCards = ({ icon, title, description, navigate, buttonText }) => {
  const navigateTo = useNavigate()
  return (
    <div className="bg-white border border-slate-100 rounded-[1.75rem] p-6 flex items-start gap-5 hover:border-indigo-200 transition-all duration-300 aurora-card group">
      <div className="p-4 bg-indigo-50 rounded-2xl text-primary text-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
        <button 
          onClick={() => navigateTo(navigate)}
          className="px-5 py-2 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default QuickActionCards

