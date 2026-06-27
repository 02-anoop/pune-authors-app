const fs = require('fs');
let c = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

c = c.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('Eye')) {
    return `import {${p1}, Eye} from 'lucide-react';`;
  }
  return match;
});

const st = `
  const [selectedBooksToLink, setSelectedBooksToLink] = useState<any[]>([]);
  const [optInEventId, setOptInEventId] = useState<any>(null);
  const [paymentScreenshotBlob, setPaymentScreenshotBlob] = useState<any>(null);
  const [catalogueEventData, setCatalogueEventData] = useState<any>({ authors: [] });
  const books = data.authorProfile?.books || [];
  const pastEvents = data.pastEvents || [];
  const submitOptIn = (eventId: any, evt: any) => {};
  const handleViewCatalogue = (eventId: any) => {};
  const handleOpenSettlement = (eventId: any) => {};
`;

c = c.replace('const [showEditProfile, setShowEditProfile] = useState(false);', 'const [showEditProfile, setShowEditProfile] = useState(false);\n' + st);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', c);
