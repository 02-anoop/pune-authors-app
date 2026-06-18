import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import { User, LogOut, Package, ArrowRight } from "lucide-react";

export function CustomerProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data.user.role !== "CUSTOMER") {
          // If they aren't a customer, redirect them to their respective dashboard
          navigate(res.data.user.role === "ADMIN" ? "/operations" : "/dashboard");
          return;
        }
        setUserData(res.data.user);
        setEditName(res.data.user.name);
        setEditAddress(res.data.user.address || "");
        setOrders(res.data.customerOrders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/profile`, 
        { name: editName, address: editAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", fontFamily: "var(--font-body)" }}>Loading your profile...</div>;

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "calc(100vh - 64px)", background: "#f7f7f9", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: "0.4rem" }}>
              Welcome back, {userData?.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 14, color: "#6b6b80" }}>Manage your profile and track your orders</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "0.6rem 1.2rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem" }} className="profile-grid">
          
          {/* Profile Card */}
          <div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 64, height: 64, background: "#f0f0f4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <User size={32} color="#1a1a2e" />
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, padding: "0.4rem 0.8rem", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#1a1a2e" }}>
                    Edit Profile
                  </button>
                ) : (
                  <button onClick={handleSaveProfile} disabled={saving} style={{ background: "#1a1a2e", border: "none", borderRadius: 6, padding: "0.4rem 0.8rem", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#fff" }}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
              
              {!isEditing ? (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.2rem" }}>{userData?.name}</h2>
                  <div style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.5rem" }}>{userData?.email}</div>
                </>
              ) : (
                <div style={{ marginBottom: "1.5rem" }}>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid rgba(0,0,0,0.15)", marginBottom: "0.5rem", fontSize: 14, fontWeight: 600 }} placeholder="Your Name" />
                  <div style={{ fontSize: 13, color: "#6b6b80" }}>{userData?.email} (Cannot be changed)</div>
                </div>
              )}
              
              <div style={{ borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "1.5rem" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b80", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.8rem" }}>Account Details</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1a1a2e", marginBottom: "0.5rem" }}>
                  <span>Role</span>
                  <span style={{ fontWeight: 600 }}>Reader / Customer</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1a1a2e", marginBottom: "0.5rem" }}>
                  <span>Phone</span>
                  <span style={{ fontWeight: 600 }}>{userData?.phone || "Not provided"}</span>
                </div>
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>Address</span>
                    <textarea rows={2} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid rgba(0,0,0,0.15)", fontSize: 13, resize: "vertical" }} placeholder="Your Address" />
                  </div>
                ) : (
                  userData?.address && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1a1a2e", marginBottom: "0.5rem" }}>
                      <span>Address</span>
                      <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{userData.address}</span>
                    </div>
                  )
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1a1a2e" }}>
                  <span>Member Since</span>
                  <span style={{ fontWeight: 600 }}>{new Date(userData?.createdAt || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Package size={20} color="#2563eb" />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>Your Orders</h2>
              </div>
              
              {orders.length === 0 ? (
                <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, background: "#f0f8ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <Package size={28} color="#2563eb" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.5rem" }}>No orders placed yet</h3>
                  <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.5rem" }}>Looks like you haven't bought any books yet.</p>
                  <Link to="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#1a1a2e", color: "#fff", textDecoration: "none", padding: "0.7rem 1.4rem", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    Explore Catalogue <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f7f7f9", borderBottom: "1px solid rgba(0,0,0,0.05)", textAlign: "left" }}>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order ID</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Qty</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                        <th style={{ padding: "1rem 1.5rem", fontSize: 12, fontWeight: 600, color: "#6b6b80", textTransform: "uppercase", letterSpacing: "0.05em" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        return (
                          <tr key={o.id} style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                            <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-mono)", fontSize: 13, color: "#1a1a2e", fontWeight: 700 }}>
                              #PAA-{o.id.toString().padStart(4, '0')}
                            </td>
                            <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b6b80" }}>
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td colSpan={2} style={{ padding: "1rem 1.5rem", fontSize: 13, color: "#6b6b80" }}>
                              {o.items?.length || 0} books
                            </td>
                            <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
                              ₹{o.amount}
                            </td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              {o.paymentScreenshot ? (
                                <a href={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${o.paymentScreenshot}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Screenshot</a>
                              ) : (
                                <span style={{ fontSize: 12, color: "#6b6b80" }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                {o.items?.map((item: any, idx: number) => (
                                  <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flexDirection: "column" }}>
                                    <span style={{ fontSize: 13, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }} title={item.book?.title}>
                                      {idx + 1}. {item.book?.title}
                                    </span>
                                    <span style={{ 
                                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : '#eff6ff', 
                                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : '#2563eb', 
                                      padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: "1rem"
                                    }}>
                                      {item.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: "1rem 1.5rem", verticalAlign: "middle" }}>
                              <button onClick={() => setSelectedOrder(o)} style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>View Details</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600, padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)" }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b6b80" }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f7f7f9", borderRadius: 8 }}>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: 13, color: "#1a1a2e" }}><strong>Order ID:</strong> #PAA-{selectedOrder.id.toString().padStart(4, '0')}</p>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: 13, color: "#1a1a2e" }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: 13, color: "#1a1a2e" }}><strong>Total Amount:</strong> ₹{selectedOrder.amount}</p>
              <p style={{ margin: "0", fontSize: 13, color: "#1a1a2e" }}><strong>Delivery Address:</strong> {selectedOrder.address || userData?.address}</p>
            </div>
            
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: "1rem" }}>Purchased Items</h3>
            <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7f7f9", textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <th style={{ padding: "0.8rem", fontSize: 12, fontWeight: 600, color: "#6b6b80" }}>Book Title</th>
                    <th style={{ padding: "0.8rem", fontSize: 12, fontWeight: 600, color: "#6b6b80" }}>Price</th>
                    <th style={{ padding: "0.8rem", fontSize: 12, fontWeight: 600, color: "#6b6b80" }}>Qty</th>
                    <th style={{ padding: "0.8rem", fontSize: 12, fontWeight: 600, color: "#6b6b80" }}>Subtotal</th>
                    <th style={{ padding: "0.8rem", fontSize: 12, fontWeight: 600, color: "#6b6b80" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td style={{ padding: "0.8rem", fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>{item.book?.title}</td>
                      <td style={{ padding: "0.8rem", fontSize: 13, color: "#1a1a2e" }}>₹{item.book?.mrp || 0}</td>
                      <td style={{ padding: "0.8rem", fontSize: 13, color: "#1a1a2e" }}>× {item.quantity}</td>
                      <td style={{ padding: "0.8rem", fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>₹{(item.book?.mrp || 0) * item.quantity}</td>
                      <td style={{ padding: "0.8rem" }}>
                        <span style={{ 
                          background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : '#eff6ff', 
                          color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : '#2563eb', 
                          padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: 11, fontWeight: 600 
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
