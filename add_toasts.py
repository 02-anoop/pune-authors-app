with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if "import { toast } from 'sonner';" not in content:
    content = content.replace("import { useNavigate } from 'react-router';", "import { useNavigate } from 'react-router';\nimport { toast } from 'sonner';")

# Add toast to handleApproveAuthor
old_approve = '''  const handleApproveAuthor = async (id: number) => {
    await axios.post(`${API}/api/admin/authors/${id}/approve`);
    fetchAuthors();
  };'''
new_approve = '''  const handleApproveAuthor = async (id: number) => {
    try {
      await axios.post(`${API}/api/admin/authors/${id}/approve`);
      toast.success('Author Approved!');
      fetchAuthors();
    } catch(err) {
      toast.error('Failed to approve author');
    }
  };'''
content = content.replace(old_approve, new_approve)

# Add toast to handleRejectAuthorSubmit
old_reject = '''    try {
      await axios.post(`${API}/api/admin/authors/${rejectAuthorTarget.id}/reject`, { reason });
      setRejectAuthorTarget(null);
      fetchAuthors();
    } catch (err) {
      alert('Failed to reject author');
    }'''
new_reject = '''    try {
      await axios.post(`${API}/api/admin/authors/${rejectAuthorTarget.id}/reject`, { reason });
      toast.success('Author Rejected');
      setRejectAuthorTarget(null);
      fetchAuthors();
    } catch (err) {
      toast.error('Failed to reject author');
    }'''
content = content.replace(old_reject, new_reject)

# Add toast to handleDeleteAuthor
old_delete = '''  const handleDeleteAuthor = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this author?')) {
      await axios.delete(`${API}/api/admin/authors/${id}`);
      fetchAuthors();
      fetchOverview();
    }
  };'''
new_delete = '''  const handleDeleteAuthor = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this author?')) {
      try {
        await axios.delete(`${API}/api/admin/authors/${id}`);
        toast.success('Author Removed');
        fetchAuthors();
        fetchOverview();
      } catch(err) {
        toast.error('Failed to remove author');
      }
    }
  };'''
content = content.replace(old_delete, new_delete)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added toasts")
