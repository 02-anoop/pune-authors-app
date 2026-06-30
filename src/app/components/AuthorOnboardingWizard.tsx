import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';
import pastEvents from './data/past_events.json';
import { Info, CalendarDays, Briefcase, FileSignature, CheckCircle, ChevronRight, ChevronLeft, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router';

// ── INTERNAL COMPONENTS FOR WIZARD STEPS ──

function WizardAboutStep() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="text-[10px] font-bold tracking-widest text-paa-navy uppercase mb-2">Origins & Mission</div>
        <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900 mb-6 leading-tight">
          About <span className="italic text-paa-gold">The Group.</span>
        </h2>
        <div className="w-16 h-1 bg-paa-gold mx-auto mb-8"></div>
      </div>
      
      <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-paa-navy/5">
        <p>
          The group was conceived in <strong className="text-paa-navy font-semibold">December 2024</strong> following the Pune Book Fair. While networking at a local stall, several authors recognized a shared challenge: the immense difficulty of selling independently in a saturated market.
        </p>
        <p>
          The idea to form a unified coalition of Pune authors was spearheaded by <strong className="text-paa-navy font-semibold">Cdr Shiv Mathur</strong>. Having witnessed firsthand the struggles authors face with visibility and distribution, the vision became clear: find a way to promote literature collaboratively rather than competitively.
        </p>
        <p>
          By pooling resources, we discovered that financial barriers to self-marketing drastically decreased. Shared costs allow us to execute large-scale activities, prominent stall placements, and robust marketing campaigns that would be prohibitively expensive for an individual author.
        </p>
        <p>
          Today, a strict group guideline document ensures every author understands our shared agenda and ethical rules. As our success grew, we expanded our invitation to authors from Mumbai, and we are now proudly welcoming talent from across the entire country into our literary ecosystem.
        </p>
      </div>
    </div>
  );
}

function WizardEventsStep() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="text-[10px] font-bold tracking-widest text-paa-navy uppercase mb-2">PAA Community</div>
        <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900 mb-6 leading-tight">
          Literary <span className="italic text-paa-gold">Events.</span>
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Discover our book fairs, reading sessions, and literary festivals across India. 
          Join the movement and celebrate the written word.
        </p>
      </div>

      <div className="space-y-10">
        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="font-serif text-2xl text-paa-navy mb-6 border-b border-gray-200 pb-2">Upcoming Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {upcomingEvents.map((event, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                     <span className="text-xs font-bold text-paa-gold uppercase tracking-widest bg-paa-gold/10 px-2 py-1 rounded">{event.date}</span>
                     <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {event.duration}</span>
                  </div>
                  <h4 className="font-serif text-lg text-gray-900 font-medium mb-2">{event.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-auto pt-4"><MapPin size={14}/> {event.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-serif text-2xl text-paa-navy mb-6 border-b border-gray-200 pb-2">Past Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {pastEvents.slice(0, 4).map((event, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-paa-navy/5 shadow-sm">
                 <div className="flex justify-between items-start mb-3">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{event.date}</span>
                 </div>
                 <h4 className="font-serif text-lg text-gray-900 font-medium mb-2">{event.name}</h4>
                 <p className="text-sm text-gray-500 flex items-center gap-1.5"><MapPin size={14}/> {event.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardServicesStep() {
  const services = [
    {
      num: "I.",
      title: "Publishing Support",
      desc: "We provide professional end-to-end manuscript production to ensure your book meets exact industry standards before hitting the market.",
      items: ["Formatting of Manuscript", "Book Cover Design", "Editing & Proof Reading", "Printing as low as 50 copies at minimal cost"]
    },
    {
      num: "II.",
      title: "Promotional Support",
      desc: "Strategic visibility is crucial. We position your literature directly in front of discerning audiences using collective brand power.",
      items: ["Catalogue of fiction and non-fiction books", "Giving books to the Airport Libraries", "Donating books to well known local libraries", "LinkedIn page management"]
    },
    {
      num: "III.",
      title: "Selling Books",
      desc: "Securing reliable revenue streams through vetted physical and digital distribution networks.",
      items: ["Participation in book fairs all over India (NBT)", "Literary Events in large housing societies & Educational Institutes", "Setting up stalls in housing societies"]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="text-[10px] font-bold tracking-widest text-paa-navy uppercase mb-2">Capabilities</div>
        <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900 mb-6 leading-tight">
          Our <span className="italic text-paa-gold">Services.</span>
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Empowering independent authors through collaborative publishing, strategic promotion, and widespread distribution.
        </p>
      </div>

      <div className="space-y-6">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl-2xl border border-paa-navy/5 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="md:w-1/3">
              <div className="font-serif text-xl text-paa-gold italic mb-2">{service.num}</div>
              <h3 className="font-serif text-2xl font-medium text-gray-900 leading-tight">{service.title}</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">{service.desc}</p>
              <ul className="space-y-2">
                {service.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-paa-gold mt-1">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN WIZARD COMPONENT ──

const onboardingSteps = [
  { title: "About PAA", icon: <Info size={18} /> },
  { title: "Past Events", icon: <CalendarDays size={18} /> },
  { title: "Our Services", icon: <Briefcase size={18} /> },
  { title: "Join Form", icon: <FileSignature size={18} /> },
];

export function AuthorOnboardingWizard() {
  const [step, setStep] = useState(0);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-24 md:pb-20">
      
      {/* Top Navbar specifically for the Wizard (since global NavBar is hidden) */}
      <div className="bg-paa-navy text-white px-4 md:px-8 py-3 flex justify-between items-center shadow-md z-50 sticky top-0">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="PAA Logo" className="h-8 md:h-10 object-contain bg-white rounded-full p-0.5" />
          <span className="font-serif text-lg md:text-xl tracking-wide font-medium hidden sm:block">
            <span className="text-paa-gold">Pune</span> Authors' Association
          </span>
        </Link>
        <Link to="/" className="text-[10px] md:text-xs uppercase tracking-widest text-gray-300 hover:text-white font-bold">
          Cancel
        </Link>
      </div>

      {/* Onboarding Stepper */}
      <div className="sticky top-[60px] z-40 w-full bg-white border-b border-paa-navy/5 px-2 md:px-6 py-3 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="max-w-4xl mx-auto flex items-center justify-between md:justify-center min-w-max md:min-w-0">
          {onboardingSteps.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div
                className="flex flex-col items-center px-2 md:px-4 cursor-pointer group"
                onClick={() => setStep(i)}
              >
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 shadow-sm
                    ${i < step ? "bg-paa-navy text-white shadow-paa-navy/20" : i === step ? "bg-paa-gold text-paa-navy shadow-paa-gold/20" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}
                >
                  {i < step ? <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" /> : <span className="scale-75 md:scale-100">{s.icon}</span>}
                </div>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap transition-colors ${i === step ? "text-paa-navy" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {s.title}
                </span>
              </div>
              {i < onboardingSteps.length - 1 && (
                <div className={`w-6 md:w-16 h-0.5 transition-colors ${i < step ? "bg-paa-navy" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {step === 0 && (
           <div className="w-full relative pb-16">
             <WizardAboutStep />
             <div className="fixed bottom-0 left-0 w-full bg-white border-t border-paa-navy/10 p-4 flex justify-center z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
               <button onClick={() => setStep(1)} className="dash-btn dash-btn-primary rounded-full px-8 py-3 text-sm md:text-base flex items-center shadow-md">
                 Next: Past Events <ChevronRight size={18} className="ml-2" />
               </button>
             </div>
           </div>
        )}
        {step === 1 && (
           <div className="w-full relative pb-16">
             <WizardEventsStep />
             <div className="fixed bottom-0 left-0 w-full bg-white border-t border-paa-navy/10 p-4 flex justify-center gap-4 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
               <button onClick={() => setStep(0)} className="px-6 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center">
                 <ChevronLeft size={16} className="mr-1 md:mr-2" /> <span className="hidden md:inline">Previous</span>
               </button>
               <button onClick={() => setStep(2)} className="dash-btn dash-btn-primary rounded-full px-8 py-3 text-sm md:text-base flex items-center shadow-md">
                 Next: Our Services <ChevronRight size={18} className="ml-2" />
               </button>
             </div>
           </div>
        )}
        {step === 2 && (
           <div className="w-full relative pb-16">
             <WizardServicesStep />
             <div className="fixed bottom-0 left-0 w-full bg-white border-t border-paa-navy/10 p-4 flex justify-center gap-4 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
               <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center">
                 <ChevronLeft size={16} className="mr-1 md:mr-2" /> <span className="hidden md:inline">Previous</span>
               </button>
               <button onClick={() => setStep(3)} className="dash-btn dash-btn-primary rounded-full px-6 md:px-8 py-3 text-sm md:text-base flex items-center shadow-md">
                 Continue to Join Form <ChevronRight size={18} className="ml-2" />
               </button>
             </div>
           </div>
        )}
        {step === 3 && (
          <div className="w-full relative bg-gray-50 min-h-screen">
             <div className="max-w-4xl mx-auto px-2 md:px-6 pt-4 pb-10">
               <button onClick={() => setStep(2)} className="mb-4 inline-flex items-center text-[11px] font-bold tracking-widest uppercase text-paa-navy bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-colors">
                  <ChevronLeft size={14} className="mr-1" /> Back to Services
               </button>
               <AuthorRegistrationPage hideNavbar={true} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
