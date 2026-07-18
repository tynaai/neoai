import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

import { AdvisorHeader } from '~/components/advisor/advisor-header'
import { BoothShowcase } from '~/components/storefront/booth-showcase'
import { ChatSidebar } from '~/components/storefront/chat-sidebar'
import { Hero } from '~/components/storefront/hero'
import { ProductCarousel } from '~/components/storefront/product-carousel'
import { ProductGrid } from '~/components/storefront/product-grid'
import { PromoCarousel } from '~/components/storefront/promo-carousel'
import type { StoreProduct } from '~/lib/products-api'
import { useProducts } from '~/lib/use-products'
import { ForgotPasswordPage, LoginPage, RegisterPage } from './auth'

const MAX_COMPARE_ITEMS = 4

function StorefrontHome() {
  const [chatOpen, setChatOpen] = useState(false)
  const [compareItems, setCompareItems] = useState<StoreProduct[]>([])
  // Shared "featured" fetch (page 1, 10 items) — both the hero image and the carousel read
  // from it so we don't fire two near-identical requests on first paint.
  const { data: featured, loading: featuredLoading } = useProducts({ page: 1, pageSize: 10 })

  const compareIds = compareItems.map((p) => p.id)

  // Tagging a product opens the chat sidebar so the tag is immediately visible; untagging
  // doesn't (the user is on the grid dismissing it, not asking to see chat).
  const toggleCompare = (product: StoreProduct) => {
    if (compareIds.includes(product.id)) {
      setCompareItems((prev) => prev.filter((p) => p.id !== product.id))
      return
    }
    if (compareItems.length >= MAX_COMPARE_ITEMS) return
    setCompareItems((prev) => [...prev, product])
    setChatOpen(true)
  }

  const removeCompareItem = (id: string) => setCompareItems((prev) => prev.filter((p) => p.id !== id))
  const clearCompare = () => setCompareItems([])

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <AdvisorHeader onOpenChat={() => setChatOpen(true)} />
      <main className="flex-1">
        <Hero onOpenChat={() => setChatOpen(true)} />
        <PromoCarousel />
        <BoothShowcase />
        <ProductCarousel
          products={featured?.items ?? []}
          loading={featuredLoading}
          compareIds={compareIds}
          onToggleCompare={toggleCompare}
        />
        <ProductGrid compareIds={compareIds} onToggleCompare={toggleCompare} />
      </main>

      <motion.button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label="Mở trợ lý AI tư vấn máy lạnh"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.6 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 sm:right-6 sm:bottom-6"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40" style={{ animationDuration: '2.4s' }} />
        <Sparkles className="size-5" aria-hidden />
        <span className="hidden text-sm font-semibold sm:inline">Tư vấn AI</span>
      </motion.button>

      <ChatSidebar
        open={chatOpen}
        onOpenChange={setChatOpen}
        compareItems={compareItems}
        onRemoveCompareItem={removeCompareItem}
        onClearCompare={clearCompare}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page is public — chat/products/compare all hit unauthenticated API routes. */}
        <Route element={<StorefrontHome />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
