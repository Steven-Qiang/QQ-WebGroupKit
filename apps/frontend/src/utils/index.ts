import dayjs from 'dayjs';

export function formatTime(x: any): string {
  if (!x) return '';
  return dayjs(x).format('YYYY-MM-DD HH:mm:ss');
}
