/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  PhoneCall,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

// Data extracted from images
const CALLS_DATA = [
  { name: 'Gulnoza 007', incoming: 234, outgoing: 1414, total: 1648, duration: '24:33:43' },
  { name: 'Valentina', incoming: 17, outgoing: 585, total: 602, duration: '05:01:12' },
];

const PIPELINE_DATA = [
  { name: 'Янги Мижоз', count: 60, color: '#0aececff' },
  { name: 'Алоқа ўрнатилди', count: 4, color: '#6366f1' },
  { name: 'Ташриф буюрувчилар', count: 3, color: '#f59e0b' },
  { name: 'Офисга келганлар', count: 0, color: '#10b981' },
  { name: 'Шартнома', count: 0, color: '#06a340ff' },
  { name: 'Отказ', count: 6, color: '#e00404ff' },
];

const COMPANY_STATS = [
  { name: 'Lorry Group', count: 4 },
  { name: 'Vodiy Auto Trade', count: 3 },
  { name: 'Navoiy Trade', count: 3 },
  { name: 'Ideal truck sales', count: 3 },
  { name: 'Magistral diesel service', count: 2 },
  { name: 'Avto group Trading and service', count: 0 },
  { name: 'Truckexpert global', count: 0 },
  { name: 'Comptrans Auto Service', count: 0 },
];

const PIE_DATA = [
  { name: 'Муваффақиятли', value: 67 },
  { name: 'Музокарада', value: 133 },
  { name: 'Рад этилди', value: 6 },
];

const COLORS = ['#0ef1a6ff', '#0b66faff', '#ee0909ff', '#b97b0eff'];

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div 
      id="dashboard-root" 
      className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans relative"
      style={{
        backgroundImage: 'url("/kamaz-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Semi-transparent overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tighter text-slate-900"
            >
              Call Center
            </motion.h1>
            <p className="text-slate-600 mt-1 font-medium">Кўрсаткичлар ва қўнғироқлар ҳисоботи</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
              <Filter size={18} className="text-slate-600" />
              <span className="font-medium">Фильтр</span>
            </button>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-slate-600">
              <Clock size={18} className="text-blue-600" />
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            id="total-calls"
            title="Жами қўнғироқлар"
            value="2,254"
            icon={<PhoneCall className="text-blue-600" />}
            trend="+12%"
            trendUp={true}
          />
          <SummaryCard
            id="total-deals"
            title="Жами битимлар"
            value="133"
            icon={<Briefcase className="text-emerald-600" />}
            trend="+5%"
            trendUp={true}
          />
          <SummaryCard
            id="conversion-rate"
            title="Конверсия"
            value="4.5%"
            icon={<TrendingUp className="text-amber-600" />}
            trend="-1%"
            trendUp={false}
          />
          <SummaryCard
            id="active-users"
            title="Актив операторлар"
            value="5"
            icon={<Users className="text-purple-600" />}
            trend="0%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calls Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
            id="calls-chart-container"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Операторлар қўнғироқлари</h3>
            </div>
            <div className="h-[350px] w-full bg-slate-50/50 rounded-2xl p-4 flex flex-col" id="calls-chart-canvas">
              <div className="flex justify-end gap-4 mb-4 text-xs font-bold">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Кирувчи</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Чиқувчи</div>
              </div>

              <div className="flex-1 flex items-end gap-4 pb-8 border-b border-slate-200 relative">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 pr-2 -translate-x-full border-r border-slate-200">
                  <span>1600</span>
                  <span>1200</span>
                  <span>800</span>
                  <span>400</span>
                  <span>0</span>
                </div>

                {CALLS_DATA.map((item) => {
                  const maxVal = 1648;
                  const inHeight = (item.incoming / maxVal) * 100;
                  const outHeight = (item.outgoing / maxVal) * 100;

                  return (
                    <div key={item.name} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                        К: {item.incoming} | Ч: {item.outgoing}
                      </div>

                      <div className="flex items-end gap-1 w-full max-w-[60px] h-full">
                        <div
                          className="bg-emerald-500 rounded-t-lg w-1/2 transition-all duration-700 shadow-sm"
                          style={{ height: `${Math.max(inHeight, 2)}%` }}
                        ></div>
                        <div
                          className="bg-blue-500 rounded-t-lg w-1/2 transition-all duration-700 shadow-sm"
                          style={{ height: `${Math.max(outHeight, 2)}%` }}
                        ></div>
                      </div>
                      <span className="absolute top-full mt-2 text-[10px] font-bold text-slate-500 rotate-[-45deg] origin-top-left whitespace-nowrap">
                        {item.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}

                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2">
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                </div>
              </div>
            </div>

            <div className="mt-12 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Менежер</th>
                    <th className="py-3 px-4 font-bold text-emerald-600">Кирувчи</th>
                    <th className="py-3 px-4 font-bold text-blue-600">Чиқувчи</th>
                    <th className="py-3 px-4 font-bold">Жами</th>
                  </tr>
                </thead>
                <tbody>
                  {CALLS_DATA.map((item) => (
                    <tr key={item.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-900 font-medium">{item.name}</td>
                      <td className="py-3 px-4">{item.incoming}</td>
                      <td className="py-3 px-4">{item.outgoing}</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
            id="deal-status-chart-container"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Битимлар ҳолати</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                <span className="block text-3xl font-black text-slate-800">206</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Жами битим</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
            id="pipeline-chart-container"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Сотувлар воронкаси</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIPELINE_DATA.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                    isAnimationActive={true}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {PIPELINE_DATA.filter(d => d.count > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
            id="companies-stats"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Диллерларга йўналтирилган битимлар</h3>
            <div className="space-y-4">
              {COMPANY_STATS.map((company, index) => (
                <div key={company.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                      {index + 1}
                    </div>
                    <span className="font-bold text-slate-700">{company.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(company.count / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-900 font-black font-mono">{company.count} та</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
            id="detailed-stats"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Битимлар ҳолати</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PIPELINE_DATA.map((item) => (
                <div key={item.name} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full ring-4 ring-slate-50" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-500">{item.name}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-800 font-mono group-hover:text-blue-600 transition-colors">{item.count}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm font-medium">
          <p>&copy; 2024 Аналитика Дашборд. Барча ҳуқуқлар ҳимояланган.</p>
        </footer>
      </div>
    </div>
  );
}

function SummaryCard({ id, title, value, icon, trend, trendUp }: { id: string, title: string, value: string, icon: ReactNode, trend: string, trendUp: boolean }) {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/95 border border-slate-100 rounded-3xl p-6 shadow-lg backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-3 bg-slate-50 rounded-2xl shadow-inner">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 font-mono tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}
