import { Calendar, MapPin, Clock, Users, BookOpen, Filter, ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CustomerGallery } from "./CustomerGallery";

interface EventRecord {
  id: number;
  location: string;
  place: string;
  city: string;
  date: string;
  duration: string;
  authors: number;
  booksSold: number;
  type: string;
  description: string;
  photoUrl: string;
  images?: { id: number; url: string; caption?: string; dateTaken?: string }[];
}

const typeColors: Record<string, { color: string; bg: string; border: string }> = {
  "Literary Event": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Book Fair": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Corporate Activation": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Airport Library": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
};

// --- FADE IN ON SCROLL (SUBTLE) ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : `translateY(15px)`,
        transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function EventLogPage() {
  const [stats, setStats] = useState({ events: 0, booksSold: 0, authors: 0 });

  useEffect(() => {
    // Fetch stats for the hero section
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/gallery`)
      .then(res => {
        const events = res.data || [];
        setStats({
          events: events.length,
          booksSold: events.reduce((acc: number, e: any) => acc + (e.booksSold || 0), 0),
          authors: new Set(events.map((e: any) => e.authors)).size
        });
      })
      .catch(console.error);
  }, []);

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      {/* ── GALLERY ── */}
      <section style={{ padding: "0" }}>
         <div style={{ width: "100%", margin: "0 auto" }}>
            <CustomerGallery />
         </div>
      </section>
    </main>
  );
}
