import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Restore AuthorFullProfileView useEffect
bad_code = """  // Auto-refresh mechanism
  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
        setLastRefreshTime(Date.now());
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };

    // Refresh immediately when activeTab changes
    fetchCurrentTabData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Old useEffect removed/bypassed
  /* useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/authors/${author.id}/dashboard-data`);
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); */"""

good_code = """  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/authors/${author.id}/dashboard-data`);
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [author.id]);"""

content = content.replace(bad_code, good_code)


# Now let's inject the auto-refresh correctly into OperationsDashboardPage
# We need to find OperationsDashboardPage's fetchDashboardData and useEffect
# It looks like:
#   const fetchDashboardData = async () => { ... }
#   useEffect(() => { fetchDashboardData(); }, []);

# Let's see if we can find it.
# Actually, let's use a regex to replace `useEffect(() => {\n    fetchDashboardData();\n  }, []);`
interval_code = """  // Auto-refresh mechanism
  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
        setLastRefreshTime(Date.now());
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };

    fetchCurrentTabData();

    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);"""

content = re.sub(r"useEffect\(\(\) => \{\s*fetchDashboardData\(\);\s*\}, \[\]\);", interval_code, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
