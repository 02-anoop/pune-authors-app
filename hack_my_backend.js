async function simulateDDoSAttack() {
  console.log("🔥 INITIATING SIMULATED DDoS ATTACK...");
  console.log("Target: https://pune-authors-api.duckdns.org/api/public-stats");
  
  const targetUrl = 'https://pune-authors-api.duckdns.org/api/public-stats';
  const totalRequests = 1050; // The limit is 1000, so we send slightly more!
  let completed = 0;
  let blocked = 0;
  
  // Create an array of 1050 promises that all fire at the exact same time
  const requests = Array.from({ length: totalRequests }).map(async (_, i) => {
    try {
      const response = await fetch(targetUrl);
      if (response.status === 429) {
        blocked++;
      }
    } catch (error) {
      // Ignore network errors
    } finally {
      completed++;
      if (completed % 100 === 0) {
        console.log(`📡 Sent ${completed} requests...`);
      }
    }
  });

  console.log(`🚀 Firing ${totalRequests} simultaneous requests! Hang on...`);
  await Promise.all(requests);
  
  console.log("=================================================");
  console.log(`✅ ATTACK FINISHED!`);
  console.log(`🛡️ The Rate Limiter intercepted and blocked ${blocked} requests!`);
  console.log(`🚨 YOUR IP IS NOW BANNED FOR 15 MINUTES!`);
  console.log("👉 Go open your website in Google Chrome right now to see the Red Popup!");
}

simulateDDoSAttack();
