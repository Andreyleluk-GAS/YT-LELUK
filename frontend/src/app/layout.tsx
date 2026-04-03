import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Авто YouTube Прокси',
  description: 'Проигрыватель YouTube для Android Auto через VLESS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
