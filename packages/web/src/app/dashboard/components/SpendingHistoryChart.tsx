"use client";
import { TransactionType } from "@/common/types/transaction";
import { Radio } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Line } from "recharts";
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Transaction } from "./FinanceDashboard";
import { NoDataMessage } from "./NoDataMessage";

interface SpendingHistoryChartProps {
  transactions: Transaction[];
}

export const SpendingHistoryChart: React.FC<SpendingHistoryChartProps> = ({
  transactions,
}) => {
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "year" | "tenYears"
  >("month");
  const t = useTranslations("SpendingHistoryChart");

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    const now = dayjs();
    let startDate: dayjs.Dayjs;
    let dateFormat: string;
    let groupingFormat: string;

    switch (timeRange) {
      case "week":
        startDate = now.subtract(7, "day");
        dateFormat = "YYYY-MM-DD";
        groupingFormat = "YYYY-MM-DD";
        break;
      case "month":
        startDate = now.subtract(1, "month");
        dateFormat = "MMM DD";
        groupingFormat = "YYYY-MM-DD";
        break;
      case "year":
        startDate = now.subtract(1, "year");
        dateFormat = "MMM YYYY";
        groupingFormat = "YYYY-MM";
        break;
      case "tenYears":
        startDate = now.subtract(10, "year");
        dateFormat = "YYYY";
        groupingFormat = "YYYY";
        break;
    }

    // Filter transactions within the time range
    const filteredTransactions = transactions.filter(
      (t) =>
        dayjs(t.date).isAfter(startDate) &&
        t.type === TransactionType.WITHDRAWAL
    );

    // Group transactions by date
    const groupedData = filteredTransactions.reduce((acc, transaction) => {
      const date = dayjs(transaction.date).format(groupingFormat);
      acc[date] = (acc[date] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date
    return Object.entries(groupedData)
      .map(([date, amount]) => ({
        date: dayjs(date).format(dateFormat),
        amount,
      }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [transactions, timeRange]);

  if (!transactions?.length) {
    return <NoDataMessage />;
  }

  return (
    <div className="bg-white p-4 rounded">
      <div className="flex justify-center mb-4">
        <Radio.Group
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="space-x-2"
        >
          <Radio.Button value="week">{t("week")}</Radio.Button>
          <Radio.Button value="month">{t("month")}</Radio.Button>
          <Radio.Button value="year">{t("year")}</Radio.Button>
          <Radio.Button value="tenYears">{t("tenYears")}</Radio.Button>
        </Radio.Group>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value: number) => [`$${value}`, t("amount")]} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
