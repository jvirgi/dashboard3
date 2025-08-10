"use client"

export function MonthSegment({ value, onChange }: { value: number; onChange: (v: number)=>void }){
  const options = [6, 12, 18]
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
      {options.map(opt => (
        <button
          key={opt}
          onClick={()=>onChange(opt)}
          className={`px-3 py-1.5 text-sm rounded-full transition ${value===opt ? 'bg-white shadow-soft text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {opt} mo
        </button>
      ))}
    </div>
  )
}