"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type CustomerSpendingItem = {
  date: string;
  spending: number;
};

export function CustomerSpendingChart({ data }: { data: CustomerSpendingItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        No debit activity to visualize yet.
      </div>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B8975A" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#B8975A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EC" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#5B6670" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#5B6670" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E8EC", fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#B8975A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendingGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type TxnDistItem = {
  name: string;
  value: number;
};

const TXN_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"];

export function CustomerTxnDistChart({ data }: { data: TxnDistItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        No transaction distribution data.
      </div>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E8EC", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={TXN_COLORS[index % TXN_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
