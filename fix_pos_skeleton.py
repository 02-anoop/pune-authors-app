import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_loading = """  if (loading) {
    return (
      <div className="flex flex-col bg-gray-50 overflow-hidden rounded-2xl border shadow-sm h-[calc(100vh-140px)] w-full relative">
        <div className="bg-paa-navy h-16 shrink-0 w-full animate-pulse"></div>
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row p-4 gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[280px] bg-white rounded animate-pulse border border-gray-200"></div>
            ))}
          </div>
          <div className="w-full md:w-[350px] lg:w-[400px] h-[45%] md:h-full bg-white rounded animate-pulse border border-gray-200"></div>
        </div>
      </div>
    );
  }"""

new_loading = """  if (loading) {
    return (
      <div className="flex flex-col bg-gray-50 overflow-hidden rounded-2xl border border-paa-navy/5 shadow-sm h-[calc(100vh-140px)] w-full relative">
        <div className="bg-white border-b border-paa-navy/5 px-6 py-4 flex items-center justify-between shrink-0 h-[72px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full dash-skeleton"></div>
            <div>
              <div className="w-48 h-6 dash-skeleton rounded mb-2"></div>
              <div className="w-32 h-4 dash-skeleton rounded"></div>
            </div>
          </div>
          <div className="w-32 h-10 dash-skeleton rounded-lg"></div>
        </div>
        <div className="flex flex-1 p-4 gap-4 flex-col md:flex-row overflow-hidden">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[300px] bg-white rounded-xl border border-paa-navy/5 p-4 flex flex-col shadow-sm">
                 <div className="h-36 dash-skeleton rounded-lg w-full mb-4 shrink-0"></div>
                 <div className="h-4 dash-skeleton rounded w-3/4 mb-2"></div>
                 <div className="h-4 dash-skeleton rounded w-1/2 mb-4"></div>
                 <div className="mt-auto h-10 dash-skeleton rounded-full w-full"></div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex w-[350px] lg:w-[400px] bg-white rounded-xl border border-paa-navy/5 p-6 shrink-0 h-full flex-col shadow-sm">
             <div className="flex gap-3 items-center mb-8 shrink-0">
                <div className="w-6 h-6 dash-skeleton rounded-full"></div>
                <div className="h-6 dash-skeleton rounded w-1/2"></div>
             </div>
             <div className="space-y-6 flex-1 overflow-hidden">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <div className="flex-1">
                           <div className="h-4 dash-skeleton rounded w-full mb-2"></div>
                           <div className="h-3 dash-skeleton rounded w-1/3"></div>
                        </div>
                        <div className="w-24 h-8 dash-skeleton rounded-full shrink-0"></div>
                    </div>
                 ))}
             </div>
          </div>
        </div>
      </div>
    );
  }"""

content = content.replace(old_loading, new_loading)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS skeleton fixed.")
