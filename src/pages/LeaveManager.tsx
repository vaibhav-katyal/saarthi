import { useState, useMemo, useEffect } from "react";
import {
  Calculator, TrendingDown, TrendingUp, AlertTriangle, BookOpen, PartyPopper,
  CalendarCheck, Plus, Trash2, Edit2, LayoutGrid, CheckCircle2, Save, X
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type Course = {
  _id?: string;
  id?: string;
  name: string;
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
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  // New Course Form
  const [newCourse, setNewCourse] = useState({
    name: "", requiredAttendance: 75, delivered: 0, attended: 0
  });

  // Load from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCourses(data.data.map((c: any) => ({ ...c, id: c._id })));
          }
        }
      } catch (e) {
        console.error("Failed to fetch courses", e);
      }
    };
    fetchCourses();
  }, []);

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

  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) return;
    if (newCourse.attended > newCourse.delivered) {
      alert("Attended cannot exceed delivered lectures");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        const data = await res.json();
        setCourses([...courses, { ...data.data, id: data.data._id }]);
        setIsAddingCourse(false);
        setNewCourse({ name: "", requiredAttendance: 75, delivered: 0, attended: 0 });
      }
    } catch (e) {
      console.error("Failed to add course", e);
    }
  };

  const handleUpdateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => {
      if (c.id === id || c._id === id) {
        const updated = { ...c, ...updates };
        if (updated.attended > updated.delivered) updated.attended = updated.delivered;
        return updated;
      }
      return c;
    }));
    setUnsavedChanges(prev => ({ ...prev, [id]: true }));
  };

  const handleSaveCourse = async (id: string) => {
    const courseToSave = courses.find(c => c.id === id || c._id === id);
    if (!courseToSave || !courseToSave._id) return;

    setIsSaving(prev => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/courses/${courseToSave._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseToSave)
      });
      if (res.ok) {
        setUnsavedChanges(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        alert("Failed to save. Is the backend server running with the new routes?");
      }
    } catch (e) {
      console.error("Failed to save course", e);
      alert("Failed to save. Network Error.");
    } finally {
      setIsSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteCourse = async (id: string) => {
    const courseToDelete = courses.find(c => c.id === id || c._id === id);
    if (!courseToDelete || !courseToDelete._id) return;

    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/courses/${courseToDelete._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCourses(courses.filter(c => c.id !== id && c._id !== id));
          setUnsavedChanges(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      } catch (e) {
        console.error("Failed to delete course", e);
      }
    }
  };

  const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
    if (status === 'safe') return <CheckCircle2 className={`text-emerald-400 ${className}`} />;
    if (status === 'warning') return <AlertTriangle className={`text-yellow-400 ${className}`} />;
    return <AlertTriangle className={`text-red-400 ${className}`} />;
  };

  const getStatusColors = (status: string) => {
    if (status === 'safe') return { bg: 'bg-white/40', text: 'text-white/80', glow: '', container: 'bg-white/[0.05] border-white/[0.08]' };
    if (status === 'warning') return { bg: 'bg-white/30', text: 'text-white/60', glow: '', container: 'bg-white/[0.03] border-white/[0.06]' };
    return { bg: 'bg-white/20', text: 'text-white/50', glow: '', container: 'bg-white/[0.02] border-white/[0.05]' };
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-black min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">

        {/* Header & Toggle */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/60 mb-1">
            <CalendarCheck className="h-3 w-3" />
            Smart Attendance
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
            Leave <span className="text-white">Manager</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            Quickly calculate secure skips or track your subjects long-term.
          </p>

          <div className="flex justify-center mt-6">
            <div className="bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] flex gap-1 inline-flex">
              <button
                onClick={() => setViewMode("calculator")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'calculator' ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.05]'}`}
              >
                <Calculator className="w-4 h-4" />
                Quick Calculator
              </button>
              <button
                onClick={() => setViewMode("dashboard")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'dashboard' ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.05]'}`}
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
          <div className="w-full max-w-4xl mx-auto relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 animate-in fade-in zoom-in-95 duration-500">

            <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 md:gap-8">

              {/* Calculator Inputs */}
              <div className="space-y-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/[0.06] pb-5 md:pb-0 md:pr-6">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/50 px-1 ml-1">Lectures Delivered</label>
                    <input
                      type="number"
                      value={calcDelivered}
                      onChange={e => setCalcDelivered(e.target.value === "" ? "" : Number(e.target.value).toString())}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/50 px-1 ml-1">Lectures Attended</label>
                    <input
                      type="number"
                      value={calcAttended}
                      onChange={e => setCalcAttended(e.target.value === "" ? "" : Number(e.target.value).toString())}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/50 px-1 ml-1">Required %</label>
                    <input
                      type="number"
                      value={calcRequired}
                      onChange={e => setCalcRequired(e.target.value === "" ? "" : Number(e.target.value).toString())}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all mt-2 h-[48px] flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </button>
              </div>

              {/* Results Area */}
              <div className="flex flex-col justify-center space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06] shadow-lg ${getStatusColors(quickStats.status).container} ${getStatusColors(quickStats.status).text}`}>
                      <StatusIcon status={quickStats.status} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tight mb-0.5 ${getStatusColors(quickStats.status).text}`}>
                        {quickStats.status === 'safe' ? "You're safe!" : quickStats.status === 'warning' ? "Warning Zone" : "Critical bounds!"}
                      </h3>
                      <p className={`text-[13px] ${getStatusColors(quickStats.status).text}`}>
                        {quickStats.status === 'safe' ? "You have room to take breaks." : quickStats.status === 'warning' ? "Careful, close to requirement." : "You need to attend more lectures."}
                      </p>

                    </div>


                  </div>

                  <div className="text-left sm:text-right">
                    <div className={`text-3xl font-bold tracking-tight leading-none mb-1 ${quickStats.status === 'safe' ? 'text-green-400' : quickStats.status === 'warning' ? 'text-orange-400' : 'text-red-400'}`}>
                      {quickStats.formattedPercent}%
                    </div>
                    <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                      Current
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden flex items-center relative border border-white/[0.06]">
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

                  <div className="flex justify-between items-center text-[10px] text-white/40 font-medium uppercase tracking-wider relative h-4 px-1">
                    <span className="absolute left-0">0%</span>
                    <span className="absolute text-white font-bold" style={{ left: `${quickStats.required}%`, transform: 'translateX(-50%)' }}>
                      {quickStats.required}% required
                    </span>
                    <span className="absolute right-0">100%</span>
                  </div>
                </div>

                {/* Highlight Stats */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] transition-colors group">
                    <div className="w-8 h-8 bg-white/[0.05] rounded-full flex items-center justify-center mb-1.5 group-hover:bg-white/10 transition-colors">
                      <TrendingDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                    <div className={`text-2xl font-bold tracking-tight mb-0.5 ${quickStats.status === 'safe' ? 'text-green-400' : 'text-white'}`}>{quickStats.skip}</div>
                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Safe Skips</div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] transition-colors group">
                    <div className="w-8 h-8 bg-white/[0.05] rounded-full flex items-center justify-center mb-1.5 group-hover:bg-white/10 transition-colors">
                      <TrendingUp className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                    <div className={`text-2xl font-bold tracking-tight mb-0.5 ${quickStats.status === 'critical' ? 'text-red-400' : 'text-white'}`}>{quickStats.recover}</div>
                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
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
              <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mb-4 text-white/30">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white/80">No Courses Yet</h3>
                <p className="text-white/40 text-sm max-w-sm mb-6">
                  Add your first course to start tracking your attendance over the semester.
                </p>
                <button
                  onClick={() => setIsAddingCourse(true)}
                  className="bg-white hover:bg-white/90 text-black font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Course
                </button>
              </div>
            ) : (
              <div className="space-y-6">

                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-bold tracking-tight text-white/80">Your Courses</h2>
                  {!isAddingCourse && (
                    <button
                      onClick={() => setIsAddingCourse(true)}
                      className="bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 border border-white/[0.06]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Course
                    </button>
                  )}
                </div>

                {isAddingCourse && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold text-white/80">Create New Course</h3>
                      <button onClick={() => setIsAddingCourse(false)} className="text-white/40 hover:text-white/60"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-medium text-white/40 uppercase">Course Name</label>
                        <input
                          value={newCourse.name}
                          onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                          placeholder="e.g. Operating Systems"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/40 uppercase">Required %</label>
                        <input
                          type="number"
                          value={newCourse.requiredAttendance === 0 ? "" : newCourse.requiredAttendance.toString()}
                          onChange={e => setNewCourse({ ...newCourse, requiredAttendance: e.target.value === "" ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                        />
                      </div>
                      <button
                        onClick={handleAddCourse}
                        className="bg-white hover:bg-white/90 text-black font-bold rounded-xl py-2.5 px-4 transition-all"
                      >
                        Save Course
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map(course => {
                    const stats = calculateStats(course.delivered, course.attended, course.requiredAttendance);
                    const colors = getStatusColors(stats.status);

                    return (
                      <div key={course.id || course._id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 relative group">

                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none ${colors.bg}`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="text-lg font-bold text-white/80 mb-1 truncate max-w-[200px]">{course.name}</h3>
                            <div className="flex gap-2 text-xs font-medium">
                              <span className="bg-white/[0.05] py-1 px-2 rounded-md border border-white/[0.06] text-white/40">Req: {course.requiredAttendance}%</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {unsavedChanges[(course.id || course._id) as string] && (
                              <button
                                onClick={() => handleSaveCourse((course.id || course._id) as string)}
                                disabled={isSaving[(course.id || course._id) as string]}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/80 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Save className="w-3.5 h-3.5" /> {isSaving[(course.id || course._id) as string] ? "Saving..." : "Save"}
                              </button>
                            )}
                            <button onClick={() => deleteCourse((course.id || course._id) as string)} className="p-2 bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white/60 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                            <label className="text-[10px] text-white/40 uppercase font-medium tracking-wider mb-1 block">Delivered</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateCourse((course.id || course._id) as string, { delivered: Math.max(0, course.delivered - 1) })} className="bg-white/[0.05] p-1 rounded hover:bg-white/10">-</button>
                              <input
                                type="number"
                                value={course.delivered === 0 ? "" : course.delivered.toString()}
                                onChange={e => handleUpdateCourse((course.id || course._id) as string, { delivered: e.target.value === "" ? 0 : Number(e.target.value) })}
                                placeholder="0"
                                className="w-full bg-transparent text-center font-bold text-lg outline-none text-white/80"
                              />
                              <button onClick={() => handleUpdateCourse((course.id || course._id) as string, { delivered: course.delivered + 1 })} className="bg-white/[0.05] p-1 rounded hover:bg-white/10">+</button>
                            </div>
                          </div>
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                            <label className="text-[10px] text-white/40 uppercase font-medium tracking-wider mb-1 block">Attended</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateCourse((course.id || course._id) as string, { attended: Math.max(0, course.attended - 1) })} className="bg-white/[0.05] p-1 rounded hover:bg-white/10">-</button>
                              <input
                                type="number"
                                value={course.attended === 0 ? "" : course.attended.toString()}
                                onChange={e => handleUpdateCourse((course.id || course._id) as string, { attended: e.target.value === "" ? 0 : Number(e.target.value) })}
                                placeholder="0"
                                className="w-full bg-transparent text-center font-bold text-lg outline-none text-white/80"
                              />
                              <button onClick={() => handleUpdateCourse((course.id || course._id) as string, { attended: course.attended + 1 })} className="bg-white/[0.05] p-1 rounded hover:bg-white/10">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10 border-t border-white/[0.06] pt-5 mt-2">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-white/70">Current Attendance</div>
                            <div className="text-xl font-bold text-white/80">{stats.formattedPercent}%</div>
                          </div>

                          <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden relative border border-white/[0.06]">
                            <div className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700 ease-out ${colors.bg}`} style={{ width: `${Math.min(100, stats.currentPercent)}%` }} />
                            <div className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ left: `${course.requiredAttendance}%` }} />
                          </div>

                          <div className={`rounded-xl p-4 mt-2 border ${colors.container}`}>
                            <h4 className={`text-base font-bold mb-1 tracking-tight ${colors.text}`}>
                              {stats.status === 'safe' && (
                                <span className="text-green-400">Holiday Mode 🌴</span>
                              )}
                              {stats.status === 'warning' && (
                                <span className="text-orange-400">Caution Zone ⚠️</span>
                              )}
                              {stats.status === 'critical' && (
                                <span className="text-red-400">Recovery Mode 🚨</span>
                              )}

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
