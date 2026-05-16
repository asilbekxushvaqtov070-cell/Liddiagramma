/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Filter,
  Calendar,
  RotateCcw,
  Moon,
  Sun,
  LayoutDashboard,
  Users,
  TrendingUp,
  MapPin,
  Trophy,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import extracted data
import dashboardData from './data/dashboard_data.json';

const COLORS = {
  orange: '#f4981d',
  blue: '#34a8da',
  green: '#10b981',
  purple: '#818cf8',
  red: '#ef4444',
  slate: '#0f172a'
};

const CHART_COLORS = ['#34a8da', '#10b981', '#f4981d', '#818cf8', '#ef4444', '#6366f1'];

export default function App() {
  const [department, setDepartment] = useState('Барчаси');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter logic
  const filteredData = useMemo(() => {
    return dashboardData.filter((item: any) => {
      const matchDept = department === 'Барчаси' || item.department === department;
      const matchStart = !dateRange.start || item.date >= dateRange.start;
      const matchEnd = !dateRange.end || item.date <= dateRange.end;
      return matchDept && matchStart && matchEnd;
    });
  }, [department, dateRange]);

  // Derived stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    const budget = filteredData.reduce((acc, curr: any) => acc + (curr.budget || 0), 0);
    const byRegion = filteredData.reduce((acc, curr: any) => {
      acc[curr.region] = (acc[curr.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedRegions = Object.entries(byRegion)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count: count as number,
        percent: total ? (((count as number) / total) * 100).toFixed(1) : '0'
      }));

    const byType = filteredData.reduce((acc, curr: any) => {
      acc[curr.product_type] = (acc[curr.product_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = filteredData.reduce((acc, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(byStatus).map(([name, value]) => {
      // Cyrillic mapping for common statuses
      const statusMap: Record<string, string> = {
        'QIZIQISH BILDIRGAN YANGI MIJOZ': 'ҚИЗИҚИШ БИЛДИРГАН ЯНГИ МИЖОЗ',
        'ALOQA O\'RNATLDI': 'АЛОҚА ЎРНАТИЛДИ',
        'OFISGA TASHRIF BUYURUVCHILAR': 'ОФИСГА ТАШРИФ БУЮРУВЧИЛАР',
        'OKB': 'ОҚБ',
        'Inson omili': 'Инсон омили',
        'Xato raqam': 'Хато рақам',
        'Batafsil ma\'lumot berildi': 'Батафсил маълумот берилди',
        'ВЗЯТ В РАБОТУ': 'ИШГА ОЛИНДИ',
        'ПЕРВИЧНЫЙ КОНТАКТ': 'БИРИНЧИ АЛОҚА',
        'НУЖНА ОБРАТНАЯ СВЯЗЬ': 'ҚАЙТА АЛОҚА КЕРАК',
        'ИНФОРМИРОВАН': 'МАЪЛУМОТ БЕРИЛДИ'
      };
      return { name: statusMap[name] || name, value };
    });

    const byDealer = filteredData.reduce((acc, curr: any) => {
      const resp = curr.responsible || '';
      const isOperatorFilter = resp === 'Gulnoza 007' || resp === 'Валентина' || resp.includes('Klara');

      if (resp && resp !== 'Администратор' && !resp.includes('Klara')) {
        // Exclude known operators from Dillerlar section header
        if (department === 'Диллерлар' && isOperatorFilter) return acc;
        acc[resp] = (acc[resp] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedDealers = Object.entries(byDealer)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([name, count], index) => ({
        name: department === 'Операторлар' ? `${index + 1}-оператор` : name,
        count: count as number
      }));

    // Dynamics for AreaChart
    const dynamics = filteredData.length > 0 ?
      filteredData.slice().sort((a: any, b: any) => a.date.localeCompare(b.date))
        .reduce((acc, curr: any) => {
          const date = curr.date.substring(5); // MM-DD
          const existing = acc.find(d => d.date === date);
          if (existing) existing.value += 1;
          else acc.push({ date, value: 1 });
          return acc;
        }, [] as { date: string, value: number }[]).slice(-15)
      : [];

    // Calls Data (from user screenshot for demonstration)
    const callsData = department === 'Операторлар' ? [
      { name: '1-оператор', value: 1648 },
      { name: '2-оператор', value: 602 }
    ] : [];

    return { total, budget, sortedRegions, statusData, dynamics, byType, sortedDealers, callsData };
  }, [filteredData, department]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">

        {/* Top Navigation / Filters */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white font-bold p-3 rounded-2xl shadow-lg shadow-orange-500/20">
              UZ
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Call-center</h1>
              <p className="text-sm font-medium opacity-60">Савдо аналитикаси ва ҳисоботлар панели</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Department Filter */}
            <div className="relative group">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`appearance-none pl-10 pr-10 py-3 rounded-2xl border-none shadow-sm font-bold text-sm cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/50 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
              >
                <option value="Диллерлар">Диллерлар</option>
                <option value="Мижозлар билан қайта ишлаш">Мижозлар билан ишлаш</option>
                <option value="UAT Савдо">UAT Савдо</option>
                <option value="Операторлар">Операторлар</option>
              </select>
              <LayoutDashboard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" />
            </div>

            {/* Date Range */}
            <div className={`flex items-center gap-2 p-1 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <Calendar size={18} className="text-blue-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
                />
              </div>
              <div className="w-[1px] h-6 bg-slate-200 opacity-20"></div>
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => { setDepartment('Барчаси'); setDateRange({ start: '', end: '' }) }}
              className="p-3 rounded-2xl bg-white shadow-sm hover:bg-orange-50 transition-colors text-orange-500"
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-2xl shadow-sm transition-colors ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-400'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        {/* Savdo Holati (Full Width) */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="lg:col-span-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-[40px] shadow-sm border border-slate-100/50 h-full ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Савдо Ҳолати</h3>
                  <p className="text-[10px] opacity-40 font-bold">Ойлик ҳисобот таҳлили</p>
                </div>
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-full text-[10px] font-black opacity-60">2026</div>
              </div>

              <div className="h-[350px] w-full relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dynamics}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.5" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5, fill: darkMode ? '#94a3b8' : '#64748b' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5, fill: darkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '24px',
                        border: 'none',
                        background: darkMode ? '#1e293b' : '#ffffff',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: darkMode ? '#f1f5f9' : '#0f172a'
                      }}
                      itemStyle={{ color: COLORS.orange }}
                      cursor={{ stroke: COLORS.orange, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.orange}
                      strokeWidth={5}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      filter="url(#shadow)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Lower Section: Status & Dealers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Status Distribution */}
          <div className={`${department === 'Operatorlar' ? 'lg:col-span-12 xl:col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-8' : 'lg:col-span-12 xl:col-span-8'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-[40px] shadow-sm border border-slate-100/50 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Битимлар Ҳолати</h3>
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-full text-[10px] font-black opacity-40">Барча бўлимлар</div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-10">
                <div className="relative">
                  <PieChart width={220} height={220}>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats.statusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-black opacity-30 uppercase">Жами</p>
                    <p className="text-2xl font-black">{stats.total}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
                  {stats.statusData.map((status, i) => (
                    <div key={status.name} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <div>
                        <p className="text-[10px] font-black opacity-80 uppercase truncate max-w-[150px]">{status.name}</p>
                        <p className="text-sm font-black">{status.value} <span className="text-[10px] opacity-40 ml-1">Лидлар</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {department === 'Operatorlar' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-8 rounded-[40px] shadow-sm border border-slate-100/50 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Қўнғироқлар Ҳисоботи</h3>
                  <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-tighter">Ойлик жами</div>
                </div>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.callsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5, fill: darkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5, fill: darkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '20px', border: 'none', background: darkMode ? '#1e293b' : '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="value"
                        fill={COLORS.blue}
                        radius={[10, 10, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>


          {/* Brands List */}
          <div className="lg:col-span-12 xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-[40px] h-full shadow-sm border border-slate-100/50 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xs uppercase tracking-widest opacity-60">
                  {department === 'Барчаси' ? 'Диллерлар' : department} Рейтинги
                </h3>
                <Trophy size={16} className="text-yellow-500" />
              </div>
              <div className="space-y-6">
                {stats.sortedDealers.map((dealer, i) => (
                  <div key={dealer.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="opacity-80 truncate max-w-[200px]">{dealer.name}</span>
                      <span>{dealer.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(dealer.count / (stats.sortedDealers[0]?.count || 1)) * 100}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
                {stats.sortedDealers.length === 0 && (
                  <p className="text-center py-10 opacity-40 italic font-bold">Маълумот топилмади</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4 opacity-40 text-[10px] font-black uppercase tracking-widest">
          <p>TIZIM FAOL. 2026.FINAL.MARKET.REPORT</p>
          <p>© 2026 Савдо Аналитикаси Платформаси</p>
        </footer>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, percent, color, darkMode }: { title: string, value: string, unit?: string, percent?: string, color: string, darkMode?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-5 rounded-[24px] relative overflow-hidden shadow-sm border border-slate-100/50 transition-all duration-300 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white'}`}
    >
      <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-lg" style={{ backgroundColor: color }}></div>
      <p className="text-[10px] font-black opacity-40 uppercase mb-2 tracking-tighter">{title}</p>
      <div className="flex items-baseline gap-1">
        <h4 className="text-3xl font-black tracking-tighter">{value}</h4>
        {unit && <span className="text-[10px] font-black opacity-30">{unit}</span>}
      </div>
      {percent && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300" style={{ width: percent }}></div>
          </div>
          <span className="text-[10px] font-black opacity-60">{percent}</span>
        </div>
      )}
    </motion.div>
  );
}
