import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, User, CheckCircle2, XCircle, MapPin, Search } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthorInvitationsView = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await axios.get(`${API}/api/author/invitations`, {
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

  const respondToInvitation = async (id: number, status: string) => {
    try {
      await axios.put(`${API}/api/author/invitations/${id}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Invitation ${status.split(' ')[0].toLowerCase()}`);
      fetchInvitations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update response');
    }
  };

  if (loading) return <div className="p-8 text-center text-paa-gray-text animate-pulse">Loading your invitations...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium">
        <div>
          <h2 className="text-xl font-bold font-serif text-paa-navy mb-1">Author Invitations</h2>
          <p className="text-sm text-paa-gray-text">Manage invitations from readers, schools, and organizations.</p>
        </div>
        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
          <Calendar size={24} />
        </div>
      </div>

      <div className="grid gap-6">
        {invitations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-paa-navy mb-2">No Invitations Yet</h3>
            <p className="text-paa-gray-text">When organizers invite you to their events, they will appear here.</p>
          </div>
        ) : (
          invitations.map((inv) => (
            <div key={inv.id} className={`bg-white rounded-2xl border border-paa-navy/5 shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden ${
              inv.status === 'Accepted by Author' ? 'border-l-4 border-l-emerald-500' :
              inv.status === 'Rejected by Author' ? 'border-l-4 border-l-rose-500' :
              'border-l-4 border-l-amber-500'
            }`}>
              <div className="flex flex-col md:flex-row">
                
                {/* Event Details (Left side) */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      inv.status === 'Sent to Author' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      inv.status === 'Accepted by Author' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      inv.status === 'Rejected by Author' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {inv.status === 'Sent to Author' ? 'Pending Action' : inv.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {inv.eventType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-serif text-paa-navy leading-tight">{inv.eventTitle}</h3>

                  {/* Inline Info Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={16} className="text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Date &amp; Time</p>
                        <p className="text-xs font-semibold text-slate-850 truncate">{inv.eventDate} {inv.eventTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin size={16} className="text-rose-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Venue</p>
                        <p className="text-xs font-semibold text-slate-850 truncate">{inv.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <User size={16} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Expected Audience</p>
                        <p className="text-xs font-semibold text-slate-850 truncate">{inv.expectedAudience || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Description */}
                    <div className="bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-50">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Event Description
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto pr-1">
                        {inv.eventDescription || 'No description provided.'}
                      </p>
                    </div>

                    {/* Additional Notes or Invite Reason */}
                    <div className="bg-amber-50/20 p-3.5 rounded-xl border border-amber-50">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Notes / Reason for Invite
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto pr-1">
                        {inv.additionalNotes || inv.reasonForInvite || 'No additional notes provided.'}
                      </p>
                    </div>
                  </div>
                  
                  {inv.adminRemarks && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-150 flex gap-2">
                      <span className="text-sm">📢</span>
                      <div>
                        <h4 className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">Admin Remark</h4>
                        <p className="text-xs text-amber-900 leading-normal">{inv.adminRemarks}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizer Info & Response (Right side sidebar) */}
                <div className="w-full md:w-80 bg-slate-50/40 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <User size={14} className="text-slate-350" /> Organizer Info
                      </h4>
                      
                      <div className="space-y-3 text-xs">
                        <div className="border-b border-slate-100 pb-1.5">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Name</p>
                          <p className="text-slate-800 font-bold">{inv.customerName}</p>
                        </div>
                        {inv.organizationName && (
                          <div className="border-b border-slate-100 pb-1.5">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Organization</p>
                            <p className="text-slate-800 font-semibold">{inv.organizationName}</p>
                          </div>
                        )}
                        <div className="border-b border-slate-100 pb-1.5">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                          <a href={`mailto:${inv.customerEmail}`} className="text-indigo-600 hover:underline font-semibold block break-all">
                            {inv.customerEmail}
                          </a>
                        </div>
                        <div className="border-b border-slate-100 pb-1.5">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Phone</p>
                          <a href={`tel:${inv.customerPhone}`} className="text-indigo-600 hover:underline font-semibold block break-all">
                            {inv.customerPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 pt-4 border-t border-slate-100/80">
                    {inv.status === 'Sent to Author' && (
                      <div className="space-y-2">
                        <button 
                          onClick={() => respondToInvitation(inv.id, 'Accepted by Author')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                        >
                          <CheckCircle2 size={16} /> Accept Invite
                        </button>
                        <button 
                          onClick={() => respondToInvitation(inv.id, 'Rejected by Author')}
                          className="w-full py-2.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                          <XCircle size={16} /> Decline
                        </button>
                      </div>
                    )}
                    
                    {inv.status === 'Accepted by Author' && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center flex flex-col items-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                        <p className="text-xs font-bold text-emerald-800">You've Accepted</p>
                        <p className="text-[10px] text-emerald-600/85 mt-0.5 leading-tight">Coordinate with organizers for further details.</p>
                      </div>
                    )}

                    {inv.status === 'Rejected by Author' && (
                      <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center flex flex-col items-center">
                        <XCircle className="w-6 h-6 text-rose-600 mb-1" />
                        <p className="text-xs font-bold text-rose-800">Declined by You</p>
                        <p className="text-[10px] text-rose-600/85 mt-0.5 leading-tight">You have turned down this invitation.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
