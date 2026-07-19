import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Replace Status rendering logic
    target_status = """                      <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.registration === 'Registered' || evt.registration === 'Approved' ? 'bg-emerald-100 text-emerald-700' : (evt.registration === 'Pending' || evt.registration === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}`}>
                            {evt.registration}
                          </span>
                      </td>"""
                      
    replacement_status = """                      <td className="px-4 py-3 text-center">
                          {(() => {
                              let statusText = evt.registration;
                              let statusColors = 'bg-gray-100 text-gray-700';
                              
                              if (evt.isPast && !evt.isDataUpdated) {
                                  statusText = 'Awaiting Data';
                                  statusColors = 'bg-blue-100 text-blue-700 border border-blue-200';
                              } else if (evt.registration === 'Registered' || evt.registration === 'Approved') {
                                  statusText = 'Registered';
                                  statusColors = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                              } else if (evt.registration === 'Pending Approval') {
                                  statusText = 'Wait for Approval';
                                  statusColors = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
                              } else if (evt.registration === 'Pending') {
                                  statusText = 'Pending Registration';
                                  statusColors = 'bg-orange-100 text-orange-700 border border-orange-200';
                              }
                              
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors}`}>
                                  {statusText}
                                </span>
                              );
                          })()}
                      </td>"""

    content = content.replace(target_status, replacement_status)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY UPDATED STATUS LOGIC")

if __name__ == '__main__':
    fix_file()
