import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace useState for dashboardData and loading
old_state = """  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);"""
new_state = """  const [dashboardData, setDashboardData] = useState<any>(() => {
    const cached = sessionStorage.getItem('authorDashboardData');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!sessionStorage.getItem('authorDashboardData'));"""

content = content.replace(old_state, new_state)

# Replace fetchDashboardData
old_fetch = """      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (err: any) {"""
new_fetch = """      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
      sessionStorage.setItem('authorDashboardData', JSON.stringify(res.data));
    } catch (err: any) {"""

content = content.replace(old_fetch, new_fetch)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("AuthorDashboardPage cached.")
