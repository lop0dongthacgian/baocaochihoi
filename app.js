const { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, TabStopPosition } = docx;

// ===================== TOAST NOTIFICATION =====================
function showToast(title, message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;
  
  container.appendChild(toast);
  
  const timeout = setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.onclick = () => {
    clearTimeout(timeout);
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  };
  
  return toast;
}

// ===================== CONFIRM MODAL =====================
function showConfirm({ icon, title, message, confirmText, confirmClass, onConfirm, onCancel }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">${icon}</div>
      <div class="modal-title">${title}</div>
      <div class="modal-msg">${message}</div>
      <div class="modal-actions">
        <button class="modal-btn modal-btn-cancel" id="modalCancel">✖ Hủy</button>
        <button class="modal-btn ${confirmClass}" id="modalConfirm">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modalCancel').onclick = () => {
    overlay.remove();
    if (onCancel) onCancel();
  };
  overlay.querySelector('#modalConfirm').onclick = () => { 
    overlay.remove(); 
    if (onConfirm) onConfirm();
  };
  overlay.addEventListener('click', e => { 
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  });
}

// ===================== SET BUTTON LOADING STATE =====================
function setButtonLoading(btn, isLoading, originalText) {
  if (isLoading) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = '<span>⏳</span> Đang xử lý...';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = originalText;
  }
}

// ===================== HANDLE DOWNLOAD BUTTON =====================
function handleDownload() {
  const chiHoiRaw = document.getElementById('chiHoi').value.trim().toUpperCase() || 'ChiHoi';
  const thang = document.getElementById('thang').value;
  const nam = document.getElementById('nam').value || '2026';
  const chiHoiSafe = chiHoiRaw
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_').replace(/^_|_$/g, '');
  const fileName = `CTH_DLXH_${chiHoiSafe}_T${thang}_${nam}.docx`;

  showConfirm({
    icon: '📄',
    title: 'Xác nhận tải file Word',
    message: `Bạn sẽ tải xuống file:<br><b>${fileName}</b>`,
    confirmText: '⬇ Tải xuống',
    confirmClass: 'modal-btn-confirm-blue',
    onConfirm: () => {
      const btn = document.querySelector('.btn-word');
      const originalText = btn.innerHTML;
      setButtonLoading(btn, true, originalText);
      createDoc(false)
        .then(() => showToast('Thành công', 'Đã lưu tại thư mục Download', 'success'))
        .catch(err => showToast('Lỗi', err.message || 'Không thể tải file', 'error'))
        .finally(() => setButtonLoading(btn, false, originalText));
    }
  });
}

// ===================== HANDLE SEND BUTTON =====================
function handleSend() {
  const btn = document.getElementById('sendBtn');
  if (btn.disabled) return;

  showConfirm({
    icon: '☁️',
    title: 'Xác nhận gửi báo cáo',
    message: 'Bạn có chắc muốn gửi báo cáo lên Google Drive của Hội LHPN phường?',
    confirmText: '✔ Gửi ngay',
    confirmClass: 'modal-btn-confirm-cyan',
    onConfirm: () => {
      const originalText = btn.innerHTML;
      setButtonLoading(btn, true, originalText);
      createDoc(true)
        .then(() => showToast('Gửi thành công', 'Báo cáo đã được gửi lên phường!', 'success'))
        .catch(err => showToast('Gửi thất bại', err.message || 'Không thể gửi báo cáo', 'error'))
        .finally(() => setButtonLoading(btn, false, originalText));
    }
  });
}

// ===================== UPLOAD FILE LÊN GOOGLE DRIVE =====================
function uploadFile(blob, fileName) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64 = reader.result.split(',')[1];

      // Gọi qua Vercel Function thay vì dùng URL trực tiếp
      // (process.env không hoạt động trong trình duyệt)
      fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, filename: fileName })
      })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          resolve();
        } else {
          reject(new Error(res.error || "Upload failed"));
        }
      })
      .catch(e => {
        reject(e);
      });
    };
  });
}

// ===================== TẠO FILE WORD =====================
async function createDoc(isUpload) {
  const phuong = document.getElementById('phuong').value.trim().toUpperCase() || "THANH KHÊ";
  const chiHoi = document.getElementById('chiHoi').value.trim().toUpperCase() || ".................";
  const thang = document.getElementById('thang').value;
  const nam = document.getElementById('nam').value || "2025";

  const thangText = `tháng ${thang} năm ${nam}`;
  const thangTiepTheo = parseInt(thang) === 12 ? 1 : parseInt(thang) + 1;

  // Phần I
  const tinhHinhTuTuong = document.getElementById('tinhHinhTuTuong').value.trim() || "………………………………………………………………………………………\n………………………………………………………………………………………\n………………………………………………………………………………………";
  const duLuanQuanTam   = document.getElementById('duLuanQuanTam').value.trim()   || "………………………………………………………………………………………\n………………………………………………………………………………………";

  // Phần II
  const phongTraoPhuNu  = document.getElementById('phongTraoPhuNu').value.trim()  || "………………………………………………………………………………………";
  const cuocVanDong     = document.getElementById('cuocVanDong').value.trim()     || "………………………………………………………………………………………";
  const phongTraoKhac   = document.getElementById('phongTraoKhac').value.trim()   || "………………………………………………………………………………………";
  const ungDungCNTT     = document.getElementById('ungDungCNTT').value.trim()     || "………………………………………… ";
  const chuyenDoiSo     = document.getElementById('chuyenDoiSo').value.trim()     || "…………………………………… ";
  const phongChongBLGD  = document.getElementById('phongChongBLGD').value.trim()  || "………………………………………… ";
  const meDoDau         = document.getElementById('meDoDau').value.trim()         || "…………………………………………………………………… ";
  const hoatDongAnSinh  = document.getElementById('hoatDongAnSinh').value.trim()  || "……………………………………………………………… ";
  const moHinhKhac      = document.getElementById('moHinhKhac').value.trim()      || "………………………………………………………………………… \n……………………………………………………………………………………";
  const nhiemVuTrongTam = document.getElementById('nhiemVuTrongTam').value.trim() || "……………………………………………………………………………….";
  const nhiemVuDiaPhuong = document.getElementById('nhiemVuDiaPhuong').value.trim() || "………………………………………………………………………………………\n………………………………………………………………………………………";

  // Phần III & IV
  const kienNghi        = document.getElementById('kienNghi').value.trim()        || "………………………………………………………………………………………\n………………………………………………………………………………………";
  const nhiemVuThangToi = document.getElementById('nhiemVuThangToi').value.trim() || "………………………………………………………………………………………\n………………………………………………………………………………………";

  const chiHoiTruong    = document.getElementById('chiHoiTruong').value.trim().toUpperCase() || ".................";

  // Helper: tạo runs từ text có thể có \n (dùng line break trong docx)
  const makeRuns = (text, runProps = {}) => {
    const lines = text.split('\n');
    const runs = [];
    lines.forEach((line, i) => {
      runs.push(new TextRun({ text: line, ...runProps }));
      if (i < lines.length - 1) {
        runs.push(new TextRun({ break: 1 }));
      }
    });
    return runs;
  };

  // Helper: paragraph nội dung thông thường (có thể multiline)
  const contentPara = (text, extra = {}) => new Paragraph({
    children: makeRuns(text, { font: "Times New Roman", size: 28 }),
    spacing: { before: 100, after: 100, line: 240, lineRule: "auto" },
    ...extra
  });

  // Helper: paragraph tiêu đề mục (bold)
  const headingPara = (text, extra = {}) => new Paragraph({
    children: [new TextRun({ text, bold: true, font: "Times New Roman", size: 28 })],
    spacing: { before: 100, after: 100, line: 240, lineRule: "auto" },
    ...extra
  });

  // Helper: paragraph inline label + nội dung trên cùng dòng
  const inlinePara = (label, content, extra = {}) => new Paragraph({
    children: [
      new TextRun({ text: label, font: "Times New Roman", size: 28 }),
      new TextRun({ text: " " + content, font: "Times New Roman", size: 28 })
    ],
    spacing: { before: 100, after: 100, line: 240, lineRule: "auto" },
    ...extra
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 28 },
          paragraph: { spacing: { line: 240, lineRule: "auto" } }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // ===== TIÊU ĐỀ BÁO CÁO =====
        new Paragraph({
          children: [new TextRun({ text: "BÁO CÁO", bold: true, font: "Times New Roman", size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kết quả công tác Hội và phong trào phụ nữ, tình hình dư luận xã hội", bold: true, font: "Times New Roman", size: 28 }),
            new TextRun({ break: 1 }),
            new TextRun({ text: `${thangText}`, bold: true, font: "Times New Roman", size: 28 }),
            new TextRun({ break: 1 }),
            new TextRun({ text: `Nhiệm vụ trọng tâm tháng ${thangTiepTheo}`, bold: true, font: "Times New Roman", size: 28 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),

        // ===== PHẦN I =====
        headingPara("I. TÌNH HÌNH TƯ TƯỞNG, ĐỜI SỐNG HỘI VIÊN, PHỤ NỮ"),

        headingPara("1. Tình hình tư tưởng cán bộ, hội viên và Nhân dân"),
        contentPara(tinhHinhTuTuong),

        headingPara("2. Những vấn đề được dư luận quan tâm"),
        new Paragraph({
          children: [new TextRun({ text: "- An sinh xã hội; VSMT; Trật tự đô thị; Không gian mạng…", bold: true, font: "Times New Roman", size: 28 })],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        contentPara(duLuanQuanTam),

        // ===== PHẦN II =====
        headingPara("II. KẾT QUẢ CÔNG TÁC HỘI VÀ PHONG TRÀO PHỤ NỮ"),

        headingPara("1. Hoạt động nổi bật theo trọng tâm chỉ đạo"),
        new Paragraph({
          children: [new TextRun({ text: '- Phong trào "Xây dựng người phụ nữ Việt Nam thời đại mới"', bold: true, font: "Times New Roman", size: 28 })],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        contentPara(phongTraoPhuNu),
        new Paragraph({
          children: [new TextRun({ text: '- Cuộc vận động "Gia đình 5 không, 3 sạch, 3 an"', bold: true, font: "Times New Roman", size: 28 })],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        contentPara(cuocVanDong),
        new Paragraph({
          children: [new TextRun({ text: "- Các phong trào thi đua khác", bold: true, font: "Times New Roman", size: 28 })],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        new Paragraph({
          children: [new TextRun({ text: "(Mỗi hội viên một cử chỉ đẹp; mỗi gia đình một địa chỉ hạnh phúc; mỗi chi hội một điểm đến thân thiện – hữu ích…)", italics: true, font: "Times New Roman", size: 28 })],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        contentPara(phongTraoKhac),

        headingPara("2. Thực hiện các khâu đột phá"),
        inlinePara("- Ứng dụng công nghệ thông tin:", ungDungCNTT),
        inlinePara("- Chuyển đổi số trong hoạt động Hội:", chuyenDoiSo),
        inlinePara("- Phòng, chống bạo lực gia đình:", phongChongBLGD),

        headingPara("3. Chương trình, mô hình nổi bật"),
        inlinePara("- Mẹ đỡ đầu:", meDoDau),
        inlinePara("- Hoạt động an sinh (trao quà, hỗ trợ…):", hoatDongAnSinh),
        new Paragraph({
          children: [
            new TextRun({ text: "- Mô hình/hoạt động khác:", font: "Times New Roman", size: 28 }),
            new TextRun({ text: " " + moHinhKhac, font: "Times New Roman", size: 28 }),
          ],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),

        headingPara("4. Kết quả thực hiện nhiệm vụ trọng tâm"),
        contentPara(nhiemVuTrongTam),

        headingPara("5. Nhiệm vụ theo chỉ đạo địa phương"),
        contentPara(nhiemVuDiaPhuong),

        // ===== PHẦN III =====
        headingPara("III. ĐỀ XUẤT, KIẾN NGHỊ"),
        contentPara(kienNghi),

        // ===== PHẦN IV =====
        headingPara("IV. NHIỆM VỤ TRỌNG TÂM THÁNG TIẾP THEO"),
        contentPara(nhiemVuThangToi),

        // ===== KÝ TÊN =====
        new Paragraph({
          children: [
            new TextRun({ text: "                                                                         ", bold: true, font: "Times New Roman", size: 28 }),
            new TextRun({ text: "  CHI HỘI TRƯỞNG", bold: true, font: "Times New Roman", size: 28 }),
          ],
          spacing: { before: 100, after: 100, line: 240, lineRule: "auto" }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "                                                                         ", bold: true, font: "Times New Roman", size: 28 }),
            new TextRun({ text: "  " + chiHoiTruong, bold: true, font: "Times New Roman", size: 28 }),
          ],
          spacing: { before: 100, after: 0, line: 240, lineRule: "auto" }
        }),
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const chiHoiSafe = chiHoi
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_').replace(/^_|_$/g, '');
  const fileName = `CTH_DLXH_${chiHoiSafe}_T${thang}_${nam}.docx`;

  if (isUpload) {
    await uploadFile(blob, fileName);
  } else {
    await downloadFile(blob, fileName);
  }
}

// ===================== TẢI FILE (HỖ TRỢ CẢ ANDROID VÀ TRÌNH DUYỆT) =====================
function downloadFile(blob, fileName) {
  return new Promise((resolve, reject) => {
    try {
      // --- Android WebView: dùng bridge Java (AndroidDownload) ---
      const isAndroidBridge = typeof AndroidDownload !== 'undefined';
      if (isAndroidBridge) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const mimeType = blob.type || 'application/octet-stream';
            AndroidDownload.saveFile(e.target.result, fileName, mimeType);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Không đọc được file'));
        reader.readAsDataURL(blob);
        return;
      }

      // --- Trình duyệt thường: dùng FileSaver hoặc thẻ <a> ---
      if (typeof saveAs !== 'undefined') {
        saveAs(blob, fileName);
        resolve();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, 2000);
      }
    } catch (e) {
      // --- Fallback cuối: mở data URL ---
      try {
        const reader = new FileReader();
        reader.onload = function(ev) {
          window.location.href = ev.target.result;
          resolve();
        };
        reader.onerror = () => reject(new Error('Không thể tải file'));
        reader.readAsDataURL(blob);
      } catch (err) {
        reject(err);
      }
    }
  });
}

// ===================== KIỂM TRA VÀ CẢNH BÁO THÁNG/NĂM =====================
function setupDateTimeValidation() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const thangSelect = document.getElementById('thang');
  const namInput = document.getElementById('nam');
  
  let currentMonthValue = currentMonth;
  let currentYearValue = currentYear;
  
  thangSelect.addEventListener('change', function(e) {
    const newMonth = parseInt(this.value);
    
    if (newMonth !== currentMonthValue || parseInt(namInput.value) !== currentYearValue) {
      const newYear = parseInt(namInput.value);
      
      showConfirm({
        icon: '⚠️',
        title: 'Xác nhận thời gian báo cáo',
        message: `Bạn đang chọn báo cáo cho <b>tháng ${newMonth}/${newYear}</b><br>Khác với thời gian hiện tại.<br>Bạn có chắc chắn muốn thay đổi?`,
        confirmText: 'Vẫn thay đổi',
        confirmClass: 'modal-btn-confirm-blue',
        onConfirm: () => {
          currentMonthValue = newMonth;
          currentYearValue = newYear;
          updateDateBadge(newMonth, newYear);
          showToast('Thông báo', `Đã thay đổi sang tháng ${newMonth}/${newYear}`, 'info', 2000);
        },
        onCancel: () => {
          thangSelect.value = currentMonthValue;
          namInput.value = currentYearValue;
          showToast('Thông báo', 'Đã khôi phục thời gian hiện tại', 'info', 2000);
        }
      });
    }
  });
  
  namInput.addEventListener('change', function(e) {
    const newYear = parseInt(this.value);
    
    if (newYear < 2000 || newYear > 2030) {
      showToast('Cảnh báo', 'Năm không hợp lệ! Vui lòng nhập năm từ 2000-2030', 'warning');
      this.value = currentYearValue;
      return;
    }
    
    if (newYear !== currentYearValue || parseInt(thangSelect.value) !== currentMonthValue) {
      const newMonth = parseInt(thangSelect.value);
      
      showConfirm({
        icon: '⚠️',
        title: 'Xác nhận thời gian báo cáo',
        message: `Bạn đang chọn báo cáo cho <b>tháng ${newMonth}/${newYear}</b><br>Khác với thời gian hiện tại.<br>Bạn có chắc chắn muốn thay đổi?`,
        confirmText: 'Vẫn thay đổi',
        confirmClass: 'modal-btn-confirm-blue',
        onConfirm: () => {
          currentMonthValue = newMonth;
          currentYearValue = newYear;
          updateDateBadge(newMonth, newYear);
          showToast('Thông báo', `Đã thay đổi sang tháng ${newMonth}/${newYear}`, 'info', 2000);
        },
        onCancel: () => {
          thangSelect.value = currentMonthValue;
          namInput.value = currentYearValue;
          showToast('Thông báo', 'Đã khôi phục thời gian hiện tại', 'info', 2000);
        }
      });
    }
  });
}

// ===================== TỰ ĐỘNG VIẾT HOA TÊN NGƯỜI KÝ =====================
function setupAutoUppercase() {
  const chiHoiTruongInput = document.getElementById('chiHoiTruong');
  if (chiHoiTruongInput) {
    chiHoiTruongInput.addEventListener('input', function() {
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.toUpperCase();
      this.setSelectionRange(start, end);
    });
  }
}

// ===================== THIẾT LẬP THÁNG/NĂM MẶC ĐỊNH =====================
function setDefaultDateTime() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const thangSelect = document.getElementById('thang');
  const namInput = document.getElementById('nam');
  
  if (thangSelect) thangSelect.value = currentMonth.toString();
  if (namInput) namInput.value = currentYear;
  
  updateDateBadge(currentMonth, currentYear);
}

function updateDateBadge(thang, nam) {
  const el1 = document.getElementById('badgeThang');
  const el2 = document.getElementById('badgeNam');
  if (el1) el1.textContent = thang;
  if (el2) el2.textContent = nam;
}

function toggleDatePanel() {
  const panel = document.getElementById('datePanel');
  const btn = document.getElementById('btnAdjust');
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '✖ Đóng' : '✏️ Bổ sung / Điều chỉnh';
}

// ===================== LOAD DANH SÁCH CHI HỘI =====================
window.addEventListener("DOMContentLoaded", () => {
  setDefaultDateTime();
  setupDateTimeValidation();
  setupAutoUppercase();

  const list = document.getElementById("chiHoiList");

  function renderList(filter = "") {
    list.innerHTML = "";
    let count = 0;
    if (typeof DS_CHI_HOI_GS !== 'undefined' && Array.isArray(DS_CHI_HOI_GS)) {
      DS_CHI_HOI_GS.forEach(name => {
        if (!filter || name.includes(filter.toUpperCase())) {
          const li = document.createElement("li");
          li.textContent = name;
          li.addEventListener("mousedown", (e) => {
            e.preventDefault();
            selectChiHoi(name);
          });
          list.appendChild(li);
          count++;
        }
      });
    }
    document.getElementById("chiHoiNoResult").style.display = count === 0 ? "block" : "none";
  }

  renderList();

  document.getElementById("chiHoiSearch").addEventListener("input", function () {
    renderList(this.value);
  });

  document.addEventListener("click", function (e) {
    if (!document.getElementById("chiHoiWrapper").contains(e.target)) {
      closeChiHoiDropdown();
    }
  });
});

function toggleChiHoiDropdown() {
  const dropdown = document.getElementById("chiHoiDropdown");
  const display = document.getElementById("chiHoiDisplay");
  const isOpen = dropdown.style.display !== "none";
  if (isOpen) {
    closeChiHoiDropdown();
  } else {
    dropdown.style.display = "block";
    display.classList.add("open");
    setTimeout(() => document.getElementById("chiHoiSearch").focus(), 50);
  }
}

function closeChiHoiDropdown() {
  document.getElementById("chiHoiDropdown").style.display = "none";
  document.getElementById("chiHoiDisplay").classList.remove("open");
  document.getElementById("chiHoiSearch").value = "";
  const list = document.getElementById("chiHoiList");
  list.innerHTML = "";
  if (typeof DS_CHI_HOI_GS !== 'undefined') {
    DS_CHI_HOI_GS.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); selectChiHoi(name); });
      list.appendChild(li);
    });
  }
  document.getElementById("chiHoiNoResult").style.display = "none";
}

function selectChiHoi(name) {
  document.getElementById("chiHoi").value = name;
  const textEl = document.getElementById("chiHoiText");
  textEl.textContent = name;
  textEl.classList.remove("placeholder");
  document.getElementById("chiHoiDisplay").classList.add("selected");
  closeChiHoiDropdown();
}
