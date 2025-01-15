"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import Cookies from "js-cookie";
import { LOCALES } from "../constants/locales";

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    Cookies.set("NEXT_LOCALE", newLocale);
    router.refresh();
  };

  return (
    <Select
      value={locale}
      onChange={handleLocaleChange}
      options={LOCALES.map((l) => ({
        value: l.code,
        label: (
          <div>
            <span>{l.flag}</span> <span>{l.name}</span>
          </div>
        ),
      }))}
      className="w-36"
    />
  );
};
