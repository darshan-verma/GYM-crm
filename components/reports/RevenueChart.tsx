'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            name="Revenue (₹)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
