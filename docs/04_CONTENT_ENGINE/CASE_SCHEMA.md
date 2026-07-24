# ĐẶC TẢ CẤU TRÚC DỮ LIỆU VỤ ÁN (CASE DATA SCHEMA) — VERITAS

> **Nhiệm vụ Tài liệu:** Định nghĩa chuẩn hóa cấu trúc dữ liệu JSON/YAML của một vụ án VERITAS. Mọi vụ án do đội ngũ phát hành hoặc cộng đồng sáng tạo (UGC) đều phải tuân thủ nghiêm ngặt Schema này.

---

## 01. Tổng Quan Cấu Trúc File Vụ Án (`case.json`)

Mỗi vụ án được gói gọn trong một tập tin JSON chính (hoặc folder gói tài nguyên `case.zip`). Cấu trúc bậc cao nhất gồm 6 khối chính:

```json
{
  "$schema": "https://veritas.dev/schemas/case.v1.json",
  "caseId": "CASE-001",
  "title": "Vụ Án Cầu Cảng Số 9 (The Pier 9 Incident)",
  "difficulty": "SENIOR",
  "estimatedDurationMinutes": 180,
  "metadata": {
    "author": "VERITAS Studio",
    "version": "1.0.0",
    "releaseDate": "2026-07-20",
    "tags": ["Murder", "Port", "Digital Device Dump", "Alibi Clash"]
  },
  "objectives": [],
  "entities": {},
  "evidence": [],
  "timelineEvents": [],
  "alibiClashes": [],
  "solution": {}
}
```

---

## 02. Khối Thực Thể (`entities`)

Nơi định nghĩa các đối tượng nhân vật và địa điểm có mặt trong vụ án.

```json
"entities": {
  "victims": [
    {
      "id": "VIC-001",
      "name": "Thomas Vance",
      "age": 42,
      "role": "Giám đốc Logistics Cầu Cảng",
      "status": "DECEASED",
      "notes": "Tử vong do ngạt nước hoặc tác động ngoại lực trước khi rơi xuống nước."
    }
  ],
  "suspects": [
    {
      "id": "SUS-001",
      "name": "Lê Hoàng Minh",
      "age": 35,
      "role": "Trợ lý Kỹ thuật Viễn thông",
      "relationshipToVictim": "Cấp dưới / Đối tác mâu thuẫn tài chính",
      "alibiSummary": "Khai báo ở văn phòng trung tâm lúc 21:30"
    }
  ],
  "locations": [
    {
      "id": "LOC-001",
      "name": "Cầu Cảng Số 9 - Kho Container B3",
      "coordinates": { "lat": 10.762622, "lng": 106.680011 }
    }
  ]
}
```

---

## 03. Khối Tang Vật & Dữ Liệu Số (`evidence`)

Định nghĩa toàn bộ các loại bằng chứng (vật lý, tệp tin giả lập, log cuộc gọi, tin nhắn, hình ảnh pháp y).

```json
"evidence": [
  {
    "id": "EVI-001",
    "type": "PHYSICAL",
    "title": "Đồng hồ dây da vỡ mặt glass",
    "description": "Kim đồng hồ dừng lại lúc 21:42. Mặt sau có vết bẩn dầu máy kho container.",
    "discoveryLocation": "LOC-001",
    "forensicData": {
      "fingerprints": ["FP-SUS-001"],
      "substances": ["Oil-Type-B"]
    }
  },
  {
    "id": "EVI-PHONE-DUMP",
    "type": "DIGITAL_DEVICE",
    "title": "Bản Dump Nokia 3310 của nạn nhân",
    "deviceDetails": {
      "model": "Nokia 3310 (2000)",
      "imei": "352345091283019",
      "ownerId": "VIC-001"
    },
    "smsLogs": [
      {
        "id": "SMS-101",
        "sender": "+84903112233",
        "timestamp": "2026-07-19T21:15:00Z",
        "content": "Gặp tôi ở bến cảng. Đừng báo ai."
      }
    ],
    "callLogs": [
      {
        "id": "CALL-201",
        "type": "INCOMING",
        "phoneNumber": "+84903112233",
        "timestamp": "2026-07-19T21:14:10Z",
        "durationSeconds": 45
      }
    ]
  }
]
```

---

## 04. Mâu Thuẫn Ngoại Phạm (`alibiClashes`)

Hệ thống ghi nhận các điểm va chạm giữa lời khai nghi phạm và bằng chứng thực tế.

```json
"alibiClashes": [
  {
    "id": "CLASH-001",
    "suspectId": "SUS-001",
    "claimedAlibiTime": "2026-07-19T21:30:00Z",
    "claimedLocation": "Văn phòng Trung tâm",
    "contradictingEvidenceIds": ["EVI-001", "SMS-101"],
    "clashDescription": "Nghi phạm khai ở văn phòng nhưng dấu vết dầu máy và tin nhắn SMS định vị nghi phạm tại Kho B3 lúc 21:30."
  }
]
```

---

## 05. Khối Đáp Án & Đồ Thị Phá Án (`solution`)

Nơi định nghĩa Hung thủ, Động cơ, và Đồ thị liên kết bằng chứng bắt buộc để kết án.

```json
"solution": {
  "culpritId": "SUS-001",
  "motive": "FINANCIAL_FRAUD_COVERUP",
  "crimeSequence": [
    "Khống chế nạn nhân tại kho container B3",
    "Xóa nhật ký cuộc gọi",
    "Đẩy nạn nhân xuống cầu cảng để tạo hiện trường giả"
  ],
  "requiredProofGraph": [
    {
      "from": "SMS-101",
      "to": "SUS-001",
      "relation": "LINKED_PHONE_NUMBER"
    },
    {
      "from": "EVI-001",
      "to": "CLASH-001",
      "relation": "PROVES_CONTRADICTION"
    }
  ]
}
```