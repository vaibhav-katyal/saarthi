import { useState, useMemo, useEffect } from "react";
import { 
  Calculator, TrendingDown, TrendingUp, AlertTriangle, BookOpen, PartyPopper, 
  CalendarCheck, Plus, Trash2, Edit2, LayoutGrid, CheckCircle2, Save, X
} from "lucide-react";

type Course = {
  id: string;
  name: string;
  totalPlannedLectures: number;
  requiredAttendance: number;
  delivered: number;
  attended: number;
};

type ViewMode = "calculator" | "dashboard";

export default function LeaveManager() {
  const [viewMode, setViewMode] = useState<ViewMode>("calculator");
  
  // Quick Calculator State
  const [calcDelivered, setCalcDelivered] = useState<number | string>(120);
  const [calcAttended, setCalcAttended] = useState<number | string>(115);
  const [calcRequired, setCalcRequired] = useState<number | string>(75);

  const [activeDelivered, setActiveDelivered] = useState(120);
  const [activeAttended, setActiveAttended] = useState(115);
  const [activeRequired, setActiveRequired] = useState(75);

  // Dashboard State
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // New Course Form
  const [newCourse, setNewCourse] = useState({
    name: "", totalPlannedLectures: 60, requiredAttendance: 75, delivered: 0, attended: 0
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("saarthi_courses");
    if (saved) {
      try {
        setCourses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse courses", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("saarthi_courses", JSON.stringify(courses));
  }, [courses]);

  const handleCalculate = () => {
    if (Number(calcAttended) > Number(calcDelivered)) {
      alert("Attended lectures cannot exceed delivered lectures.");
      return;
    }
    setActiveDelivered(Number(calcDelivered) || 0);
    setActiveAttended(Number(calcAttended) || 0);
    setActiveRequired(Number(calcRequired) || 0);
  };

  const calculateStats = (delivered: number, attended: number, required: number) => {
    const currentPercent = delivered === 0 ? 0 : (attended / delivered) * 100;
    
    let skip = 0;
    let recover = 0;

    if (required > 0 && delivered > 0) {
      if (currentPercent >= required) {
        const skipRaw = (100 * attended - required * delivered) / required;
        skip = Math.floor(Math.max(0, skipRaw));
      } else {
        const recoverRaw = (required * delivered - 100 * attended) / (100 - required);
        recover = Math.ceil(Math.max(0, recoverRaw));
      }
    }

    let status: 'safe' | 'warning' | 'critical' = 'critical';
    if (currentPercent >= required + 5) status = 'safe';
    else if (currentPercent >= required) status = 'warning';

    return {
      currentPercent,
      formattedPercent: currentPercent.toFixed(1),
      status,
      skip,
      recover,
      required
    };
  };

  const quickStats = useMemo(() => calculateStats(activeDelivered, activeAttended, activeRequired), [activeDelivered, activeAttended, activeRequired]);

  const handleAddCourse = () => {
    if (!newCourse.name.trim()) return;
    if (newCourse.attended > newCourse.delivered) {
      alert("Attended cannot exceed delivered lectures");
      return;
    }
    
    const course: Course = {
      id: Date.now().toString(),
      ...newCourse
    };
    
    setCourses([...courses, course]);
    setIsAddingCourse(false);
    setNewCourse({ name: "", totalPlannedLectures: 60, requiredAttendance: 75, delivered: 0, attended: 0 });
  };

  const handleUpdateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updated.attended > updated.delivered) updated.attended = updated.delivered;
        return updated;
      }
      return c;
    }));
  };

  const deleteCourse = (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
    if (status === 'safe') return <CheckCircle2 className={`text-emerald-400 ${className}`} />;
    if (status === 'warning') return <AlertTriangle className={`text-yellow-400 ${className}`} />;
    return <AlertTriangle className={`text-red-400 ${className}`} />;
  };

  const getStatusColors = (status: string) => {
    if (status === 'safe') return { bg: 'bg-emerald-400', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]', container: 'bg-emerald-400/10 border-emerald-400/20' };
    if (status === 'warning') return { bg: 'bg-yellow-400', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]', container: 'bg-yellow-400/10 border-yellow-400/20' };
    return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]', container: 'bg-red-500/10 border-red-500/20' };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070B14] min-h-screen text-white font-sans relative pb-10">
      {/* Background Noise & Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-accent/10 blur-[180px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">
        
        {/* Header & Toggle */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(0,245,255,0.15)] mb-1">
            <CalendarCheck className="h-3 w-3" />
            Smart Attendance
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Leave <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Manager</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Quickly calculate secure skips or track your subjects long-term.
          </p>

          <div className="flex justify-center mt-6">
            <div className="bg-black/50 p-1 rounded-2xl border border-white/5 flex gap-1 inline-flex">
              <button 
                onClick={() => setViewMode("calculator")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'calculator' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
              >
                <Calculator className="w-4 h-4" />
                Quick Calculator
              </button>
              <button 
                onClick={() => setViewMode("dashboard")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'dashboard' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Saved Courses
              </button>
            </div>
          </div>
        </div>

        {/* View Routing */}
        {viewMode === "calculator" ? (
          /* QUICK CALCULATOR MODE */
          <div className="w-full max-w-4xl mx-auto relative rounded-[2rem] border border-white/5 bg-background/40 p-5 md:p-6 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 grid md:grid-cols-[1fr_1.5fr] gap-6 md:gap-8">
              
              {/* Calculator Inputs */}
              <div className="space-y-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-5 md:pb-0 md:pr-6">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-muted-foreground/80 px-1 ml-1">Lectures Delivered</label>
                    <input 
                      type="number" 
                      value={calcDelivered} 
                      onChange={e => setCalcDelivered(e.target.value)}
                      className="w-full rounded-2xl border border-border/50 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-muted-foreground/80 px-1 ml-1">Lectures Attended</label>
                    <input 
                      type="number" 
                      value={calcAttended} 
                      onChange={e => setCalcAttended(e.target.value)}
                      className="w-full rounded-2xl border border-border/50 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-muted-foreground/80 px-1 ml-1">Required %</label>
                    <input 
                      type="number" 
                      value={calcRequired} 
                      onChange={e => setCalcRequired(e.target.value)}
                      className="w-full rounded-2xl border border-border/50 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCalculate}
                  className="relative overflow-hidden w-full group/btn rounded-2xl bg-gradient-to-r from-primary to-accent p-0.5 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 h-[48px]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-10" />
                  <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center gap-2 rounded-[14px] z-20 relative px-4 text-sm font-bold text-primary-foreground shadow-[0_0_20px_rgba(0,245,255,0.3)] group-hover/btn:shadow-[0_0_40px_rgba(123,97,255,0.5)]">
                    <Calculator className="w-4 h-4" />
                    Calculate 
                  </div>
                </button>
              </div>
              
              {/* Results Area */}
              <div className="flex flex-col justify-center space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-lg ${getStatusColors(quickStats.status).container} ${getStatusColors(quickStats.status).text}`}>
                      <StatusIcon status={quickStats.status} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tight mb-0.5 ${getStatusColors(quickStats.status).text}`}>
                        {quickStats.status === 'safe' ? "You're safe! 🎉" : quickStats.status === 'warning' ? "Warning Zone" : "Critical bounds!"}
                      </h3>
                      <p className="text-muted-foreground text-[13px]">
                        {quickStats.status === 'safe' ? "You have room to take breaks." : quickStats.status === 'warning' ? "Careful, close to requirement." : "You need to attend more lectures."}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1">
                      {quickStats.formattedPercent}%
                    </div>
                    <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                      Current
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex items-center relative border border-white/5 shadow-inner">
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out rounded-full ${getStatusColors(quickStats.status).bg} ${getStatusColors(quickStats.status).glow}`} 
                      style={{ width: `${Math.min(100, quickStats.currentPercent)}%` }} 
                    />
                    {/* Required Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full z-10" 
                      style={{ left: `${quickStats.required}%`, transform: 'translateX(-50%)' }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider relative h-4 px-1">
                    <span className="absolute left-0">0%</span>
                    <span className="absolute text-white font-bold" style={{ left: `${quickStats.required}%`, transform: 'translateX(-50%)' }}>
                      {quickStats.required}% required
                    </span>
                    <span className="absolute right-0">100%</span>
                  </div>
                </div>

                {/* Highlight Stats */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-primary/20 transition-colors">
                      <TrendingDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight mb-0.5">{quickStats.skip}</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Safe Skips</div>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-accent/20 transition-colors">
                      <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight mb-0.5">{quickStats.recover}</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Extra Needed
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* DASHBOARD MODE */
          <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            {courses.length === 0 && !isAddingCourse ? (
              <div className="flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm border border-white/5 rounded-[2rem] p-12 text-center shadow-xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Courses Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Add your first course to start tracking your attendance over the semester.
                </p>
                <button 
                  onClick={() => setIsAddingCourse(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Course
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-bold tracking-tight">Your Courses</h2>
                  {!isAddingCourse && (
                    <button 
                      onClick={() => setIsAddingCourse(true)}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 border border-white/5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Course
                    </button>
                  )}
                </div>

                {isAddingCourse && (
                  <div className="bg-background/40 backdrop-blur-xl border border-primary/30 rounded-[1.5rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold">Create New Course</h3>
                        <button onClick={() => setIsAddingCourse(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5"/></button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5 lg:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Course Name</label>
                          <input 
                            value={newCourse.name}
                            onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                            placeholder="e.g. Operating Systems"
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Total Planned</label>
                          <input 
                            type="number"
                            value={newCourse.totalPlannedLectures}
                            onChange={e => setNewCourse({...newCourse, totalPlannedLectures: Number(e.target.value)})}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Required %</label>
                          <input 
                            type="number"
                            value={newCourse.requiredAttendance}
                            onChange={e => setNewCourse({...newCourse, requiredAttendance: Number(e.target.value)})}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                          />
                        </div>
                        <button 
                          onClick={handleAddCourse}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl py-2.5 px-4 transition-all"
                        >
                          Save Course
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map(course => {
                    const stats = calculateStats(course.delivered, course.attended, course.requiredAttendance);
                    const colors = getStatusColors(stats.status);
                    
                    return (
                      <div key={course.id} className="bg-background/30 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 shadow-lg relative group">
                        
                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none ${colors.bg}`} />
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[200px]">{course.name}</h3>
                            <div className="flex gap-2 text-xs font-medium">
                              <span className="bg-white/5 py-1 px-2 rounded-md border border-white/5 text-muted-foreground">Planned: {course.totalPlannedLectures}</span>
                              <span className="bg-white/5 py-1 px-2 rounded-md border border-white/5 text-muted-foreground">Req: {course.requiredAttendance}%</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => deleteCourse(course.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1 block">Delivered</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateCourse(course.id, { delivered: Math.max(0, course.delivered - 1) })} className="bg-white/5 p-1 rounded hover:bg-white/10">-</button>
                              <input 
                                type="number" 
                                value={course.delivered} 
                                onChange={e => handleUpdateCourse(course.id, { delivered: Number(e.target.value) })}
                                className="w-full bg-transparent text-center font-bold text-lg outline-none"
                              />
                              <button onClick={() => handleUpdateCourse(course.id, { delivered: course.delivered + 1 })} className="bg-white/5 p-1 rounded hover:bg-white/10">+</button>
                            </div>
                          </div>
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1 block">Attended</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateCourse(course.id, { attended: Math.max(0, course.attended - 1) })} className="bg-white/5 p-1 rounded hover:bg-white/10">-</button>
                              <input 
                                type="number" 
                                value={course.attended} 
                                onChange={e => handleUpdateCourse(course.id, { attended: Number(e.target.value) })}
                                className="w-full bg-transparent text-center font-bold text-lg outline-none"
                              />
                              <button onClick={() => handleUpdateCourse(course.id, { attended: course.attended + 1 })} className="bg-white/5 p-1 rounded hover:bg-white/10">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10 border-t border-white/10 pt-5 mt-2">
                           <div className="flex justify-between items-center">
                             <div className="text-sm font-semibold text-white/90">Current Attendance</div>
                             <div className="text-xl font-extrabold">{stats.formattedPercent}%</div>
                           </div>

                           <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                             <div className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700 ease-out ${colors.bg}`} style={{ width: `${Math.min(100, stats.currentPercent)}%` }} />
                             <div className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ left: `${course.requiredAttendance}%` }} />
                           </div>
                           
                           <div className={`rounded-xl p-4 mt-2 border ${colors.container}`}>
                             <h4 className={`text-base font-extrabold mb-1 tracking-tight ${colors.text}`}>
                               {stats.status === 'safe' && "Holiday Mode 🌴"}
                               {stats.status === 'warning' && "Caution Zone ⚠️"}
                               {stats.status === 'critical' && "Recovery Mode 🚨"}
                             </h4>
                             <p className="text-sm text-white/80">
                               {stats.status === 'safe' && <>You can safely skip <strong className={`font-bold ${colors.text}`}>{stats.skip} more classes</strong></>}
                               {stats.status === 'warning' && <>You can skip <strong className={`font-bold ${colors.text}`}>{stats.skip} more classes</strong>, but you are very close to the {course.requiredAttendance}% edge.</>}
                               {stats.status === 'critical' && <>You need <strong className={`font-bold ${colors.text}`}>{stats.recover} more classes</strong> to reach {course.requiredAttendance}%</>}
                             </p>
                           </div>
                        </div>
                        
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
