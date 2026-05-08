// ===================== CẤU HÌNH — CHỈ SỬA Ở ĐÂY =====================
const ROOT_FOLDER_NAME  = "Báo cáo CTH-DLXH";
const SPREADSHEET_NAME  = "Theo dõi báo cáo CTH-DLXH";
const TIMEZONE          = "Asia/Ho_Chi_Minh";
// =====================================================================

let SPREADSHEET_ID = null;

// ================= DANH SÁCH CHI HỘI =================
const DS_CHI_HOI_GS = [
  "1 TÂN NINH B", "2 TÂN NINH B", "3 TÂN NINH B", "1 TÂN NINH A", "2 TÂN NINH A",
  "3 TÂN NINH A", "4 TÂN NINH 4", "1 CHÍNH TRẠCH", "2 CHÍNH TRẠCH", "1 TÂN AN B",
  "2 TÂN AN B", "3 TÂN AN B", "4 TÂN AN B", "5 TÂN AN B", "6 TÂN AN B",
  "7 TÂN AN B", "8 TÂN AN B", "TÂN AN A1", "TÂN AN A2", "TÂN AN A3",
  "TÂN AN A4", "TÂN SINH A1", "TÂN SINH A2", "TÂN SINH B1", "TÂN SINH B2",
  "TÂN SINH B3", "NÚI CÙNG 1", "NÚI CÙNG 2", "NÚI CÙNG 3", "XUÂN HÒA B1",
  "XUÂN HÒA B2", "XUÂN HÒA B3", "XUÂN HÒA B4", "BẦU SEN 1", "BẦU SEN 2",
  "BẦU SEN 3", "XUÂN HÒA 1", "XUÂN HÒA 2", "XUÂN HÒA A1", "THANH XUÂN",
  "THANH PHONG 2", "THANH PHONG 3", "THANH HUY 1", "THANH HUY 2", "THANH TÂN 1",
  "THANH TÂN 2", "THANH MINH 1", "THANH MINH 2", "THANH HÒA", "THANH MINH",
  "THANH HÀ", "THANH THỦY", "1 XUÂN HÒA", "2 XUÂN HÒA", "3 XUÂN HÒA",
  "4 XUÂN HÒA", "5 XUÂN HÒA", "1 XUÂN HÒA A", "2 XUÂN HÒA A", "3 XUÂN HÒA A",
  "4 XUÂN HÒA A", "5 XUÂN HÒA A", "6 XUÂN HÒA A", "7 XUÂN HÒA A", "1 THANH KHÊ",
  "2 THANH KHÊ", "3 THANH KHÊ", "4 THANH KHÊ", "1 PHẦN LĂNG", "2 PHẦN LĂNG",
  "3 PHẦN LĂNG", "4 PHẦN LĂNG", "5 PHẦN LĂNG", "KHU DÂN CƯ 372", "TÂN TRUNG 1",
  "TÂN TRUNG 2", "HÀ ĐÔNG 1", "HÀ ĐÔNG 2", "HÀ ĐÔNG 3", "XUÂN ĐÁN 1",
  "XUÂN ĐÁN 2", "XUÂN ĐÁN 3", "XUÂN ĐÁN 4", "XUÂN ĐÁN 5", "XUÂN ĐÁN 6",
  "THUẬN AN 1", "THUẬN AN 2", "THUẬN AN 3", "THUẬN AN 4", "THUẬN AN 5",
  "THUẬN AN 6", "TÂN CHÁNH 1", "TÂN CHÁNH 2", "TÂN CHÁNH 3", "1 TAM THUẬN",
  "2 TAM THUẬN", "3 TAM THUẬN", "4 TAM THUẬN", "5 TAM THUẬN", "6 TAM THUẬN",
  "7 TAM THUẬN", "8 TAM THUẬN", "9 TAM THUẬN", "10 TAM THUẬN", "11 TAM THUẬN",
  "12 TAM THUẬN", "13 TAM THUẬN", "14 TAM THUẬN", "15 TAM THUẬN", "16 TAM THUẬN",
  "17 TAM THUẬN", "1 THANH KHÊ TÂY", "2 THANH KHÊ TÂY", "4A THANH KHÊ TÂY",
  "4B THANH KHÊ TÂY", "5 THANH KHÊ TÂY", "6 THANH KHÊ TÂY", "7 THANH KHÊ TÂY",
  "8 THANH KHÊ TÂY", "9 THANH KHÊ TÂY", "10 THANH KHÊ TÂY", "11 THANH KHÊ TÂY",
  "12 THANH KHÊ TÂY", "13 THANH KHÊ TÂY", "14 THANH KHÊ TÂY", "15 THANH KHÊ TÂY",
  "16 THANH KHÊ TÂY", "17 THANH KHÊ TÂY", "TRUNG NGHĨA 2", "TRUNG NGHĨA 5",
  "HÒA PHÚ 4", "HÒA PHÚ 4A", "HÒA PHÚ 5", "HÒA PHÚ 5A", "HÒA PHÚ 5B",
  "TAM GIÁC 1", "TAM GIÁC 2", "TAM GIÁC 3A", "TAM GIÁC 3B", "TRUNG BÌNH A1",
  "TRUNG BÌNH A2", "TRUNG BÌNH A3", "TRUNG BÌNH B1", "TRUNG BÌNH B2",
  "TRUNG LẬP A1", "TRUNG LẬP A2", "TRUNG LẬP A3", "TRUNG LẬP A4", "TRUNG LẬP B1",
  "TRUNG LẬP B2", "TRUNG LẬP B3", "TRUNG LẬP B4", "TRUNG LẬP B5", "TRUNG LẬP B6",
  "TRUNG LẬP B7", "VĨNH AN A1", "VĨNH AN A2", "VĨNH AN B1", "VĨNH AN B2",
  "VĨNH AN B3", "TRUNG HÒA A1", "TRUNG HÒA A2", "TRUNG HÒA A3", "TRUNG HÒA B1",
  "TRUNG HÒA B2", "TRUNG HÒA B3", "TÂN LẬP A1", "TÂN LẬP A2", "TÂN LẬP A3",
  "TÂN LẬP B1", "TÂN LẬP B2", "TÂN LẬP B3", "TÂN LẬP B4", "TÂN LẬP B5",
  "CHI HỘI PN CÔNG AN PHƯỜNG"
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

    const file = DriveApp.getFolderById(targetFolderId).createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const shortFileName = formatFileName(chiHoi, month, year);
    file.setName(shortFileName);

    logToSpreadsheet({
      chiHoi: chiHoi,
      thang: month,
      nam: year,
      fileName: shortFileName,
      fileUrl: file.getUrl()
    });

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

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    version: "2.0",
    message: "Webhook nhận báo cáo CTH-DLXH đang hoạt động"
  })).setMimeType(ContentService.MimeType.JSON);
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
  
  let match = fileName.match(/^CTH_DLXH_(.+)_T(\d+)_(\d{4})\.docx$/);
  if (!match) {
    match = fileName.match(/^DLXH_(.+)_T(\d+)_(\d{4})\.docx$/);
  }
  if (!match) {
    match = fileName.match(/^(.+)_T(\d+)_(\d{4})\.docx$/);
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