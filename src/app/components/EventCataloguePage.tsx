import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { MapPin, Calendar as CalendarIcon, User, BookOpen } from 'lucide-react';
import { NavBar } from './NavBar';
import { Footer } from './Footer';

export const EventCataloguePage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/events/${eventId}/catalogue`);
        setEvent(res.data.event);
        setCatalogue(res.data.catalogue);
      } catch (error) {
        console.error("Failed to load catalogue");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogue();
  }, [eventId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paa-cream">Loading Event Catalogue...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-paa-cream">Event not found.</div>;

  return (
    <div className="bg-paa-cream font-sans min-h-screen flex flex-col">
      <NavBar />
      <div className="bg-paa-navy text-paa-cream py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-6">{event.name} - Official Catalogue</h1>
          <div className="flex flex-wrap justify-center gap-6 text-sm tracking-widest font-bold uppercase text-paa-gold">
            <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {event.date} ({event.duration})</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-paa-navy mb-12 text-center uppercase border-b border-paa-navy/10 pb-4 inline-block">Books Available at the Event</h2>
        
        {catalogue.length === 0 ? (
           <p className="text-center text-gray-500 py-12">No books have been listed for this event yet.</p>
        ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {catalogue.map((item) => (
                <div key={item.id} className="bg-white border border-paa-navy/10 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col">
                   <div className="relative aspect-[2/3] bg-gray-100 flex items-center justify-center overflow-hidden border-b border-paa-navy/5 p-4">
                     {item.book.coverUrl ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${item.book.coverUrl}`} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 shadow-md" />
                     ) : (
                        <div className="text-paa-gray-text"><BookOpen className="w-12 h-12 opacity-20" /></div>
                     )}
                     <div className="absolute top-2 right-2 bg-paa-gold text-paa-navy text-[10px] font-black tracking-widest uppercase px-2 py-1 shadow">
                        {item.book.genre}
                     </div>
                   </div>
                   <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-serif font-bold text-paa-navy mb-1 leading-tight">{item.book.title}</h3>
                      <p className="text-sm text-paa-gray-text mb-4 line-clamp-2 italic border-b border-paa-navy/5 pb-4">{item.book.synopsis}</p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center gap-3 bg-gray-50 p-2 border border-paa-navy/10 mb-3 rounded">
                           {item.author.photoUrl ? (
                              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${item.author.photoUrl}`} alt={item.author.name} className="w-8 h-8 rounded-full object-cover" />
                           ) : (
                              <div className="w-8 h-8 rounded-full bg-paa-navy/10 flex items-center justify-center text-paa-navy"><User className="w-4 h-4" /></div>
                           )}
                           <div className="overflow-hidden">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">Author</p>
                              <p className="text-sm font-bold text-paa-navy truncate">{item.author.name}</p>
                           </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <span className="text-2xl font-black text-paa-navy">₹{item.book.mrp}</span>
                           <span className="text-xs font-bold uppercase text-green-700 tracking-widest">In Stock: {item.listedStock}</span>
                        </div>
                      </div>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
