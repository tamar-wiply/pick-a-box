
"use client"

import { X } from "lucide-react"

interface CouponPopupProps {
  isOpen: boolean
  onClose: () => void
  prize: {
    type: "prize" | "try-again"
    title: string
    //description: string
    icon: string
  } | null
  shopUrl?: string 
}

export function CouponPopup({ isOpen, onClose, prize, shopUrl = "https://www.wiply.com/home" }: CouponPopupProps) { //change URL per Client!
  if (!isOpen || !prize) return null

  const isWin = prize.type === "prize"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-sm w-full mx-4 relative overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="px-8 py-12 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              {isWin ? "CONGRATULATIONS" : "BETTER LUCK NEXT TIME"}
            </h2>
            <h1 className="text-4xl font-black text-black">
              {isWin ? "YOU WON" : "TRY AGAIN"}
            </h1>
            <div className="w-16 h-0.5 bg-black mx-auto mt-6"></div>
          </div>

          {/* Coupon/Prize Display */}
          <div className="mb-8">
            {isWin ? (
              <div className="relative">
                <div
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-8 px-6 mx-4 relative"
                  style={{
                    clipPath:
                      "polygon(0% 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 0% 100%, 15px 50%)",
                  }}
                >
                 <div className="text-5xl font-black mb-2">
                  {prize.icon}
                </div>
                <div className="text-2xl font-bold">
                   {prize.title}
                 </div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-6xl mb-4">{prize.icon}</div>
                <div className="text-xl font-semibold text-gray-700">{prize.title}</div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isWin ? (
            <button
              onClick={() => {
                window.location.href = shopUrl;
                onClose();
              }}
              className="w-full py-4 text-lg font-bold rounded-xl bg-black hover:bg-gray-600 text-white"
            >
              SHOP NOW
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-4 text-lg font-bold rounded-xl bg-purple-600 hover:bg-purple-900 text-white"
            >
              PLAY AGAIN TOMORROW
            </button>
          )}

          {/* Footer Text */}
          {isWin && <p className="text-indigo-900 text-m mt-4">Thanks for Playing!</p>}
        </div>
      </div>
    </div>
  )
}
