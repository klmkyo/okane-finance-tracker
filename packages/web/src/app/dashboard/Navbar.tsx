"use client";

import { useLogout } from "@/common/hooks/useLogout";
import { useUser } from "@/common/hooks/useUser";
import {
  EllipsisOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Modal } from "antd";
import { ItemType } from "antd/es/menu/interface";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useMemo, useCallback } from "react";
import { AccountSwitcher } from "./components/AccountSwitcher";
import { useParams } from "next/navigation";

const Navbar: React.FC = () => {
  const t = useTranslations();
  const { user } = useUser();
  const logout = useLogout();

  const { accountId } = useParams();

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

  const items: ItemType[] = useMemo(
    () => [
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: t("Navbar.settings"),
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
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href={`/dashboard/${accountId}`} className="flex items-center">
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
  );
};

export default Navbar;
