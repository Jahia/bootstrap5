export function useTranslation() {
  return { t: (key: string) => key, i18n: { language: 'en' } };
}
