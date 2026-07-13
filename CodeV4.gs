// ===================== CẤU HÌNH — CHỈ SỬA Ở ĐÂY =====================
const ROOT_FOLDER_NAME  = "Báo cáo CTH-DLXH";
const SPREADSHEET_NAME  = "Theo dõi báo cáo CTH-DLXH";
const TIMEZONE          = "Asia/Ho_Chi_Minh";
// =====================================================================

let SPREADSHEET_ID = null;

// ================= DANH SÁCH CHI HỘI =================
const DS_CHI_HOI_GS = [
  "1 TAM THUẬN", "2 TAM THUẬN", "3 TAM THUẬN", "4 TAM THUẬN", "5 TAM THUẬN",
  "6 TAM THUẬN", "7 TAM THUẬN", "8 TAM THUẬN", "9 TAM THUẬN", "10 TÂN CHÍNH",
  "11 TÂN CHÍNH", "12 TÂN CHÍNH", "13 TÂN CHÍNH", "14 TÂN CHÍNH", "15 TÂN CHÍNH",
  "16 VĨNH TRUNG", "17 VĨNH TRUNG", "18 VĨNH TRUNG", "19 VĨNH TRUNG", "20 VĨNH TRUNG",
  "21 VĨNH TRUNG", "22 VĨNH TRUNG", "23 THẠC GIÁN", "24 THẠC GIÁN", "25 THẠC GIÁN",
  "26 THẠC GIÁN", "27 THẠC GIÁN", "28 THẠC GIÁN", "29 THẠC GIÁN", "30 THẠC GIÁN",
  "31 THẠC GIÁN", "32 XUÂN HÀ", "33 XUÂN HÀ", "34 XUÂN HÀ", "35 XUÂN HÀ",
  "36 XUÂN HÀ", "37 XUÂN HÀ", "38 XUÂN HÀ", "39 XUÂN HÀ", "40 CHÍNH GIÁN",
  "41 CHÍNH GIÁN", "42 CHÍNH GIÁN", "43 CHÍNH GIÁN", "44 CHÍNH GIÁN", "45 CHÍNH GIÁN",
  "46 CHÍNH GIÁN", "47 CHÍNH GIÁN", "48 CHÍNH GIÁN", "49 THANH KHÊ ĐÔNG", "50 THANH KHÊ ĐÔNG",
  "51 THANH KHÊ ĐÔNG", "52 THANH KHÊ ĐÔNG", "53 THANH KHÊ ĐÔNG", "54 HÒA KHÊ", "55 HÒA KHÊ",
  "56 HÒA KHÊ", "57 HÒA KHÊ", "58 HÒA KHÊ", "59 HÒA KHÊ", "60 HÒA KHÊ",
  "61 HÒA KHÊ", "62 HÒA KHÊ", "63 HÒA KHÊ", "64 HÒA KHÊ", "65 THANH KHÊ TÂY",
  "66 THANH KHÊ TÂY", "67 THANH KHÊ TÂY", "68 THANH KHÊ TÂY", "69 THANH KHÊ TÂY", "70 THANH KHÊ TÂY",
  "71 THANH KHÊ TÂY", "72 THANH KHÊ TÂY", "73 THANH KHÊ TÂY", "74 THANH KHÊ TÂY", "75 THANH KHÊ TÂY",
  "76 THANH KHÊ TÂY", "77 THANH KHÊ TÂY", "78 THANH KHÊ TÂY", "79 THANH KHÊ TÂY",
  "PN CÔNG AN PHƯỜNG"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const base64Data = payload.file;
    const fileName = payload.filename || "BaoCao.docx";

    const bytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(bytes, MimeType.MICROSOFT_WORD, fileName);

    const fileInfo = extractFileInfo(fileName);
    const year = fileInfo.year || new Date().getFullYear().toString();
    const month = fileInfo.month || new Date().getMonth() + 1;
    let chiHoi = fileInfo.chiHoi || "Chưa xác định";
    const thangText = `Tháng ${month}`;

    chiHoi = normalizeChiHoi(chiHoi);

    const isValidChiHoi = DS_CHI_HOI_GS.includes(chiHoi);
    
    if (!isValidChiHoi) {
      const suggestions = findSimilarChiHoi(fileInfo.chiHoi || chiHoi);
      let errorMsg = `Chi hội "${fileInfo.chiHoi || chiHoi}" không có trong danh sách hợp lệ.`;
      if (suggestions.length > 0) {
        errorMsg += ` Danh sách gợi ý: ${suggestions.join(", ")}`;
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: errorMsg,
        suggestions: suggestions
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (isReportExists(chiHoi, month, year)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: `Chi hội "${chiHoi}" đã gửi báo cáo tháng ${month}/${year} rồi!`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!checkRateLimit(chiHoi)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Vui lòng đợi 60 giây trước khi gửi lại"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const rootFolderId = getOrCreateFolder_(ROOT_FOLDER_NAME);
    const yearFolderId = getOrCreateSubfolder_(rootFolderId, year);
    const targetFolderId = getOrCreateSubfolder_(yearFolderId, thangText);

    const shortFileName = formatFileName(chiHoi, month, year);

    // Kiểm tra file đã tồn tại trên Drive chưa (chống trường hợp sheet chưa ghi nhưng file đã có)
    const existingFile = findFileInFolder_(targetFolderId, shortFileName);
    if (existingFile) {
      // File đã tồn tại trên Drive → đảm bảo sheet cũng được ghi (đồng bộ lại)
      syncSheetIfMissing_(chiHoi, month, year, existingFile.getUrl());
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: `Chi hội "${chiHoi}" đã gửi báo cáo tháng ${month}/${year} rồi! (File đã tồn tại trên Drive)`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Upload file lên Drive
    let file;
    try {
      file = DriveApp.getFolderById(targetFolderId).createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      file.setName(shortFileName);
    } catch (driveError) {
      console.error("Lỗi khi upload lên Drive:", driveError);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Không thể lưu file lên Drive: " + driveError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ghi vào Sheet — nếu thất bại thì xóa file vừa upload để tránh mất đồng bộ
    try {
      logToSpreadsheet({
        chiHoi: chiHoi,
        thang: month,
        nam: year,
        fileName: shortFileName,
        fileUrl: file.getUrl()
      });
    } catch (sheetError) {
      console.error("Lỗi ghi Sheet, đang rollback file Drive:", sheetError);
      try { file.setTrashed(true); } catch(e) {}
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Lỗi khi ghi thống kê vào Sheet. File đã bị xóa để tránh mất đồng bộ. Vui lòng gửi lại."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Kiểm tra chéo sau khi lưu: xác nhận cả file Drive lẫn sheet đều có
    const verifyFile = findFileInFolder_(targetFolderId, shortFileName);
    const verifySheet = isReportExists(chiHoi, month, year);
    if (!verifyFile || !verifySheet) {
      console.error(`Mất đồng bộ sau khi lưu: Drive=${!!verifyFile}, Sheet=${verifySheet}`);
      // Cố rollback file nếu sheet chưa có
      if (verifyFile && !verifySheet) {
        try { DriveApp.getFileById(verifyFile.getId()).setTrashed(true); } catch(e) {}
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Lỗi đồng bộ dữ liệu. Vui lòng gửi lại."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: file.getUrl(),
      folder: `${ROOT_FOLDER_NAME}/${year}/${thangText}`,
      fileName: shortFileName,
      message: "Đã lưu thành công!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("Lỗi trong doPost:", error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Cho phép CORS để admin.html có thể gọi
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : "ping";

    // ── PING: kiểm tra web app còn hoạt động ──
    if (action === "ping") {
      output.setContent(JSON.stringify({
        status: "active",
        version: "2.0",
        message: "Webhook nhận báo cáo CTH-DLXH đang hoạt động"
      }));
      return output;
    }

    // ── THỐNG KÊ: lấy dữ liệu 1 tháng/năm ──
    if (action === "getStats") {
      const thang = parseInt(e.parameter.thang || (new Date().getMonth() + 1));
      const nam   = e.parameter.nam   || new Date().getFullYear().toString();

      const spreadsheet = getOrCreateSpreadsheet_();
      const sheetName   = "TK T" + thang + "-" + nam;
      const sheet       = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        output.setContent(JSON.stringify({
          success: false,
          error: "Sheet \"" + sheetName + "\" chưa tồn tại. Chưa có chi hội nào gửi báo cáo tháng này."
        }));
        return output;
      }

      const data = sheet.getDataRange().getValues();
      const rows = [];

      // Dữ liệu bắt đầu từ dòng 5 (index 4), bỏ 2 dòng cuối (tổng kết)
      for (let i = 4; i < data.length - 2; i++) {
        const r = data[i];
        if (!r[1]) continue; // bỏ dòng trống
        // Lấy URL từ rich text nếu có
        let fileUrl = "";
        try {
          const cell = sheet.getRange(i + 1, 5);
          const rt   = cell.getRichTextValue();
          if (rt) {
            const runs = rt.getRuns();
            for (const run of runs) {
              const link = run.getTextStyle().getLinkUrl();
              if (link) { fileUrl = link; break; }
            }
          }
        } catch(ex) {}

        rows.push({
          stt:      r[0] ? r[0].toString() : (i - 3).toString(),
          chiHoi:   r[1] ? r[1].toString() : "",
          status:   r[2] ? r[2].toString() : "",
          thoiGian: r[3] ? r[3].toString() : "",
          fileUrl:  fileUrl
        });
      }

      const sent    = rows.filter(function(r){ return r.status.indexOf("Đã gửi") !== -1; }).length;
      const pending = rows.length - sent;
      const pct     = rows.length > 0 ? ((sent / rows.length) * 100).toFixed(1) : "0";

      output.setContent(JSON.stringify({
        success:  true,
        thang:    thang,
        nam:      nam,
        total:    rows.length,
        sent:     sent,
        pending:  pending,
        pct:      pct,
        rows:     rows
      }));
      return output;
    }

    // ── DANH SÁCH CÁC THÁNG ĐÃ CÓ SHEET ──
    if (action === "getMonths") {
      const spreadsheet = getOrCreateSpreadsheet_();
      const sheets      = spreadsheet.getSheets();
      const months      = [];
      sheets.forEach(function(s) {
        const name = s.getName();
        const m    = name.match(/^TK T(\d{1,2})-(\d{4})$/);
        if (m) months.push({ thang: parseInt(m[1]), nam: m[2] });
      });
      months.sort(function(a, b) {
        return (b.nam - a.nam) || (b.thang - a.thang);
      });
      output.setContent(JSON.stringify({ success: true, months: months }));
      return output;
    }

    // ── LẤY URL & ID THƯ MỤC GỐC — dùng cho tonghop.html tự điền tự động ──
    if (action === "getRootFolderUrl") {
      const rootFolderId = getOrCreateFolder_(ROOT_FOLDER_NAME);
      const rootFolder   = DriveApp.getFolderById(rootFolderId);
      output.setContent(JSON.stringify({
        success:    true,
        folderId:   rootFolderId,
        folderUrl:  rootFolder.getUrl(),
        folderName: rootFolder.getName()
      }));
      return output;
    }

    output.setContent(JSON.stringify({ success: false, error: "Action không hợp lệ: " + action }));
    return output;

  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
    return output;
  }
}

function normalizeChiHoi(input) {
  if (!input) return "Chưa xác định";
  const normalizedInput = normalizeCode(input);
  for (const standard of DS_CHI_HOI_GS) {
    if (normalizeCode(standard) === normalizedInput) {
      return standard;
    }
  }
  return input;
}

function findSimilarChiHoi(inputChiHoi) {
  if (!inputChiHoi) return [];
  const normalizedInput = normalizeCode(inputChiHoi);
  const suggestions = [];
  for (const chiHoi of DS_CHI_HOI_GS) {
    const normalizedChiHoi = normalizeCode(chiHoi);
    if (normalizedChiHoi.includes(normalizedInput) || 
        normalizedInput.includes(normalizedChiHoi)) {
      suggestions.push(chiHoi);
    } else if (getLevenshteinDistance(normalizedInput, normalizedChiHoi) <= 3) {
      suggestions.push(chiHoi);
    }
    if (suggestions.length >= 5) break;
  }
  return suggestions;
}

function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j-1] === b[i-1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function isReportExists(chiHoi, thang, nam) {
  try {
    const spreadsheet = getOrCreateSpreadsheet_();
    const sheetName = `TK T${thang}-${nam}`;
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const normalizedChiHoi = normalizeCode(chiHoi);
    
    for (let i = 4; i < data.length; i++) {
      if (data[i] && data[i][1] && normalizeCode(data[i][1]) === normalizedChiHoi) {
        return data[i][2] === "✅ Đã gửi";
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

function checkRateLimit(chiHoi) {
  const cache = CacheService.getScriptCache();
  const key = `last_upload_${normalizeCode(chiHoi)}`;
  const lastUpload = cache.get(key);
  const now = new Date().getTime();
  
  if (lastUpload && (now - parseInt(lastUpload)) < 60000) {
    return false;
  }
  cache.put(key, now.toString(), 60);
  return true;
}

function extractFileInfo(fileName) {
  const info = {
    chiHoi: "Chưa xác định",
    month: null,
    year: null
  };
  
  // Dùng non-greedy (.+?) để tránh nuốt nhầm _T(tháng)_ cuối tên file
  let match = fileName.match(/^CTH_DLXH_(.+?)_T(\d{1,2})_(\d{4})\.docx$/);
  if (!match) {
    match = fileName.match(/^DLXH_(.+?)_T(\d{1,2})_(\d{4})\.docx$/);
  }
  if (!match) {
    match = fileName.match(/^(.+?)_T(\d{1,2})_(\d{4})\.docx$/);
  }
  if (!match) {
    match = fileName.match(/BaoCao_DuLuanXaHoi_([^_]+)_Thang(\d+)_(\d{4})\.docx/);
  }
  
  if (match) {
    info.chiHoi = match[1];
    info.month = parseInt(match[2]);
    info.year = match[3];
  }
  
  return info;
}

function formatFileName(chiHoi, month, year) {
  const chiHoiCode = normalizeCode(chiHoi);
  return `CTH_DLXH_${chiHoiCode}_T${month}_${year}.docx`;
}

function normalizeCode(str) {
  const map = {
    'á':'a','à':'a','ả':'a','ã':'a','ạ':'a',
    'ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a',
    'â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'đ':'d','é':'e','è':'e','ẻ':'e','ẽ':'e','ẹ':'e',
    'ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e',
    'í':'i','ì':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ó':'o','ò':'o','ỏ':'o','õ':'o','ọ':'o',
    'ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ú':'u','ù':'u','ủ':'u','ũ':'u','ụ':'u',
    'ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u',
    'ý':'y','ỳ':'y','ỷ':'y','ỹ':'y','ỵ':'y'
  };
  
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const lowerChar = char.toLowerCase();
    if (map[lowerChar]) {
      result += map[lowerChar];
    } else if (/[a-z0-9]/i.test(char)) {
      result += char.toLowerCase();
    }
  }
  return result.toUpperCase();
}

function logToSpreadsheet(data) {
  try {
    const spreadsheet = getOrCreateSpreadsheet_();
    updateThongKeSheet_(spreadsheet, data.thang, data.nam, data.chiHoi, data.fileUrl);
  } catch (error) {
    console.error("Lỗi ghi log vào Sheet:", error);
    throw error;
  }
}

function getOrCreateSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty("SPREADSHEET_ID");

  if (savedId) {
    try {
      const file = DriveApp.getFileById(savedId);
      if (!file.isTrashed()) {
        SPREADSHEET_ID = savedId;
        return SpreadsheetApp.openById(savedId);
      }
    } catch (e) {
      props.deleteProperty("SPREADSHEET_ID");
    }
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  SPREADSHEET_ID = spreadsheet.getId();
  props.setProperty("SPREADSHEET_ID", SPREADSHEET_ID);

  const rootFolderId = getOrCreateFolder_(ROOT_FOLDER_NAME);
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const file = DriveApp.getFileById(SPREADSHEET_ID);
  rootFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return spreadsheet;
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next().getId();
  return DriveApp.createFolder(name).getId();
}

function getOrCreateSubfolder_(parentId, name) {
  const parent = DriveApp.getFolderById(parentId);
  const subfolders = parent.getFoldersByName(name);
  if (subfolders.hasNext()) return subfolders.next().getId();
  return parent.createFolder(name).getId();
}

// ================= SHEET THỐNG KÊ =================
function updateThongKeSheet_(spreadsheet, thang, nam, chiHoiVuaGui, fileUrl) {
  const sheetName = `TK T${thang}-${nam}`;
  let tkSheet = spreadsheet.getSheetByName(sheetName);
  const isNewSheet = !tkSheet;

  // === TẠO SHEET MỚI NẾU CHƯA CÓ ===
  if (isNewSheet) {
    // Nếu chỉ có 1 sheet mặc định chưa có dữ liệu, dùng lại và đổi tên
    const sheets = spreadsheet.getSheets();
    const firstSheet = sheets[0];
    if (sheets.length === 1 && firstSheet.getLastRow() === 0) {
      tkSheet = firstSheet;
      tkSheet.setName(sheetName);
    } else {
      tkSheet = spreadsheet.insertSheet(sheetName);
    }

    // === TIÊU ĐỀ CHÍNH (5 CỘT) ===
    tkSheet.getRange(1, 1, 1, 5).merge()
      .setValue(`📊 THỐNG KÊ BÁO CÁO CTH-DLXH THÁNG ${thang} NĂM ${nam}`)
      .setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center")
      .setFontColor("#1a237e");

    // SỬA LỖI: Đảm bảo hiển thị đúng giờ Việt Nam
    const today = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm:ss");
    tkSheet.getRange(2, 1, 1, 5).merge()
      .setValue(`📅 Tạo lúc: ${today}`)
      .setFontSize(9).setHorizontalAlignment("center")
      .setFontColor("#546e7a");

    // === HEADER (5 CỘT) ===
    const headers = ["STT", "CHI HỘI", "TRẠNG THÁI", "THỜI GIAN GỬI", "FILE BÁO CÁO"];
    tkSheet.getRange(4, 1, 1, 5).setValues([headers])
      .setFontWeight("bold").setFontSize(10)
      .setFontColor("#0d47a1")
      .setHorizontalAlignment("center");

    tkSheet.setFrozenRows(4);

    // Độ rộng cột
    tkSheet.setColumnWidth(1, 45);
    tkSheet.setColumnWidth(2, 250);
    tkSheet.setColumnWidth(3, 110);
    tkSheet.setColumnWidth(4, 150);
    tkSheet.setColumnWidth(5, 280);

    // === ĐỔ DANH SÁCH CHI HỘI (chỉ khi tạo mới) ===
    const rows = [];
    for (let i = 0; i < DS_CHI_HOI_GS.length; i++) {
      rows.push([i + 1, DS_CHI_HOI_GS[i], "⏳ Chưa gửi", "", ""]);
    }

    if (rows.length > 0) {
      tkSheet.getRange(5, 1, rows.length, 5).setValues(rows);

      tkSheet.getRange(5, 3, rows.length, 1)
        .setFontColor("#e65100").setFontWeight("bold").setHorizontalAlignment("center");
      tkSheet.getRange(5, 1, rows.length, 1).setHorizontalAlignment("center");
      tkSheet.getRange(5, 4, rows.length, 1).setHorizontalAlignment("center");
      tkSheet.getRange(5, 5, rows.length, 1).setHorizontalAlignment("center");
    }
  }

  // === CẬP NHẬT DÒNG CHI HỘI VỪA GỬI ===
  const maVuaGui = normalizeCode(chiHoiVuaGui || "");
  let foundRow = -1;
  
  for (let i = 0; i < DS_CHI_HOI_GS.length; i++) {
    if (normalizeCode(DS_CHI_HOI_GS[i]) === maVuaGui) {
      foundRow = i;
      break;
    }
  }
  
  if (foundRow !== -1) {
    // SỬA LỖI: Đảm bảo hiển thị đúng giờ Việt Nam khi cập nhật
    const thoiGian = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm:ss");
    const row = foundRow + 5;
    
    // Cập nhật trạng thái
    tkSheet.getRange(row, 3).setValue("✅ Đã gửi");
    tkSheet.getRange(row, 3).setFontColor("#1b5e20").setFontWeight("bold").setHorizontalAlignment("center");
    
    // Cập nhật thời gian
    tkSheet.getRange(row, 4).setValue(thoiGian);
    tkSheet.getRange(row, 4).setFontColor("#37474f").setFontSize(9).setHorizontalAlignment("center");
    
    // Cập nhật link file
    if (fileUrl) {
      const cell = tkSheet.getRange(row, 5);
      const richText = SpreadsheetApp.newRichTextValue()
        .setText("📄 Mở báo cáo")
        .setLinkUrl(fileUrl)
        .setTextStyle(0, 11, SpreadsheetApp.newTextStyle()
          .setForegroundColor("#1565c0")
          .setUnderline(true)
          .build())
        .build();
      cell.setRichTextValue(richText);
      cell.setHorizontalAlignment("center");
    }
  }

  // === DÒNG TỔNG KẾT ===
  const totalRow = DS_CHI_HOI_GS.length + 5;
  const daGui = tkSheet.getRange(5, 3, DS_CHI_HOI_GS.length, 1).getValues()
    .filter(r => r[0] === "✅ Đã gửi").length;
  const chuaGui = DS_CHI_HOI_GS.length - daGui;
  const tiLe = DS_CHI_HOI_GS.length > 0 ? ((daGui / DS_CHI_HOI_GS.length) * 100).toFixed(1) : "0";
  
  // SỬA LỖI: Đảm bảo hiển thị đúng giờ Việt Nam khi cập nhật tổng kết
  const capNhat = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm:ss");

  // Xóa dòng cũ nếu có
  try {
    if (tkSheet.getLastRow() >= totalRow) {
      tkSheet.getRange(totalRow, 1, 2, 5).clearContent().clearFormat();
    }
  } catch(e) {}
  
  // Hàng tổng kết
  tkSheet.getRange(totalRow, 1, 1, 5).setValues([[
    "📈 TỔNG KẾT", 
    `Tổng số: ${DS_CHI_HOI_GS.length}`, 
    `Đã gửi: ${daGui}`, 
    `Chưa gửi: ${chuaGui}`, 
    `Tỷ lệ: ${tiLe}%`
  ]]);
  tkSheet.getRange(totalRow, 1, 1, 5).setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center");
  tkSheet.getRange(totalRow, 1).setFontColor("#1a237e");
  tkSheet.getRange(totalRow, 2).setFontColor("#0d47a1");
  tkSheet.getRange(totalRow, 3).setFontColor("#1b5e20");
  tkSheet.getRange(totalRow, 4).setFontColor("#e65100");
  tkSheet.getRange(totalRow, 5).setFontColor("#1565c0");
  
  // Dòng cập nhật riêng
  const updateRow = totalRow + 1;
  tkSheet.getRange(updateRow, 1, 1, 5).merge()
    .setValue(`🕐 Cập nhật lần cuối: ${capNhat}`)
    .setFontSize(8).setFontColor("#546e7a").setHorizontalAlignment("center");
  
  // Đảm bảo lưu thay đổi
  SpreadsheetApp.flush();
}

// ================= HÀM HỖ TRỢ ĐỒNG BỘ DRIVE ↔ SHEET =================

/**
 * Tìm file theo tên trong một thư mục Drive.
 * Trả về File object hoặc null nếu không tìm thấy.
 */
function findFileInFolder_(folderId, fileName) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByName(fileName);
    return files.hasNext() ? files.next() : null;
  } catch (e) {
    return null;
  }
}

/**
 * Nếu file đã có trên Drive nhưng sheet chưa được đánh dấu "✅ Đã gửi",
 * tự động cập nhật sheet cho khớp (đồng bộ lại dữ liệu bị mất).
 */
function syncSheetIfMissing_(chiHoi, thang, nam, fileUrl) {
  try {
    const alreadyInSheet = isReportExists(chiHoi, thang, nam);
    if (!alreadyInSheet) {
      console.warn(`syncSheetIfMissing_: Phát hiện mất đồng bộ — file Drive tồn tại nhưng Sheet chưa có. Đang ghi lại cho ${chiHoi} T${thang}-${nam}`);
      logToSpreadsheet({
        chiHoi: chiHoi,
        thang: thang,
        nam: nam,
        fileName: formatFileName(chiHoi, thang, nam),
        fileUrl: fileUrl
      });
    }
  } catch (e) {
    console.error("syncSheetIfMissing_ lỗi:", e);
  }
}

/**
 * Hàm kiểm tra thủ công (chạy từ Apps Script Editor) để phát hiện
 * mọi trường hợp mất đồng bộ giữa Drive và Sheet cho một tháng/năm cụ thể.
 * Kết quả ghi vào Logger — xem qua menu Xem → Nhật ký.
 */
function auditDriveVsSheet(thang, nam) {
  thang = thang || new Date().getMonth() + 1;
  nam   = nam   || new Date().getFullYear().toString();

  const thangText    = `Tháng ${thang}`;
  const rootFolderId = getOrCreateFolder_(ROOT_FOLDER_NAME);
  const yearFolderId = getOrCreateSubfolder_(rootFolderId, nam.toString());
  const monthFolderId= getOrCreateSubfolder_(yearFolderId, thangText);

  // Lấy danh sách file trên Drive
  const folder = DriveApp.getFolderById(monthFolderId);
  const driveFiles = {};
  const iter = folder.getFiles();
  while (iter.hasNext()) {
    const f = iter.next();
    driveFiles[f.getName()] = f.getUrl();
  }

  // Lấy trạng thái sheet
  const spreadsheet = getOrCreateSpreadsheet_();
  const sheetName   = `TK T${thang}-${nam}`;
  const sheet       = spreadsheet.getSheetByName(sheetName);

  const sheetSent = {}; // { chiHoiName: true/false }
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = 4; i < data.length; i++) {
      const name   = data[i][1];
      const status = data[i][2];
      if (name) sheetSent[name] = (status === "✅ Đã gửi");
    }
  } else {
    Logger.log(`⚠️  Sheet "${sheetName}" chưa tồn tại.`);
  }

  let issues = 0;

  // Trường hợp 1: Sheet "✅ Đã gửi" nhưng KHÔNG có file trên Drive
  for (const chiHoi of DS_CHI_HOI_GS) {
    if (sheetSent[chiHoi] === true) {
      const expectedName = formatFileName(chiHoi, thang, nam.toString());
      if (!driveFiles[expectedName]) {
        Logger.log(`❌ SHEET CÓ, DRIVE KHÔNG CÓ: ${chiHoi} → ${expectedName}`);
        issues++;
      }
    }
  }

  // Trường hợp 2: File tồn tại trên Drive nhưng Sheet KHÔNG đánh dấu "✅ Đã gửi"
  for (const [fileName, url] of Object.entries(driveFiles)) {
    const info = extractFileInfo(fileName);
    if (!info.chiHoi || info.chiHoi === "Chưa xác định") {
      Logger.log(`⚠️  File tên không nhận dạng được: ${fileName}`);
      issues++;
      continue;
    }
    const chiHoi = normalizeChiHoi(info.chiHoi);
    if (!sheetSent[chiHoi]) {
      Logger.log(`❌ DRIVE CÓ, SHEET KHÔNG CÓ: ${chiHoi} → ${fileName} (${url})`);
      issues++;
    }
  }

  if (issues === 0) {
    Logger.log(`✅ Tháng ${thang}/${nam}: Không phát hiện mất đồng bộ.`);
  } else {
    Logger.log(`⚠️  Tổng số vấn đề phát hiện: ${issues}`);
  }
}

// ================= HÀM KIỂM TRA MÚI GIỜ VIỆT NAM =================

/**
 * KIỂM TRA MÚI GIỜ HIỆN TẠI
 * Chạy hàm này để debug xem múi giờ có đúng không
 */
function testTimeZone() {
  const now = new Date();
  Logger.log("=== KIỂM TRA MÚI GIỜ ===");
  Logger.log("TimeZone configured: " + TIMEZONE);
  Logger.log("Current UTC time: " + now.toUTCString());
  Logger.log("Formatted VN time: " + Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy HH:mm:ss"));
  Logger.log("Raw date object: " + now.toString());
  
  // Kiểm tra thêm
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  Logger.log(`Manual format: ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
  
  return {
    timezone: TIMEZONE,
    formattedVN: Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy HH:mm:ss"),
    rawDate: now.toString()
  };
}

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam để chèn vào Word
 */
function getCurrentVietnamTimeForWord() {
  const now = new Date();
  // Định dạng: HH:mm:ss - dd/mm/yyyy
  const time = Utilities.formatDate(now, TIMEZONE, "HH:mm:ss");
  const date = Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy");
  
  return {
    full: `${time} - ${date}`,
    time: time,
    date: date,
    datetime: Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy HH:mm:ss")
  };
}