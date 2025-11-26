import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fighting Fantasy',
  description: 'Interactive gamebook adventure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
