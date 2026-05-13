export const getToken = () => localStorage.getItem('token');
export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => {
  const u = getUser();
  return u && u.role === 'admin';
};
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const formatRupiah = (num) => {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const formatDateShort = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const PAYMENT_METHODS = {
  transfer_bca: { label: 'Transfer BCA', account: '1234567890', holder: 'FutsalGo' },
  transfer_mandiri: { label: 'Transfer Mandiri', account: '0987654321', holder: 'FutsalGo' },
  transfer_bri: { label: 'Transfer BRI', account: '1122334455', holder: 'FutsalGo' },
  qris: { label: 'QRIS' },
  cash: { label: 'Tunai / Cash' },
};

export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Dikonfirmasi', color: '#059669', bg: '#d1fae5' },
  completed: { label: 'Selesai', color: '#2563eb', bg: '#dbeafe' },
  cancelled: { label: 'Dibatalkan', color: '#dc2626', bg: '#fecaca' },
};

export const PAYMENT_STATUS = {
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: '#f59e0b', bg: '#fef3c7' },
  lunas: { label: 'Lunas', color: '#059669', bg: '#d1fae5' },
  ditolak: { label: 'Ditolak', color: '#dc2626', bg: '#fecaca' },
};
