// api/proxy.js
// Vercel Serverless Function: đóng vai trò trung gian giữa trình duyệt
// và Google Apps Script Web App.

export default async function handler(req, res) {
  // CORS headers - cho phép các domain được cấu hình
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://your-domain.vercel.app', 'http://localhost:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Security headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Xử lý preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Chỉ chấp nhận POST cho API chính
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only POST is supported.' 
    });
    return;
  }

  const API_URL = process.env.GOOGLE_SHEET_API_URL;

  if (!API_URL) {
    console.error('GOOGLE_SHEET_API_URL not configured');
    res.status(500).json({
      success: false,
      message: 'Server configuration error: API URL not set. Please contact administrator.',
    });
    return;
  }

  // Rate limiting đơn giản (tùy chọn)
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // Có thể thêm logic rate limit ở đây

  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await upstream.text();

    // Kiểm tra content-type trước khi parse JSON
    const contentType = upstream.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (parseError) {
        // Nếu không parse được JSON, trả về text
        res.status(200).send(text);
      }
    } else {
      // Nếu không phải JSON, trả về nguyên văn
      res.status(200).send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi kết nối tới Google Apps Script: ' + err.message,
    });
  }
}
