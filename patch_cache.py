import re

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Patch CataloguePage.tsx (Caching)
catalogue_file = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx"
catalogue_code = read_file(catalogue_file)

if "window.__apiCache" not in catalogue_code:
    old_fetch = """  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => res.json())
      .then(data => {
        const mapped: CatalogueBook[] = data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title,
          synopsis: b.synopsis || "",
          mrp: b.mrp,
          mrpRaw: b.mrp?.toString(),
          coverUrl: b.coverUrl || "",
          authorName: b.author?.name || "Unknown",
          authorBio: b.author?.bio || "",
          genre: toGenreCode(b.genre),
          subGenre: b.subGenre || ""
        }));
        setAllBooks(mapped);
      })
      .catch(console.error);
  }, []);"""

    new_fetch = """  useEffect(() => {
    const w = window as any;
    w.__apiCache = w.__apiCache || {};
    
    if (w.__apiCache.catalogueBooks) {
      setAllBooks(w.__apiCache.catalogueBooks);
    }

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => res.json())
      .then(data => {
        const mapped: CatalogueBook[] = data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title,
          synopsis: b.synopsis || "",
          mrp: b.mrp,
          mrpRaw: b.mrp?.toString(),
          coverUrl: b.coverUrl || "",
          authorName: b.author?.name || "Unknown",
          authorBio: b.author?.bio || "",
          genre: toGenreCode(b.genre),
          subGenre: b.subGenre || ""
        }));
        w.__apiCache.catalogueBooks = mapped;
        setAllBooks(mapped);
      })
      .catch(console.error);
  }, []);"""
    catalogue_code = catalogue_code.replace(old_fetch, new_fetch)
    write_file(catalogue_file, catalogue_code)
    print("Catalogue patched")


# 2. Patch CustomerProfilePage.tsx (Polling and caching)
customer_file = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
customer_code = read_file(customer_file)

if "setInterval" not in customer_code:
    old_fetch_customer = """  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data.customer);
      setOrders(res.data.orders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);"""

    new_fetch_customer = """  const fetchProfile = async (background = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const w = window as any;
      w.__apiCache = w.__apiCache || {};
      
      if (!background && w.__apiCache.customerProfile) {
        setUserData(w.__apiCache.customerProfile.customer);
        setOrders(w.__apiCache.customerProfile.orders);
        setLoading(false);
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      w.__apiCache.customerProfile = res.data;
      setUserData(res.data.customer);
      setOrders(res.data.orders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (!background) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(() => fetchProfile(true), 15000);
    return () => clearInterval(interval);
  }, []);"""
    customer_code = customer_code.replace(old_fetch_customer, new_fetch_customer)
    write_file(customer_file, customer_code)
    print("Customer patched")


# 3. Patch AuthorDashboardPage.tsx (Polling, Caching, Red dot)
author_file = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
author_code = read_file(author_file)

if "hasNewOrders" not in author_code:
    old_state_author = """export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDashboardData = async () => {"""

    new_state_author = """import { useRef } from 'react';
export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const prevOrderCountRef = useRef<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/orders')) {
      setHasNewOrders(false);
    }
  }, [location.pathname]);

  const fetchDashboardData = async (background = false) => {"""
    
    author_code = author_code.replace(old_state_author, new_state_author).replace("import { useRef } from 'react';\nimport React, { useState", "import React, { useState, useEffect, useRef")

    old_fetch_author = """  const fetchDashboardData = async (background = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const dashRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(dashRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);"""

    new_fetch_author = """  const fetchDashboardData = async (background = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if(!background) navigate('/login');
        return;
      }
      const w = window as any;
      w.__apiCache = w.__apiCache || {};
      
      if (!background && w.__apiCache.authorDashboard) {
        setDashboardData(w.__apiCache.authorDashboard);
        prevOrderCountRef.current = w.__apiCache.authorDashboard.authorOrders?.length || 0;
        setLoading(false);
      }

      const dashRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newOrderCount = dashRes.data.authorOrders?.length || 0;
      if (background && prevOrderCountRef.current > 0 && newOrderCount > prevOrderCountRef.current && !location.pathname.includes('/orders')) {
         setHasNewOrders(true);
      }
      prevOrderCountRef.current = newOrderCount;
      
      w.__apiCache.authorDashboard = dashRes.data;
      setDashboardData(dashRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (!background) {
        toast.error('Failed to load dashboard data');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);"""
    
    author_code = author_code.replace(old_fetch_author, new_fetch_author)

    # Red dot for My Orders
    old_my_orders_link = """<Link to="/dashboard/orders" className={`${location.pathname.includes('/orders') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>My Orders</Link>"""
    new_my_orders_link = """<Link to="/dashboard/orders" className={`${location.pathname.includes('/orders') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap relative`}>
      My Orders
      {hasNewOrders && <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>}
      {hasNewOrders && <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
    </Link>"""
    author_code = author_code.replace(old_my_orders_link, new_my_orders_link)
    
    write_file(author_file, author_code)
    print("Author patched")

print("Done")
