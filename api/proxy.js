// api/proxy.js – Vercel Serverless Function
// Che giấu WEBAPP_URL khỏi client, xử lý cả gửi báo cáo lẫn admin getStats

const WEBAPP_URL = process.env.WEBAPP_URL;

export default async function handler(req, res) {
  // Chỉ nhận POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!WEBAPP_URL) {
    return res.status(500).json({ success: false, error: "WEBAPP_URL chưa được cấu hình trên server" });
  }

  const body = req.body;

  try {
    // ── ADMIN: lấy thống kê ──────────────────────────────────────────
    if (body.action === "getStats" || body.action === "getMonths" || body.action === "ping") {
      const params = new URLSearchParams({ action: body.action });
      if (body.thang) params.set("thang", body.thang);
      if (body.nam)   params.set("nam",   body.nam);

      const response = await fetch(`${WEBAPP_URL}?${params.toString()}`);
      const data     = await response.json();
      return res.status(200).json(data);
    }

    // ── CHI HỘI: gửi file báo cáo ────────────────────────────────────
    if (body.file && body.filename) {
      const response = await fetch(WEBAPP_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ file: body.file, filename: body.filename }),
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ success: false, error: "Yêu cầu không hợp lệ" });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
