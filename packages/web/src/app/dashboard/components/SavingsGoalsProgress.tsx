"use client";

import { api } from "@/common/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Progress,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
} from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { NoDataMessage } from "./NoDataMessage";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { Goal } from "lucide-react";

interface CreateSavingGoalPayload {
  moneyboxId: number;
  title: string;
  description?: string;
  targetAmount: number;
  icon?: string;
}

export interface SavingGoal {
  amount: number;
  isCompleted: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  title: string;
  description: string;
  moneyboxId: number;
  targetAmount: number;
  icon?: string;
}

export const SavingsGoalsProgress: React.FC<{ accountId: number }> = ({
  accountId,
}) => {
  const t = useTranslations("Dashboard");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ["savingsGoals", accountId],
    queryFn: async () => {
      const { data } = await api.get<SavingGoal[]>("/saving-goals");
      return data;
    },
  });

  const { mutateAsync: deleteSavingGoal } = useMutation({
    mutationFn: async (goalId: number) => {
      return api.delete(`/saving-goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", accountId] });
      message.success(t("savingsGoalDeleted"));
    },
  });

  const handleEdit = (goal: SavingGoal) => {
    setSelectedGoal(goal);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedGoal(null);
    setIsModalVisible(true);
  };

  const handleDelete = (goalId: number) => {
    Modal.confirm({
      title: t("confirmDelete"),
      content: t("deleteGoalConfirmation"),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: () => deleteSavingGoal(goalId),
    });
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <Goal className="w-5 h-5 mr-2" />
          {t("savingsGoalsProgress")}
        </div>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t("addSavingsGoal")}
        </Button>
      }
    >
      <div className="min-h-24">
        {goals?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal.title} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold">
                    {goal.icon} {goal.title}
                  </h4>
                  <div className="space-x-2">
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEdit(goal)}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={() => handleDelete(goal.id)}
                    />
                  </div>
                </div>
                <Progress
                  percent={Math.round((goal.amount / goal.targetAmount) * 100)}
                  format={() => `$${goal.amount} / $${goal.targetAmount}`}
                  status="active"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-24 w-full">
            <NoDataMessage />
          </div>
        )}
      </div>

      <SavingsGoalFormModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        goal={selectedGoal}
        accountId={accountId}
      />
    </Card>
  );
};

interface SavingsGoalFormModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  goal?: SavingGoal | null;
  accountId: number;
}

const SavingsGoalFormModal: React.FC<SavingsGoalFormModalProps> = ({
  visible,
  setVisible,
  goal,
  accountId,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations("Dashboard");
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(goal?.icon || "🎯");
  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      form.setFieldsValue({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount,
        icon: goal.icon,
      });
      setSelectedEmoji(goal.icon || "🎯");
    } else {
      form.resetFields();
      setSelectedEmoji("🎯");
    }
  }, [goal, form]);

  const { mutateAsync: createSavingGoal } = useMutation({
    mutationFn: async (data: CreateSavingGoalPayload) => {
      return api.post("/saving-goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", accountId] });
      message.success(t("savingsGoalCreated"));
    },
  });

  const { mutateAsync: updateSavingGoal } = useMutation({
    mutationFn: async (data: Partial<CreateSavingGoalPayload>) => {
      return api.patch(`/saving-goals/${goal?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", accountId] });
      message.success(t("savingsGoalUpdated"));
    },
  });

  const { mutateAsync: createMoneybox } = useMutation({
    mutationFn: async () => {
      return api.post<{ id: number }[]>("/moneyboxes", {
        currency: "USD",
        balance: 0,
      });
    },
  });

  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
    form.setFieldValue("icon", emojiData.emoji);
  };

  const handleOk = async () => {
    form.validateFields().then(async (values) => {
      if (isEditing) {
        await updateSavingGoal({
          ...values,
          icon: selectedEmoji,
        });
      } else {
        const {
          data: [moneybox],
        } = await createMoneybox();
        await createSavingGoal({
          ...values,
          moneyboxId: moneybox.id,
          icon: selectedEmoji,
        });
      }
      setVisible(false);
      if (!isEditing) {
        form.resetFields();
      }
    });
  };

  return (
    <Modal
      title={t(isEditing ? "editSavingsGoal" : "addNewSavingsGoal")}
      open={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okText={t(isEditing ? "save" : "add")}
      cancelText={t("cancel")}
    >
      <Form form={form} layout="vertical">
        <div className="flex gap-4 mb-4">
          <div className="relative">
            <button
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-200"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              type="button"
            >
              {selectedEmoji}
            </button>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  width={300}
                  height={400}
                  skinTonesDisabled
                  categories={[
                    // @ts-ignore
                    "travel_places",
                    // @ts-ignore
                    "activities",
                    // @ts-ignore
                    "objects",
                    // @ts-ignore
                    "animals_nature",
                    // @ts-ignore
                    "food_drink",
                    // @ts-ignore
                    "flags",
                  ]}
                />
              </div>
            )}
          </div>
          <Form.Item
            name="title"
            label={t("title")}
            className="flex-1"
            rules={[{ required: true, message: t("titleRequired") }]}
          >
            <Input placeholder={t("enterTitle")} />
          </Form.Item>
        </div>

        <Form.Item name="description" label={t("description")}>
          <Input.TextArea placeholder={t("enterDescription")} />
        </Form.Item>

        <Form.Item
          name="targetAmount"
          label={t("targetAmount")}
          rules={[{ required: true, message: t("targetAmountRequired") }]}
        >
          <InputNumber
            prefix="$"
            style={{ width: "100%" }}
            min={0}
            placeholder={t("enterTargetAmount")}
          />
        </Form.Item>

        <Form.Item name="icon" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
