import { useState, useMemo } from "react";
import { Calculator, TrendingDown, TrendingUp, AlertTriangle, BookOpen, PartyPopper, CalendarCheck } from "lucide-react";

export default function LeaveManager() {
  const [totalClasses, setTotalClasses] = useState<number | string>(120);
  const [attendedClasses, setAttendedClasses] = useState<number | string>(115);
  const [requiredPercentage, setRequiredPercentage] = useState<number | string>(75);

  const [calcTotal, setCalcTotal] = useState(120);
  const [calcAttended, setCalcAttended] = useState(115);
  const [calcRequired, setCalcRequired] = useState(75);

  const handleCalculate = () => {
    setCalcTotal(Number(totalClasses) || 0);
    setCalcAttended(Number(attendedClasses) || 0);
    setCalcRequired(Number(requiredPercentage) || 0);
  };

  const stats = useMemo(() => {
    const currentPercent = calcTotal === 0 ? 0 : (calcAttended / calcTotal) * 100;
    const isSafe = currentPercent >= calcRequired;
    
    let skip = 0;
    let recover = 0;

    if (calcRequired > 0 && calcTotal > 0) {
      if (isSafe) {
        const skipRaw = (100 * calcAttended - calcRequired * calcTotal) / calcRequired;
        skip = Math.floor(Math.max(0, skipRaw));
      } else {
        const recoverRaw = (calcRequired * calcTotal - 100 * calcAttended) / (100 - calcRequired);
        recover = Math.ceil(Math.max(0, recoverRaw));
      }
    }

    return {
      currentPercent,
      isSafe,
      skip,
      recover,
      formattedPercent: currentPercent.toFixed(1)
    };
  }, [calcTotal, calcAttended, calcRequired]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0e17] min-h-screen text-white font-sans relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a233a] via-[#0a0e17] to-[#0a0e17] opacity-50 pointer-events-none"></div>

      <div className="max-w-[700px] mx-auto px-6 py-12 space-y-12 relative z-10">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Leave Manager</h1>
          <p className="text-[#8ba3b8] text-[15px]">Calculate how many lectures you can safely skip.</p>
        </div>

        {/* Calculator Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CalendarCheck className="w-[18px] h-[18px] text-[#e2e8f0]" />
            <span className="text-[15px]">Attendance Calculator</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#8ba3b8]">Total Lectures</label>
              <input 
                type="number" 
                value={totalClasses} 
                onChange={e => setTotalClasses(e.target.value)}
                className="w-full bg-[#353434] text-white border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#8ba3b8]">Attended</label>
              <input 
                type="number" 
                value={attendedClasses} 
                onChange={e => setAttendedClasses(e.target.value)}
                className="w-full bg-[#353434] text-white border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#8ba3b8]">Required %</label>
              <input 
                type="number" 
                value={requiredPercentage} 
                onChange={e => setRequiredPercentage(e.target.value)}
                className="w-full bg-[#353434] text-white border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium placeholder-gray-500"
              />
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full bg-[#ffffff] hover:bg-[#f0f0f0] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2.5 transition-colors shadow-sm"
          >
            <Calculator className="w-[18px] h-[18px]" />
            Calculate
          </button>
        </div>
        
        {/* Result Area */}
        <div className="pt-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stats.isSafe ? 'bg-[#1c2230]' : 'bg-[#2a1315]'}`}>
                {stats.isSafe ? (
                  <PartyPopper className="w-7 h-7 text-white" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-[#e53e3e]" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className={`text-[22px] font-bold tracking-tight mb-1 ${stats.isSafe ? 'text-white' : 'text-[#e53e3e]'}`}>
                  {stats.isSafe ? "You're safe! 🎉" : "Attendance too low!"}
                </h3>
                <p className="text-[#8ba3b8] text-[15px]">
                  {stats.isSafe ? "You have room to take breaks." : "You need to attend more lectures."}
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col justify-center">
              <div className="text-[32px] font-bold text-white tracking-tight leading-none mb-1.5">{stats.formattedPercent}%</div>
              <div className="text-[#8ba3b8] text-[11px] font-medium lowercase">current attendance</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 relative">
            <div className="w-full h-3.5 bg-[#1c2230] rounded-full overflow-hidden flex items-center relative">
              <div 
                className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out rounded-full ${stats.isSafe ? 'bg-white' : 'bg-[#ab2424]'}`} 
                style={{ width: `${Math.min(100, stats.currentPercent)}%` }} 
              />
            </div>
            {/* Required Marker (visually splitting the bar slightly) */}
            <div 
              className="absolute top-0 bottom-0 w-[3px] bg-[#0a0e17]" 
              style={{ left: `${calcRequired}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center text-[11px] text-[#5c6e84] font-medium relative h-5">
            <span className="absolute left-0">0%</span>
            <span className="absolute" style={{ left: `${calcRequired}%`, transform: 'translateX(-50%)' }}>
              {calcRequired}% required
            </span>
            <span className="absolute right-0">100%</span>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-2 gap-8 mt-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#1c2230] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                <TrendingDown className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="text-[38px] leading-none font-bold text-white mb-2.5 tracking-tight">{stats.skip}</div>
              <div className="text-[14px] text-[#8ba3b8]">lectures you can skip</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#1c2230] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                <TrendingUp className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="text-[38px] leading-none font-bold text-white mb-2.5 tracking-tight">{stats.recover}</div>
              <div className="text-[14px] text-[#8ba3b8]">
                {stats.isSafe ? "no extra needed" : "must attend to recover"}
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="pt-10 mb-8 border-t border-white/5">
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <BookOpen className="w-[18px] h-[18px] text-[#e2e8f0]" />
            <span className="text-[15px]">How it works</span>
          </div>
          <p className="text-[13.5px] leading-[1.8] text-[#8ba3b8]">
            We calculate based on the formula: <code className="text-[#a1b8c7] font-mono text-[13px] mx-1">X = (100×A - R×T) ÷ R</code> where A = attended, T = total, R = required %. The "must attend" count assumes all future lectures are attended consecutively.
          </p>
        </div>

      </div>
    </div>
  );
}
