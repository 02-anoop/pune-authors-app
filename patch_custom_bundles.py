import os

author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

# 1. Update ProfileSettings component to add Bundle Offers state
state_target = "const [editProfileForm, setEditProfileForm] = useState({"
state_replace = """  const [bundleForm, setBundleForm] = useState({
    bundleBuyCount: dashboardData?.authorProfile?.extraData?.bundleRule?.buyCount || 3,
    bundleDiscount: dashboardData?.authorProfile?.extraData?.bundleRule?.discount || 50,
    bundleEnabled: dashboardData?.authorProfile?.extraData?.bundleRule?.enabled || false
  });
  const [bundleSaving, setBundleSaving] = useState(false);

  const handleSaveBundle = async () => {
    setBundleSaving(true);
    try {
      const extraData = dashboardData?.authorProfile?.extraData || {};
      extraData.bundleRule = {
        buyCount: Number(bundleForm.bundleBuyCount),
        discount: Number(bundleForm.bundleDiscount),
        enabled: bundleForm.bundleEnabled
      };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Bundle Offer updated successfully!');
    } catch (err) {
      alert('Failed to update Bundle Offer');
    } finally {
      setBundleSaving(false);
    }
  };

  const [editProfileForm, setEditProfileForm] = useState({"""
if "const [bundleForm, setBundleForm]" not in author_content:
    author_content = author_content.replace(state_target, state_replace)

# 2. Inject Bundle Offer UI in ProfileSettings
ui_target = """      </form>
    </div>
  );
}"""
ui_replace = """      </form>
    </div>

    {/* BUNDLE OFFER CONFIGURATION */}
    <div className="bg-white p-8 border border-paa-navy/5 shadow-premium mt-8">
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Dynamic Bundle Offers</h2>
        <p className="text-sm text-gray-500 mt-1">Configure an automated discount rule for customers buying multiple books from you.</p>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <input 
            type="checkbox" 
            id="bundleEnabled"
            checked={bundleForm.bundleEnabled}
            onChange={e => setBundleForm({...bundleForm, bundleEnabled: e.target.checked})}
            className="w-5 h-5 accent-paa-navy"
          />
          <label htmlFor="bundleEnabled" className="text-sm font-bold text-paa-navy">Enable Bundle Offer for my books</label>
        </div>

        {bundleForm.bundleEnabled && (
          <div className="grid grid-cols-2 gap-6 bg-white p-6 border border-paa-navy/10 rounded-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Buy (Number of Books)</label>
              <input 
                type="number" 
                min="2"
                className="dash-input w-full" 
                value={bundleForm.bundleBuyCount} 
                onChange={e => setBundleForm({...bundleForm, bundleBuyCount: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Get Discount (₹)</label>
              <input 
                type="number" 
                min="0"
                className="dash-input w-full" 
                value={bundleForm.bundleDiscount} 
                onChange={e => setBundleForm({...bundleForm, bundleDiscount: Number(e.target.value)})} 
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded text-blue-800">
                <strong>Preview:</strong> "Buy {bundleForm.bundleBuyCount}+ books by this author, get ₹{bundleForm.bundleDiscount} off!"
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveBundle}
            disabled={bundleSaving} 
            className="bg-paa-gold text-paa-navy font-bold uppercase tracking-widest px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {bundleSaving ? 'Saving...' : 'Save Bundle Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}"""
if "Dynamic Bundle Offers" not in author_content:
    author_content = author_content.replace(ui_target, ui_replace)

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Author Dashboard updated with Bundle Offer config")


# 3. Update CheckoutPage.tsx
checkout_path = "src/app/components/CheckoutPage.tsx"
with open(checkout_path, "r", encoding="utf-8") as f:
    checkout_content = f.read()

checkout_bundle_target = """  // Phase 6, Task 9: Bundle Offers - Buy 3 get Rs 50 off dynamically in checkout
  const bundleDiscount = currentGroupQty >= 3 ? 50 : 0;"""
checkout_bundle_replace = """  // Phase 6, Task 9: Bundle Offers - Dynamic per author rule
  let bundleDiscount = 0;
  let bundleMessage = "";
  if (currentAuthor?.extraData?.bundleRule?.enabled) {
     const rule = currentAuthor.extraData.bundleRule;
     if (currentGroupQty >= rule.buyCount) {
        bundleDiscount = rule.discount;
        bundleMessage = `🎉 Bundle Offer Applied: Buy ${rule.buyCount}+ Books, Get ₹${rule.discount} Off!`;
     }
  }"""
if "bundleDiscount = rule.discount" not in checkout_content:
    checkout_content = checkout_content.replace(checkout_bundle_target, checkout_bundle_replace)

checkout_ui_target = """                {bundleDiscount > 0 && (
                   <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: 13, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                      🎉 Bundle Offer Applied: Buy 3+ Books, Get ₹50 Off!
                   </div>
                )}"""
checkout_ui_replace = """                {bundleDiscount > 0 && (
                   <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: 13, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                      {bundleMessage}
                   </div>
                )}"""
if "{bundleMessage}" not in checkout_content:
    checkout_content = checkout_content.replace(checkout_ui_target, checkout_ui_replace)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(checkout_content)
print("Checkout Page updated with dynamic bundle config")


# 4. Update CataloguePage.tsx
cat_path = "src/app/components/CataloguePage.tsx"
with open(cat_path, "r", encoding="utf-8") as f:
    cat_content = f.read()

cat_ui_target = """                  <span className="bg-paa-gold/20 text-paa-navy px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-paa-gold/30">
                    ₹{book.mrp || 428} MRP
                  </span>"""
cat_ui_replace = cat_ui_target + """
                  {book.author?.extraData?.bundleRule?.enabled && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200 shadow-sm ml-2">
                      🎁 Buy {book.author.extraData.bundleRule.buyCount}+ Get ₹{book.author.extraData.bundleRule.discount} Off
                    </span>
                  )}"""
if "🎁 Buy" not in cat_content:
    cat_content = cat_content.replace(cat_ui_target, cat_ui_replace)
    
cat_ui_target_2 = """          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {book.author?.name}</span>"""
cat_ui_replace_2 = """          {book.author?.extraData?.bundleRule?.enabled && (
             <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm mb-4 font-bold flex items-center gap-2">
                🎁 Bundle Offer: Buy {book.author.extraData.bundleRule.buyCount} or more books by {book.author.name} and get ₹{book.author.extraData.bundleRule.discount} off your entire order instantly!
             </div>
          )}
""" + cat_ui_target_2
if "🎁 Bundle Offer: Buy" not in cat_content:
    cat_content = cat_content.replace(cat_ui_target_2, cat_ui_replace_2)

with open(cat_path, "w", encoding="utf-8") as f:
    f.write(cat_content)
print("Catalogue Page updated with bundle offer suggestions")
