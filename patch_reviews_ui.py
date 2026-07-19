import os

# --- Author Dashboard Updates ---
author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

# Add link
nav_target = "<Link onClick={() => setIsMobileMenuOpen(false)} to=\"/dashboard/gallery\""
nav_replace = "<Link onClick={() => setIsMobileMenuOpen(false)} to=\"/dashboard/reviews\" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/reviews') ? 'active' : ''}`}><Star className=\"w-4 h-4\"/> Reviews & Ratings</Link>\n            " + nav_target
if "/dashboard/reviews" not in author_content:
    author_content = author_content.replace(nav_target, nav_replace)

# Add Route
route_target = "<Route path=\"/gallery\" element={<AuthorGallery />} />"
route_replace = "<Route path=\"/reviews\" element={<AuthorReviews books={dashboardData.authorProfile.books} />} />\n            " + route_target
if "<Route path=\"/reviews\"" not in author_content:
    author_content = author_content.replace(route_target, route_replace)

# Add Component
author_reviews_comp = """
function AuthorReviews({ books }: { books: any[] }) {
  const booksWithReviews = books.filter(b => b.reviews && b.reviews.length > 0);
  
  if (booksWithReviews.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl-2xl border border-gray-100 border-dashed">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-paa-navy">No reviews yet</h3>
        <p className="text-gray-500 text-sm mt-1">Your books haven't received any customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Customer Reviews & Ratings</h2>
        <p className="text-sm text-gray-500 mt-1">See what readers are saying about your published works.</p>
      </div>
      
      {booksWithReviews.map(book => {
        const avgRating = book.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / book.reviews.length;
        return (
          <div key={book.id} className="bg-white rounded-3xl-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-paa-navy text-lg">{book.title}</h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-paa-navy">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({book.reviews.length} reviews)</span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {book.reviews.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm text-paa-navy">{r.reviewerName}</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                  <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
"""
if "function AuthorReviews" not in author_content:
    author_content += "\n\n" + author_reviews_comp

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Author UI patched")

# --- Admin Dashboard Updates ---
admin_path = "src/app/components/OperationsDashboardPage.tsx"
with open(admin_path, "r", encoding="utf-8") as f:
    admin_content = f.read()

tabs_target = "'Gallery Review']"
tabs_replace = "'Gallery Review', 'Reviews']"
if "'Reviews'" not in admin_content:
    admin_content = admin_content.replace(tabs_target, tabs_replace)

ui_target = "{activeTab === 'Gallery Review' && <GalleryReviewTab />}"
ui_replace = ui_target + "\n        {activeTab === 'Reviews' && <AdminReviewsTab />}"
if "<AdminReviewsTab />" not in admin_content:
    admin_content = admin_content.replace(ui_target, ui_replace)

admin_reviews_comp = """
function AdminReviewsTab() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setReviews(res.data);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy"/></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Global Book Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor all customer feedback and ratings across the platform.</p>
        </div>
        <div className="bg-paa-navy text-paa-cream px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
          <Star className="w-4 h-4"/> {reviews.length} Total Reviews
        </div>
      </div>

      <div className="bg-white rounded-3xl-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Reviewer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Book</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Rating</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Feedback</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-paa-navy">{r.reviewerName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-paa-navy line-clamp-1">{r.book?.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">by {r.book?.author?.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex bg-amber-50 text-amber-700 px-2 py-1 rounded-lg w-fit items-center gap-1">
                    <span className="font-bold text-sm">{r.rating}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 line-clamp-2 min-w-[200px] italic">"{r.comment}"</p>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No reviews found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""
if "function AdminReviewsTab" not in admin_content:
    admin_content += "\n\n" + admin_reviews_comp

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin_content)
print("Admin UI patched")
