with open('src/app/components/EventsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We need to add useEffect and state for live events
imports_replace = "import React, { useState, useEffect } from 'react';\nimport axios from 'axios';\nimport pastEvents from './data/past_events.json';"
content = re.sub(r"import React, \{ useState \} from 'react';\nimport pastEvents from './data/past_events\.json';", imports_replace, content)

# Inject state and fetch logic
state_injection = '''export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/public/events`);
        setLiveEvents(res.data || []);
      } catch(err) {
        console.error("Failed to fetch live events");
      }
    };
    fetchLiveEvents();
  }, []);'''
content = re.sub(r'export function EventsPage\(\) \{\nconst \[searchTerm, setSearchTerm\] = useState\(""\);\nconst \[activeTab, setActiveTab\] = useState<\'upcoming\' \| \'past\'>\(\'past\'\);', state_injection, content)

# We need to render the Live Events inside the Upcoming Tab content
old_upcoming_content = '''{activeTab === 'upcoming' && (
<div className="py-20 text-center">
<div className="bg-white p-12 max-w-2xl mx-auto rounded-2xl shadow-sm border border-gray-100">
<Calendar className="w-16 h-16 text-[#b44d28] mx-auto mb-6 opacity-20" />
<h3 className="text-2xl font-serif text-[#1a1a2e] mb-4">No Upcoming Events</h3>
<p className="text-gray-500 mb-8">We are currently planning our next literary gatherings. Check back soon or subscribe to our newsletter for updates.</p>
</div>
</div>
)}'''

new_upcoming_content = '''{activeTab === 'upcoming' && (
<div className="py-12">
  {liveEvents.length === 0 ? (
    <div className="bg-white p-12 max-w-2xl mx-auto rounded-2xl shadow-sm border border-gray-100 text-center">
      <Calendar className="w-16 h-16 text-[#b44d28] mx-auto mb-6 opacity-20" />
      <h3 className="text-2xl font-serif text-[#1a1a2e] mb-4">No Upcoming Events</h3>
      <p className="text-gray-500 mb-8">We are currently planning our next literary gatherings. Check back soon or subscribe to our newsletter for updates.</p>
    </div>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {liveEvents.map(evt => (
        <div key={evt.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all flex flex-col">
          <div className="h-32 bg-[#1a1a2e] relative p-6 flex flex-col justify-end">
             <div className="absolute top-4 right-4 bg-[#b44d28] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                UPCOMING
             </div>
             <h3 className="text-2xl font-serif font-bold text-white leading-tight">{evt.name}</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
             <div className="space-y-3">
               <div className="flex items-start gap-3 text-sm text-gray-600">
                 <Calendar className="w-4 h-4 mt-0.5 text-[#b44d28]" />
                 <div>
                   <p className="font-bold text-[#1a1a2e]">{evt.date}</p>
                   <p className="text-xs uppercase tracking-widest mt-1">{evt.duration}</p>
                 </div>
               </div>
               <div className="flex items-start gap-3 text-sm text-gray-600">
                 <MapPin className="w-4 h-4 mt-0.5 text-[#b44d28]" />
                 <p>{evt.location}</p>
               </div>
               <div className="flex items-start gap-3 text-sm text-gray-600">
                 <BookOpen className="w-4 h-4 mt-0.5 text-[#b44d28]" />
                 <p className="font-medium"><span className="text-[#1a1a2e] font-black">{evt._count?.eventBooks || 0}</span> Books in Live Catalogue</p>
               </div>
             </div>
             
             <div className="mt-auto pt-6 border-t border-gray-100">
               <a href={`/events/${evt.id}/catalogue`} className="block w-full py-3 bg-gradient-to-r from-[#b44d28] to-[#d6653a] hover:from-[#9c4120] hover:to-[#b44d28] text-white text-xs font-black tracking-widest uppercase rounded-lg transition-all text-center shadow-md">
                  Browse Event Catalogue
               </a>
             </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
)}'''

content = content.replace(old_upcoming_content, new_upcoming_content)

with open('src/app/components/EventsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated EventsPage.tsx to show live events")
