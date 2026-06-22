import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { ArrowRight } from "lucide-react";

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
        
        if (res.data.role !== "ADMIN" && res.data.role !== roleSelection) {
          alert(`Error: Invalid credentials for ${roleSelection} login. This account belongs to a ${res.data.role}.`);
          setLoading(false);
          return;
        }

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

  const inputStyle = {
    width: "100%",
    padding: "0.8rem 0",
    border: "none",
    borderBottom: "1px solid #eaeaea",
    background: "transparent",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    color: "#111",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-[#F8FAFC] font-sans text-paa-navy">
      {/* LEFT SIDE (Image / Branding) - Hidden on small screens */}
      <div className="hidden lg:flex flex-1 bg-paa-navy text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-paa-gold/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-[10px] font-bold tracking-widest uppercase text-paa-gold mb-8">
            Pune Authors' Association
          </div>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-medium text-white leading-[1.1] tracking-tight max-w-lg mb-6">
            {type === "login" ? "Welcome back to the collective." : "Join our literary community."}
          </h1>
          <p className="text-sm text-white/70 max-w-md leading-relaxed font-normal">
            {type === "login" 
              ? "Sign in to your account to manage your profile, books, and event registrations." 
              : "Create an account to explore local literature or join as a published author."}
          </p>
        </div>
        
        <div className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-[10px] text-white/50 tracking-widest uppercase font-bold">
            A literary collective since 2015.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-[420px]">
          {/* Role Tabs */}
          <div className="flex gap-6 border-b border-paa-navy/10 mb-10">
            <button 
              type="button" 
              onClick={() => setRoleSelection("CUSTOMER")}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 mb-[-1px] ${roleSelection === "CUSTOMER" ? "text-paa-navy border-b-2 border-paa-navy" : "text-gray-400 border-b-2 border-transparent hover:text-paa-navy/70"}`}
            >
              Reader
            </button>
            <button 
              type="button" 
              onClick={() => setRoleSelection("AUTHOR")}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 mb-[-1px] ${roleSelection === "AUTHOR" ? "text-paa-navy border-b-2 border-paa-navy" : "text-gray-400 border-b-2 border-transparent hover:text-paa-navy/70"}`}
            >
              Author
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {type === "signup" && roleSelection === "AUTHOR" ? (
              <div className="py-4">
                <div className="bg-paa-gold/10 border border-paa-gold/20 rounded-2xl p-6 mb-8">
                  <p className="text-sm text-paa-navy leading-relaxed font-normal">
                    Authors must complete a comprehensive application process to publish and sell their books with us. This includes portfolio review and a registration fee.
                  </p>
                </div>
                <button type="button" onClick={() => navigate("/register")} className="dash-btn dash-btn-primary w-full flex justify-between items-center px-6 py-4 rounded-full text-xs">
                  Begin Application <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                {type === "signup" && (
                  <>
                    <div>
                      <input required type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pb-3 border-b border-paa-navy/10 bg-transparent text-sm text-paa-navy outline-none focus:border-paa-navy transition-colors placeholder:text-gray-400" />
                    </div>
                    <div>
                      <input required type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pb-3 border-b border-paa-navy/10 bg-transparent text-sm text-paa-navy outline-none focus:border-paa-navy transition-colors placeholder:text-gray-400" />
                    </div>
                    <div>
                      <input required type="text" placeholder="City / Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pb-3 border-b border-paa-navy/10 bg-transparent text-sm text-paa-navy outline-none focus:border-paa-navy transition-colors placeholder:text-gray-400" />
                    </div>
                  </>
                )}

                <div>
                  <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pb-3 border-b border-paa-navy/10 bg-transparent text-sm text-paa-navy outline-none focus:border-paa-navy transition-colors placeholder:text-gray-400" />
                </div>

                <div>
                  <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pb-3 border-b border-paa-navy/10 bg-transparent text-sm text-paa-navy outline-none focus:border-paa-navy transition-colors placeholder:text-gray-400" />
                </div>

                {signupError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-medium">
                    {signupError}
                    <div className="mt-2">
                      <button type="button" onClick={() => navigate(`/login?role=${roleSelection}`)} className="text-paa-navy font-bold hover:underline transition-all">Sign in instead</button>
                    </div>
                  </div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className={`dash-btn dash-btn-primary w-full flex justify-center items-center py-3.5 rounded-full mt-4 transition-all ${loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
                >
                  {loading ? <span className="animate-pulse">Authenticating...</span> : type === "login" ? "Sign In" : "Create Account"}
                </button>
              </>
            )}
          </form>

          <div className="mt-12 text-xs text-gray-500 border-t border-paa-navy/10 pt-8 flex items-center justify-center gap-1.5 font-medium">
            {type === "login" ? (
              <>Don't have an account? <Link to={`/signup?role=${roleSelection}`} className="text-paa-navy font-bold border-b border-paa-navy pb-0.5 hover:text-paa-gold hover:border-paa-gold transition-colors">Sign up</Link></>
            ) : (
              <>Already have an account? <Link to={`/login?role=${roleSelection}`} className="text-paa-navy font-bold border-b border-paa-navy pb-0.5 hover:text-paa-gold hover:border-paa-gold transition-colors">Sign in</Link></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
