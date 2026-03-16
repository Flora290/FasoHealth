'use client';

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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  patients: number;
  doctors: number;
  appointments: number;
}

interface SpecialtyData {
  name: string;
  count: number;
  color: string;
}

interface StatsChartsProps {
  usersByRole: ChartData[];
  appointmentsByMonth: TimeSeriesData[];
  specialties: SpecialtyData[];
  userGrowth: TimeSeriesData[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Fallback data when arrays are empty
const FALLBACK_USERS: ChartData[] = [
  { name: 'Patients', value: 0, color: '#10b981' },
  { name: 'Doctors', value: 0, color: '#3b82f6' },
  { name: 'Admins', value: 0, color: '#f59e0b' },
];

const FALLBACK_APPOINTMENTS: TimeSeriesData[] = [
  { date: 'Jan', patients: 0, doctors: 0, appointments: 0 },
  { date: 'Feb', patients: 0, doctors: 0, appointments: 0 },
  { date: 'Mar', patients: 0, doctors: 0, appointments: 0 },
  { date: 'Apr', patients: 0, doctors: 0, appointments: 0 },
  { date: 'May', patients: 0, doctors: 0, appointments: 0 },
  { date: 'Jun', patients: 0, doctors: 0, appointments: 0 },
];

const FALLBACK_SPECIALTIES: SpecialtyData[] = [
  { name: 'General Medicine', count: 0, color: '#3b82f6' },
  { name: 'Cardiology', count: 0, color: '#ef4444' },
  { name: 'Pediatrics', count: 0, color: '#10b981' },
];

const FALLBACK_USER_GROWTH: TimeSeriesData[] = [
  { date: 'Jan', patients: 0, doctors: 0, appointments: 0 },
  { date: 'Mar', patients: 0, doctors: 0, appointments: 0 },
];

export default function StatsCharts({
  usersByRole,
  appointmentsByMonth,
  specialties,
  userGrowth
}: StatsChartsProps) {

  // Use real data if available, otherwise use fallback
  const roleData = (usersByRole && usersByRole.length > 0) ? usersByRole : FALLBACK_USERS;
  const appointmentsData = (appointmentsByMonth && appointmentsByMonth.length > 0) ? appointmentsByMonth : FALLBACK_APPOINTMENTS;
  const specialtiesData = (specialties && specialties.length > 0) ? specialties : FALLBACK_SPECIALTIES;
  const growthData = (userGrowth && userGrowth.length > 0) ? userGrowth : FALLBACK_USER_GROWTH;

  const hasRoleData = roleData.some(d => d.value > 0);
  const hasAppointmentsData = appointmentsData.some(d => d.appointments > 0 || d.patients > 0);
  const hasSpecialtiesData = specialtiesData.some(d => d.count > 0);
  const hasGrowthData = growthData.some(d => d.patients > 0 || d.doctors > 0);

  return (
    <div className="space-y-6">

      {/* 1 — Pie Chart: User Distribution */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">User Distribution</h3>
        {!hasRoleData ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No user data yet</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => (percent ?? 0) > 0 ? `${name} ${(((percent ?? 0)) * 100).toFixed(0)}%` : ''}
                  outerRadius={75}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 shrink-0">
              {roleData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                  <span className="text-slate-700 font-medium text-sm">{item.name}</span>
                  <span className="text-slate-400 text-sm">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2 — Bar Chart: Doctors by Specialty */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Doctors by Specialty</h3>
        {!hasSpecialtiesData ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No specialty data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={specialtiesData} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Doctors" radius={[6, 6, 0, 0]}>
                {specialtiesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 3 — Line Chart: User Growth */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">User Growth</h3>
        {!hasGrowthData ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No growth data yet — add more users to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={growthData} margin={{ right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Patients" />
              <Line type="monotone" dataKey="doctors" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Doctors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 4 — Bar Chart (Histogram): Monthly Appointments */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Monthly Appointments</h3>
        {!hasAppointmentsData ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No appointment data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={appointmentsData} margin={{ right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Appointments" />
              <Bar dataKey="patients" fill="#10b981" radius={[4, 4, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
