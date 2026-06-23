import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Star, BookOpen, User, Tag, IndianRupee, Send, MessageSquare, Package } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:3001").trim();

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
    extraData?: any;
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
    <div style={{ background: "#fafafa", minHeight: "100vh", fontFamily: "var(--font-body)", color: "#111" }}>
      {/* Hero banner */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eaeaea", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => navigate("/catalogue")}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", color: "#333", border: "1px solid #eaeaea", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 500, marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#111"; e.currentTarget.style.borderColor = "#111"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
            <ArrowLeft size={14} /> Back to Catalogue
          </button>

          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Cover */}
            <div style={{ width: 220, height: 320, border: "1px solid #eaeaea", background: "#fff", padding: "0.5rem", flexShrink: 0 }}>
              {book.coverUrl
                ? <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${API}${book.coverUrl.startsWith('/') ? book.coverUrl : '/' + book.coverUrl}`} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
                    <BookOpen size={40} color="#ccc" />
                  </div>}
            </div>

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={{ color: "#b44d28", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {meta.label}
                </span>
                {book.subGenre && (
                  <>
                    <span style={{ color: "#ccc" }}>/</span>
                    <span style={{ color: "#333", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {book.subGenre}
                    </span>
                  </>
                )}
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, margin: "0 0 1rem", letterSpacing: "-0.01em" }}>
                {book.title}
              </h1>
              <p style={{ color: "#333", fontSize: 15, margin: "0 0 1.5rem", fontWeight: 400 }}>by <span style={{ color: "#111", fontWeight: 400 }}>{book.author.name}</span></p>

              {/* Rating summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <StarRating value={Math.round(avgRating)} />
                {book.reviews.length > 0
                  ? <span style={{ color: "#333", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{avgRating.toFixed(1)} / 5 &nbsp;·&nbsp; {book.reviews.length} review{book.reviews.length !== 1 ? "s" : ""}</span>
                  : <span style={{ color: "#555", fontSize: 12, fontStyle: "italic" }}>No ratings yet — be the first!</span>}
              </div>

              {/* Price & stock */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: 32, fontWeight: 400, color: "#111", fontFamily: "var(--font-display)" }}>₹{book.mrp}</span>
                  <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>MRP</span>
                </div>
                
                <div style={{ background: "transparent", border: `1px solid ${book.stock > 0 ? "#111" : "#eaeaea"}`, borderRadius: 20, padding: "0.3rem 0.8rem", fontSize: 11, fontWeight: 500, color: book.stock > 0 ? "#111" : "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Package size={12} style={{ display: "inline", marginRight: 6, marginTop: -2 }} />
                  {book.stock > 0 ? `In stock` : "Out of stock"}
                </div>
                {book.stock > 0 && (
                  <button onClick={() => navigate("/checkout", { state: { cart: [book.id] } })} style={{ background: "#111", color: "#fff", border: "none", padding: "0.8rem 2rem", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", transition: "opacity 0.2s", marginLeft: "auto" }} onMouseEnter={e => e.currentTarget.style.opacity="0.8"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                    Purchase Book
                  </button>
                )}

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
          <section style={{ background: "#fff", border: "1px solid #eaeaea", padding: "3rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", margin: "0 0 1.5rem" }}>
              About the Book
            </h2>
            <div style={{ width: 30, height: 1, background: "#111", marginBottom: "1.5rem" }}></div>
            <p style={{ color: "#222", lineHeight: 1.8, fontSize: 14, margin: 0, fontWeight: 400 }}>{book.synopsis || "No synopsis available."}</p>
          </section>

          {/* Author bio */}
          <section style={{ background: "#fff", border: "1px solid #eaeaea", padding: "3rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", margin: "0 0 1.5rem" }}>
              About the Author
            </h2>
            <div style={{ width: 30, height: 1, background: "#111", marginBottom: "2rem" }}></div>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, fontWeight: 700, color: meta.color }}>
                {book.author.photoUrl
                  ? <img src={book.author.photoUrl} alt={book.author.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : book.author.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 700, color: "#1a1a2e", margin: "0 0 0.5rem", fontSize: 16 }}>{book.author.name}</p>
                <p style={{ color: "#6b7280", lineHeight: 1.75, fontSize: 14, margin: 0 }}>{book.author.bio || "No bio available."}</p>
                {book.author.extraData && Object.keys(book.author.extraData).length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f5' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Additional Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                      {Object.entries(book.author.extraData).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600 }}>{k}</span>
                          <span style={{ display: 'block', fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews list */}
          <section style={{ background: "#fff", border: "1px solid #eaeaea", padding: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", margin: 0 }}>Reader Reviews</h2>
              {book.reviews.length > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>{book.reviews.length} review{book.reviews.length !== 1 ? "s" : ""}</span>}
            </div>
            <div style={{ width: 30, height: 1, background: "#111", marginBottom: "2rem" }}></div>
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
          <section style={{ background: "#fff", border: "1px solid #eaeaea", padding: "3rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", margin: "0 0 1.5rem" }}>Write a Review</h2>
            <div style={{ width: 30, height: 1, background: "#111", marginBottom: "2rem" }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <input
                placeholder="Your Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                style={{ border: "none", borderBottom: "1px solid #eaeaea", padding: "0.5rem 0", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", transition: "border 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#111")}
                onBlur={(e) => (e.target.style.borderColor = "#eaeaea")}
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
                style={{ border: "none", borderBottom: "1px solid #eaeaea", padding: "0.5rem 0", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", resize: "none", transition: "border 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#111")}
                onBlur={(e) => (e.target.style.borderColor = "#eaeaea")}
              />
              {submitMsg && (
                <p style={{ fontSize: 11, color: submitMsg.startsWith("✓") ? "#111" : "#b44d28", fontWeight: 500, margin: 0 }}>{submitMsg}</p>
              )}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#111", color: "#fff", border: "none", padding: "1rem 2rem", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "var(--font-body)", alignSelf: "flex-start", transition: "opacity 0.2s" }}>
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick details */}
          <div style={{ background: "#fff", border: "1px solid #eaeaea", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "#111", margin: "0 0 1.5rem" }}>Book Details</h3>
            <div style={{ width: 20, height: 1, background: "#111", marginBottom: "1.5rem" }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: <Tag size={14} />, label: "Genre", value: meta.label },
                book.subGenre ? { icon: <Tag size={14} />, label: "Sub-Genre", value: book.subGenre } : null,
                { icon: <IndianRupee size={14} />, label: "Price (MRP)", value: `₹${book.mrp}` },
                { icon: <Package size={14} />, label: "Stock", value: book.stock > 0 ? "In Stock" : "Out of stock" },
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
            <div style={{ background: "#fff", border: "1px solid #eaeaea", padding: "2rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "#111", margin: "0 0 1.5rem" }}>Rating Breakdown</h3>
              <div style={{ width: 20, height: 1, background: "#111", marginBottom: "1.5rem" }}></div>
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
          <div style={{ background: "#f3f3f3", padding: "2rem", border: "1px solid #eaeaea" }}>
            <p style={{ fontSize: 10, color: "#555", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Listed on</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "#111", margin: 0 }}>
              {new Date(book.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 11, color: "#333", margin: "1rem 0 0" }}>Pune Authors' Association</p>
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
