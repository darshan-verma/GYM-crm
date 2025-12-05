'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface MembershipChartProps {
  data: Array<{
    month: string
    newMembers: number
    activeMembers: number
    expiredMembers: number
  }>
}

export default function MembershipChart({ data }: MembershipChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Line
            type="monotone"
            dataKey="newMembers"
            stroke="#3b82f6"
            strokeWidth={2}
            name="New Members"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="activeMembers"
            stroke="#10b981"
            strokeWidth={2}
            name="Active Members"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expiredMembers"
            stroke="#ef4444"
            strokeWidth={2}
            name="Expired"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
