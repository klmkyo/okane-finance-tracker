"use client";

import { useParams } from "next/navigation";
import { AiReportsPage } from "../../components/AIReportsPage";

export default function DashboardPage() {
  const params = useParams();
  const accountId = Array.isArray(params.accountId)
    ? params.accountId[0]
    : params.accountId;

  return (
    <div className="min-h-screen bg-gray-100">
      <AiReportsPage accountId={Number.parseInt(accountId)} />
    </div>
  );
}
