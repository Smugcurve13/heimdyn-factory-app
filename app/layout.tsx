import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { AutoAuthModal } from '@/components/AutoAuthModal'
import { ConditionalShell } from '@/components/ConditionalShell'
import GlobalLoader from '@/components/GlobalLoader'

export const metadata: Metadata = {
  title: 'Heimdyn',
  description: 'Heimdyn — Factory operations management dashboard',
  icons: {
    icon: '/logo.PNG',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (window.DarkReader) {
                    window.DarkReader.disable();
                  }
                } catch (e) {}
              `
            }}
          />
        </head>
        <body suppressHydrationWarning>
          <ReactQueryProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AutoAuthModal />
                <Suspense fallback={null}>
                  <GlobalLoader />
                </Suspense>
                <ConditionalShell>
                  {children}
                </ConditionalShell>
              </TooltipProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </AuthProvider>
  )
}
