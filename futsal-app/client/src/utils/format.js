/**
 * Format angka ke format Rupiah.
 * formatRupiah(2000) → "Rp 2.000"
 */
export function formatRupiah(angka) {
  if (angka === null || angka === undefined) return 'Rp 0';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

/**
 * Format durasi menit ke string jam + menit.
 * formatDurasi(95) → "1 jam 35 menit"
 */
export function formatDurasi(menit) {
  if (!menit && menit !== 0) return '-';
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  if (jam === 0) return `${sisa} menit`;
  return `${jam} jam ${sisa} menit`;
}

/**
 * Format datetime string ke "DD/MM/YYYY HH:mm".
 * formatWaktu("2026-01-06 18:09:00") → "06/01/2026 18:09"
 */
export function formatWaktu(datetime) {
  if (!datetime) return '-';
  const d = new Date(datetime);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
