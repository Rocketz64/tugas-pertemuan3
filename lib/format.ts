export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function toInputDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Kost & Tempat Tinggal',
  'Transportasi',
  'Kuliah & Buku',
  'Hiburan & Nongkrong',
  'Belanja Pribadi',
  'Tagihan & Pulsa',
  'Kesehatan',
  'Lainnya',
] as const;

export const INCOME_CATEGORIES = [
  'Uang Saku',
  'Gaji / Magang',
  'Freelance / Project',
  'Beasiswa',
  'Hadiah / Bantuan',
  'Penjualan',
  'Lainnya',
] as const;

export const ALL_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
);
