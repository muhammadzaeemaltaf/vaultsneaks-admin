"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useState } from "react"

export function Overview() {
  const [data, setData] = useState<{ name: string, total: number }[]>([]);

  useEffect(() => {
    // Adding testing data
    setData([
      { name: "Jan", total: 30 },
      { name: "Feb", total: 20 },
      { name: "Mar", total: 50 },
      { name: "Apr", total: 40 },
      { name: "May", total: 70 },
      { name: "Jun", total: 60 },
      { name: "Jul", total: 90 },
      { name: "Aug", total: 80 },
      { name: "Sep", total: 100 },
      { name: "Oct", total: 110 },
      { name: "Nov", total: 120 },
      { name: "Dec", total: 130 },
    ]);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#4D4D4D"
          fontSize={12}
          tickLine={true}
          axisLine={true}
        />
        <YAxis
          stroke="#4D4D4D"
          fontSize={12}
          tickLine={true}
          axisLine={true}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#4D4D4D"
          strokeWidth={2}
          dot={{ r: 4 }}
          isAnimationActive={true}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
