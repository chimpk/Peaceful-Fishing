
export const SAVE_KEY = 'fishing_frenzy_save_v1';

export const saveGame = (data: any) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};

export const loadGame = () => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu bản lưu:", e);
    }
  }
  return null;
};

export const clearSave = () => {
  localStorage.removeItem(SAVE_KEY);
};
