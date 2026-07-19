const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
  // We want to find events that are airport entries.
  // Based on the screenshot: "Thiruvananthapuram Airport @ Thiruvananthapuram Airport"
  // It has "Airport" in the name.
  
  db.all("SELECT * FROM events WHERE name LIKE '%Airport%' OR location LIKE '%Airport%'", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Found ${rows.length} airport entries.`);
    
    rows.forEach(row => {
      // row.date is likely a string like "2026-07-07T00:00:00.000Z" or similar
      if (row.date) {
        let oldDate = row.date;
        let newDate = oldDate.replace("2026", "2025");
        
        db.run("UPDATE events SET date = ? WHERE id = ?", [newDate, row.id], function(err) {
          if (err) console.error("Error updating row", row.id, err);
          else console.log(`Updated ${row.name}: ${oldDate} -> ${newDate}`);
        });
      }
    });
  });
});

