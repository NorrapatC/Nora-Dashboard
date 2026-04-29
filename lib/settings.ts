export interface NSettings {
  monthlyTarget: number;
  availability: boolean;
  profileName: string;
  profileEmail: string;
  profileBio: string;
}

export const SETTINGS_KEY = "nora_settings";

export const DEFAULT_SETTINGS: NSettings = {
  monthlyTarget: 30000,
  availability: true,
  profileName: "Safe Norrapat",
  profileEmail: "chanapolnorrapat@gmail.com",
  profileBio: "นักพัฒนา Full-Stack ที่เชี่ยวชาญ Next.js, TypeScript และ Node.js",
};

export function loadSettings(): NSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
