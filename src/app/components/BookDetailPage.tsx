import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Star, BookOpen, User, Tag, IndianRupee, Send, MessageSquare, Package } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Review {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BookDetail {
  id: number;
  title: string;
  genre: string;
  subGenre: string | null;
  synopsis: string;
  mrp: number;
  coverUrl: string | null;
  stock: number;
  status: string;
  createdAt: string;
  author: {
    name: string;
    bio: string;
    photoUrl: string | null;
    email: string;
  };
  reviews: Review[];
}

const GENRE_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  Fiction: { bg: "#f0f4ff", color: "#3b4fd8", border: "#c7d2fe", label: "Fiction" },
  "Non-Fiction": { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", label: "Non-Fiction" },
  F: { bg: "#f0f4ff", color: "#3b4fd8", border: "#c7d2fe", label: "Fiction" },
  NF: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", label: "Non-Fiction" },
  C: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Children" },
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={onChange ? 28 : 16}
          fill={(hover || value) >= s ? "#f59e0b" : "none"}
          color={(hover || value) >= s ? "#f59e0b" : "#d1d5db"}
          style={{ cursor: onChange ? "pointer" : "default", transition: "all 0.1s" }}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(s)}
        />
      ))}
    </div>
  );
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    fetch(`${API}/api/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBook(data);
      })
      .catch(() => setError("Failed to load book"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim() || reviewRating === 0) {
      setSubmitMsg("Please fill in your name, rating and comment.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch(`${API}/api/books/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerName: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitMsg(data.error || "Failed to submit"); return; }
      // Prepend review locally
      setBook((prev) => prev ? { ...prev, reviews: [data, ...prev.reviews] } : prev);
      setReviewName(""); setReviewRating(0); setReviewComment("");
      setSubmitMsg("✓ Your review has been submitted. Thank you!");
    } catch {
      setSubmitMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#6b6b80" }}>
        <BookOpen size={40} style={{ margin: "0 auto 1rem", opacity: 0.3, display: "block" }} />
        <p>Loading book details…</p>
      </div>
    </div>
  );

  if (error || !book) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "#ef4444", fontWeight: 600 }}>{error || "Book not found"}</p>
      <button onClick={() => navigate("/catalogue")} style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer" }}>Back to Catalogue</button>
    </div>
  );

  const meta = GENRE_COLORS[book.genre] || GENRE_COLORS["Fiction"];
  const avgRating = book.reviews.length > 0
    ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
    : 0;

  return (
    <div style={{ background: "#f8f8fc", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {/* Hero banner */}
      <div style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)`, padding: "2.5rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => navigate("/catalogue")}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: "2rem", backdropFilter: "blur(4px)" }}>
            <ArrowLeft size={14} /> Back to Catalogue
          </button>

          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Cover */}
            <div style={{ width: 200, height: 280, borderRadius: 12, overflow: "hidden", flexShrink: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", background: meta.bg }}>
              {book.coverUrl
                ? <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={60} color={meta.color} style={{ opacity: 0.4 }} />
                  </div>}
            </div>

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 6, padding: "0.25rem 0.7rem", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {meta.label}
                </span>
                {book.subGenre && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "#e2e8f0", borderRadius: 6, padding: "0.25rem 0.7rem", fontSize: 11, fontWeight: 600 }}>
                    {book.subGenre}
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: "0 0 0.5rem" }}>
                {book.title}
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 1rem" }}>by <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{book.author.name}</span></p>

              {/* Rating summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <StarRating value={Math.round(avgRating)} />
                {book.reviews.length > 0
                  ? <span style={{ color: "#94a3b8", fontSize: 13 }}>{avgRating.toFixed(1)} / 5 &nbsp;·&nbsp; {book.reviews.length} review{book.reviews.length !== 1 ? "s" : ""}</span>
                  : <span style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>No ratings yet — be the first!</span>}
              </div>

              {/* Price & stock */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)" }}>₹{book.mrp}</span>
                  <span style={{ fontSize: 12, color: "#64748b", marginLeft: 6 }}>MRP</span>
                </div>
                <div style={{ background: book.stock > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${book.stock > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, padding: "0.35rem 0.85rem", fontSize: 12, fontWeight: 700, color: book.stock > 0 ? "#4ade80" : "#f87171" }}>
                  <Package size={12} style={{ display: "inline", marginRight: 4 }} />
                  {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }} className="book-detail-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Synopsis */}
          <section style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={18} color={meta.color} /> About the Book
            </h2>
            <p style={{ color: "#4b5563", lineHeight: 1.8, fontSize: 15, margin: 0 }}>{book.synopsis || "No synopsis available."}</p>
          </section>

          {/* Author bio */}
          <section style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <User size={18} color={meta.color} /> About the Author
            </h2>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, fontWeight: 700, color: meta.color }}>
                {book.author.photoUrl
                  ? <img src={book.author.photoUrl} alt={book.author.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : book.author.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 700, color: "#1a1a2e", margin: "0 0 0.5rem", fontSize: 16 }}>{book.author.name}</p>
                <p style={{ color: "#6b7280", lineHeight: 1.75, fontSize: 14, margin: 0 }}>{book.author.bio || "No bio available."}</p>
              </div>
            </div>
          </section>

          {/* Reviews list */}
          <section style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare size={18} color={meta.color} /> Reader Reviews
              {book.reviews.length > 0 && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>{book.reviews.length} review{book.reviews.length !== 1 ? "s" : ""}</span>}
            </h2>
            {book.reviews.length === 0
              ? <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                  <Star size={32} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, margin: 0 }}>No reviews yet.</p>
                  <p style={{ fontSize: 13, margin: "0.25rem 0 0" }}>Be the first to share your thoughts!</p>
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {book.reviews.map((r) => (
                    <div key={r.id} style={{ borderLeft: `3px solid ${meta.border}`, paddingLeft: "1rem", paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{r.reviewerName}</span>
                        <StarRating value={r.rating} />
                        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>}
          </section>

          {/* Write a review */}
          <section style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1.5rem" }}>Write a Review</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                placeholder="Your name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", transition: "border 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = meta.color)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 0.5rem" }}>Your Rating</p>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                placeholder="Share your thoughts about this book…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", transition: "border 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = meta.color)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              {submitMsg && (
                <p style={{ fontSize: 13, color: submitMsg.startsWith("✓") ? "#16a34a" : "#ef4444", fontWeight: 600, margin: 0 }}>{submitMsg}</p>
              )}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: meta.color, color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "var(--font-body)", alignSelf: "flex-start" }}>
                <Send size={14} />
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick details */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1.25rem" }}>Book Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[
                { icon: <Tag size={14} />, label: "Genre", value: meta.label },
                book.subGenre ? { icon: <Tag size={14} />, label: "Sub-Genre", value: book.subGenre } : null,
                { icon: <IndianRupee size={14} />, label: "Price (MRP)", value: `₹${book.mrp}` },
                { icon: <Package size={14} />, label: "Stock", value: book.stock > 0 ? `${book.stock} available` : "Out of stock" },
                {
                  icon: <Star size={14} />,
                  label: "Rating",
                  value: book.reviews.length > 0 ? `${avgRating.toFixed(1)} / 5 (${book.reviews.length} reviews)` : "Unrated"
                },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", paddingBottom: "0.85rem", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6b7280", fontSize: 13 }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 13, textAlign: "right" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating breakdown */}
          {book.reviews.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f5" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 1.25rem" }}>Rating Breakdown</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#1a1a2e", fontFamily: "var(--font-mono)", lineHeight: 1 }}>{avgRating.toFixed(1)}</span>
                <div>
                  <StarRating value={Math.round(avgRating)} />
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "0.3rem 0 0" }}>{book.reviews.length} review{book.reviews.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = book.reviews.filter((r) => r.rating === star).length;
                const pct = book.reviews.length > 0 ? (count / book.reviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: 12, color: "#6b7280", minWidth: 10 }}>{star}</span>
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 16 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Published info */}
          <div style={{ background: `linear-gradient(135deg, ${meta.bg}, #fff)`, borderRadius: 16, padding: "1.5rem", border: `1px solid ${meta.border}` }}>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 0.25rem" }}>Listed on</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", margin: 0 }}>
              {new Date(book.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0.75rem 0 0" }}>Pune Authors' Association</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .book-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
