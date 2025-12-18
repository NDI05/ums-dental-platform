'use client';

// Simple CSS Bar Chart Component
const WeeklyActivityChart = ({ data }: { data: { day: string, count: number }[] }) => {
    // Determine max for scaling
    const max = Math.max(...data.map(d => d.count), 5); // Minimum scale of 5

    return (
        <div className="flex items-end justify-between h-48 w-full gap-2 pt-4">
            {data.map((item, i) => {
                const height = Math.round((item.count / max) * 100);
                return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer" title={`${item.count} Siswa`}>
                        <div className="relative w-full bg-sky-50 rounded-t-xl h-full flex items-end overflow-hidden">
                            <div
                                style={{ height: `${height}%` }}
                                className="w-full bg-sky-500 group-hover:bg-sky-600 transition-all duration-500 rounded-t-xl relative min-h-[12px]"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.count} Siswa
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{item.day}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default WeeklyActivityChart;
