import { useEffect, useState } from 'react';

/**
 * Hook trả về thông tin user hiện tại.
 * Tạm thời mock từ localStorage 'current_user' hoặc fallback tên mặc định.
 * Khi tích hợp backend/.NET, thay logic lấy user từ auth context/API.
 */
export default function useCurrentUser() {
  const [user, setUser] = useState({ name: 'Nguyễn Văn A' });

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('current_user') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name) setUser({ name: parsed.name });
      }
    } catch {}
  }, []);

  return user;
}


