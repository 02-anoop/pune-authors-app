import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { LogIn, UserPlus } from "lucide-react";

export function AuthPage({ type }: { type: "login" | "signup" }) {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as "CUSTOMER" | "AUTHOR") || "CUSTOMER";
  const [roleSelection, setRoleSelection] = useState<"CUSTOMER" | "AUTHOR">(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();

  // Sync role when type changes (e.g., clicking the bottom link)
  useEffect(() => {
    const role = searchParams.get("role") as "CUSTOMER" | "AUTHOR";
    if (role) setRoleSelection(role);
  }, [searchParams, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError("");
    if (type === "signup" && roleSelection === "AUTHOR") {
      navigate("/register");
      return;
    }

    try {
      if (type === "signup") {
        await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/register`, { name, email, phone, address, password, role: roleSelection });
        alert("Registration successful! Please login.");
        navigate(`/login?role=${roleSelection}`);
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/login`, { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.role);
        
        if (res.data.role === "ADMIN") navigate("/operations");
        else if (res.data.role === "AUTHOR") navigate("/dashboard");
        else navigate("/profile");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "An error occurred";
      if (type === "signup" && errorMsg === 'Email already exists') {
        setSignupError("An account with this email already exists.");
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f9", padding: "2rem 1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", padding: "2.5rem 2rem", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#1a1a2e" }}>
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p style={{ fontSize: 14, color: "#6b6b80", marginTop: "0.5rem" }}>
            {type === "login" ? "Login to access your dashboard" : "Sign up to join Pune Authors' Association"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
            <button 
              type="button" 
              onClick={() => setRoleSelection("CUSTOMER")}
              style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: roleSelection === "CUSTOMER" ? "2px solid #b44d28" : "1px solid #e5e7eb", background: roleSelection === "CUSTOMER" ? "#fff5f0" : "#f9fafb", fontWeight: 600, color: roleSelection === "CUSTOMER" ? "#b44d28" : "#6b7280", cursor: "pointer", transition: "all 0.2s" }}
            >
              Customer
            </button>
            <button 
              type="button" 
              onClick={() => setRoleSelection("AUTHOR")}
              style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: roleSelection === "AUTHOR" ? "2px solid #b44d28" : "1px solid #e5e7eb", background: roleSelection === "AUTHOR" ? "#fff5f0" : "#f9fafb", fontWeight: 600, color: roleSelection === "AUTHOR" ? "#b44d28" : "#6b7280", cursor: "pointer", transition: "all 0.2s" }}
            >
              Author
            </button>
          </div>

          {type === "signup" && roleSelection === "AUTHOR" ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <p style={{ marginBottom: "1.5rem", color: "#6b6b80", fontSize: 14, lineHeight: "1.5" }}>
                Authors must complete a comprehensive application process to publish and sell their books with us.
              </p>
              <button type="button" onClick={() => navigate("/register")} style={{ width: "100%", padding: "0.8rem", borderRadius: 8, background: "#b44d28", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                Proceed to Author Application
              </button>
            </div>
          ) : (
            <>
              {type === "signup" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Full Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Phone Number</label>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Address</label>
                    <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", boxSizing: "border-box", resize: "vertical" }} />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", boxSizing: "border-box" }} />
              </div>

              {signupError && (
                <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1rem", borderRadius: 8, fontSize: 13, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 600 }}>{signupError}</div>
                  <div>
                    Would you like to <button type="button" onClick={() => navigate(`/login?role=${roleSelection}`)} style={{ background: "none", border: "none", color: "#b44d28", fontWeight: 700, padding: 0, cursor: "pointer", textDecoration: "underline" }}>Sign in instead</button>?
                  </div>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                style={{
                  width: "100%", padding: "0.8rem", borderRadius: 8, border: "none",
                  background: "#1a1a2e", color: "#fff", fontSize: 15, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem"
                }}
              >
                {type === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
                {loading ? "Please wait..." : type === "login" ? "Login" : "Sign Up"}
              </button>
            </>
          )}
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 14, color: "#6b6b80" }}>
          {type === "login" ? (
            <>Don't have an account? <Link to={`/signup?role=${roleSelection}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign up</Link></>
          ) : (
            <>Already have an account? <Link to={`/login?role=${roleSelection}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Login</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
