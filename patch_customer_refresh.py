import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add new state variables
if "const [isRefreshing, setIsRefreshing] = useState(false);" not in content:
    content = content.replace(
        "const [loading, setLoading] = useState(true);",
        "const [loading, setLoading] = useState(true);\n  const [isRefreshing, setIsRefreshing] = useState(false);\n  const [hasOrderUpdates, setHasOrderUpdates] = useState(false);\n  const prevOrdersRef = React.useRef<any>(null);"
    )

# 2. Modify fetchProfile to track order updates
old_fetch_profile = """        setEditName(res.data.user.name);
        setEditAddress(res.data.user.address || "");
        setOrders(res.data.customerOrders || []);
        
        // Update selectedOrder if it's currently open"""

new_fetch_profile = """        setEditName(res.data.user.name);
        setEditAddress(res.data.user.address || "");
        
        const newOrders = res.data.customerOrders || [];
        
        // Check for updates
        if (prevOrdersRef.current && JSON.stringify(prevOrdersRef.current) !== JSON.stringify(newOrders)) {
          setHasOrderUpdates(true);
        }
        prevOrdersRef.current = newOrders;
        
        setOrders(newOrders);
        
        // Update selectedOrder if it's currently open"""

content = content.replace(old_fetch_profile, new_fetch_profile)

# 3. Add auto-refresh interval
old_use_effect = """  useEffect(() => {
    fetchProfile();
  }, [navigate]);"""

new_use_effect = """  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        await fetchProfile();
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);"""

if "setInterval(" not in content:
    content = content.replace(old_use_effect, new_use_effect)

# 4. Add the blinking bar at the top
blinking_bar = """
      {/* Blinking Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden pointer-events-none">
        {isRefreshing && <div className="h-full bg-paa-navy animate-[pulse_0.5s_ease-in-out_infinite] w-full" />}
      </div>
"""
if "Blinking Top Bar" not in content:
    content = content.replace("    <>\n      {/* Query Modal */}", "    <>\n" + blinking_bar + "\n      {/* Query Modal */}")

# 5. Add blinking dot next to "My Orders" heading
old_heading = """              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)", marginBottom: "1.5rem" }}>My Orders</h2>"""
new_heading = """              <h2 onClick={() => setHasOrderUpdates(false)} style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                My Orders
                {hasOrderUpdates && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>}
              </h2>"""
content = content.replace(old_heading, new_heading)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
