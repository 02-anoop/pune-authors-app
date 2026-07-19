with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_return = '''  return (
    <div className="min-h-screen bg-paa-cream font-sans">
      <div className="bg-white border-b border-paa-navy/10 shadow-sm sticky top-0 z-10">'''

new_return = '''  const { status, rejectionReason, name, email, phone, bio, photoUrl, transactionId, paymentScreenshot } = dashboardData.authorProfile;

  if (status === 'Pending' || status === 'Rejected') {
    return (
      <div className="min-h-screen bg-paa-cream font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow border border-paa-navy/10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-paa-navy">Author Application Status</h1>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-bold uppercase"><LogOut size={16}/> Logout</button>
          </div>
          
          <div className={`p-4 mb-8 rounded border ${status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              {status === 'Pending' ? <AlertCircle size={20} /> : <AlertCircle size={20} />}
              Status: {status}
            </h2>
            {status === 'Pending' ? (
              <p className="text-sm">Your author application has been submitted and is currently pending review by the admin team. You will be notified via email once approved. Check back here for updates.</p>
            ) : (
              <div>
                <p className="text-sm mb-2">Unfortunately, your author application has been rejected.</p>
                {rejectionReason && <p className="text-sm font-bold bg-white p-3 rounded border border-red-100">Reason: {rejectionReason}</p>}
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-paa-navy border-b pb-2 mb-4 uppercase tracking-widest">Submitted Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Name</span> {name}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Email</span> {email}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Phone</span> {phone}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Transaction ID</span> {transactionId || 'N/A'}</div>
          </div>
          
          <div className="mb-4">
            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Bio</span>
            <p className="text-sm bg-gray-50 p-3 rounded">{bio}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {photoUrl && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Profile Photo</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photoUrl}`} alt="Profile" className="w-24 h-24 object-cover rounded shadow" />
              </div>
            )}
            {paymentScreenshot && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Payment Screenshot</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${paymentScreenshot}`} alt="Payment" className="w-full max-w-xs object-contain border rounded shadow-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paa-cream font-sans">
      <div className="bg-white border-b border-paa-navy/10 shadow-sm sticky top-0 z-10">'''

content = content.replace(old_return, new_return)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorDashboardPage successfully")
