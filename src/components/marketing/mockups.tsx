/* ------------------------------------------------------------------
   Rich HTML/CSS UI mockups — miniature previews of real DawFit screens.
   Used on the home page (ProductScreenshots) and feature detail pages.
------------------------------------------------------------------ */

export function DashboardMockup() {
  return (
    <div className="h-full bg-slate-50 overflow-hidden relative text-[10px] select-none">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900 flex flex-col items-center pt-2 gap-2">
        <div className="h-4 w-4 rounded bg-indigo-500" />
        {["bg-slate-700","bg-slate-700","bg-slate-600","bg-slate-700","bg-slate-700"].map((c,i)=>(
          <div key={i} className={`h-3 w-3 rounded-sm ${c}`}/>
        ))}
      </div>
      <div className="ml-8 p-2 space-y-1.5">
        <div className="text-slate-800 font-bold text-[11px]">Dashboard</div>
        <div className="grid grid-cols-4 gap-1">
          {[
            {label:"Clients",val:"8",color:"bg-blue-100"},
            {label:"Leads",val:"3",color:"bg-violet-100"},
            {label:"Drafts",val:"3",color:"bg-amber-100"},
            {label:"Programs",val:"5",color:"bg-emerald-100"},
          ].map(({label,val,color})=>(
            <div key={label} className="bg-white rounded border border-slate-200 p-1">
              <div className="text-slate-500">{label}</div>
              <div className={`text-slate-900 font-bold text-sm mt-0.5`}>{val}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-white rounded border border-slate-200 p-1.5 col-span-1">
            <div className="text-slate-600 font-semibold mb-1">Recent Clients</div>
            {["Jordan S.","Maya C.","Carlos D.","Priya P.","Sam J."].map((n,i)=>(
              <div key={i} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-slate-300 flex items-center justify-center text-[7px] font-bold text-slate-600">{n[0]}</div>
                  <span className="text-slate-700">{n}</span>
                </div>
                <div className="h-2 w-6 rounded-full bg-emerald-200" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded border border-slate-200 p-1.5 col-span-1">
            <div className="text-slate-600 font-semibold mb-1">New Leads</div>
            {["Marcus W.","Natalie O.","Derek H."].map((n,i)=>(
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-slate-700">{n}</span>
                <div className="h-2 w-8 rounded-full bg-violet-200" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded border border-slate-200 p-1.5 col-span-1">
            <div className="text-slate-600 font-semibold mb-1">AI Drafts</div>
            {["Adjustment","Analysis","Program"].map((n,i)=>(
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-slate-700">{n}</span>
                <div className="h-2 w-8 rounded-full bg-amber-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgramBuilderMockup() {
  const weeks = ["Week 1","Week 2","Week 3","Week 4"];
  const workouts = [
    {name:"Upper A — Push",exercises:5,sets:"4×8"},
    {name:"Lower A — Squat",exercises:6,sets:"5×5"},
    {name:"Upper B — Pull",exercises:5,sets:"4×10"},
    {name:"Lower B — Hinge",exercises:5,sets:"4×6"},
  ];
  return (
    <div className="h-full bg-slate-50 overflow-hidden relative text-[10px] select-none">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900" />
      <div className="ml-8 p-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-slate-800 font-bold text-[11px]">12-Week Hypertrophy Block</div>
          <div className="h-4 w-16 rounded bg-indigo-600 flex items-center justify-center text-white text-[8px]">+ Add Workout</div>
        </div>
        <div className="flex gap-1">
          {weeks.map((w,i)=>(
            <div key={w} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${i===0?"bg-indigo-600 text-white":"bg-white border border-slate-200 text-slate-600"}`}>{w}</div>
          ))}
          <div className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 border border-dashed border-slate-300">+ Week</div>
        </div>
        <div className="space-y-1">
          {workouts.map(({name,exercises,sets})=>(
            <div key={name} className="bg-white rounded border border-slate-200 px-2 py-1.5 flex items-center justify-between">
              <div>
                <div className="text-slate-800 font-medium">{name}</div>
                <div className="text-slate-400 text-[8px]">{exercises} exercises · {sets}</div>
              </div>
              <div className="flex gap-1">
                <div className="h-4 w-8 rounded bg-slate-100 border border-slate-200 text-[8px] flex items-center justify-center text-slate-600">Edit</div>
                <div className="h-4 w-8 rounded bg-indigo-50 border border-indigo-200 text-[8px] flex items-center justify-center text-indigo-600">Copy</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded px-2 py-1 flex items-center justify-between">
          <span className="text-indigo-600 text-[9px]">✨ Generate with AI — describe the client&apos;s goals</span>
          <div className="h-3.5 w-10 rounded bg-indigo-600 flex items-center justify-center text-[7px] text-white">Generate</div>
        </div>
      </div>
    </div>
  );
}

export function LeadPipelineMockup() {
  const columns = [
    { label:"New", color:"bg-violet-100 text-violet-700 border-violet-200", leads:[
      {name:"Marcus W.",goal:"Lose 20 lbs"},
      {name:"Natalie O.",goal:"Half marathon"},
      {name:"Derek H.",goal:"Build muscle"},
    ]},
    { label:"Contacted", color:"bg-blue-100 text-blue-700 border-blue-200", leads:[
      {name:"Sofia R.",goal:"Post-partum"},
      {name:"Ben K.",goal:"Powerlifting"},
    ]},
    { label:"Qualified", color:"bg-emerald-100 text-emerald-700 border-emerald-200", leads:[
      {name:"Amara D.",goal:"Body recomp"},
      {name:"Finn L.",goal:"Athletic perf"},
    ]},
  ];
  return (
    <div className="h-full bg-slate-50 overflow-hidden relative text-[10px] select-none">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900" />
      <div className="ml-8 p-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-slate-800 font-bold text-[11px]">Lead Pipeline</div>
          <div className="h-4 w-14 rounded bg-indigo-600 flex items-center justify-center text-white text-[8px]">+ Add Lead</div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 overflow-hidden">
          {columns.map(({label,color,leads})=>(
            <div key={label} className="bg-white rounded border border-slate-200 overflow-hidden">
              <div className={`px-1.5 py-0.5 border-b ${color} font-semibold text-[9px]`}>
                {label} · {leads.length}
              </div>
              <div className="p-1 space-y-1">
                {leads.map(({name,goal})=>(
                  <div key={name} className="bg-slate-50 rounded border border-slate-100 px-1.5 py-1">
                    <div className="text-slate-700 font-medium leading-none">{name}</div>
                    <div className="text-slate-400 text-[8px] mt-0.5 leading-none">{goal}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded px-2 py-1 flex items-center justify-between">
          <span className="text-indigo-600 text-[9px]">dawfit.app/apply/austin-rivera</span>
          <div className="h-3.5 w-8 rounded bg-indigo-600 flex items-center justify-center text-[7px] text-white">Copy</div>
        </div>
      </div>
    </div>
  );
}

export function ProgressMockup() {
  const bars = [3,4,4,5,4,5,3,4,5,4,5,4];
  const maxBar = 5;
  const weightPoints = [195,193,191,189,187,185,184,183];
  const minW = 182; const maxW = 196;

  return (
    <div className="h-full bg-slate-900 overflow-hidden relative text-[10px] select-none">
      <div className="p-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-[11px]">Jordan S. — Progress</div>
          <div className="text-slate-400 text-[9px]">Last 12 weeks</div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[{label:"Sessions (30d)",val:"18"},{label:"Weight Δ",val:"−12 lbs"},{label:"Avg RPE",val:"7.6"}].map(({label,val})=>(
            <div key={label} className="bg-slate-800 rounded border border-slate-700 p-1 text-center">
              <div className="text-slate-400 text-[8px]">{label}</div>
              <div className="text-white font-bold text-sm">{val}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 rounded border border-slate-700 p-1.5">
          <div className="text-slate-400 text-[9px] mb-1">Workouts / week</div>
          <div className="flex items-end gap-0.5 h-10">
            {bars.map((v,i)=>(
              <div key={i} className="flex-1 rounded-t" style={{height:`${(v/maxBar)*100}%`,background:"#6366f1",opacity:0.7+i*0.02}}/>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded border border-slate-700 p-1.5">
          <div className="text-slate-400 text-[9px] mb-1">Body Weight (lbs)</div>
          <svg viewBox="0 0 120 28" className="w-full h-7" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              points={weightPoints.map((w,i)=>{
                const x = (i/(weightPoints.length-1))*118+1;
                const y = 27-((w-minW)/(maxW-minW))*25;
                return `${x},${y}`;
              }).join(" ")}
            />
            {weightPoints.map((w,i)=>{
              const x = (i/(weightPoints.length-1))*118+1;
              const y = 27-((w-minW)/(maxW-minW))*25;
              return <circle key={i} cx={x} cy={y} r="1.5" fill="#6366f1"/>;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
