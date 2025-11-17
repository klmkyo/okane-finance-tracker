import { api } from "@/common/api/api";
import { TransactionType } from "@/common/types/transaction";
import { formatCurrency } from "@/common/utils/currency";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import { Repeat } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAccount } from "./FinanceDashboard";

interface RecurringTransaction {
  id: number;
  accountId: number;
  title: string;
  amount: number;
  type: TransactionType;
  startDate: string;
  endDate?: string;
  interval: string;
  description?: string;
  categoryId?: number;
}

interface RecurringTransactionsProps {
  accountId: number;
}

export const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  accountId,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const t = useTranslations("RecurringTransactions");
  const queryClient = useQueryClient();
  const { account } = useAccount(accountId);

  const isValidId = Boolean(accountId && Number.isFinite(accountId) && accountId > 0);

  const { data: recurringTransactions } = useQuery({
    queryKey: ["recurring-transactions", accountId],
    queryFn: async () => {
      return (
        await api.get<RecurringTransaction[]>(
          `/recurring-transactions?accountId=${accountId}`
        )
      ).data;
    },
    enabled: isValidId,
  });

  const { mutateAsync: createRecurringTransaction } = useMutation({
    mutationFn: async (data: Omit<RecurringTransaction, "id">) => {
      return api.post("/recurring-transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring-transactions", accountId],
      });
      message.success(t("recurringTransactionCreated"));
    },
  });

  const { mutateAsync: deleteRecurringTransaction } = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/recurring-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring-transactions", accountId],
      });
      message.success(t("recurringTransactionDeleted"));
    },
  });

  const columns = [
    {
      title: t("title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      render: (type: TransactionType) => {
        const typeColors = {
          [TransactionType.DEPOSIT]: "text-green-600",
          [TransactionType.WITHDRAWAL]: "text-red-600",
        };
        return (
          <span className={typeColors[type]}>{t(type.toLowerCase())}</span>
        );
      },
    },
    {
      title: t("interval"),
      dataIndex: "interval",
      key: "interval",
      render: (interval: string) => {
        const intervalMap: Record<string, string> = {
          "1 day": t("everyDay"),
          "1 week": t("everyWeek"),
          "1 month": t("everyMonth"),
          "1 year": t("everyYear"),
        };
        return intervalMap[interval] || interval;
      },
    },
    {
      title: t("startDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t("endDate"),
      dataIndex: "endDate",
      key: "endDate",
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_: any, record: RecurringTransaction) => (
        <Button
          danger
          onClick={() => {
            if (window.confirm(t("confirmDeleteRecurring"))) {
              deleteRecurringTransaction(record.id);
            }
          }}
        >
          {t("delete")}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center">
          <Repeat className="w-5 h-5 mr-2" />
          {t("recurringTransactions")}
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t("addRecurringTransaction")}
        </Button>
      }
    >
      <Table dataSource={recurringTransactions} columns={columns} rowKey="id" />

      <RecurringTransactionModal
        currency={account?.currency ?? "USD"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={async (values) => {
          await createRecurringTransaction({
            ...values,
            accountId,
          });
          setIsModalVisible(false);
        }}
      />
    </Card>
  );
};

interface RecurringTransactionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  currency: string;
}

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  visible,
  currency,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations("RecurringTransactions");

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        await onSubmit(values);
        form.resetFields();
      } catch (error) {
        console.error("Failed to submit:", error);
      }
    });
  };

  return (
    <Modal
      title={t("addNewRecurringTransaction")}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={t("title")}
          rules={[{ required: true, message: t("titleRequired") }]}
        >
          <Input placeholder={t("enterTitle")} />
        </Form.Item>

        <Form.Item
          name="amount"
          label={t("amount")}
          rules={[{ required: true, message: t("amountRequired") }]}
        >
          <InputNumber
            prefix={currency}
            style={{ width: "100%" }}
            min={0}
            placeholder={t("enterAmount")}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label={t("type")}
          rules={[{ required: true, message: t("typeRequired") }]}
        >
          <Select>
            <Select.Option value={TransactionType.DEPOSIT}>
              {t("deposit")}
            </Select.Option>
            <Select.Option value={TransactionType.WITHDRAWAL}>
              {t("withdrawal")}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="interval"
          label={t("interval")}
          rules={[{ required: true, message: t("intervalRequired") }]}
        >
          <Select>
            <Select.Option value="1 day">{t("everyDay")}</Select.Option>
            <Select.Option value="1 week">{t("everyWeek")}</Select.Option>
            <Select.Option value="1 month">{t("everyMonth")}</Select.Option>
            <Select.Option value="1 year">{t("everyYear")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label={t("startDate")}
          rules={[{ required: true, message: t("startDateRequired") }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="endDate" label={t("endDate")}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="description" label={t("description")}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
