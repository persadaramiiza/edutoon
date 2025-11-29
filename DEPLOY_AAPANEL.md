# 📦 Panduan Deploy EduToon di aaPanel (Armbian/Ubuntu)

## 🔧 Persiapan Server

### 1. Install aaPanel
```bash
# Ubuntu/Debian
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && bash install.sh
```

### 2. Install Software via aaPanel
Buka aaPanel web interface, lalu install:
- **Nginx** (versi terbaru)
- **PostgreSQL** (versi 14+)
- **PM2 Manager** (dari App Store)
- **Node.js Version Manager** (pilih Node.js 20.x atau 22.x)

---

## 📁 Upload Project

### 1. Upload via aaPanel File Manager
Upload folder project ke `/www/wwwroot/edutoon`

Atau via Git:
```bash
cd /www/wwwroot
git clone https://github.com/persadaramiiza/edutoon.git
cd edutoon
git checkout deployment-test
```

---

## 🗄️ Setup Database PostgreSQL

### 1. Buat Database via aaPanel
- Buka **Database** → **PostgreSQL**
- Klik **Add Database**
- Database name: `edutoon`
- Username: `edutoon`
- Password: (catat password Anda)

### 2. Setup Environment
```bash
cd /www/wwwroot/edutoon

# Copy dan edit file environment
cp .env.production .env
nano .env
```

Edit `.env` sesuai database yang dibuat:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=edutoon
DB_PASS=PASSWORD_DATABASE_ANDA
DB_NAME=edutoon

JWT_SECRET=GANTI_SECRET_RANDOM_MINIMAL_32_KARAKTER
JWT_EXPIRES_IN=7d
```

---

## 🔨 Build Project

### 1. Build Backend (NestJS)
```bash
cd /www/wwwroot/edutoon

# Install dependencies
npm install

# Build production
npm run build
```

### 2. Build Frontend (Next.js)
```bash
cd /www/wwwroot/edutoon/frontend

# Edit environment frontend
nano .env.production
```

Isi dengan domain/IP server Anda:
```env
NEXT_PUBLIC_API_URL=http://YOUR_DOMAIN:3000/api
```

Jika menggunakan domain dengan reverse proxy (recommended):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Lalu build:
```bash
# Install dependencies
npm install

# Build production
npm run build
```

---

## 🚀 Jalankan dengan PM2

### 1. Start Aplikasi
```bash
cd /www/wwwroot/edutoon

# Start dengan PM2
pm2 start ecosystem.config.js

# Save PM2 list
pm2 save

# Auto-start on reboot
pm2 startup
```

### 2. Periksa Status
```bash
pm2 status
pm2 logs edutoon-backend
pm2 logs edutoon-frontend
```

---

## 🌐 Setup Nginx Reverse Proxy

### Option A: Single Domain (Recommended untuk STB)

Buat Website di aaPanel dengan domain/IP Anda, lalu edit Nginx config:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend (Next.js) - default
    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS)
    location /api {
        proxy_pass http://127.0.0.1:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Untuk setup ini, update `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=/api
```

Lalu rebuild frontend:
```bash
cd /www/wwwroot/edutoon/frontend
npm run build
pm2 restart edutoon-frontend
```

### Option B: Subdomain Terpisah

**Backend**: api.yourdomain.com
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend**: yourdomain.com atau app.yourdomain.com
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 SSL Certificate (Optional tapi Recommended)

Di aaPanel:
1. Buka **Website** → klik domain Anda
2. Tab **SSL** → **Let's Encrypt**
3. Klik **Apply** untuk mendapatkan SSL gratis

---

## ✅ Testing

### 1. Test Backend
```bash
curl http://localhost:3000/api
# atau
curl http://YOUR_DOMAIN/api
```

### 2. Test Frontend
Buka browser: `http://YOUR_DOMAIN`

### 3. Test Database Connection
```bash
pm2 logs edutoon-backend
# Pastikan tidak ada error koneksi database
```

---

## 🔄 Update Deployment

Jika ada update code:

```bash
cd /www/wwwroot/edutoon

# Pull latest code
git pull origin deployment-test

# Rebuild backend
npm install
npm run build

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart PM2
pm2 restart all
```

---

## 🐛 Troubleshooting

### Error: Port already in use
```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
```

### Error: Database connection refused
- Pastikan PostgreSQL running di aaPanel
- Cek username/password di `.env`
- Cek PostgreSQL listen address di config

### Error: Module not found
```bash
rm -rf node_modules
npm install
npm run build
```

### View Logs
```bash
pm2 logs
pm2 logs edutoon-backend --lines 100
pm2 logs edutoon-frontend --lines 100
```

---

## 📊 Monitoring

```bash
# CPU/Memory usage
pm2 monit

# Status semua app
pm2 status

# Info detail
pm2 info edutoon-backend
```

---

## 🎯 Quick Commands Reference

| Command | Keterangan |
|---------|------------|
| `pm2 start ecosystem.config.js` | Start semua app |
| `pm2 stop all` | Stop semua app |
| `pm2 restart all` | Restart semua app |
| `pm2 logs` | Lihat logs |
| `pm2 status` | Lihat status |
| `pm2 monit` | Monitoring realtime |

---

## 📝 Catatan Penting untuk STB Armbian

1. **RAM Terbatas**: Jika RAM < 2GB, pertimbangkan menjalankan backend saja dan gunakan static export untuk frontend

2. **Storage**: Pastikan ada cukup space untuk node_modules (~500MB)

3. **Swap Memory**: Tambahkan swap jika RAM terbatas
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

4. **Auto-start**: PM2 akan otomatis start setelah reboot jika sudah setup `pm2 startup`
