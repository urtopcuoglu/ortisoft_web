// Sunucu ve istemci tarafında ortak kullanılan saf (pure) yardımcı — server-only
// bağımlılığı yok, hem RSC'lerde hem client component'lerde import edilebilir.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Messages = Record<string, any>;

export function createTranslator(messages: Messages) {
  return function t(key: string): string {
    const value = key
      .split(".")
      .reduce<unknown>((obj, part) => {
        if (obj && typeof obj === "object" && part in obj) {
          return (obj as Messages)[part];
        }
        return undefined;
      }, messages);
    return typeof value === "string" ? value : key;
  };
}
