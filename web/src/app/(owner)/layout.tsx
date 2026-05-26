import '../globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AuthGuard from '../components/AuthGuard'

export const metadata = {
  title: 'FoodTour - Owner',
  description: 'Owner portal'
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <Header />
        <AuthGuard allowedRoles={["OWNER", "ADMIN"]}>
          <main className="container py-8">{children}</main>
        </AuthGuard>
        <Footer />
      </body>
    </html>
  )
}
