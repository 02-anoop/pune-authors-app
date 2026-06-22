import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

if "hasNewOrders" not in content:
    # 1. Add state and ref
    old_state = """export function OperationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery'>('overview');"""

    new_state = """import { useRef } from 'react';
export function OperationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery'>('overview');
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const prevOrderCountRef = useRef<number>(0);
  
  useEffect(() => {
    if (activeTab === 'orders') {
      setHasNewOrders(false);
    }
  }, [activeTab]);"""

    content = content.replace(old_state, new_state).replace("import { useRef } from 'react';\nimport React, { useState", "import React, { useState, useEffect, useRef")

    # 2. Add polling in fetchOrders
    old_fetch_orders = """  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/orders`);
      setOrders(res.data);
    } catch(err) {} finally { setIsRefreshing(false); }
  };"""

    new_fetch_orders = """  const fetchOrders = async (background = false) => {
    if (!background) setIsRefreshing(true);
    try {
      const w = window as any;
      w.__apiCache = w.__apiCache || {};
      if (!background && w.__apiCache.adminOrders) {
         setOrders(w.__apiCache.adminOrders);
         prevOrderCountRef.current = w.__apiCache.adminOrders.length;
      }
      
      const res = await axios.get(`${API}/api/admin/orders`);
      const newCount = res.data.length;
      
      if (background && prevOrderCountRef.current > 0 && newCount > prevOrderCountRef.current && activeTab !== 'orders') {
         setHasNewOrders(true);
      }
      prevOrderCountRef.current = newCount;
      w.__apiCache.adminOrders = res.data;
      
      setOrders(res.data);
    } catch(err) {} finally { if (!background) setIsRefreshing(false); }
  };"""
    content = content.replace(old_fetch_orders, new_fetch_orders)

    # 3. Add global interval for fetchOrders
    old_use_effect_init = """  useEffect(() => {
    const initFetch = async () => {
      await Promise.all([
        fetchStats(),
        fetchAuthors(),
        fetchBooks(),
        fetchEvents(),
        fetchOrders(),
        fetchForms(),
        fetchGallery()
      ]);
      setLoading(false);
    };
    initFetch();
  }, []);"""

    new_use_effect_init = """  useEffect(() => {
    const initFetch = async () => {
      await Promise.all([
        fetchStats(),
        fetchAuthors(),
        fetchBooks(),
        fetchEvents(),
        fetchOrders(),
        fetchForms(),
        fetchGallery()
      ]);
      setLoading(false);
    };
    initFetch();
    
    const interval = setInterval(() => {
      fetchOrders(true);
      fetchStats(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);"""
    content = content.replace(old_use_effect_init, new_use_effect_init)

    # Add background flag to fetchStats
    old_fetch_stats = """  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/dashboard-stats`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };"""

    new_fetch_stats = """  const fetchStats = async (background = false) => {
    if (!background) setIsRefreshing(true);
    try {
      const w = window as any;
      w.__apiCache = w.__apiCache || {};
      if (!background && w.__apiCache.adminStats) {
         setStats(w.__apiCache.adminStats);
      }
      const res = await axios.get(`${API}/api/admin/dashboard-stats`);
      w.__apiCache.adminStats = res.data;
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!background) setIsRefreshing(false);
    }
  };"""
    content = content.replace(old_fetch_stats, new_fetch_stats)

    # 4. Add red dot to Web Orders tab
    old_orders_tab = """          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition-colors ${activeTab === 'orders' ? 'bg-[#1a1a2e] text-white border-paa-gold' : 'border-transparent text-[#b3d4ff] hover:bg-[#1a1a2e] hover:text-white'}`}>
            <ShoppingCart className="w-5 h-5" /> Web Orders
          </button>"""

    new_orders_tab = """          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition-colors relative ${activeTab === 'orders' ? 'bg-[#1a1a2e] text-white border-paa-gold' : 'border-transparent text-[#b3d4ff] hover:bg-[#1a1a2e] hover:text-white'}`}>
            <ShoppingCart className="w-5 h-5" /> Web Orders
            {hasNewOrders && <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
            {hasNewOrders && <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>"""
    content = content.replace(old_orders_tab, new_orders_tab)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Admin dashboard patched")
