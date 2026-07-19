with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We need to replace the state and toggle function in ActivityRegistration
old_state = '''  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredIds = registrations.map(r => r.activityId);

  const handleParticipateClick = (act: any) => {
    if (registeredIds.includes(act.id)) return;
    if (act.status === 'CLOSED') return;
    setSelectedAct(act);
    setShowDialog(true);
  };

  const confirmParticipation = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book');
      return;
    }
    if (!screenshot && selectedAct.charges > 0) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('activityId', selectedAct.id);
      formData.append('booksIds', JSON.stringify(selectedBooks));
      formData.append('amount', selectedAct.charges);
      if (screenshot) formData.append('paymentScreenshot', screenshot);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/activities/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Registration submitted! Pending verification.');
      setShowDialog(false);
      setSelectedAct(null);
      setScreenshot(null);
      setSelectedBooks([]);
      onRefresh();
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBook = (id: number) => {
    setSelectedBooks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };'''

new_state = '''  const [selectedBooks, setSelectedBooks] = useState<{id: number, qty: number}[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredIds = registrations.map(r => r.activityId);

  const handleParticipateClick = (act: any) => {
    if (registeredIds.includes(act.id)) return;
    if (act.status === 'CLOSED') return;
    setSelectedAct(act);
    setShowDialog(true);
  };

  const confirmParticipation = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book');
      return;
    }
    if (!screenshot && selectedAct.charges > 0) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('activityId', selectedAct.id);
      formData.append('booksIds', JSON.stringify(selectedBooks));
      formData.append('amount', selectedAct.charges);
      if (screenshot) formData.append('paymentScreenshot', screenshot);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/activities/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Registration submitted! Pending verification.');
      setShowDialog(false);
      setSelectedAct(null);
      setScreenshot(null);
      setSelectedBooks([]);
      onRefresh();
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBook = (id: number) => {
    setSelectedBooks(prev => {
      if (prev.find(b => b.id === id)) {
        return prev.filter(b => b.id !== id);
      } else {
        return [...prev, { id, qty: 1 }];
      }
    });
  };
  
  const updateBookQty = (id: number, qty: number) => {
    setSelectedBooks(prev => prev.map(b => b.id === id ? { ...b, qty } : b));
  };'''
content = content.replace(old_state, new_state)

old_ui = '''                 <div className="mb-4">
                   <p className="text-sm font-bold text-paa-navy mb-2">1. Select Books for this event:</p>
                   <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 bg-gray-50">
                     {books.map(b => (
                       <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                         <input type="checkbox" checked={selectedBooks.includes(b.id)} onChange={() => toggleBook(b.id)} />
                         {b.title}
                       </label>
                     ))}
                   </div>
                 </div>'''

new_ui = '''                 <div className="mb-4">
                   <p className="text-sm font-bold text-paa-navy mb-2">1. Select Books and Quantity for this event:</p>
                   <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 bg-gray-50">
                     {books.map(b => {
                       const selected = selectedBooks.find(sb => sb.id === b.id);
                       return (
                         <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                           <label className="flex items-center gap-2 cursor-pointer flex-1">
                             <input type="checkbox" checked={!!selected} onChange={() => toggleBook(b.id)} />
                             {b.title}
                           </label>
                           {selected && (
                             <input type="number" min="1" placeholder="Qty" value={selected.qty} onChange={(e) => updateBookQty(b.id, parseInt(e.target.value) || 1)} className="w-16 p-1 text-xs border" />
                           )}
                         </div>
                       )
                     })}
                   </div>
                 </div>'''
content = content.replace(old_ui, new_ui)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ActivityRegistration with book quantity")
