import { useEffect, useRef, useState } from 'react'
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
import { PRODUCT_DND_MIME, readDraggedProduct } from '~/lib/product-dnd'
import { DEFAULT_CATEGORY_CODE, STORE_CATEGORIES, type StoreProduct } from '~/lib/products-api'
import { useProducts } from '~/lib/use-products'
import { DEFAULT_COMPARE_PROMPT, useAdvisorChat } from '~/lib/use-advisor-chat'
import { ForgotPasswordPage, LoginPage, RegisterPage } from './auth'

const MAX_COMPARE_ITEMS = 4

function StorefrontHome() {
  const [chatOpen, setChatOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [compareItems, setCompareItems] = useState<StoreProduct[]>([])
  const [category, setCategory] = useState(DEFAULT_CATEGORY_CODE)
  const categoryLabel = STORE_CATEGORIES.find((c) => c.code === category)?.label ?? ''
  // Shared "featured" fetch (page 1, 10 items) — both the hero image and the carousel read
  // from it so we don't fire two near-identical requests on first paint.
  const { data: featured, loading: featuredLoading } = useProducts({ page: 1, pageSize: 10, category })

  const { messages, status, response, submitMessage } = useAdvisorChat(compareItems)

  const compareIds = compareItems.map((p) => p.id)

  const addCompareItem = (product: StoreProduct) => {
    if (compareIds.includes(product.id) || compareItems.length >= MAX_COMPARE_ITEMS) return
    setCompareItems((prev) => [...prev, product])
    setChatOpen(true)
  }

  // Tagging a product opens the chat so the "So sánh:" chip bar above the input is immediately
  // visible; untagging doesn't (the user is on the grid dismissing it, not asking to see chat).
  const toggleCompare = (product: StoreProduct) => {
    if (compareIds.includes(product.id)) {
      setCompareItems((prev) => prev.filter((p) => p.id !== product.id))
      return
    }
    addCompareItem(product)
  }

  const removeCompareItem = (id: string) => setCompareItems((prev) => prev.filter((p) => p.id !== id))
  const clearCompare = () => setCompareItems([])
  const toggleChat = () => setChatOpen((open) => !open)

  const compareNow = () => {
    setChatOpen(true)
    setExpanded(true)
    void submitMessage(DEFAULT_COMPARE_PROMPT, compareItems)
  }

  // First time the AI actually has products to show, expand once so users discover the results
  // column — after that we leave it alone (don't keep yanking the view open on every reply).
  const hasAutoExpanded = useRef(false)
  useEffect(() => {
    if (!hasAutoExpanded.current && response && response.products.length > 0) {
      hasAutoExpanded.current = true
      setExpanded(true)
    }
  }, [response])

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <div
        className={`flex min-h-svh flex-col transition-[margin] duration-200 ease-out ${
          chatOpen && !expanded ? 'sm:ml-[32rem] lg:ml-[42rem]' : 'ml-0'
        }`}
      >
        <AdvisorHeader category={category} onCategoryChange={setCategory} onOpenChat={() => setChatOpen(true)} />
        <main className="flex-1">
          <Hero chatOpen={chatOpen} onToggleChat={toggleChat} onOpenChat={() => setChatOpen(true)} />
          <PromoCarousel />
          <BoothShowcase />
          <ProductCarousel
            products={featured?.items ?? []}
            loading={featuredLoading}
            categoryLabel={categoryLabel}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
          <ProductGrid
            category={category}
            categoryLabel={categoryLabel}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
        </main>

        <motion.button
          type="button"
          onClick={toggleChat}
          aria-label={chatOpen ? 'Đóng NeoAI' : 'Mở NeoAI'}
          aria-pressed={chatOpen}
          // Once expanded the chat panel covers this exact spot full-screen — fade the button
          // out of the way instead of leaving a dead click; it also doubles as a drop target so
          // dragging a product card here opens chat and adds it to compare in one motion.
          inert={expanded}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes(PRODUCT_DND_MIME)) return
            e.preventDefault()
          }}
          onDrop={(e) => {
            const product = readDraggedProduct(e)
            if (product) addCompareItem(product)
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: expanded ? 0 : 1, scale: expanded ? 0.6 : 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 sm:right-6 sm:bottom-6"
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40" style={{ animationDuration: '2.4s' }} />
          <Sparkles className="size-5" aria-hidden />
          <span className="hidden text-sm font-semibold sm:inline">NeoAI</span>
        </motion.button>
      </div>

      <ChatSidebar
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={messages}
        status={status}
        onSubmit={submitMessage}
        response={response}
        compareItems={compareItems}
        onRemoveCompareItem={removeCompareItem}
        onClearCompare={clearCompare}
        onCompareNow={compareNow}
        onDropProduct={addCompareItem}
        expanded={expanded}
        onExpandedChange={setExpanded}
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
