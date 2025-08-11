import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DropdownManagerProvider } from '@/components/DropdownManager'
import { GlobalSearch } from '@/components/GlobalSearch'

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
      <body className={`${inter.className} min-h-screen bg-linear-hero dark:bg-slate-900 dark:text-slate-100`}>
        <DropdownManagerProvider>
          <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/60 backdrop-blur border-b border-slate-200 dark:border-slate-800">
            <div className="container-padded flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--header-from,#3b82f6)] to-[var(--header-to,#ec4899)] shadow-soft" />
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold">Voice of Consumer</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Beauty • Grooming • Oral Care • More</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <GlobalSearch />
                <Link href="/" className="hover:text-brand-700">Overview</Link>
                <Link href="/category" className="hover:text-brand-700">Category & Brand</Link>
                <Link href="/retailer" className="hover:text-brand-700">Retailer</Link>
                <Link href="/themes" className="hover:text-brand-700">Themes</Link>
                <Link href="/admin" className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">Admin</Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="container-padded py-6 sm:py-10">
            {children}
          </main>
        </DropdownManagerProvider>
      </body>
    </html>
  )
}