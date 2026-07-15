const fs = require('fs');
const file = 'app/dashboard/upload/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. PremiumSelect
content = content.replace(
  /className={`w-full flex items-center justify-between rounded-2xl px-4 py-2\.5 text-xs font-bold shadow-sm transition-all cursor-pointer border/g,
  'className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer border'
);
content = content.replace(
  /<ChevronDown className={`w-4 h-4 transition-transform/g,
  '<ChevronDown className={`w-3.5 h-3.5 transition-transform'
);
content = content.replace(
  /className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-\[0_10px_40px_rgba\(0,0,0,0\.1\)\] overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-2 max-h-\[300px\] overflow-y-auto no-scrollbar"/g,
  'className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1 max-h-[300px] overflow-y-auto no-scrollbar"'
);
content = content.replace(
  /px-4 py-2\.5 text-xs font-bold cursor-pointer transition-colors hover:bg-slate-50/g,
  'px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50'
);

// 2. Global Page Filters Container
content = content.replace(
  /className="relative z-50 flex flex-wrap items-center gap-4 bg-white\/80 backdrop-blur-xl p-5 rounded-\[2rem\] shadow-sm border border-slate-200\/60"/g,
  'className="relative z-50 flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-sm border border-slate-200/60"'
);

// 3. Right Side: Validation Sidebar (reduce padding and icon sizes)
content = content.replace(
  /className="border-slate-200\/60 shadow-sm rounded-\[2rem\] overflow-hidden bg-white\/80 backdrop-blur-xl"/g,
  'className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl"'
);
content = content.replace(
  /className="border-b border-slate-100 bg-slate-50\/50 py-5 px-6"/g,
  'className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-4"'
);
content = content.replace(
  /<CardContent className="p-5">/g,
  '<CardContent className="p-4">'
);
content = content.replace(
  /w-12 h-12 rounded-xl flex items-center justify-center shadow-sm/g,
  'w-8 h-8 rounded-lg flex items-center justify-center shadow-sm'
);
content = content.replace(
  /py-2\.5 px-4 rounded-xl bg-slate-50 border border-slate-100\/60/g,
  'py-2 px-3 rounded-lg bg-slate-50 border border-slate-100/60'
);

// 4. LEFT SIDE: Main Upload Workspace
content = content.replace(
  /className="bg-white\/90 backdrop-blur-xl rounded-\[2\.5rem\] border border-slate-200\/60 shadow-sm overflow-hidden flex flex-col"/g,
  'className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col"'
);
content = content.replace(
  /className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50\/50"/g,
  'className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"'
);
content = content.replace(
  /w-12 h-12 rounded-\[1rem\] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary\/25/g,
  'w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm'
);
content = content.replace(
  /text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3/g,
  'text-lg font-black tracking-tight text-slate-900 flex items-center gap-2'
);
content = content.replace(
  /ml-\[3\.75rem\]/g,
  'ml-[2.75rem]'
);

// 5. Dropzone
content = content.replace(
  /className="p-8 flex flex-col flex-1"/g,
  'className="p-5 flex flex-col flex-1"'
);
content = content.replace(
  /gap-6 border-2 border-dashed rounded-\[2rem\] cursor-pointer transition-all duration-300 flex-1 min-h-\[300px\]/g,
  'gap-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 flex-1 min-h-[200px]'
);
content = content.replace(
  /w-20 h-20 rounded-3xl/g,
  'w-14 h-14 rounded-2xl'
);
content = content.replace(
  /w-10 h-10/g,
  'w-6 h-6'
);

// 6. Action Buttons
content = content.replace(
  /flex-1 py-7 rounded-2xl text-sm font-bold shadow-sm/g,
  'flex-1 py-4 rounded-xl text-sm font-bold shadow-sm'
);
content = content.replace(
  /flex-\[2\] py-7 rounded-2xl text-base font-black shadow-xl/g,
  'flex-[2] py-4 rounded-xl text-sm font-black shadow-sm'
);

// 7. Validation Data Results (Stats Cards)
content = content.replace(
  /p-8 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-\[2rem\]/g,
  'p-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl'
);
content = content.replace(
  /p-8 bg-red-50 hover:bg-red-100 border border-red-200 rounded-\[2rem\]/g,
  'p-5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl'
);
content = content.replace(
  /text-4xl font-black/g,
  'text-3xl font-black'
);

// 8. Date Selection Bar
content = content.replace(
  /className="px-8 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center gap-4"/g,
  'className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-4"'
);
content = content.replace(
  /px-5 py-2 rounded-xl text-xs font-bold transition-all/g,
  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all'
);

fs.writeFileSync(file, content);
console.log('Done');
