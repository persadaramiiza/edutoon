# RDS Binding (Disabled)

Konfigurasi ini hanya mendokumentasikan pemetaan environment untuk integrasi RDS di masa depan. Tidak ada koneksi, provisioning, perubahan security group, migration, atau pengujian RDS yang dijalankan.

| EduToon | RDS source |
|---|---|
| `DB_HOST` | endpoint instance/cluster yang disetujui |
| `DB_PORT` | port PostgreSQL, umumnya 5432 |
| `DB_USER` | Secret perusahaan |
| `DB_PASS` | Secret perusahaan |
| `DB_NAME` | database yang disetujui |
| `DB_SSL` | `true` |
| `DB_SSL_REJECT_UNAUTHORIZED` | mengikuti CA/policy perusahaan |

Template di `k8s/overlays/rds-disabled` tidak memiliki `kustomization.yaml`, sehingga tidak termasuk deployment lokal. Aktivasi memerlukan persetujuan perusahaan, akses jaringan, pemeriksaan CA, backup, schema audit, dan rencana rollback.
