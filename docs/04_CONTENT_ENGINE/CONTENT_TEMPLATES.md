# TỔNG HỢP MẪU KHAI BÁO THỰC THỂ (CONTENT TEMPLATES) — VERITAS

Tài liệu hợp nhất toàn bộ các mẫu khai báo thực thể (JSON Templates) dùng cho việc biên soạn vụ án mới.

---

## 01. Mẫu Khai Báo Nạn Nhân (Victim Template)
```json
{
  "victimId": "VIC-001",
  "name": "Thomas Vance",
  "age": 35,
  "causeOfDeath": "Chấn thương sọ não",
  "autopsyReportEvidenceId": "EVI-DOC-AUTOPSY"
}
```

---

## 02. Mẫu Khai Báo Nghi Phạm (Suspect Template)
```json
{
  "suspectId": "SUS-002",
  "name": "V. Marsh",
  "alibiStatement": "Ở nhà xem tivi từ 21:00 đêm",
  "associatedDeviceIds": ["DEV-PHONE-MARSH"]
}
```

---

## 03. Mẫu Khai Báo Thiết Bị Số & Tin Nhắn (Device & Message Template)
```json
{
  "deviceId": "DEV-NOKIA-01",
  "deviceType": "BURNER_PHONE",
  "messages": [
    {
      "id": "MSG-102",
      "sender": "+84903xxx12",
      "timestamp": "2026-07-20T21:45:00Z",
      "body": "Gặp ở kho B sau 22h."
    }
  ]
}
```

---

## 04. Mẫu Khai Báo Nhật Ký GPS & Tháp Sóng (Location & GPS Template)
```json
{
  "locationId": "LOC-PIER9",
  "gpsLogs": [
    {
      "deviceId": "FL-09",
      "timestamp": "2026-07-20T22:05:00Z",
      "latitude": 10.762622,
      "longitude": 106.660172
    }
  ]
}
```
