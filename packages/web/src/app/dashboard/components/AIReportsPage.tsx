import { api } from "@/common/api/api";
import { LOCALES } from "@/i18n/locales";
import {
  CalendarOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTransactions } from "./FinanceDashboard";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const components = {
  h1: (props: any) => <Title level={1} {...props} />,
  h2: (props: any) => <Title level={2} {...props} />,
  h3: (props: any) => <Title level={3} {...props} />,
  h4: (props: any) => <Title level={4} {...props} />,
  h5: (props: any) => <Title level={5} {...props} />,
  h6: (props: any) => <Title level={5} {...props} />,
  p: (props: any) => <Text {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside ml-3" {...props} />,
  ol: (props: any) => (
    <ol className="list-decimal list-inside ml-3" {...props} />
  ),
  li: (props: any) => <li {...props} />,
};

interface Report {
  id: number;
  accountId: number;
  periodStartDate: string;
  periodEndDate: string;
  reviewResponse: {
    role: string;
    content: string;
  };
}

export const AiReportsPage: React.FC<{ accountId: number }> = ({
  accountId,
}) => {
  const queryClient = useQueryClient();
  const t = useTranslations("Dashboard");
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);

  const { transactions } = useTransactions(accountId);

  useEffect(() => {
    if (transactions?.length) {
      const sortedTransactions = transactions.sort((a, b) => {
        return dayjs(a.date).diff(dayjs(b.date));
      });

      form.setFieldsValue({
        dateRange: [
          dayjs(sortedTransactions[0].date),
          dayjs(sortedTransactions[sortedTransactions.length - 1].date),
        ],
      });
    }
  }, [transactions, form]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["raports", accountId],
    queryFn: async () => {
      return (await api.get<Report[]>(`/ai-raport?accountId=${accountId}`))
        .data;
    },
  });

  const { mutateAsync: generateReport } = useMutation({
    mutationFn: async (values: {
      periodStartDate: string;
      periodEndDate: string;
      notes: string;
      language: string;
    }) => {
      return api.post("/ai-raport", {
        ...values,
        accountId: Number(accountId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raports", accountId] });
      message.success(t("reportGenerated"));
      form.resetFields();
    },
    onError: () => {
      message.error(t("errorGeneratingReport"));
    },
  });

  const { mutateAsync: deleteReport } = useMutation({
    mutationFn: async (reportId: number) => {
      return api.delete(`/ai-raport/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raports", accountId] });
      message.success(t("reportDeleted"));
    },
    onError: () => {
      message.error(t("errorDeletingReport"));
    },
  });

  const handleGenerateReport = async (values: any) => {
    setIsGenerating(true);
    try {
      const [startDate, endDate] = values.dateRange;
      await generateReport({
        periodStartDate: startDate.toISOString(),
        periodEndDate: endDate.toISOString(),
        notes: values.notes,
        language: values.language,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    await deleteReport(reportId);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Space direction="vertical" size="large" className="w-full">
        <Space
          direction="vertical"
          size="large"
          className="w-full"
          style={{ gap: 8 }}
        >
          <Title level={4}>
            <FileTextOutlined className="mr-2" />
            {t("generateReport")}
          </Title>
          <Card className="shadow-sm">
            <Text type="secondary" className="mb-3 block">
              {t("selectDateRangeToGenerateReport")}
            </Text>

            <Form
              form={form}
              onFinish={handleGenerateReport}
              layout="horizontal"
              className="w-full"
            >
              <Space direction="vertical" className="w-full" style={{ gap: 0 }}>
                <Space align="baseline" className="w-full">
                  <Form.Item
                    name="dateRange"
                    label={
                      <Space>
                        <CalendarOutlined />
                        {t("selectPeriod")}
                      </Space>
                    }
                    rules={[
                      { required: true, message: t("pleaseSelectDateRange") },
                    ]}
                    className="mb-0 flex-1"
                  >
                    <RangePicker
                      className="w-full"
                      placeholder={[t("startDate"), t("endDate")]}
                    />
                  </Form.Item>
                </Space>

                <Form.Item
                  name="language"
                  label={t("language")}
                  initialValue="en"
                >
                  <Select
                    options={LOCALES.map((l) => ({
                      value: l.code,
                      label: `${l.flag} ${l.name}`,
                    }))}
                  />
                </Form.Item>
                <Form.Item name="notes" label={t("notes")} className="mb-4">
                  <Input.TextArea placeholder={t("enterNotesForAI")} rows={4} />
                </Form.Item>
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isGenerating}
                    size="large"
                    icon={<FileTextOutlined />}
                  >
                    {t("generateNewReport")}
                  </Button>
                </Form.Item>
              </Space>
            </Form>
          </Card>
        </Space>

        {isLoading ? (
          <div className="text-center p-8">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          </div>
        ) : reports?.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" align="center">
                <Text>{t("noReportsYet")}</Text>
                <Text type="secondary">{t("generateYourFirstReport")}</Text>
              </Space>
            }
          />
        ) : (
          <Space direction="vertical" className="w-full">
            <Title level={4} className="m-0">
              {t("previousReports")}
            </Title>
            {reports?.toReversed().map((report) => (
              <Card
                key={report.id}
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <Space className="w-full justify-between">
                    <Space>
                      <CalendarOutlined />
                      <span>
                        {dayjs(report.periodStartDate).format("YYYY-MM-DD")}
                        {" - "}
                        {dayjs(report.periodEndDate).format("YYYY-MM-DD")}
                      </span>
                    </Space>
                    <Popconfirm
                      title={t("deleteReportConfirm")}
                      onConfirm={() => handleDeleteReport(report.id)}
                      okText={t("yes")}
                      cancelText={t("no")}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={t("deleteReport")}
                      />
                    </Popconfirm>
                  </Space>
                }
              >
                <div className="max-w-none">
                  <ReactMarkdown components={components}>
                    {report.reviewResponse.content}
                  </ReactMarkdown>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Space>
    </div>
  );
};
