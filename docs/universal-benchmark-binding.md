# Universal Benchmark Binding for EduToon

Dokumen ini mencatat binding EduToon yang digunakan oleh Universal Benchmark di checkout `gl-sre-voidmark`. Profil project berada di `.benchmark/project.yaml` dan binding host berada di `.benchmark/mcp-bindings.yaml`.

## Project contract

- application: `edutoon`
- environment: `local-benchmark`
- Kubernetes context: `docker-desktop`
- namespace: `edutoon-benchmark`
- health URL: `http://localhost:3333/api/health` melalui service lokal Docker Desktop
- metrics URL: `http://edutoon-backend:3000/metrics`
- Prometheus service: `edutoon-prometheus:9090`
- Grafana datasource UID: `prometheus`
- load-test runtime: Kubernetes Job `edutoon-k6-smoke` atau `edutoon-k6-baseline`

## Logical capabilities

`.benchmark/mcp-bindings.yaml` menyediakan discovery, status, pembuatan Job yang di-approve, dan pembacaan log melalui Kubernetes MCP; HTTP healthcheck; serta query Grafana/Prometheus. Mutasi Kubernetes dibatasi ke context `docker-desktop` dan namespace `edutoon-benchmark`. Provider AWS RDS, Cloud Build, dan Google Sheets tidak diperlukan untuk mode lokal ini dan tetap disabled.

Server desktop yang dibutuhkan:

- `edutoon-kubernetes`, dengan tool `resources_create_or_update` dan `pods_log`;
- `http-health`, dengan allow-list URL EduToon dan opt-in HTTP loopback;
- `edutoon-grafana`, mengarah ke `http://localhost:3001`; wrapper membuat token Viewer sementara maksimal 8 jam untuk child MCP dan mencabutnya saat server berhenti.

Konfigurasi lokal ini tidak mengubah binding Grafana GLChat yang sudah ada.
Nama server Kubernetes sengaja dipisahkan dari `kubernetes` global milik
cluster kantor agar kubeconfig Docker Desktop tidak saling menimpa.

Jalankan setup service account sekali secara eksplisit:

```powershell
.\scripts\benchmark\setup-grafana-service-account.ps1
```

Script startup MCP hanya menggunakan account Viewer tersebut untuk token
sementara dan tidak pernah membuat account baru secara implisit.

Minimum query verifikasi:

```promql
up{job="edutoon-backend"}
```

Status kontrak atau test lokal tidak boleh dianggap sebagai live readiness. Readiness hanya lulus setelah provider aktif dapat membaca workload, health endpoint mengembalikan 2xx, Prometheus mengembalikan nilai `1`, Grafana datasource health berhasil, dan k6 smoke Job berstatus `Complete`.
