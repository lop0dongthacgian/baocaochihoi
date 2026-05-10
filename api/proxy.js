// api/proxy.js — Vercel Serverless Function
// File này chạy trên SERVER của Vercel, không phải trình duyệt
// nên có thể dùng process.env an toàn

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Lấy URL từ biến môi trường (cấu hình trong Vercel Settings)
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({
      error: "Chưa cấu hình GOOGLE_SCRIPT_URL trong Vercel Environment Variables"
    });
  }

  try {
    // Chuyển tiếp request sang Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Lỗi kết nối tới Google Script: " + err.message
    });
  }
}
