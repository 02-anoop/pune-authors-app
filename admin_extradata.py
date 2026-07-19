with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_bio_admin = '''             <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Author Bio</p>
                <p className="text-sm font-medium text-paa-navy bg-gray-50 p-4 border rounded leading-relaxed">{authorProfile.bio || 'No biography provided.'}</p>
             </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};'''

new_bio_admin = '''             <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Author Bio</p>
                <p className="text-sm font-medium text-paa-navy bg-gray-50 p-4 border rounded leading-relaxed">{authorProfile.bio || 'No biography provided.'}</p>
             </div>
             
             {authorProfile.extraData && Object.keys(authorProfile.extraData).length > 0 && (
                <div className="md:col-span-2 mt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Additional Required Details</p>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.entries(authorProfile.extraData).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">{key}</p>
                           <p className="text-sm font-medium text-paa-navy">{String(val)}</p>
                        </div>
                     ))}
                   </div>
                </div>
             )}
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};'''

content = content.replace(old_bio_admin, new_bio_admin)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx with extraData display")
