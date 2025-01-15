"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import Cookies from "js-cookie";

const LOCALES = [
  { code: "en", name: "English" },
  { code: "pl", name: "Polski" },
] as const;

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
      options={LOCALES.map((l) => ({ value: l.code, label: l.name }))}
      className="w-24"
    />
  );
};
