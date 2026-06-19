import React from 'react';
import { Check, Clock, Package, Truck, Home, ThumbsUp } from 'lucide-react';

export function OrderFulfillmentTimeline({ currentStatus, trackingNumber }: { currentStatus: string, trackingNumber?: string }) {
  const stages = [
    { id: 'Pending Verification', label: 'Order Placed', icon: <Clock size={16} /> },
    { id: 'Approved', label: 'Payment Verified', icon: <Check size={16} /> },
    { id: 'Accepted', label: 'Accepted by Author', icon: <ThumbsUp size={16} /> },
    { id: 'Dispatched', label: 'Dispatched', icon: <Package size={16} /> },
    { id: 'In Transit', label: 'In Transit', icon: <Truck size={16} /> },
    { id: 'Delivered', label: 'Out for Delivery', icon: <Truck size={16} /> },
    { id: 'Completed', label: 'Delivered', icon: <Home size={16} /> }
  ];

  // Helper to determine active index based on current status
  const getActiveIndex = () => {
    const exactMatch = stages.findIndex(s => s.id === currentStatus);
    if (exactMatch !== -1) return exactMatch;
    
    // Fallbacks
    if (currentStatus === 'Pending') return 0;
    return 0; // Default
  };

  const activeIndex = getActiveIndex();

  return (
    <div style={{ padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
        Track Order Status
      </h4>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        {/* Progress Bar Background */}
        <div style={{ position: 'absolute', top: 16, left: 24, right: 24, height: 4, background: '#f0f0f4', zIndex: 1, borderRadius: 2 }} />
        
        {/* Active Progress Bar */}
        <div style={{ 
          position: 'absolute', top: 16, left: 24, 
          width: `calc(${(activeIndex / (stages.length - 1)) * 100}% - 24px)`, 
          height: 4, background: '#10b981', zIndex: 2, borderRadius: 2, transition: 'width 0.4s ease' 
        }} />

        {stages.map((stage, idx) => {
          const isActive = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '14%' }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: isActive ? '#10b981' : '#fff', 
                border: isActive ? 'none' : '2px solid #e2e8f0',
                color: isActive ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem',
                boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isActive ? <Check size={16} strokeWidth={3} /> : stage.icon}
              </div>
              <span style={{ 
                fontSize: 11, fontWeight: isCurrent ? 700 : 500, 
                color: isCurrent ? '#1a1a2e' : isActive ? '#64748b' : '#94a3b8', 
                textAlign: 'center', lineHeight: 1.2
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {trackingNumber && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Package size={18} color="#3b82f6" />
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tracking Number</div>
            <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{trackingNumber}</div>
          </div>
        </div>
      )}
    </div>
  );
}
