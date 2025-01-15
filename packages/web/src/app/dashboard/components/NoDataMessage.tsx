'use client'

import { useTranslations } from "next-intl"

export const NoDataMessage: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="text-center p-4 size-full flex items-center justify-center">
      <p className="text-gray-500">{t('noData')}</p>
    </div>
  )
}