import { StructuredAnalysisResponse } from '../types';

const STORAGE_KEY = 'revo_analysis_history';
const MAX_HISTORY_ITEMS = 30;

export function getHistory(): StructuredAnalysisResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (err) {
    console.warn('Failed to parse analysis history from localStorage:', err);
    return [];
  }
}

export function saveToHistory(item: StructuredAnalysisResponse): StructuredAnalysisResponse[] {
  try {
    const current = getHistory();
    // Remove duplicate if exists
    const filtered = current.filter((x) => x.id !== item.id && x.url !== item.url);
    
    // Create lightweight screenshot copy if too large to prevent localStorage overflow
    const itemToSave = { ...item };
    
    filtered.unshift(itemToSave);
    const updated = filtered.slice(0, MAX_HISTORY_ITEMS);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaErr) {
      // If quota exceeded, trim screenshot base64 and retry
      console.warn('LocalStorage quota exceeded. Trimming screenshots for history optimization.');
      const trimmedList = updated.map((obj) => {
        if (obj.evidence?.screenshotDesktopBase64) {
          return {
            ...obj,
            evidence: {
              ...obj.evidence,
              screenshotDesktopBase64: undefined,
              screenshotFullBase64: undefined,
            },
          };
        }
        return obj;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedList));
      return trimmedList;
    }
    
    return updated;
  } catch (err) {
    console.error('Failed to save item to history:', err);
    return getHistory();
  }
}

export function deleteFromHistory(id: string): StructuredAnalysisResponse[] {
  try {
    const current = getHistory();
    const filtered = current.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete item from history:', err);
    return getHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
