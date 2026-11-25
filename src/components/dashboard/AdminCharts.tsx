"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type MonthlyVolumeItem = {
  month: string;
  deposits: number;
  withdrawals: number;
};

export function AdminVolumeChart({ data }: { data: MonthlyVolumeItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No transaction volume recorded yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EC" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#5B6670" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#5B6670" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E8EC", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="deposits" name="Deposits ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withdrawals" name="Withdrawals ($)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type AccountDistItem = {
  name: string;
  value: number;
};

const PIE_COLORS = ["#B8975A", "#1B2427", "#3B82F6", "#10B981"];

export function AdminAccountDistChart({ data }: { data: AccountDistItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No bank accounts data available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E8EC", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
