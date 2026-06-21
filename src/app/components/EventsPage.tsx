import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pastEvents from './data/past_events.json';
import { Calendar, MapPin, Users, BookOpen, Clock, TrendingUp, Search, Download } from 'lucide-react';

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('past');

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public/events`);
        setUpcomingEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const filteredPastEvents = pastEvents.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.address.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-sans pb-20">
      {/* Header */}
      <section className="bg-[#1a1a2e] pt-32 pb-16 px-6 relative overflow-hidden text-center">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold tracking-widest uppercase mb-6 border border-white/10">
            <Calendar className="w-3 h-3" /> PAA Community Events
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Connecting Authors <span className="text-[#b44d28] italic">&</span> Readers
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover our upcoming book fairs, reading sessions, and literary festivals across India. 
            Join the movement and celebrate the written word with the Pune Authors' Association.
          </p>
        </div>
      </section>

      {/* Tabs & Search */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'upcoming' ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Upcoming Events ({upcomingEvents.length})
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'past' ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Past Events ({pastEvents.length})
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH EVENTS..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold tracking-widest uppercase outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {activeTab === 'upcoming' ? (
          upcomingEvents.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Calendar className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-serif text-[#1a1a2e] font-bold mb-3">No Upcoming Events</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Our event coordinators are busy planning the next big literary gathering. 
                Check back soon or join our mailing list to stay updated!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full relative">
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
                    Upcoming
                  </div>
                  <div className="p-6 flex-grow pt-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest uppercase">
                        <Clock className="w-3 h-3" /> {event.duration}
                      </span>
                      <span className="text-blue-900 font-bold text-sm bg-blue-100/50 px-3 py-1 rounded-full border border-blue-200">
                        {event.date}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-3 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 flex items-start gap-2 mb-6 h-10 line-clamp-2">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#b44d28]" /> {event.location}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Authors Participating</div>
                        <div className="text-xl font-black text-[#1a1a2e]">{event._count?.eventAuthors || 0}</div>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100 text-center">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-blue-600/70 mb-1">Books Showcased</div>
                        <div className="text-xl font-black text-blue-600">{event._count?.eventBooks || 0}</div>
                      </div>
                    </div>
                  </div>
                  <a href={`/events/${event.id}/catalogue`} className="block w-full text-center py-4 bg-[#1a1a2e] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#b44d28] transition-colors">
                    View Live Catalogue
                  </a>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                      <Clock className="w-3 h-3" /> {event.duration}
                    </span>
                    <span className="text-[#1a1a2e] font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {event.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2 line-clamp-2 hover:text-[#b44d28] cursor-pointer transition-colors">
                    {event.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 flex items-start gap-2 mb-6 h-10 line-clamp-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#b44d28]" /> {event.address}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1 flex items-center justify-center gap-1.5">
                        <Users className="w-3 h-3" /> Authors
                      </div>
                      <div className="text-2xl font-black text-[#1a1a2e]">{event.authorsParticipated}</div>
                    </div>
                    <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/50 text-center">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-600/70 mb-1 flex items-center justify-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Books Sold
                      </div>
                      <div className="text-2xl font-black text-blue-600">
                        {event.booksSold !== null ? event.booksSold : "TBA"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer group">
                  <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 group-hover:text-[#b44d28]" /> View Event Report
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1a1a2e] group-hover:text-[#b44d28] shadow-sm">
                    <Download className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPastEvents.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <Search className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-serif text-[#1a1a2e] font-bold mb-2">No Past Events Found</h2>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
