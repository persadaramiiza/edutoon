# Mock Mode Testing Guide

## Cepat Mulai Testing

### 1. **Aktifkan Testing Mode**

Edit file `frontend_edit/app/watch/[id]/page.tsx` line 39:

```typescript
const TESTING_MODE = true;  // ✅ Set TRUE untuk mock mode
```

### 2. **Jalankan Development Server**

```bash
cd frontend_edit
npm run dev
```

### 3. **Akses Halaman**

Buka di browser:
```
http://localhost:3000/watch/1
```

✅ **Tidak perlu API backend**  
✅ **Tidak perlu login**  
✅ **Langsung pakai mock data**

---

## Apa yang Ditest

### Video Data
- ✅ Video Title: "Test Video - Belajar Alphabet"
- ✅ Video URL: YouTube embed
- ✅ Creator: "Teacher Ali"
- ✅ Category: "Bahasa"
- ✅ Views: 1234

### Quiz Data
3 quiz otomatis:

**Quiz 1 (10 detik)**
- Question: "Apa huruf pertama dalam alphabet?"
- Correct answer: A

**Quiz 2 (25 detik)**
- Question: "Apa huruf setelah B?"
- Correct answer: C

**Quiz 3 (40 detik)**
- Question: "Apa huruf setelah Z?"
- Correct answer: "Tidak ada"

---

## Console Logs Untuk Debug

Open DevTools (F12) dan lihat Console untuk debug info:

```
🧪 TESTING MODE ACTIVE
✅ Auth bypassed
✅ Using mock data only
✅ NO API calls will be made

📥 Loading video...
🧪 Getting video from MOCK DATA
✅ Video loaded

📥 Loading quizzes...
🧪 Getting quizzes from MOCK DATA
✅ Loaded quizzes

📤 Submitting quiz answer: {...}
📦 Mock submit quiz
✅ Mock result: {...}
```

---

## Disable Testing Mode (Untuk API)

Edit file `frontend_edit/app/watch/[id]/page.tsx` line 39:

```typescript
const TESTING_MODE = false;  // ❌ Set FALSE untuk real API
```

Sekarang akan:
- ✅ Require login
- ✅ Call API backend (`GET /videos/{id}`)
- ✅ Call API backend (`GET /videos/{id}/quizzes`)
- ✅ Call API backend (`POST /quiz/submit`)

---

## Environment Variables

Edit `.env.local`:

```bash
# Testing Configuration
NEXT_PUBLIC_TESTING_MODE=true

# API Configuration (bypass saat testing)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Mock Data Mode
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## Mock Data Location

Semua mock data ada di: `frontend_edit/lib/useMockData.ts`

Untuk ubah/tambah mock data, edit file ini langsung!

---

## Troubleshooting

### "Video Not Found"
- Pastikan videoId = 1 di URL
- Check console untuk error messages

### "Quiz tidak muncul"
- Video harus di YouTube embed
- Quiz harus di timestamp: 10, 25, 40 detik
- Mainkan video sampai mencapai timestamp tersebut

### "Submit quiz tidak jalan"
- Pastikan profile ID ada (default: 1)
- Check console untuk error messages
- Refresh halaman jika perlu

---

Happy Testing! 🚀
