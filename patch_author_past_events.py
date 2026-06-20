import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add pastEvents state
if "const [pastEvents, setPastEvents] = useState<any[]>([]);" not in content:
    content = content.replace(
        "const [listedBooks, setListedBooks] = useState<any[]>([]);",
        "const [listedBooks, setListedBooks] = useState<any[]>([]);\n  const [pastEvents, setPastEvents] = useState<any[]>([]);"
    )

# 2. Update fetchAuthorEvents to set pastEvents
if "setPastEvents(res.data.pastEvents || []);" not in content:
    content = content.replace(
        "setListedBooks(res.data.listedBooks || []);",
        "setListedBooks(res.data.listedBooks || []);\n       setPastEvents(res.data.pastEvents || []);"
    )

# 3. Add the Past Events section at the bottom of the component
past_events_section = """
      {pastEvents.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-serif text-paa-navy mb-6 text-center uppercase border-t pt-8">Past Events Gallery</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pastEvents.map((evt) => (
               <div key={evt.id} className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b border-gray-200">
                     <h4 className="font-serif font-medium text-paa-navy text-lg truncate" title={evt.name}>{evt.name}</h4>
                  </div>
                  <div className="p-4 space-y-2 text-sm text-gray-600">
                     <p>📅 {evt.date} &bull; {evt.duration}</p>
                     <p className="truncate" title={evt.location}>📍 {evt.location}</p>
                     <p className="text-xs pt-2 mt-2 border-t border-gray-100 italic text-gray-400">This event has concluded.</p>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}
"""

if "Past Events Gallery" not in content:
    content = content.replace(
        """      )}
    </div>
  );""",
        """      )}""" + past_events_section + """
    </div>
  );"""
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
