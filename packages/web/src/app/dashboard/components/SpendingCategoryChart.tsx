"use client";
import { TransactionType } from "@/common/types/transaction";
import { Radio } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Transaction } from "./FinanceDashboard";
import { NoDataMessage } from "./NoDataMessage";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA336A",
  "#33AA99",
];

type TimeRange = "week" | "month" | "year" | "tenYears";

interface SpendingCategoryChartProps {
  transactions: Transaction[];
}

export const SpendingCategoryChart: React.FC<SpendingCategoryChartProps> = ({
  transactions,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const t = useTranslations("SpendingCategoryChart");

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    const now = dayjs();
    let startDate: dayjs.Dayjs;

    switch (timeRange) {
      case "week":
        startDate = now.subtract(7, "day");
        break;
      case "month":
        startDate = now.subtract(1, "month");
        break;
      case "year":
        startDate = now.subtract(1, "year");
        break;
      case "tenYears":
        startDate = now.subtract(10, "year");
        break;
    }

    // Filter transactions within time range and only withdrawals
    const filteredTransactions = transactions.filter(
      (t) =>
        dayjs(t.date).isAfter(startDate) &&
        t.type === TransactionType.WITHDRAWAL
    );

    // Group by category
    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.categoryName || "Uncategorized";
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format needed for chart
    return Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [transactions, timeRange]);

  if (!transactions?.length) {
    return <NoDataMessage />;
  }

  return (
    <div className="bg-white p-4 rounded">
      <div className="flex justify-center mb-4">
        <Radio.Group
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="space-x-2"
        >
          <Radio.Button value="week">{t("week")}</Radio.Button>
          <Radio.Button value="month">{t("month")}</Radio.Button>
          <Radio.Button value="year">{t("year")}</Radio.Button>
          <Radio.Button value="tenYears">{t("tenYears")}</Radio.Button>
        </Radio.Group>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label={({ category, percent }) =>
              `${category} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
