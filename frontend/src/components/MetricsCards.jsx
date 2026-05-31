import React from 'react'

const MetricsCards = ({ title, stats, desc, index }) => {
  const borders = [
    'border-t-indigo-500',
    'border-t-teal-500',
    'border-t-rose-500',
    'border-t-amber-500'
  ]
  
  return (
    <div className={`bg-white p-7 rounded-[2rem] border border-slate-100 border-t-4 ${borders[index % 4]} aurora-card flex flex-col justify-between hover:scale-[1.02]`}>
      <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase mb-4">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-slate-800 tracking-tighter">{stats}</span>
        {desc && <span className="text-xs font-semibold text-slate-400 lowercase">{desc}</span>}
      </div>
    </div>
  )
}

export default MetricsCards