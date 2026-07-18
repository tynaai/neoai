import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BadgeCheck, Box, Info, Ruler, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { FitStatus, PreviewProduct, RoomProfile } from './types'
import { getModelUrl } from './mock-products'
import { loadModelViewer } from './model-viewer-loader'

type ProductPreviewModalProps = {
  product: PreviewProduct | null
  open: boolean
  onClose: () => void
}

const initialRoomProfile: RoomProfile = {
  roomArea: '',
  placementWidth: '',
  viewingDistance: '',
  unsure: false,
}

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)

function evaluateFit(product: PreviewProduct, profile: RoomProfile) {
  const area = parseNumber(profile.roomArea)
  const width = parseNumber(profile.placementWidth)
  const distance = parseNumber(profile.viewingDistance)
  const warnings: string[] = []
  const positives: string[] = []
  let status: FitStatus = profile.unsure ? 'unknown' : 'good'

  if (width !== null) {
    if (width < product.dimensions.widthCm + 8) {
      warnings.push(
        `Chỗ đặt rộng ${width}cm hơi hẹp so với sản phẩm rộng khoảng ${product.dimensions.widthCm}cm. Nên chừa thêm tối thiểu 8cm để thao tác/lưu thông khí.`,
      )
      status = 'warning'
    } else {
      positives.push('Chiều ngang chỗ đặt có vẻ đủ thoải mái.')
    }
  }

  if (
    product.category === 'Máy lạnh' &&
    area !== null &&
    product.dimensions.recommendedAreaMin &&
    product.dimensions.recommendedAreaMax
  ) {
    const { recommendedAreaMin, recommendedAreaMax } = product.dimensions
    if (area < recommendedAreaMin) {
      warnings.push('Công suất có thể hơi dư so với diện tích phòng.')
      status = status === 'good' ? 'warning' : status
    } else if (area > recommendedAreaMax) {
      warnings.push('Công suất có thể chưa đủ mạnh cho diện tích phòng này.')
      status = 'warning'
    } else {
      positives.push('Công suất máy lạnh phù hợp diện tích phòng bạn nhập.')
    }
  }

  if (
    product.category === 'TV' &&
    distance !== null &&
    product.dimensions.recommendedViewingDistanceMin &&
    product.dimensions.recommendedViewingDistanceMax
  ) {
    const min = product.dimensions.recommendedViewingDistanceMin
    const max = product.dimensions.recommendedViewingDistanceMax
    if (distance < min) {
      warnings.push('Khoảng cách xem hơi gần, bạn có thể thấy mỏi mắt với kích thước này.')
      status = 'warning'
    } else if (distance > max) {
      warnings.push('Khoảng cách xem hơi xa, nên cân nhắc TV lớn hơn nếu muốn trải nghiệm tốt hơn.')
      status = status === 'good' ? 'warning' : status
    } else {
      positives.push('Khoảng cách xem phù hợp kích thước TV.')
    }
  }

  if (profile.unsure || (!area && !width && !distance)) {
    status = status === 'warning' ? 'warning' : 'unknown'
  }

  return { status, positives, warnings }
}

const statusCopy: Record<FitStatus, { title: string; className: string }> = {
  good: {
    title: 'Phù hợp với thông tin hiện có',
    className: 'border-[#147D45]/25 bg-[#E8F7EE] text-[#147D45]',
  },
  warning: {
    title: 'Cần kiểm tra lại trước khi mua',
    className: 'border-[#B45309]/25 bg-[#FFF4E5] text-[#B45309]',
  },
  unknown: {
    title: 'Kết quả đang là ước lượng',
    className: 'border-[#D8DEE8] bg-[#EEF2F7] text-[#4B5563]',
  },
}

export function ProductPreviewModal({
  product,
  open,
  onClose,
}: ProductPreviewModalProps) {
  const [profile, setProfile] = useState<RoomProfile>(initialRoomProfile)
  const [viewerReady, setViewerReady] = useState(false)
  const [viewerError, setViewerError] = useState('')

  useEffect(() => {
    if (!open) return

    setViewerReady(false)
    setViewerError('')
    loadModelViewer()
      .then(() => setViewerReady(true))
      .catch(() =>
        setViewerError(
          'Không tải được trình xem 3D. Vui lòng kiểm tra kết nối mạng và thử lại.',
        ),
      )
  }, [open])

  const fit = useMemo(() => {
    if (!product) return null
    return evaluateFit(product, profile)
  }, [product, profile])

  if (!open || !product) return null

  const modelUrl = getModelUrl(product)
  const status = fit ? statusCopy[fit.status] : statusCopy.unknown

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#111827]/55 p-3 backdrop-blur-sm animate-in fade-in duration-200">
      <section className="grid max-h-[92svh] w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-2xl lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="relative min-h-[460px] bg-[radial-gradient(circle_at_top_left,#EAF3FF,transparent_35%),linear-gradient(135deg,#F7F9FC,#EEF2F7)] p-4 sm:p-6">
          <button
            aria-label="Đóng xem trước 3D"
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-[#D8DEE8] bg-white/90 text-[#4B5563] shadow-sm transition hover:border-[#0B63CE]/30 hover:text-[#0B63CE]"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FFD400] px-3 py-1 text-xs font-bold text-[#1F2937]">
              3D Preview
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B63CE] shadow-sm">
              Xoay · Zoom · AR nếu thiết bị hỗ trợ
            </span>
          </div>

          <div className="h-[520px] overflow-hidden rounded-[20px] border border-white/80 bg-white/65 shadow-inner">
            {viewerError ? (
              <div className="grid h-full place-items-center p-8 text-center text-sm text-[#C62828]">
                {viewerError}
              </div>
            ) : viewerReady ? (
              <model-viewer
                ar
                ar-modes="webxr scene-viewer quick-look"
                auto-rotate
                camera-controls
                environment-image="neutral"
                exposure="1"
                interaction-prompt="auto"
                shadow-intensity="1"
                src={modelUrl}
                alt={`Mô hình 3D của ${product.name}`}
                className="h-full w-full"
              />
            ) : (
              <div className="grid h-full place-items-center text-center text-sm text-[#4B5563]">
                <div>
                  <Box className="mx-auto mb-3 size-10 animate-pulse text-[#0B63CE]" />
                  Đang tải trình xem 3D...
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="max-h-[92svh] overflow-y-auto border-l border-[#D8DEE8] bg-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B63CE]">
            {product.category}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-[#111827]">
            {product.name}
          </h2>
          <p className="mt-2 text-lg font-extrabold text-[#0B63CE]">
            {formatPrice(product.price)}
          </p>

          <div className="mt-5 rounded-2xl border border-[#D8DEE8] bg-[#F7F9FC] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Ruler className="size-4 text-[#0B63CE]" />
              Thông tin không gian
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-semibold text-[#4B5563]">
                Diện tích phòng m²
                <Input
                  inputMode="decimal"
                  placeholder="Ví dụ: 18"
                  value={profile.roomArea}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, roomArea: event.target.value }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-[#4B5563]">
                Chiều ngang chỗ đặt cm
                <Input
                  inputMode="decimal"
                  placeholder="Ví dụ: 160"
                  value={profile.placementWidth}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      placementWidth: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-[#4B5563]">
                Khoảng cách xem mét
                <Input
                  inputMode="decimal"
                  placeholder="Ví dụ: 2.8"
                  value={profile.viewingDistance}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      viewingDistance: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm text-[#4B5563]">
                <input
                  checked={profile.unsure}
                  className="mt-1"
                  type="checkbox"
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, unsure: event.target.checked }))
                  }
                />
                Tôi chưa chắc số đo, hãy xem kết quả như ước lượng.
              </label>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${status.className}`}>
            <div className="flex items-center gap-2 text-sm font-bold">
              {fit?.status === 'good' ? (
                <BadgeCheck className="size-4" />
              ) : fit?.status === 'warning' ? (
                <AlertTriangle className="size-4" />
              ) : (
                <Info className="size-4" />
              )}
              {status.title}
            </div>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#111827]">
              {fit?.positives.map((item) => <li key={item}>• {item}</li>)}
              {fit?.warnings.map((item) => <li key={item}>• {item}</li>)}
              {!fit?.positives.length && !fit?.warnings.length ? (
                <li>
                  • AI cần thêm diện tích phòng, chiều ngang chỗ đặt hoặc khoảng cách xem để đánh giá chắc hơn.
                </li>
              ) : null}
            </ul>
          </div>

          <Button className="mt-5 h-11 w-full rounded-full bg-[#0B63CE] text-white hover:bg-[#084EA6]">
            {product.buyLabel}
          </Button>
        </aside>
      </section>
    </div>
  )
}
