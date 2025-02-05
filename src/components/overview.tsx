"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { getAllOrders } from "@/sanity/orders/getAllOrders";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";

export function Overview() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedYearRange, setSelectedYearRange] = useState("5");
  const [data, setData] = useState<{ name: string, total: number }[]>([]);
  const [filter, setFilter] = useState("month");
  const [monthName, setMonthName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedMonthForMonth, setSelectedMonthForMonth] = useState("all");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      const orders = await getAllOrders();
      let filteredData: any;

      if (filter === "year") {
        filteredData = orders.reduce((acc: any, order: any) => {
          const orderYear = new Date(order._createdAt).getFullYear();
          if (orderYear >= currentYear - parseInt(selectedYearRange) + 1) {
            if (!acc[orderYear]) {
              acc[orderYear] = 0;
            }
            acc[orderYear]++;
          }
          return acc;
        }, {});
      } else if (filter === "week") {
        filteredData = orders.reduce((acc: any, order: any) => {
          const orderDate = new Date(order._createdAt);
          if(orderDate.getFullYear() === selectedYear) {
            const week = `${orderDate.getFullYear()}-W${Math.ceil(orderDate.getDate() / 7)}`;
            if (!acc[week]) {
              acc[week] = 0;
            }
            acc[week]++;
          }
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
      } else if (filter === "month") {
        if (selectedMonthForMonth === "all") {
          filteredData = orders.reduce((acc: any, order: any) => {
            const orderDate = new Date(order._createdAt);
            if(orderDate.getFullYear() === selectedYear) {
              const month = orderDate.toLocaleString('default', { month: 'short' });
              if (!acc[month]) {
                acc[month] = 0;
              }
              acc[month]++;
            }
            return acc;
          }, {});
        } else {
          const m = parseInt(selectedMonthForMonth);
          filteredData = orders.reduce((acc: any, order: any) => {
            const orderDate = new Date(order._createdAt);
            if (orderDate.getFullYear() === selectedYear && orderDate.getMonth() === m) {
              const day = orderDate.getDate();
              if (!acc[day]) {
                acc[day] = 0;
              }
              acc[day]++;
            }
            return acc;
          }, {});
        }
      }

      // Sort keys if filter is week so weeks show in order
      let keys = Object.keys(filteredData);
      if (filter === "week") {
        keys.sort((a, b) => {
          const aWeek = parseInt(a.split("-W")[1]);
          const bWeek = parseInt(b.split("-W")[1]);
          return aWeek - bWeek;
        });
      } else if (filter === "month") {
        if (selectedMonthForMonth === "all") {
          const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          keys.sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b));
        } else {
          keys.sort((a, b) => parseInt(a) - parseInt(b));
        }
      } else {
        keys.sort(); // optional for other filters
      }

      const formattedData = keys.map(key => ({
        name: key,
        total: filteredData[key]
      }));

      setData(formattedData);
    };

    fetchData();
  }, [filter, selectedMonth, selectedYear, selectedYearRange, selectedMonthForMonth]);

  const currentMonth = new Date().getMonth();

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4 gap-2">
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
        <div className="flex flex-wrap justify-center items-center mb-4 gap-3">
        <div>
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
        </div>
      )}
      {filter === "month" && (
        <div className="flex flex-wrap justify-start md:justify-center items-center mb-4 gap-3">
        <div className="flex items-end gap-2">
        <div className="text-center">Year</div>
          <Select value={selectedYear.toString()} onValueChange={(value: string) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="p-2 border rounded w-32">
              <span>{selectedYear}</span>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => {
                const year = currentYear - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
         <div className="flex items-center gap-2">
         <div className="text-center">Month</div>
          <Select value={selectedMonthForMonth} onValueChange={(value: string) => setSelectedMonthForMonth(value)}>
            <SelectTrigger className="p-2 border rounded w-32">
              <span>{selectedMonthForMonth === "all" ? "All" : new Date(0, parseInt(selectedMonthForMonth)).toLocaleString('default', { month: 'long' })}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem 
                  key={i} 
                  value={i.toString()} 
                  disabled={selectedYear === currentYear && i > new Date().getMonth()}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
         </div>
        </div>
      )}
      {filter === "week" && (
        <div className="flex flex-wrap justify-center items-center mb-4 gap-3">
          <div className="text-center">Year</div>
          <Select value={selectedYear.toString()} onValueChange={(value: string) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="p-2 border rounded w-32">
              <span>{selectedYear}</span>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => {
                const year = currentYear - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {filter === "year" && (
        <div className="flex flex-wrap justify-center items-center mb-4 gap-3">
          <div className="text-center">Year Range</div>
          <Select value={selectedYearRange} onValueChange={(value: string) => setSelectedYearRange(value)}>
            <SelectTrigger className="p-2 border rounded w-32">
              <span>Last {selectedYearRange} years</span>
            </SelectTrigger>
            <SelectContent>
              {["3", "5", "10"].map(range => (
                <SelectItem key={range} value={range}>
                  {`Last ${range} years`}
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
