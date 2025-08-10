import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voice of Consumer Analytics',
  description: 'CPG Voice of Consumer dashboard for daily insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-linear-hero`}>
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200">
          <div className="container-padded flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accentPink to-accentPurple shadow-soft" />
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Voice of Consumer</h1>
                <p className="text-xs text-slate-500 -mt-1">Beauty • Grooming • Oral Care • More</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-brand-700">Overview</Link>
              <Link href="/category" className="hover:text-brand-700">Category & Brand</Link>
              <Link href="/retailer" className="hover:text-brand-700">Retailer</Link>
              <Link href="/themes" className="hover:text-brand-700">Themes</Link>
            </nav>
          </div>
        </header>
        <main className="container-padded py-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  )
}