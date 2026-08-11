# EduToon Local Benchmark

Lingkungan ini menjalankan PostgreSQL, backend, frontend, Prometheus, Grafana, dan k6 pada Kubernetes Docker Desktop. Tidak ada EKS, RDS, GCP, atau resource cloud berbayar yang dibuat.

## Prasyarat

- Context Kubernetes harus `docker-desktop`.
- Container node lokal harus bernama `desktop-control-plane`.
- Docker Engine dan `kubectl` harus aktif.
- Nilai `DB_PASS`, `JWT_SECRET`, `GRAFANA_ADMIN_PASSWORD`, `BENCHMARK_EMAIL`, dan `BENCHMARK_PASSWORD` harus tersedia hanya pada environment proses lokal. Jangan simpan nilainya pada repository atau riwayat shell.

Script mutasi berhenti bila context bukan `docker-desktop`. Karena Docker Desktop menyembunyikan container node kind, `load-kind-images.ps1` memakai pod privileged sementara untuk mengakses socket containerd, mengimpor image lokal, lalu selalu menghapus pod tersebut.

## Menjalankan

```powershell
.\scripts\benchmark\build-images.ps1
.\scripts\benchmark\load-kind-images.ps1
.\scripts\benchmark\create-local-secrets.ps1
.\scripts\benchmark\deploy-local.ps1
.\scripts\benchmark\verify-local.ps1
.\scripts\benchmark\run-k6.ps1 -Mode Smoke
```

Baseline sengaja tidak otomatis. Jalankan hanya setelah smoke menghasilkan status lulus:

```powershell
.\scripts\benchmark\run-k6.ps1 -Mode Baseline
```

Smoke menggunakan satu VU dan satu iterasi. Login hanya dilakukan sekali, lalu alur membaca daftar video, detail video, dan kuis. Baseline memakai satu VU, sepuluh iterasi, dan jeda lima detik sehingga tetap berada di bawah batas 60 request per menit per IP dan 10 login per menit.

## Data terisolasi

Job seed hanya berjalan bila `ALLOW_BENCHMARK_SEED=true` dan `DB_NAME` mengandung kata `benchmark`. Job membuat akun, profil, video, dan kuis berlabel benchmark secara idempotent. Skenario awal tidak memanggil submit kuis, progress, atau increment view.

## Verifikasi manual

Frontend menggunakan `LoadBalancer` lokal Docker Desktop dan dapat dibuka langsung di `http://localhost:3333` tanpa port-forward.

```powershell
kubectl get pods -n edutoon-benchmark
kubectl get service edutoon-frontend -n edutoon-benchmark
```

Prometheus dan Grafana tetap internal secara default. Gunakan port-forward hanya ketika perlu melakukan observability/debugging.

Backend readiness memakai `/api/health`, liveness memakai `/api/health/ping`, dan Prometheus mengambil `/metrics` setiap 15 detik. Dashboard Grafana bernama `EduToon Local Benchmark` diprovision otomatis.

## Migration production

`synchronize` selalu dinonaktifkan. Migration awal hanya menerima database kosong. Bila tabel production lama sudah ada, migration berhenti tanpa mengubah schema dan meminta proses audit/baseline eksplisit. Jangan menjalankan migration atau seed benchmark terhadap production.
