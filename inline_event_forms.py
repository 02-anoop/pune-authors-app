import os
import re

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the modals from the bottom of OperationsDashboardPage
create_modal_start = content.find("<Modal isOpen={isEventModalOpen}")
if create_modal_start == -1:
    print("Could not find Create Event Modal")

# Find the end of Create Event Modal
create_modal_end = content.find("</Modal>", create_modal_start) + 8

create_modal_content = content[create_modal_start:create_modal_end]
content = content[:create_modal_start] + content[create_modal_end:]

manage_modal_start = content.find("<Modal isOpen={showAuthorDataModal}")
if manage_modal_start != -1:
    manage_modal_end = content.find("</Modal>", manage_modal_start) + 8
    manage_modal_content = content[manage_modal_start:manage_modal_end]
    content = content[:manage_modal_start] + content[manage_modal_end:]
else:
    print("Could not find Manage Modal")

# 2. Extract the forms from the modals and convert them to inline views.
# Create Event Form:
create_form = create_modal_content.replace("<Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title=\"Create Event\">", "")
create_form = create_form.replace("</Modal>", "")
create_form = create_form.strip()

# Add "Other" to eventType and handle state
create_form = create_form.replace(
"""              <select name="eventType" className="dash-input">
                <option value="Book Fair">Book Fair</option>
                <option value="Literary Event">Literary Event</option>
              </select>""",
"""              <select name="eventType" className="dash-input" onChange={(e) => {
                  const el = document.getElementById('otherEventTypeInput');
                  if (el) el.style.display = e.target.value === 'Other' ? 'block' : 'none';
              }}>
                <option value="Book Fair">Book Fair</option>
                <option value="Literary Event">Literary Event</option>
                <option value="Other">Other</option>
              </select>
              <input id="otherEventTypeInput" name="otherEventType" type="text" className="dash-input mt-2" placeholder="Specify event type" style={{ display: 'none' }} />"""
)

# Update form submission to use otherEventType
create_form = create_form.replace(
"fd.append('eventType', target.eventType.value);",
"fd.append('eventType', target.eventType.value === 'Other' ? (target.otherEventType?.value || 'Other') : target.eventType.value);"
)

inline_create_view = f"""
      <div className="bg-white rounded-xl shadow-premium p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
           <h3 className="text-2xl font-serif text-paa-navy">Create New Event</h3>
           <button onClick={{() => setIsEventModalOpen(false)}} className="dash-btn dash-btn-ghost text-gray-500 hover:text-gray-700">Cancel & Go Back</button>
        </div>
        {create_form}
      </div>
"""

# Manage Author Data Form:
manage_form = manage_modal_content.replace("<Modal isOpen={showAuthorDataModal} onClose={() => setShowAuthorDataModal(false)} title=\"Manage Author Data & Publish\">", "")
manage_form = manage_form.replace("</Modal>", "")
manage_form = manage_form.strip()

inline_manage_view = f"""
      <div className="bg-white rounded-xl shadow-premium p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
           <h3 className="text-2xl font-serif text-paa-navy">Manage Author Data</h3>
           <button onClick={{() => setShowAuthorDataModal(false)}} className="dash-btn dash-btn-ghost text-gray-500 hover:text-gray-700">Cancel & Go Back</button>
        </div>
        {manage_form}
      </div>
"""

# 3. Modify EventsTab to render these views if state is true
events_tab_start = content.find("const EventsTab = () => {")
events_tab_return = content.find("return (", events_tab_start)

# We wrap the existing return content in a condition:
# if (isEventModalOpen) return inline_create_view;
# if (showAuthorDataModal) return inline_manage_view;

injection = f"""
    if (isEventModalOpen) return (
{inline_create_view}
    );

    if (showAuthorDataModal) return (
{inline_manage_view}
    );
"""

content = content[:events_tab_return] + injection + "\n    " + content[events_tab_return:]

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored OperationsDashboardPage.tsx successfully")
