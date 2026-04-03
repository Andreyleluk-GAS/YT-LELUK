export function getApiBaseUrl() {
  // Использование переменной окружения Vercel для связи с Backend VPS
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
}
