import React from 'react';

export const QueryThreadDisplay = ({ query, currentUserType }: { query: any, currentUserType: 'Customer' | 'Admin' | 'Author' }) => {
  if (!query) return null;

  const renderBubble = (sender: string, text: string, idx: number) => {
    const isMe = sender.startsWith(currentUserType) || 
                 (currentUserType === 'Author' && sender.startsWith('Author'));
    
    return (
      <div key={idx} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 px-1">{sender}</span>
        <div className={`px-4 py-2.5 max-w-[90%] text-sm shadow-sm ${
          isMe 
            ? 'bg-paa-navy text-white rounded-2xl rounded-tr-sm' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
        }`}>
          {text}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 w-full">
      {/* Initial Message from Customer */}
      {renderBubble('Customer', query.message, -1)}
      
      {/* Replies */}
      {query.reply && query.reply.split('\n\n---\n\n').map((msg: string, idx: number) => {
        let sender = 'Admin';
        let text = msg;
        
        if (msg.startsWith('Admin: ')) {
          sender = 'Admin';
          text = msg.replace('Admin: ', '');
        } else if (msg.startsWith('Customer: ')) {
          sender = 'Customer';
          text = msg.replace('Customer: ', '');
        } else if (msg.startsWith('Author')) {
          const match = msg.match(/^Author \((.*?)\): /);
          if (match) {
            sender = `Author (${match[1]})`;
            text = msg.replace(match[0], '');
          } else {
            sender = 'Author';
            text = msg.replace('Author: ', '');
          }
        }
        
        return renderBubble(sender, text, idx);
      })}
    </div>
  );
};
