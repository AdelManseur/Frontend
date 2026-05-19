import React from "react";
import Card from "../../ui/Card";
import Avatar from "../../ui/Avatar";
import { Info } from "lucide-react";
import Link from "next/link";

interface OrdersSectionProps {
  orders?: any[];
}

export default function OrdersSection({ orders = [] }: OrdersSectionProps) {
  return (
    <div className="glass-card-dark mb-8 overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--jm-seller-border)" }}>
        <h2 className="text-lg font-bold text-white">Active Orders ({orders.length})</h2>
        {orders.length > 0 && (
          <Link href="/orders-to-sell" className="text-sm font-semibold transition-colors hover:underline" style={{ color: "var(--jm-violet)" }}>
            Manage Orders &rarr;
          </Link>
        )}
      </div>

      <div>
        {orders.length === 0 ? (
          <div className="p-6">
            <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--jm-violet)" }} />
              <div>
                <p className="text-[15px] font-semibold text-white">No active orders</p>
                <p className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  You currently have no active orders. Keep promoting your gigs to get more sales!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--jm-seller-border)" }}>
            {orders.map((order, idx) => (
              <div 
                key={order._id || idx} 
                className="p-4 px-6 flex items-center justify-between transition-colors cursor-pointer"
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                style={{ borderBottom: "1px solid var(--jm-seller-border)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(255,255,255,0.2)]">
                    <img src={order.buyer?.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} alt="Buyer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{order.buyer?.name || `Buyer ${idx + 1}`}</p>
                    <p className="text-[13px] truncate max-w-[200px]" style={{ color: "rgba(255,255,255,0.6)" }}>Order #{order._id?.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden md:block">
                    <p className="text-[12px] uppercase font-semibold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Due</p>
                    <p className="text-[14px] font-bold text-white">
                      {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] uppercase font-semibold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Value</p>
                    <p className="text-[14px] font-bold text-white">{order.price.toLocaleString()} DA</p>
                  </div>
                  <div className="w-[100px] text-center">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-[12px] font-bold" 
                      style={{ background: "rgba(124,58,237,0.2)", color: "#C4B5FD" }}
                    >
                      {order.status === "in_revision" ? "Revision" : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
