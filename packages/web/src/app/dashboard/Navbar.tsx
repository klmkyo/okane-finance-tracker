"use client";

import { LanguageSwitcher } from "@/common/components/LanguageSwitcher";
import { LOCALES } from "@/i18n/locales";
import { useLogout } from "@/common/hooks/useLogout";
import { useUser } from "@/common/hooks/useUser";
import { csvService } from "@/common/services/csvService";
import {
  EllipsisOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Dropdown,
  Menu,
  Modal,
  Upload,
  message,
} from "antd";
import { ItemType } from "antd/es/menu/interface";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { AccountSwitcher } from "./components/AccountSwitcher";
import { useTransactions } from "./components/FinanceDashboard";

const Navbar: React.FC = () => {
  const t = useTranslations();
  const { user } = useUser();
  const logout = useLogout();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [exportDates, setExportDates] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const queryClient = useQueryClient();

  const { accountId } = useParams();

  const { transactions } = useTransactions(Number(accountId));

  useEffect(() => {
    if (transactions?.length) {
      const sortedTransactions = transactions.sort((a, b) => {
        return dayjs(a.date).diff(dayjs(b.date));
      });

      setExportDates([
        new Date(sortedTransactions[0].date),
        new Date(sortedTransactions[sortedTransactions.length - 1].date),
      ]);
    }
  }, [transactions]);

  const handleLogout = useCallback(async () => {
    Modal.confirm({
      title: t("Navbar.logout"),
      content: t("Navbar.logoutConfirmation"),
      okText: t("Common.yes"),
      cancelText: t("Common.no"),
      onOk: async () => {
        const modal = Modal.info({
          title: t("Navbar.logout"),
          content: t("Navbar.loading"),
          okButtonProps: { disabled: true },
        });
        try {
          await logout.mutateAsync();
        } finally {
          modal.destroy();
        }
      },
    });
  }, [t, logout]);

  const handleExport = async () => {
    if (!exportDates[0] || !exportDates[1] || !accountId) return;

    try {
      await csvService.exportTransactions(
        Number(accountId),
        exportDates[0],
        exportDates[1]
      );
      message.success(t("Navbar.exportSuccess"));
    } catch (error) {
      message.error(t("Navbar.exportError"));
    }
  };

  const handleImport = async (file: File) => {
    if (!accountId) return;

    try {
      const result = await csvService.importTransactions(
        Number(accountId),
        file
      );
      message.success(
        t("Navbar.importSuccessWithCount", { count: result.insertedCount })
      );
      queryClient.invalidateQueries();
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error(t("Navbar.importError"));
      return false;
    }
  };

  const items: ItemType[] = useMemo(
    () => [
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: t("Navbar.settings"),
        onClick: () => setIsSettingsVisible(true),
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: t("Navbar.logout"),
        onClick: handleLogout,
      },
    ],
    [t, handleLogout]
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              href={`/dashboard/${accountId}`}
              className="flex items-center"
            >
              <div className="shrink-0 text-3xl font-medium text-blue-600 font-pacifico select-none">
                {t("appName")}
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <AccountSwitcher />
              <Dropdown
                menu={{ items }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="flex items-center cursor-pointer">
                  <div className="text-right mr-4 hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700">
                      {user?.firstName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Button
                    type="text"
                    className="flex items-center justify-center size-10 p-0"
                  >
                    <EllipsisOutlined className="text-xl" />
                  </Button>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      <Modal
        title={t("Navbar.settings")}
        open={isSettingsVisible}
        onCancel={() => setIsSettingsVisible(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("Navbar.language")}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">
                  {t("Navbar.selectLanguage")}:
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </section>

          <section className="pt-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("Navbar.csvOperations")}
            </h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("Navbar.exportTransactions")}
                </h4>
                <div className="space-y-3">
                  <DatePicker.RangePicker
                    className="w-full"
                    value={
                      exportDates[0] && exportDates[1]
                        ? [dayjs(exportDates[0]), dayjs(exportDates[1])]
                        : undefined
                    }
                    onChange={(_, dateStrings) => {
                      setExportDates([
                        dateStrings[0] ? new Date(dateStrings[0]) : null,
                        dateStrings[1] ? new Date(dateStrings[1]) : null,
                      ]);
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={handleExport}
                    disabled={!exportDates[0] || !exportDates[1]}
                    className="w-full"
                  >
                    {t("Navbar.exportTransactions")}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("Navbar.importTransactions")}
                </h4>
                <Upload
                  accept=".csv"
                  showUploadList={false}
                  beforeUpload={(file) => handleImport(file)}
                  className="w-full"
                >
                  <Button type="primary" className="w-full">
                    {t("Navbar.selectFile")}
                  </Button>
                </Upload>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
