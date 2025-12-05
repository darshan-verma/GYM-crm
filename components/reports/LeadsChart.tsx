'use client'

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LeadsChartProps {
  data: Array<{
    month: string
    newLeads: number
    converted: number
    lost: number
    conversionRate: number
  }>
}

export default function LeadsChart({ data }: LeadsChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="newLeads" fill="#f59e0b" name="New Leads" />
          <Bar yAxisId="left" dataKey="converted" fill="#10b981" name="Converted" />
          <Bar yAxisId="left" dataKey="lost" fill="#ef4444" name="Lost" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversionRate"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Conversion Rate (%)"
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
