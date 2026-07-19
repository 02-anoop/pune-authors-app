const fs = require('fs');
let content = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');

const orderTrRegex = /<tr key=\{ord\.dbId\}>/g;
const orderTrReplacement = `<tr key={ord.dbId} className={ord.slaBreached ? 'bg-red-50' : ''}>`;

const orderBadgeRegex = /<span className=\{\`dash-badge \$\{ord\.status === 'Completed' \? 'active' : ord\.status === 'Payment Not Received' \? 'rejected' : 'pending'\}\`\}>/g;
const orderBadgeReplacement = `<span className={\`dash-badge \${ord.status === 'Completed' ? 'active' : ord.status === 'Payment Not Received' ? 'rejected' : 'pending'}\`}>`;

const notifyAuthorButtonStr = `
                      <button onClick={() => setSelectedOrder(ord)} className="dash-btn dash-btn-ghost">Details</button>
                      {ord.slaBreached && (
                        <button 
                          onClick={() => {
                             // Naive implementation for notify author
                             const target = ord.items[0]?.authorName || 'Author';
                             setNewNotification('@' + target + ' Please dispatch order ' + ord.id + ' immediately. SLA breached!');
                             setActiveTab('Notifications');
                          }} 
                          className="dash-btn dash-btn-ghost text-red-600 border-red-200 mt-2 hover:bg-red-100"
                        >
                          Notify Author
                        </button>
                      )}
`;
const actionButtonRegex = /<button onClick=\{\(\) => setSelectedOrder\(ord\)\} className="dash-btn dash-btn-ghost">Details<\/button>/g;

content = content.replace(orderTrRegex, orderTrReplacement);
content = content.replace(actionButtonRegex, notifyAuthorButtonStr);

// We need to ensure ord.slaBreached is computed. Wait, where is `orders` mapped?
// It's mapped from `const [allOrders, setAllOrders] = useState([]);` -> `const filteredOrders = allOrders...` or directly from `orders` which is passed as a prop or local state.
// Let's find where orders are defined in `OperationsDashboardPage.tsx`.

const orderMappingRegex = /const orders = \(\(\) => \{[\s\S]*?\}\)\(\);/g;
const mappedOrdersReplacement = `
    const nowTime = new Date().getTime();
    const mapped = (allOrders || []).map((o: any) => {
      // Calculate SLA: Payment Verified but not dispatched within 24h
      let slaBreached = false;
      const createdTime = new Date(o.createdAt).getTime();
      const hoursSince = (nowTime - createdTime) / (1000 * 60 * 60);
      
      // If it's Completed (Paid) and it's been more than 24 hours, and items are not Dispatched
      if (o.status === 'Completed' && hoursSince > 24) {
         const hasPendingItems = o.items.some((it: any) => it.status !== 'Dispatched' && it.status !== 'Delivered' && it.status !== 'Cancelled');
         if (hasPendingItems) slaBreached = true;
      }
      
      return {
        id: 'ORD-' + o.id.toString().padStart(4, '0'),
        dbId: o.id,
        date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: o.createdAt,
        customer: o.customerName || 'Anonymous',
        total: o.amount,
        status: o.status,
        slaBreached,
        items: o.items.map((it: any) => ({
          qty: it.quantity,
          title: it.book?.title,
          authorName: it.book?.author?.name,
          status: it.status
        })),
        originalOrder: o
      };
    });
`;

// It seems Orders is a sub-component or function `const renderOrdersTab = ({ refreshTrigger }: any) => {`
// Inside `renderOrdersTab`, it fetches `fetch(api/admin/orders)` maybe?
// Actually in OperationsDashboardPage, allOrders is fetched at the top level and passed down, or fetched inside.
// Let's just do a naive regex replacement in `renderOrdersTab` where `orders` is mapped.
content = content.replace(/const orders = allOrders\.map\(\(o: any\) => \(\{/g, `
    const nowTime = new Date().getTime();
    const orders = allOrders.map((o: any) => {
      let slaBreached = false;
      const createdTime = new Date(o.createdAt).getTime();
      const hoursSince = (nowTime - createdTime) / (1000 * 60 * 60);
      if (o.status === 'Completed' && hoursSince > 24) {
         const hasPendingItems = o.items?.some((it: any) => it.status !== 'Dispatched' && it.status !== 'Delivered' && it.status !== 'Cancelled');
         if (hasPendingItems) slaBreached = true;
      }
      return {
        slaBreached,
`);

// The problem is I don't know the exact syntax used to map orders. Let's find it.
