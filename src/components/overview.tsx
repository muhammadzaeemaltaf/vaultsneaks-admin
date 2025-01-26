"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { getAllOrders } from "@/sanity/orders/getAllOrders";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";

export function Overview() {
  const [data, setData] = useState<{ name: string, total: number }[]>([]);
  const [filter, setFilter] = useState("month");
  const [monthName, setMonthName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchData = async () => {
      const orders = await getAllOrders();
      let filteredData;

      if (filter === "year") {
        filteredData = orders.reduce((acc: any, order: any) => {
          const year = new Date(order._createdAt).getFullYear();
          if (!acc[year]) {
            acc[year] = 0;
          }
          acc[year]++;
          return acc;
        }, {});
      } else if (filter === "week") {
        filteredData = orders.reduce((acc: any, order: any) => {
          const week = `${new Date(order._createdAt).getFullYear()}-W${Math.ceil(new Date(order._createdAt).getDate() / 7)}`;
          if (!acc[week]) {
            acc[week] = 0;
          }
          acc[week]++;
          return acc;
        }, {});
      } else if (filter === "day") {
        filteredData = orders.reduce((acc: any, order: any) => {
          const date = new Date(order._createdAt);
          const day = date.getDate();
          const month = date.getMonth();
          if (month === selectedMonth) {
            const monthName = date.toLocaleString('default', { month: 'short' });
            setMonthName(monthName);
            if (!acc[day]) {
              acc[day] = 0;
            }
            acc[day]++;
          }
          return acc;
        }, {});
      } else {
        filteredData = orders.reduce((acc: any, order: any) => {
          const month = new Date(order._createdAt).toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month]++;
          return acc;
        }, {});
      }

      const formattedData = Object.keys(filteredData).map(key => ({
        name: key,
        total: filteredData[key]
      }));

      setData(formattedData);
    };

    fetchData();
  }, [filter, selectedMonth]);

  const currentMonth = new Date().getMonth();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select value={filter} onValueChange={(value: string) => setFilter(value)} >
          <SelectTrigger className="p-2 border rounded w-32">
            <span>{filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase()}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filter === "day" && (
        <div className="flex justify-center items-center mb-4 gap-3">
          <div className="text-center">Month</div>
          <Select value={selectedMonth.toString()} onValueChange={(value: string) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="p-2 border rounded w-32">
              <span>{new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}</span>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()} disabled={i > currentMonth || (i < currentMonth - 1 && i !== 0)}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
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
    </div>
  );
}
