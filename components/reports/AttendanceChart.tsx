'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface AttendanceChartProps {
  data: Array<{
    month: string
    checkIns: number
    uniqueMembers: number
    avgDuration: number
  }>
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="checkIns"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
            name="Total Check-ins"
          />
          <Area
            type="monotone"
            dataKey="uniqueMembers"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.3}
            strokeWidth={2}
            name="Unique Members"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
