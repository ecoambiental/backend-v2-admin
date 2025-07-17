import { INSTITUTIONS_MAP } from '../constants/institution';

export function companyNameToId(name: string): number | null {
  return INSTITUTIONS_MAP[name.trim().toLowerCase()] ?? null;
}
