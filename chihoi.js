// ================= DANH SÁCH CHI HỘI =================
// GIỐNG HỆT VỚI DANH SÁCH TRONG Code.gs
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

// ================= HÀM TIỆN ÍCH =================

// Chuẩn hóa tên chi hội (bỏ dấu, viết hoa)
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

// Tạo dropdown chi hội
function createChiHoiSelect(selectElementId, defaultChiHoi = "") {
  const select = document.getElementById(selectElementId);
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Chọn chi hội --</option>';
  
  // Sắp xếp danh sách (số trước, chữ sau)
  const sortedList = [...DS_CHI_HOI_GS].sort((a, b) => {
    const aMatch = a.match(/^(\d+)?\s*(.*)/);
    const bMatch = b.match(/^(\d+)?\s*(.*)/);
    const aNum = aMatch[1] ? parseInt(aMatch[1]) : Infinity;
    const bNum = bMatch[1] ? parseInt(bMatch[1]) : Infinity;
    
    if (aNum !== bNum) return aNum - bNum;
    return aMatch[2].localeCompare(bMatch[2]);
  });
  
  sortedList.forEach(chiHoi => {
    const option = document.createElement('option');
    option.value = chiHoi;
    option.textContent = chiHoi;
    if (chiHoi === defaultChiHoi) option.selected = true;
    select.appendChild(option);
  });
}

// Tạo tên file tự động
function generateFileName(chiHoi, month, year) {
  const normalized = normalizeCode(chiHoi);
  return `DLXH_${normalized}_T${month}_${year}.docx`;
}

// Lấy tháng năm hiện tại
function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

// Kiểm tra chi hội có hợp lệ không
function isValidChiHoi(chiHoi) {
  return DS_CHI_HOI_GS.includes(chiHoi);
}

// Tìm chi hội gợi ý (khi nhập sai)
function findSimilarChiHoi(inputChiHoi) {
  if (!inputChiHoi) return [];
  
  const normalizedInput = normalizeCode(inputChiHoi);
  const suggestions = [];
  
  for (const chiHoi of DS_CHI_HOI_GS) {
    const normalizedChiHoi = normalizeCode(chiHoi);
    
    if (normalizedChiHoi.includes(normalizedInput) || 
        normalizedInput.includes(normalizedChiHoi)) {
      suggestions.push(chiHoi);
    }
    
    if (suggestions.length >= 5) break;
  }
  
  return suggestions;
}

// Export các hàm để sử dụng (nếu dùng module)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DS_CHI_HOI_GS,
    normalizeCode,
    createChiHoiSelect,
    generateFileName,
    getCurrentMonthYear,
    isValidChiHoi,
    findSimilarChiHoi
  };
}