"use client";

import { api } from "@/common/api/api";
import { TransactionType } from "@/common/types/transaction";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Statistic,
  Table,
  Tree,
  Typography,
  message,
} from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import {
  BarChart4,
  BrainCircuit,
  ChartPie,
  LayoutDashboard,
  MessageSquare,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { RecurringTransactions } from "./RecurringTransactions";
import { SavingsGoalsProgress } from "./SavingsGoalsProgress";
import { SpendingCategoryChart } from "./SpendingCategoryChart";
import { SpendingHistoryChart } from "./SpendingHistoryChart";
import { ECurrency } from "@/common/types/currency";
import { formatCurrency } from "@/common/utils/currency";

const { Title } = Typography;

export interface Transaction {
  id: number;
  accountId: number;
  title: string;
  amount: number;
  date: string;
  type: TransactionType;
  description?: string;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
}

export interface Account {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  accountName: string;
  balance: number;
  currency: ECurrency;
}

interface FinanceDashboardProps {
  accountId: number;
}

export const useAccount = (accountId: number) => {
  const isValidId = Boolean(
    accountId && Number.isFinite(accountId) && accountId > 0
  );

  const query = useQuery({
    queryKey: ["account", accountId],
    queryFn: async () => {
      return (await api.get<Account>(`/accounts/${accountId}`)).data;
    },
    enabled: isValidId,
  });

  return {
    ...query,
    account: query.data,
  };
};

export const useTransactions = (accountId: number) => {
  const isValidId = Boolean(
    accountId && Number.isFinite(accountId) && accountId > 0
  );

  const query = useQuery({
    queryKey: ["transactions", accountId],
    queryFn: async () => {
      return (
        await api.get<Transaction[]>(`/transactions?accountId=${accountId}`)
      ).data;
    },
    enabled: isValidId,
  });

  return {
    ...query,
    transactions: query.data,
  };
};

const useStyle = createStyles(({ prefixCls, css }: any) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #3b82f6, #9333ea);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0.5;
      }
    }
  `,
}));

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  accountId,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const t = useTranslations("Dashboard");
  const queryClient = useQueryClient();

  const { data: accountData } = useAccount(accountId);

  const { data: transactions } = useTransactions(accountId);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const { styles } = useStyle();

  const columns = [
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: t("title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t("category"),
      dataIndex: "categoryName",
      key: "categoryName",
      render: (categoryName: string) =>
        categoryName || <span className="opacity-50">-</span>,
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_: unknown, record: Transaction) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: t("deleteTransaction"),
              content: t("deleteTransactionConfirm"),
              okText: t("delete"),
              okType: "danger",
              cancelText: t("cancel"),
              onOk: () => deleteTransaction.mutateAsync(record.id),
            });
          }}
        />
      ),
    },
  ];

  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: number) => {
      return api.delete(`/transactions/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      message.success(t("transactionDeleted"));
    },
  });

  const monthlyIncome = useMemo(() => {
    return (
      transactions?.reduce((acc, transaction) => {
        if (transaction.type === TransactionType.DEPOSIT) {
          return acc + transaction.amount;
        }
        return acc;
      }, 0) || 0
    );
  }, [transactions]);

  const monthlyExpense = useMemo(() => {
    return (
      transactions?.reduce((acc, transaction) => {
        if (transaction.type === TransactionType.WITHDRAWAL) {
          return acc + transaction.amount;
        }
        return acc;
      }, 0) || 0
    );
  }, [transactions]);

  const savingsRate = useMemo(() => {
    if (!monthlyIncome) return 0;
    return ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;
  }, [monthlyIncome, monthlyExpense]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center mb-2">
              <Wallet className="w-6 h-6 mr-2 text-blue-500" />
              <Title level={5} style={{ marginBottom: 0 }}>
                {t("totalBalance")}
              </Title>
            </div>
            <Statistic
              value={accountData?.balance || 0}
              formatter={(value) =>
                formatCurrency(value as number, accountData?.currency || "USD")
              }
            />
          </Card>
          <Card>
            <div className="flex items-center mb-2">
              <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
              <Title level={5} style={{ marginBottom: 0 }}>
                {t("monthlyIncome")}
              </Title>
            </div>
            <Statistic
              value={monthlyIncome || 0}
              formatter={(value) =>
                formatCurrency(value as number, accountData?.currency || "USD")
              }
            />
          </Card>
          <Card>
            <div className="flex items-center mb-2">
              <TrendingDown className="w-6 h-6 mr-2 text-red-500" />
              <Title level={5} style={{ marginBottom: 0 }}>
                {t("monthlyExpenses")}
              </Title>
            </div>
            <Statistic
              value={monthlyExpense || 0}
              formatter={(value) =>
                formatCurrency(value as number, accountData?.currency || "USD")
              }
            />
          </Card>
          <Card>
            <div className="flex items-center mb-2">
              <PiggyBank className="w-6 h-6 mr-2 text-purple-500" />
              <Title level={5} style={{ marginBottom: 0 }}>
                {t("savingsRate")}
              </Title>
            </div>
            <Statistic value={savingsRate || 0} suffix="%" precision={2} />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card
            title={
              <div className="flex items-center">
                <BarChart4 className="w-5 h-5 mr-2" />
                {t("spendingHistory")}
              </div>
            }
          >
            <div className="h-[30rem]">
              <SpendingHistoryChart transactions={transactions ?? []} />
            </div>
          </Card>
          <Card
            title={
              <div className="flex items-center">
                <ChartPie className="w-5 h-5 mr-2" /> {t("spendingByCategory")}
              </div>
            }
          >
            <div className="h-[30rem]">
              <SpendingCategoryChart transactions={transactions ?? []} />
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <SavingsGoalsProgress accountId={accountId} />
        </div>

        <div className="mt-6">
          <Card
            title={
              <div className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                {t("recentTransactions")}
              </div>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                {t("addTransaction")}
              </Button>
            }
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 30 }}
            />
          </Card>
        </div>

        <div className="mt-6">
          <Card
            title={
              <div className="flex items-center">
                <BrainCircuit className="w-6 h-6 mr-2 text-blue-500" />

                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-purple-600">
                  {t("aiFeatures")}
                </span>
              </div>
            }
          >
            <ConfigProvider
              button={{
                className: styles.linearGradientButton,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Title
                    level={4}
                    className="text-white mb-4 flex items-center"
                  >
                    <BarChart4 className="w-5 h-5 mr-2" />
                    {t("aiReports")}
                  </Title>
                  <p className="mb-4">{t("aiReportsDescription")}</p>
                  <Link href={`/dashboard/${accountId}/ai-reports`}>
                    <Button type="primary">{t("viewAIReports")}</Button>
                  </Link>
                </div>
                <div>
                  <Title
                    level={4}
                    className="text-white mb-4 flex items-center"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {t("aiAssistant")}
                  </Title>
                  <p className="mb-4">{t("aiAssistantDescription")}</p>
                  <Link href={`/dashboard/${accountId}/ai-chat`}>
                    <Button type="primary">{t("chatWithAI")}</Button>
                  </Link>
                </div>
              </div>
            </ConfigProvider>
          </Card>
        </div>

        <div className="mt-6">
          <RecurringTransactions accountId={accountId} />
        </div>
      </main>

      {accountData && (
        <TransactionModal
          visible={isModalVisible}
          setVisible={setIsModalVisible}
          account={accountData}
        />
      )}
    </div>
  );
};

interface TransactionModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  account: Account;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  setVisible,
  account,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations("Dashboard");
  const queryClient = useQueryClient();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { id: accountId } = account;

  const { mutateAsync: createTransaction } = useMutation({
    mutationFn: async (data: Omit<Transaction, "createdAt" | "updatedAt">) => {
      return api.post("/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
    },
  });

  const handleOk = () => {
    form.validateFields().then((values) => {
      createTransaction({
        ...values,
        accountId,
        categoryId: selectedCategory?.id, // ensure we pass the chosen category
      }).then(() => {
        form.resetFields();
        setSelectedCategory(null);
        setVisible(false);
      });
    });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      title={t("addNewTransaction")}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t("add")}
      cancelText={t("cancel")}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: TransactionType.DEPOSIT, date: dayjs() }}
      >
        <Form.Item
          name="title"
          label={t("placeholder")}
          rules={[{ required: true, message: t("titleRequired") }]}
        >
          <Input placeholder={t("enterTitle")} />
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
          name="date"
          label={t("date")}
          rules={[{ required: true, message: t("dateRequired") }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("description")}
          rules={[{ message: t("descriptionRequired") }]}
        >
          <Input placeholder={t("enterDescription")} />
        </Form.Item>
        <Form.Item
          name="amount"
          label={t("amount")}
          rules={[{ required: true, message: t("amountRequired") }]}
          style={{ width: "100%" }}
        >
          <InputNumber
            prefix={account.currency}
            style={{ width: "100%" }}
            min={0}
            placeholder={t("enterAmount")}
          />
        </Form.Item>
        <Form.Item label={t("category")}>
          <Input
            value={selectedCategory?.categoryName || t("selectCategory")}
            readOnly
            onClick={() => setCategoryModalVisible(true)}
            className="cursor-pointer"
          />
        </Form.Item>
      </Form>

      <CategoryModal
        visible={categoryModalVisible}
        setVisible={setCategoryModalVisible}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCategoryModalVisible(false);
        }}
      />
    </Modal>
  );
};

export interface Category {
  id: number;
  userId: null | number;
  categoryName: string;
  parentCategoryId: null | number;
  createdAt: string;
  updatedAt: string;
  subcategories: Category[];
}

interface CategoryModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSelectCategory: (cat: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  setVisible,
  onSelectCategory,
}) => {
  const t = useTranslations("Dashboard");
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategoryModal, setNewCategoryModal] = useState<{
    visible: boolean;
    parentId?: number;
    initialValue?: string;
  }>({ visible: false });
  const [categoryNameInput, setCategoryNameInput] = useState("");

  const { categories } = useCategories();

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: async (newCategory: {
      categoryName: string;
      parentCategoryId?: number;
    }) => {
      return (await api.post("/categories", newCategory)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Category created");
    },
  });

  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: async ({
      categoryId,
      updated,
    }: {
      categoryId: number;
      updated: { categoryName?: string; parentCategoryId?: number };
    }) => {
      return (await api.patch(`/categories/${categoryId}`, updated)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Category updated");
    },
  });

  const { mutateAsync: deleteCategoryMutation } = useMutation({
    mutationFn: async (categoryId: number) => {
      return (await api.delete(`/categories/${categoryId}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Category deleted");
    },
  });

  const filterCategories = (cats: Category[]): Category[] => {
    const term = searchTerm.toLowerCase();
    return cats
      .filter((cat) => {
        const nameMatch = cat.categoryName.toLowerCase().includes(term);
        const childMatch = cat.subcategories?.some((sub) =>
          sub.categoryName.toLowerCase().includes(term)
        );
        return nameMatch || childMatch;
      })
      .map((cat) => ({
        ...cat,
        subcategories: filterCategories(cat.subcategories || []),
      }));
  };

  const handleCreateCategory = () => {
    if (categoryNameInput.trim()) {
      createCategory({
        categoryName: categoryNameInput.trim(),
        parentCategoryId: newCategoryModal.parentId,
      }).then(() => {
        setNewCategoryModal({ visible: false });
        setCategoryNameInput("");
      });
    }
  };

  const buildTreeData = (cats: Category[]): any[] => {
    return cats.map((cat) => {
      const isEditable = cat.userId !== null;

      return {
        title: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{cat.categoryName}</span>
            <span>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setNewCategoryModal({ visible: true, parentId: cat.id });
                }}
                onMouseDown={(e) => e.preventDefault()}
              />
              {isEditable && (
                <>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewCategoryModal({
                        visible: true,
                        parentId: cat.id,
                        initialValue: cat.categoryName,
                      });
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      Modal.confirm({
                        title: "Delete Category",
                        content: `Are you sure you want to delete "${cat.categoryName}"?`,
                        okText: "Yes",
                        okType: "danger",
                        cancelText: "No",
                        onOk: () => deleteCategoryMutation(cat.id),
                      });
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </>
              )}
            </span>
          </div>
        ),
        key: cat.id,
        category: cat,
        children: buildTreeData(cat.subcategories || []),
      };
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Optimization
  const displayedCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchTerm) return buildTreeData(categories);
    const filtered = filterCategories(categories);
    return buildTreeData(filtered);
  }, [categories, searchTerm]);

  const onSelect = (_selectedKeys: any, info: any) => {
    onSelectCategory(info.node.category);
  };

  return (
    <>
      <Modal
        title="Select Category"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <div className="flex gap-2 mb-4">
          <Input.Search
            placeholder="Search categories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setNewCategoryModal({ visible: true })}
          >
            Add Category
          </Button>
        </div>
        <Tree
          treeData={displayedCategories}
          onSelect={onSelect}
          defaultExpandAll
          style={{ maxHeight: 400, overflowY: "auto" }}
          showLine={{ showLeafIcon: false }}
        />
      </Modal>

      <Modal
        title={newCategoryModal.initialValue ? "Edit Category" : "New Category"}
        open={newCategoryModal.visible}
        onOk={handleCreateCategory}
        onCancel={() => {
          setNewCategoryModal({ visible: false });
          setCategoryNameInput("");
        }}
        okText={newCategoryModal.initialValue ? "Update" : "Create"}
      >
        <Form layout="vertical">
          <Form.Item
            label="Category Name"
            required
            validateStatus={categoryNameInput.trim() ? "success" : "error"}
            help={!categoryNameInput.trim() && "Please enter a category name"}
          >
            <Input
              value={categoryNameInput}
              onChange={(e) => setCategoryNameInput(e.target.value)}
              placeholder="Enter category name"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const useCategories = () => {
  const { data: categories, ...props } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return (await api.get<Category[]>("/categories")).data;
    },
  });

  return { ...props, categories };
};
