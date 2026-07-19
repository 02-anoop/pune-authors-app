import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, User, Search, MapPin, CheckCircle2, ChevronRight, AlertCircle, Clock, CheckCircle, Sparkles, Feather } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AdminInvitationsTab = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/admin/invitations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInvitations(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search only
  const filtered = invitations.filter(inv => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        inv.customerName.toLowerCase().includes(q) ||
        inv.eventTitle.toLowerCase().includes(q) ||
        inv.author.name.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Accepted by Author': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected by Author': return 'bg-red-100 text-red-800 border-red-200';
      case 'Sent to Author': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading invitations...</div>;

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'border-l-orange-400';
      case 'Under Review': return 'border-l-blue-400';
      case 'Accepted by Author': return 'border-l-emerald-400';
      case 'Rejected by Author': return 'border-l-red-400';
      case 'Sent to Author': return 'border-l-indigo-400';
      case 'Approved': return 'border-l-purple-400';
      case 'Completed': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Header & Unified View info */}
      <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold text-paa-navy font-serif">All Invitations</h2>
            <p className="text-xs text-gray-500 mt-1">Manage and track invitations sent to Pune Authors.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invites or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-paa-navy focus:ring-1 focus:ring-paa-navy transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-md border border-blue-600/20 flex items-center justify-between text-white hover:scale-[1.02] transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider opacity-90">Total Invitations</p>
            <h4 className="text-3xl font-black mt-1 tracking-tight">{invitations.length}</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl shadow-md border border-amber-600/20 flex items-center justify-between text-white hover:scale-[1.02] transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-amber-100 uppercase tracking-wider opacity-90">Pending Response</p>
            <h4 className="text-3xl font-black mt-1 tracking-tight">
              {invitations.filter(i => i.status === 'Pending').length}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-5 rounded-2xl shadow-md border border-emerald-600/20 flex items-center justify-between text-white hover:scale-[1.02] transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider opacity-90">Accepted / Completed</p>
            <h4 className="text-3xl font-black mt-1 tracking-tight">
              {invitations.filter(i => ['Accepted by Author', 'Approved', 'Completed'].includes(i.status)).length}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 p-5 rounded-2xl shadow-md border border-rose-600/20 flex items-center justify-between text-white hover:scale-[1.02] transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-wider opacity-90">Rejected</p>
            <h4 className="text-3xl font-black mt-1 tracking-tight">
              {invitations.filter(i => i.status === 'Rejected by Author').length}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-paa-navy/5 text-center shadow-premium flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-paa-navy mb-1">No invitations found</h3>
            <p className="text-sm text-gray-500">There are no invitations matching the current criteria.</p>
          </div>
        ) : (
          filtered.map((inv, index) => (
            <div 
              key={inv.id} 
              className={`bg-white rounded-2xl border border-paa-navy/5 border-l-4 ${getStatusBorderColor(inv.status)} shadow-premium overflow-hidden hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Card Header (Collapsed View) */}
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-gray-50/40 transition-colors"
                onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
              >
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="text-gray-400 font-bold text-sm min-w-[20px] shrink-0 text-center">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0 shadow-inner">
                    {inv.author.photoUrl ? (
                      <img src={inv.author.photoUrl.startsWith('http') ? inv.author.photoUrl : `${API}${inv.author.photoUrl.startsWith('/') ? inv.author.photoUrl : '/' + inv.author.photoUrl}`} alt={inv.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold font-serif text-paa-navy">{inv.author.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">{new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-paa-navy text-sm md:text-base line-clamp-1">{inv.author.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1 flex items-center gap-2">
                       <strong className="text-[#b44d28]">{inv.eventTitle}</strong> 
                       <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> 
                       Requested by <span className="font-bold text-gray-700">{inv.customerName}</span>
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center justify-end w-full md:w-auto">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-paa-amber hover:text-paa-navy transition-all duration-200 bg-orange-50/80 hover:bg-orange-100/90 border border-orange-200/50 px-3.5 py-2 rounded-xl shadow-sm">
                    {expandedId === inv.id ? 'Close Details' : 'View Action'} <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === inv.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Body (Expanded View) */}
              {expandedId === inv.id && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 gap-6 animate-in slide-in-from-top-2 duration-200">
                  
                  {/* Details */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Organizer details (Blue theme) */}
                      <div>
                        <div className="text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit mb-3 font-bold text-xs uppercase tracking-wider">
                          <User size={14}/> Organizer Details
                        </div>
                        <div className="bg-gradient-to-br from-blue-50/40 to-white p-5 rounded-2xl border border-blue-100 shadow-sm text-sm space-y-3">
                          <div className="flex justify-between border-b border-blue-50/50 pb-2">
                             <span className="text-gray-500 font-medium">Name</span>
                             <strong className="text-blue-900">{inv.customerName}</strong>
                          </div>
                          {inv.organizationName && (
                            <div className="flex justify-between border-b border-blue-50/50 pb-2">
                               <span className="text-gray-500 font-medium">Org/Club</span>
                               <span className="font-semibold text-gray-700">{inv.organizationName}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-blue-50/50 pb-2">
                             <span className="text-gray-500 font-medium">Email</span>
                             <span className="text-blue-800 font-medium">{inv.customerEmail}</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-gray-500 font-medium">Phone</span>
                             <span className="text-gray-700 font-medium">{inv.customerPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Event specs details (Amber theme) */}
                      <div>
                        <div className="text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit mb-3 font-bold text-xs uppercase tracking-wider">
                          <Calendar size={14}/> Event Specifications
                        </div>
                        <div className="bg-gradient-to-br from-amber-50/30 to-white p-5 rounded-2xl border border-amber-100 shadow-sm text-sm space-y-3">
                          <div className="flex justify-between border-b border-amber-50/50 pb-2">
                             <span className="text-gray-500 font-medium">Type</span>
                             <span className="font-semibold text-amber-900">{inv.eventType}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-50/50 pb-2">
                             <span className="text-gray-500 font-medium">Date & Time</span>
                             <span className="font-semibold text-gray-700">{inv.eventDate} {inv.eventTime && `at ${inv.eventTime}`}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-50/50 pb-2">
                             <span className="text-gray-500 font-medium">Audience Size</span>
                             <span className="font-semibold text-gray-700">{inv.expectedAudience}</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-gray-500 font-medium">Venue Location</span>
                             <span className="flex items-center gap-1 font-semibold text-gray-700">
                               <MapPin size={12} className="text-amber-600"/> {inv.venue}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reason for invitation (Purple theme) */}
                    <div className="bg-gradient-to-br from-purple-50/30 to-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-2">
                       <h5 className="text-[10px] font-bold text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                         <Sparkles size={12} /> Why they invited this author
                       </h5>
                       <p className="text-sm text-gray-700 bg-purple-50/30 p-3.5 rounded-xl border border-purple-50/60 leading-relaxed font-medium">
                         {inv.reasonForInvite}
                       </p>
                    </div>

                    {/* Event description (Emerald theme) */}
                    {inv.eventDescription && (
                      <div className="bg-gradient-to-br from-emerald-50/30 to-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
                         <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                           <Feather size={12} /> Event Description
                         </h5>
                         <p className="text-sm text-gray-700 bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-50/60 leading-relaxed whitespace-pre-wrap font-medium">
                           {inv.eventDescription}
                         </p>
                      </div>
                    )}

                    {/* Additional notes (Rose/Red theme) */}
                    {inv.additionalNotes && (
                      <div className="bg-gradient-to-br from-rose-50/30 to-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-2">
                         <h5 className="text-[10px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                           <AlertCircle size={12} /> Additional Notes from Organizer
                         </h5>
                         <p className="text-sm text-gray-700 bg-rose-50/30 p-3.5 rounded-xl border border-rose-50/60 leading-relaxed italic border-l-4 border-l-rose-400 pl-3">
                           {inv.additionalNotes}
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
