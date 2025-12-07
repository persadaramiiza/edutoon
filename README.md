# EduToon 🎓
  <strong>Platform Video Edukatif untuk Anak-Anak</strong>
</p>

## 📖 Deskripsi

**EduToon** adalah platform pembelajaran interaktif yang menggabungkan konten video edukatif dengan format webtoon yang menyenangkan untuk anak-anak. Sistem ini dirancang untuk membuat pembelajaran menjadi lebih engaging, interaktif, dan menyenangkan melalui kombinasi visual storytelling dan kuis edukatif.

Platform ini menyediakan fitur komprehensif untuk pembelajaran online, termasuk manajemen video, kuis interaktif, pelacakan riwayat menonton, dan profil pengguna yang dipersonalisasi.

## ✨ Fitur Utama

### Untuk Siswa
- **Konten Video Edukatif** - Video pembelajaran dalam format webtoon yang menarik
- **Kuis Interaktif** - Kuis setelah video untuk menguji pemahaman
- **Profil Pengguna** - Profil yang dapat dipersonalisasi dengan avatar unik 
- **Dashboard Pembelajaran** - Ringkasan progress dan statistik pembelajaran
- **Riwayat Menonton** - Pelacakan video yang telah ditonton
- **Pencapaian & Badge** - Sistem reward untuk memotivasi pembelajaran

### Untuk Kreator
- **Dashboard Kreator** - Panel untuk mengelola konten
- **Manajemen Video** - Upload dan kelola video edukatif
- **Manajemen Kuis** - Buat dan edit kuis untuk setiap video

### Keamanan & Performa
- **Autentikasi JWT** - Keamanan berbasis JWT token
- **Rate Limiting** - Proteksi terhadap abuse (60 request/menit per IP)
- **Security Headers** - Helmet.js untuk keamanan HTTP
- **Database PostgreSQL** - Penyimpanan data yang reliable

## 🏗️ Arsitektur Sistem

### Backend (NestJS)
- Framework modern dengan struktur modular
- REST API dengan dokumentasi Swagger
- TypeORM untuk management database
- Validasi input dengan class-validator

**Modules:**
- `auth` - Autentikasi dan otorisasi
- `users` - Manajemen pengguna dan akun
- `profiles` - Profil pengguna dan preferensi
- `videos` - Manajemen konten video
- `quizzes` - Manajemen kuis dan attemp kuis
- `watch-history` - Pelacakan riwayat menonton
- `health` - Health check endpoint

### Frontend (Next.js 16 + React 19)
- Modern React with Server Components
- Tailwind CSS untuk styling
- Framer Motion untuk animasi
- Axios untuk API communication
- Context API untuk state management

**Halaman Utama:**
- Login & Register
- Landing Page (Beranda)
- Dashboard Siswa
- Watch Video dengan Player
- Quiz/Kuis
- Profile Management
- Creator Dashboard

## 🚀 Setup & Instalasi

### Instalasi 

#### 1. Clone Repository
```bash
git clone https://github.com/persadaramiiza/edutoon.git
cd edutoon
```

#### 2. Setup Backend
```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate migration jika diperlukan
pnpm run typeorm migration:generate src/migrations/InitialSchema

# Development mode
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

#### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
pnpm install

# Development mode (port 3333)
pnpm run dev

# Production build
pnpm run build
pnpm run start
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register akun baru
- `POST /auth/login` - Login pengguna
- `POST /auth/refresh` - Refresh JWT token

### Users
- `GET /users/profile` - Get profil pengguna saat ini
- `PUT /users/profile` - Update profil pengguna

### Profiles
- `GET /profiles` - List semua profil pengguna
- `POST /profiles` - Create profil baru

### Videos
- `GET /videos` - List semua video
- `GET /videos/:id` - Detail video
- `POST /videos` - Upload video baru (creator only)
- `PUT /videos/:id` - Update video
- `DELETE /videos/:id` - Hapus video

### Quizzes
- `GET /quizzes/:videoId` - Get kuis untuk video tertentu
- `POST /quizzes/attempt` - Submit jawaban kuis
- `GET /quizzes/attempt/:attemptId` - Get hasil attempt

### Watch History
- `GET /watch-history` - Get riwayat menonton pengguna
- `POST /watch-history` - Record menonton video
- `DELETE /watch-history/:id` - Hapus riwayat

### Health Check
- `GET /health` - Cek status aplikasi

## 📁 Struktur Project

```
edutoon/
├── src/
│   └── backend/
│       ├── auth/              
│       ├── users/             
│       ├── profiles/          
│       ├── videos/            
│       ├── quizzes/           
│       ├── watch-history/     
│       ├── health/            
│       ├── app.module.ts      
│       └── main.ts            
├── frontend/
│   ├── app/                   
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── creator/
│   │   ├── watch/
│   │   └── profile/
│   ├── components/            
│   ├── contexts/              
│   ├── lib/                   
│   └── public/                
├── test/                      
├── docker-compose.yml
├── ecosystem.config.js        
└── README.md

```

## 📊 Database Schema

**Main Entities:**
- `User` - Akun pengguna (email, password, role)
- `Profile` - Profil pengguna (nama, avatar, bio)
- `Video` - Konten video edukatif
- `Quiz` - Kuis/soal untuk video
- `QuizOption` - Opsi jawaban kuis
- `QuizAttempt` - Rekam percobaan menjawab kuis
- `WatchHistory` - Riwayat video yang ditonton

## Contibutor
1. Kevin Azra (18223029)
2. Persada Ramiiza Abyudaya (18223033)
3. Inggried Amelia Deswanty (18223035)
4. Muhammad Aqmar Fayyaz Zakaria (18223043)
5. Velicia Christina Gabriel (18223085) 




