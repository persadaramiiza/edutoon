# Universal Benchmark Binding for EduToon

Dokumen ini mencatat binding yang perlu ditambahkan di checkout `gl-sre-voidmark` setelah integrasi EduToon lokal lulus. Existing benchmark tests dan file di repository tersebut tidak diubah pada tahap ini.

## Project contract

- application: `edutoon`
- environment: `local-benchmark`
- Kubernetes context: `docker-desktop`
- namespace: `edutoon-benchmark`
- health URL: `http://edutoon-backend:3000/api/health` dari dalam cluster
- metrics URL: `http://edutoon-backend:3000/metrics`
- Prometheus service: `edutoon-prometheus:9090`
- Grafana datasource UID: `prometheus`
- load-test runtime: Kubernetes Job `edutoon-k6-smoke` atau `edutoon-k6-baseline`

## Logical capabilities

`.benchmark/mcp-bindings.yaml` perlu menyediakan binding read-only untuk discovery/status/logs Kubernetes, HTTP healthcheck, Prometheus query, dan Grafana query. Mutasi Kubernetes harus dibatasi ke context `docker-desktop` dan namespace `edutoon-benchmark`. Provider AWS RDS, Cloud Build, dan Google Sheets tidak diperlukan untuk mode lokal ini dan harus disabled/not configured.

Minimum query verifikasi:

```promql
up{job="edutoon-backend"}
```

Status kontrak atau test lokal tidak boleh dianggap sebagai live readiness. Readiness hanya lulus setelah provider aktif dapat membaca workload, health endpoint mengembalikan 2xx, Prometheus mengembalikan nilai `1`, Grafana datasource health berhasil, dan k6 smoke Job berstatus `Complete`.
