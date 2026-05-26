# Laporan Progres Pengembangan Aplikasi FutsalGo

Aplikasi web FutsalGo yang dibangun menggunakan stack Laravel (Backend) dan React (Frontend) dengan tema Hijau-Putih telah mencapai progres yang sangat baik. Berikut adalah rincian fitur yang telah diselesaikan dan fitur yang masih tersisa/belum diimplementasikan secara penuh.

## ✅ FITUR YANG SUDAH SELESAI DAN BERJALAN BAIK

### 1. Sisi Pengguna (User Side)
* **Login & Registrasi:**
  * Pengguna dapat melakukan pendaftaran akun baru.
  * Autentikasi menggunakan email dan password (mendukung JWT/Sanctum).
  * Pengalihan otomatis ke halaman dashboard pengguna setelah berhasil login.
* **Dashboard / Jadwal Lapangan (Schedule):**
  * Menampilkan grid jadwal lapangan berdasarkan hari dan jam.
  * Sistem *color-coding* sudah berjalan: Tersedia (Hijau), Sudah Dipesan (Abu-abu), Diblokir (Oranye).
  * Bisa berpindah minggu (Minggu Lalu / Minggu Depan).
  * Pemilihan lapangan yang berbeda melalui tab (Lapangan A, B, dsb).
* **Form Pemesanan & Pembayaran Terintegrasi (Booking + Payment):**
  * Formulir auto-fill untuk nama, tanggal, lapangan, dan jam mulai.
  * Perhitungan harga otomatis berdasarkan durasi.
  * Pilihan metode pembayaran lengkap (Transfer Bank BCA/Mandiri/BRI, QRIS, Tunai).
  * Fitur unggah (upload) Bukti Pembayaran (Menerima gambar dan PDF).
  * Validasi tombol "Konfirmasi Pesanan" agar tidak bisa di-klik jika form/bukti belum lengkap.
* **Riwayat Pemesanan (Booking History):**
  * Menampilkan daftar pemesanan pengguna.
  * Fitur *filter* berdasarkan status (Pending, Dikonfirmasi, Selesai, Dibatalkan).
  * Badge warna-warni untuk status *booking* dan pembayaran.
* **Cetak Bukti (PDF Receipt):**
  * Bukti pemesanan dan pembayaran berhasil di-*generate* menjadi file PDF (menggunakan `laravel-dompdf`).
  * PDF memuat *watermark* dinamis ("DIKONFIRMASI" atau "MENUNGGU VERIFIKASI").
  * Tata letak rapi, profesional, berdesain warna hijau dengan logo.

### 2. Sisi Admin (Admin Side)
* **Login Admin:**
  * Menggunakan rute terpisah `/admin/login`.
* **Dashboard Admin:**
  * Menampilkan ringkasan data statistik real-time (Booking Hari Ini, Pending Booking, Pembayaran Pending, Total Pendapatan).
  * Tabel ringkasan 5 pemesanan terakhir.
* **Kelola Booking (Manage Bookings):**
  * Tabel daftar pemesanan dari semua pelanggan.
  * Admin dapat mengubah status booking (Pending -> Confirmed -> Completed / Cancelled).
* **Verifikasi Pembayaran (Payment Verification):**
  * Menampilkan daftar pembayaran yang "Menunggu Verifikasi".
  * Admin dapat melihat (preview) gambar bukti pembayaran yang diunggah pengguna.
  * Admin bisa menyetujui (Lunas) atau menolak (Ditolak) beserta pemberian catatan penolakan.
  * Booking otomatis menjadi "Confirmed" jika pembayaran ditandai "Lunas".
* **Blokir Slot (Block Slots):**
  * Fitur untuk memblokir jadwal tertentu dengan alasan Maintenance, Event, atau Istirahat.
  * Slot yang diblokir otomatis tidak bisa dipesan di sisi pengguna.
* **Kelola Lapangan (Manage Fields):**
  * CRUD Lapangan (Tambah, Edit, Nonaktifkan Lapangan).
  * Mengatur harga per jam dan fasilitas lapangan.
  * Mengatur jam operasional secara spesifik per hari untuk setiap lapangan.
* **Laporan Keuangan (Financial Report):**
  * Menampilkan diagram/chart interaktif (menggunakan library Recharts) berdasarkan pendapatan harian.
  * Pie chart untuk sebaran metode pembayaran yang digunakan.
  * Tabel rekap transaksi bulanan.
  * Ekspor laporan ke PDF.

---

## ⏳ FITUR YANG BELUM SELESAI / PERLU PENYEMPURNAAN

1. **Upload Gambar Lapangan dari Sisi Admin:**
   * Di menu "Kelola Lapangan" (Admin), *form input* untuk mengunggah foto/gambar lapangan (*image upload*) belum ditambahkan di sisi Frontend React (meskipun endpoint API di Laravel sudah mendukung). Saat ini hanya menyimpan nama dan deskripsi lapangan.
2. **Tampilan Gambar Lapangan di Sisi Pengguna:**
   * Halaman jadwal pengguna belum menampilkan gambar foto lapangan (hanya nama dan deskripsi).
3. **QRIS Dinamis:**
   * Saat ini metode pembayaran QRIS hanya menginstruksikan pengguna untuk "menghubungi admin". Belum ada sistem *generate* QR Code statis/dinamis langsung di aplikasi (Payment Gateway seperti Midtrans belum diintegrasikan).
4. **Notifikasi (Push Notification / Email):**
   * Aplikasi belum memiliki sistem pengiriman notifikasi email secara otomatis (misalnya ketika booking berhasil, atau ketika admin menolak pembayaran).
5. **Responsivitas Ekstrem (Mobile Tweaks):**
   * Walaupun secara keseluruhan sudah berjalan dengan baik, beberapa tabel di mode admin pada perangkat HP dengan layar sangat kecil mungkin perlu di-*scroll* secara horizontal (*overflow-x*).
6. **Lupa Password:**
   * Halaman login belum memiliki fitur "Lupa Password / Reset Password".

---
*Laporan ini dihasilkan secara otomatis berdasarkan peninjauan struktur kode pada repositori FutsalGo.*
