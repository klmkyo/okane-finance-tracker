import React from "react";
import { AIChatPage } from "../../components/AIChatPage";

export default function Page({ params }: { params: { accountId: string } }) {
  return <AIChatPage accountId={Number(params.accountId)} />;
}
