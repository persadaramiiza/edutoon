# EduToon Backend - EKS Handoff

Direktori ini adalah kontrak deployment backend untuk tim infra. Manifest ini
tidak membuat EKS, ECR, RDS, load balancer, DNS, sertifikat, atau resource AWS
lainnya.

## Artifact

- `manifest.yml`: `Deployment` dan internal `ClusterIP Service` backend.
- `migration-job.yml`: template Job migration yang dijalankan terpisah sebelum
  rollout aplikasi.

Dockerfile pada root repository tetap menjadi sumber pembuatan container image.
Tim infra membangun image, melakukan vulnerability scan, mendorongnya ke ECR,
dan mengganti `edutoon-backend:0.0.0` dengan tag immutable atau digest ECR.

Contoh image final:

```text
123456789012.dkr.ecr.ap-southeast-3.amazonaws.com/edutoon-backend@sha256:<digest>
```

## Namespace dan resource eksternal

Manifest tidak mengunci namespace. Tim infra menentukan namespace melalui
pipeline atau mekanisme konfigurasi mereka. Sebelum deployment, namespace
tersebut harus memiliki:

- `ConfigMap/edutoon-backend-config`
- `Secret/edutoon-backend-secret`

Secret harus dibuat oleh sistem pengelolaan secret milik infra, misalnya AWS
Secrets Manager dengan External Secrets. Jangan memasukkan nilainya ke Git,
manifest hasil render, image, atau log pipeline.

## ConfigMap contract

| Key                          | Wajib | Keterangan                                            |
| ---------------------------- | ----- | ----------------------------------------------------- |
| `PORT`                       | ya    | Gunakan `3000`.                                       |
| `DB_HOST`                    | ya    | Endpoint RDS yang dapat dijangkau dari EKS.           |
| `DB_PORT`                    | ya    | Gunakan `3306` untuk MariaDB.                         |
| `DB_USER`                    | ya    | User aplikasi dengan hak minimum.                     |
| `DB_NAME`                    | ya    | Nama database EduToon.                                |
| `DB_SSL`                     | ya    | Gunakan `true` untuk koneksi RDS.                     |
| `DB_SSL_REJECT_UNAUTHORIZED` | ya    | Gunakan `true`; perubahan memerlukan review keamanan. |
| `JWT_EXPIRES_IN`             | ya    | Contoh `1h`.                                          |
| `FRONTEND_URL`               | ya    | Origin frontend yang diizinkan oleh CORS.             |
| `CLUSTER_LABEL`              | ya    | Label cluster untuk metrik Prometheus.                |

`ALLOW_BENCHMARK_SEED`, `BENCHMARK_EMAIL`, dan `BENCHMARK_PASSWORD` tidak boleh
disediakan pada deployment EKS non-benchmark.

## Secret contract

| Key          | Wajib | Keterangan                                     |
| ------------ | ----- | ---------------------------------------------- |
| `DB_PASS`    | ya    | Password database aplikasi.                    |
| `JWT_SECRET` | ya    | Secret JWT yang kuat dan dikelola di luar Git. |

Jika kebijakan perusahaan menganggap `DB_USER` atau `DB_NAME` sensitif, kedua
key tersebut boleh dipindahkan dari ConfigMap ke Secret tanpa perubahan kode.

## Network dan observability

- Container mendengarkan port `3000`.
- Service bersifat internal `ClusterIP`; Ingress/ALB, domain, WAF, dan TLS
  menjadi tanggung jawab tim infra.
- Startup/liveness: `GET /api/health/ping`.
- Readiness dengan pemeriksaan database: `GET /api/health`.
- Prometheus: `GET /metrics`.
- Pod tidak memerlukan Kubernetes API token.
- Security group RDS hanya perlu membuka MariaDB dari security group/node
  atau pod identity jaringan EKS yang ditentukan infra.

## Urutan rollout

1. Infra menentukan namespace, image ECR immutable, ConfigMap, dan Secret.
2. Pastikan konektivitas EKS ke RDS dan TLS database tersedia.
3. Jalankan `migration-job.yml` memakai image yang akan dirilis.
4. Tunggu Job berstatus `Complete`; hentikan rollout bila migration gagal.
5. Terapkan `manifest.yml` dan tunggu Deployment tersedia.
6. Verifikasi `/api/health`, `/metrics`, scrape Prometheus, dan log aplikasi.

Migration awal EduToon sengaja hanya menerima database MariaDB kosong. DDL
MariaDB melakukan auto-commit, sehingga kegagalan migration harus menghentikan
rollout dan database kosong perlu dibuat ulang sebelum retry. Untuk RDS
existing, lakukan audit/baseline schema dan persetujuan migration sebelum
menjalankan Job. Jangan menjalankan seed benchmark pada RDS perusahaan.

## Batas konfigurasi

Nilai berikut harus ditetapkan tim infra sebelum manifest diterapkan:

- image ECR immutable/digest;
- namespace;
- jumlah replica dan kebijakan autoscaling;
- resource request/limit berdasarkan capacity test;
- mekanisme Secret dan akses RDS;
- Ingress/ALB, TLS, DNS, PDB, topology spread, serta observability perusahaan.

Manifest lokal di `k8s/` tetap khusus namespace `edutoon-benchmark` dan tidak
boleh digunakan untuk deployment EKS perusahaan.
