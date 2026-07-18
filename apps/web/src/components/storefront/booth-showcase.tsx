import { motion } from 'motion/react'
import { Flame } from 'lucide-react'

interface Booth {
  id: string
  src: string
  alt: string
}

// Real ĐMX campaign posters — kept at their native portrait ratio (no cropping) as a row of
// tall promo cards, distinct from the wide banner carousel above.
const BOOTHS: Booth[] = [
  { id: 'sale', src: '/booth/booth_sale.jpg', alt: 'Tháng LG — trợ giá bỏ nhỏ lấy to, giảm đến 10 triệu' },
  { id: 'fridge', src: '/booth/booth_fridge.png', alt: 'Vòng chung kết tủ lạnh tranh cúp — giảm đến 7 triệu' },
  { id: 'ronaldo', src: '/booth/booth_ronaldo.jpg', alt: 'Tuần lễ vàng Dreame — săn robot cùng CR7' },
  { id: 'event', src: '/booth/booth_event.jpg', alt: 'Super Event — nhà xanh sạch, deal cực chất' },
]

export function BoothShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex items-center gap-2.5"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <Flame className="size-4.5" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-xl tracking-wide sm:text-2xl">Chương trình nổi bật</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">Ưu đãi đang diễn ra tại Điện Máy Xanh</p>
        </div>
      </motion.div>

      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
        {BOOTHS.map((booth, i) => (
          <motion.a
            key={booth.id}
            href="#products"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="group w-36 shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 sm:w-auto"
          >
            <div className="aspect-[656/1064] w-full overflow-hidden bg-muted">
              <img src={booth.src} alt={booth.alt} loading="lazy" className="size-full object-cover" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
