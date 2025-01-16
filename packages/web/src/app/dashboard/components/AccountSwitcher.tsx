"use client";

import { api } from "@/common/api/api";
import { ECurrency } from "@/common/types/currency";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, Modal, Form, Input, Button, message } from "antd";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

interface Account {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  accountName: string;
  balance: number;
  currency: string;
}

interface CreateAccountData {
  accountName: string;
  currency: string;
}

export const useAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return (await api.get<Account[]>("/accounts")).data;
    },
  });

  return {
    accounts: query.data,
    ...query,
  };
};

export const AccountSwitcher: React.FC = () => {
  const t = useTranslations("AccountSwitcher");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { accountId } = useParams();
  const { accounts } = useAccounts();

  const createAccountMutation = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      return (await api.post("/accounts", data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      message.success(t("accountCreated"));
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error(t("accountCreationError"));
    },
  });

  const handleAccountChange = (value: number) => {
    router.push(`/dashboard/${value}`);
  };

  const handleCreateAccount = async (values: CreateAccountData) => {
    await createAccountMutation.mutateAsync(values);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        placeholder={t("selectAccount")}
        onChange={handleAccountChange}
        style={{ width: 200 }}
        value={typeof accountId === "string" ? Number(accountId) : undefined}
        dropdownRender={(menu) => (
          <>
            {menu}

            <div className="p-2 border-t mt-2 pt-2">
              <Button
                block
                onClick={() => setIsModalOpen(true)}
                icon={<PlusOutlined />}
              >
                {t("createNewAccount")}
              </Button>
            </div>
          </>
        )}
      >
        {accounts?.map((account) => (
          <Select.Option key={account.id} value={account.id}>
            {account.accountName}
          </Select.Option>
        ))}
      </Select>

      <Modal
        title={t("createNewAccount")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAccount}>
          <Form.Item
            name="accountName"
            label={t("accountName")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="currency"
            label={t("currency")}
            rules={[{ required: true }]}
            initialValue="USD"
          >
            <Select>
              {Object.values(ECurrency).map((currency) => (
                <Select.Option key={currency} value={currency}>
                  {currency}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={createAccountMutation.isPending}
            >
              {t("create")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
