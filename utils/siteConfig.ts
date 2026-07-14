import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'site_settings.json');

export interface SiteSettings {
  maintenanceMode: boolean;
  allowSignups: boolean;
  announcement: string;
}

const defaultSettings: SiteSettings = {
  maintenanceMode: false,
  allowSignups: true,
  announcement: '',
};

export function getSiteSettings(): SiteSettings {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));
  return updated;
}
