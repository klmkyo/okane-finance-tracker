"use client";

import { api } from "@/common/api/api";
import { useUser, type User } from "@/common/hooks/useUser";
import {
  Button,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
  Spin,
  Empty,
  Card,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Result,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  TeamOutlined,
  LockOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const t = useTranslations("Admin");

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/admin/users");
      return data;
    },
  });

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.firstName.toLowerCase().includes(term) ||
          user.lastName?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "blocked") {
      result = result.filter((user) => user.isBlocked);
    } else if (statusFilter === "active") {
      result = result.filter((user) => !user.isBlocked);
    }

    // Sort by ID
    result.sort((a, b) => {
      return sortOrder === "ascend" ? a.id - b.id : b.id - a.id;
    });

    return result;
  }, [users, searchTerm, roleFilter, statusFilter, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      blocked: users.filter((u) => u.isBlocked).length,
    };
  }, [users]);

  const blockMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(t("messages.blocked"));
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(t("messages.unblocked"));
    },
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/promote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(t("messages.promoted"));
    },
  });

  const demoteFromAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/demote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(t("messages.demoted"));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(t("messages.deleted"));
    },
  });

  const columns = [
    {
      title: t("table.columns.id"),
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: false,
      render: (id: number) => <span className="font-semibold">{id}</span>,
    },
    {
      title: t("table.columns.username"),
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: t("table.columns.email"),
      dataIndex: "email",
      key: "email",
      width: 160,
    },
    {
      title: t("table.columns.name"),
      key: "name",
      width: 140,
      render: (_: any, record: User) =>
        `${record.firstName} ${record.lastName || ""}`,
    },
    {
      title: t("table.columns.role"),
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: string) => (
        <Tag
          icon={role === "ADMIN" ? <CrownOutlined /> : undefined}
          color={role === "ADMIN" ? "gold" : "blue"}
        >
          {role === "ADMIN" ? t("role.admin") : t("role.user")}
        </Tag>
      ),
    },
    {
      title: t("table.columns.status"),
      key: "status",
      width: 100,
      render: (_: any, record: User) => (
        <Tag
          icon={record.isBlocked ? <LockOutlined /> : undefined}
          color={record.isBlocked ? "red" : "green"}
        >
          {record.isBlocked ? t("status.blocked") : t("status.active")}
        </Tag>
      ),
    },
    {
      title: t("table.columns.actions"),
      key: "actions",
      width: 300,
      render: (_: any, record: User) => {
        const isCurrentUser = record.id === currentUser?.id;
        return (
          <Space size="small" wrap>
            {record.isBlocked ? (
              <Button
                size="small"
                type="primary"
                onClick={() => unblockMutation.mutate(record.id)}
                loading={unblockMutation.isPending}
              >
                {t("actions.unblock")}
              </Button>
            ) : (
              <Popconfirm
                title={t("confirm.block.title")}
                description={t("confirm.block.description")}
                onConfirm={() => blockMutation.mutate(record.id)}
                okText={t("confirm.yes")}
                cancelText={t("confirm.no")}
              >
                <Button
                  size="small"
                  danger
                  loading={blockMutation.isPending}
                  disabled={isCurrentUser}
                >
                  {t("actions.block")}
                </Button>
              </Popconfirm>
            )}

            {record.role === "ADMIN" ? (
              <Button
                size="small"
                onClick={() => demoteFromAdminMutation.mutate(record.id)}
                loading={demoteFromAdminMutation.isPending}
                disabled={isCurrentUser}
              >
                {t("actions.demote")}
              </Button>
            ) : (
              <Button
                size="small"
                onClick={() => promoteToAdminMutation.mutate(record.id)}
                loading={promoteToAdminMutation.isPending}
              >
                {t("actions.promote")}
              </Button>
            )}

            <Popconfirm
              title={t("confirm.delete.title")}
              description={t("confirm.delete.description")}
              onConfirm={() => deleteUserMutation.mutate(record.id)}
              okText={t("confirm.yes")}
              cancelText={t("confirm.no")}
            >
              <Button
                size="small"
                danger
                loading={deleteUserMutation.isPending}
                disabled={isCurrentUser}
              >
                {t("actions.delete")}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Check if user is admin
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Result
          status="403"
          title={t("forbidden.title")}
          subTitle={t("forbidden.subtitle")}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Spin />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("stats.total")}
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("stats.admins")}
              value={stats.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("stats.blocked")}
              value={stats.blocked}
              prefix={<LockOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Card */}
      <Card title={t("filters.title")} className="shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              prefix={<SearchOutlined />}
              placeholder={t("filters.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              className="w-full"
              placeholder={t("filters.rolePlaceholder")}
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
              options={[
                { label: t("filters.role.admin"), value: "ADMIN" },
                { label: t("filters.role.user"), value: "USER" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              className="w-full"
              placeholder={t("filters.statusPlaceholder")}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              options={[
                { label: t("filters.status.active"), value: "active" },
                { label: t("filters.status.blocked"), value: "blocked" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              className="w-full"
              placeholder={t("filters.sortPlaceholder")}
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { label: t("filters.sort.asc"), value: "ascend" },
                { label: t("filters.sort.desc"), value: "descend" },
              ]}
            />
          </Col>
        </Row>
        <Row className="mt-4">
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              setSearchTerm("");
              setRoleFilter(null);
              setStatusFilter(null);
              setSortOrder("ascend");
            }}
          >
            {t("actions.clearFilters")}
          </Button>
        </Row>
      </Card>

      {/* Users Table */}
      <Card
        title={t("table.title", { count: filteredUsers.length })}
        className="shadow-sm"
      >
        {filteredUsers.length === 0 ? (
          <Empty description={t("table.empty")} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 20, showSizeChanger: true }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
