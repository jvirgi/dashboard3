"use client"

export type Granularity = 'day' | 'month' | 'quarter' | 'year'

export function TimeGranularity({ value, onChange }: { value: Granularity; onChange: (v: Granularity)=>void }){
  const options: Granularity[] = ['day','month','quarter','year']
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
      {options.map(opt => (
        <button
          key={opt}
          onClick={()=>onChange(opt)}
          className={`px-3 py-1.5 text-sm rounded-full capitalize transition ${value===opt ? 'bg-white shadow-soft text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}