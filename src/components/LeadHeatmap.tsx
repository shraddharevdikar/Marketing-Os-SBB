import React, { useState } from "react";
import { 
  Calendar, Clock, Flame, Zap, TrendingUp, Info, Filter, Sparkles, Award, Layers
} from "lucide-react";

interface LeadHeatmapProps {
  onLogAction?: (action: string, details: string) => void;
}

// Days of week and Time Blocks
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = [
  { id: "early", label: "00:00 - 06:00 (Overnight)" },
  { id: "morning", label: "06:00 - 12:00 (Morning)" },
  { id: "afternoon", label: "12:00 - 18:00 (Afternoon)" },
  { id: "evening", label: "18:00 - 24:00 (Evening)" }
];

// Historical matrix data: lead volume count per day & time slot
const weeklyHeatmapMatrix: Record<string, number[]> = {
  // Array of 4 values corresponding to [early, morning, afternoon, evening]
  Mon: [3, 22, 38, 14],
  Tue: [5, 34, 52, 21], // Peak conversion
  Wed: [4, 28, 48, 19],
  Thu: [6, 31, 56, 25], // Peak conversion
  Fri: [2, 18, 29, 11],
  Sat: [1, 8, 12, 6],
  Sun: [2, 10, 15, 8]
};

// Day of Month breakdown data (31 days)
const dayOfMonthData = [
  { day: 1, leads: 18, peak: false },
  { day: 2, leads: 24, peak: false },
  { day: 3, leads: 31, peak: false },
  { day: 4, leads: 42, peak: true },
  { day: 5, leads: 38, peak: false },
  { day: 6, leads: 15, peak: false },
  { day: 7, leads: 12, peak: false },
  { day: 8, leads: 29, peak: false },
  { day: 9, leads: 45, peak: true },
  { day: 10, leads: 51, peak: true },
  { day: 11, leads: 48, peak: false },
  { day: 12, leads: 35, peak: false },
  { day: 13, leads: 19, peak: false },
  { day: 14, leads: 14, peak: false },
  { day: 15, leads: 58, peak: true }, // Mid-month payday / budget release peak
  { day: 16, leads: 54, peak: true },
  { day: 17, leads: 41, peak: false },
  { day: 18, leads: 37, peak: false },
  { day: 19, leads: 22, peak: false },
  { day: 20, leads: 16, peak: false },
  { day: 21, leads: 33, peak: false },
  { day: 22, leads: 46, peak: false },
  { day: 23, leads: 49, peak: true },
  { day: 24, leads: 40, peak: false },
  { day: 25, leads: 28, peak: false },
  { day: 26, leads: 17, peak: false },
  { day: 27, leads: 11, peak: false },
  { day: 28, leads: 30, peak: false },
  { day: 29, leads: 36, peak: false },
  { day: 30, leads: 25, peak: false },
  { day: 31, leads: 19, peak: false }
];

// Helper to determine heat intensity color class
function getHeatColorClass(value: number, maxVal: number = 60): string {
  const ratio = value / maxVal;
  if (ratio >= 0.8) return "bg-emerald-600 text-white font-black shadow-sm ring-1 ring-emerald-400";
  if (ratio >= 0.6) return "bg-emerald-500 text-white font-bold";
  if (ratio >= 0.4) return "bg-emerald-400/80 text-slate-900 font-bold";
  if (ratio >= 0.25) return "bg-emerald-200 text-emerald-950 font-bold";
  if (ratio >= 0.1) return "bg-emerald-100/70 text-emerald-900 font-medium";
  return "bg-slate-100 text-slate-400";
}

export const LeadHeatmap: React.FC<LeadHeatmapProps> = ({ onLogAction }) => {
  const [activeView, setActiveView] = useState<"dayOfWeek" | "dayOfMonth">("dayOfWeek");
  const [hoveredCell, setHoveredCell] = useState<{ label: string; count: number } | null>(null);

  // Calculate totals
  const totalLeadsCalculated = Object.values(weeklyHeatmapMatrix).reduce(
    (acc, arr) => acc + arr.reduce((a, b) => a + b, 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              Lead Generation Heatmap
            </span>
            <span className="text-slate-400 text-xs">• Temporal Peak Volume Intelligence</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Historical Lead Conversion Volume Heatmap
          </h3>
          <p className="text-xs text-slate-500">
            Identify peak high-converting time windows across days of the week and days of the month to optimize ad scheduling and automated AI outreach.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => {
              setActiveView("dayOfWeek");
              if (onLogAction) onLogAction("SWITCH_HEATMAP_VIEW", "Switched lead heatmap to Day of Week x Time of Day matrix.");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "dayOfWeek"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Day x Time Block</span>
          </button>

          <button
            onClick={() => {
              setActiveView("dayOfMonth");
              if (onLogAction) onLogAction("SWITCH_HEATMAP_VIEW", "Switched lead heatmap to Day of Month distribution.");
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "dayOfMonth"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day of Month (1-31)</span>
          </button>
        </div>
      </div>

      {/* Highlights Key Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Optimal Peak Window</h4>
            <p className="text-xs text-slate-600 font-bold mt-0.5">Tuesdays & Thursdays (12:00 - 18:00)</p>
            <p className="text-[10px] text-slate-400 mt-1">Generates 38.4% of all qualified inbound lead inquiries.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Mid-Month Payday Surge</h4>
            <p className="text-xs text-slate-600 font-bold mt-0.5">Days 9-10 & Days 15-16</p>
            <p className="text-[10px] text-slate-400 mt-1">Highest B2B demo requests align with corporate budget unlocks.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Ad Schedule Recommendation</h4>
            <p className="text-xs text-slate-600 font-bold mt-0.5">Scale Bids +25% Mon-Thu 11am-5pm</p>
            <p className="text-[10px] text-slate-400 mt-1">Throttle weekend budgets to reduce low-intent click waste.</p>
          </div>
        </div>
      </div>

      {/* VIEW 1: Day of Week x Time Slot Matrix */}
      {activeView === "dayOfWeek" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Weekly Conversion Heatmap (Leads Generated)
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span>Low Volume</span>
              <div className="flex items-center gap-0.5">
                <span className="w-3 h-3 rounded bg-slate-100" />
                <span className="w-3 h-3 rounded bg-emerald-100" />
                <span className="w-3 h-3 rounded bg-emerald-300" />
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="w-3 h-3 rounded bg-emerald-600" />
              </div>
              <span className="font-bold text-emerald-700">Peak Volume (50+)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="text-left py-2 px-3">Day of Week</th>
                  {timeSlots.map(ts => (
                    <th key={ts.id} className="py-2 px-3">{ts.label}</th>
                  ))}
                  <th className="py-2 px-3 text-right">Daily Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {daysOfWeek.map(day => {
                  const rowValues = weeklyHeatmapMatrix[day];
                  const rowTotal = rowValues.reduce((a, b) => a + b, 0);

                  return (
                    <tr key={day} className="hover:bg-slate-50/80 transition-colors">
                      <td className="text-left py-3 px-3 font-bold text-slate-900 font-sans">{day}</td>
                      {rowValues.map((val, slotIdx) => {
                        const slotLabel = timeSlots[slotIdx].label;
                        return (
                          <td key={slotIdx} className="p-1">
                            <div
                              onMouseEnter={() => setHoveredCell({ label: `${day} (${slotLabel})`, count: val })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${getHeatColorClass(val)}`}
                            >
                              {val}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-right py-3 px-3 font-bold text-slate-900">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hoveredCell && (
            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs flex items-center justify-between font-mono animate-fadeIn">
              <span className="text-slate-300">Selected Window: <strong className="text-emerald-400">{hoveredCell.label}</strong></span>
              <span className="font-bold bg-emerald-600 px-2 py-0.5 rounded text-white">{hoveredCell.count} Inbound Leads Captured</span>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Day of Month (1-31 Grid) */}
      {activeView === "dayOfMonth" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Monthly Lead Generation Progression (Days 1 - 31)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Gold Badges = Peak Conversions (Paydays & Campaign Launches)
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-2">
            {dayOfMonthData.map(item => (
              <div
                key={item.day}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                  item.peak 
                    ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {item.peak && (
                  <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full shadow-xs">
                    PEAK
                  </span>
                )}
                <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">Day {item.day}</p>
                <p className={`text-sm font-black font-mono mt-0.5 ${item.peak ? "text-emerald-700" : "text-slate-800"}`}>
                  {item.leads}
                </p>
                <p className="text-[9px] text-slate-400">leads</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
