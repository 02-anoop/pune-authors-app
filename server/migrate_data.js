const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration...");
  const authors = await prisma.author.findMany();
  
  for (const author of authors) {
    let updateData = {};
    
    // Copy age to dob if dob is empty
    if (author.age && !author.dob) {
      updateData.dob = author.age;
    }
    
    // Convert skills string to JSON array
    if (author.skills && !author.skillsJson) {
      const skillsArray = author.skills.split(',').map(s => s.trim()).filter(s => s);
      updateData.skillsJson = skillsArray;
    }
    
    // Convert hobbies string to JSON array
    if (author.hobbies && !author.hobbiesJson) {
      const hobbiesArray = author.hobbies.split(',').map(s => s.trim()).filter(s => s);
      updateData.hobbiesJson = hobbiesArray;
    }
    
    // Convert qualification to qualificationsJson
    if (author.qualification && !author.qualificationsJson) {
      try {
        const parsed = JSON.parse(author.qualification);
        updateData.qualificationsJson = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        updateData.qualificationsJson = [{ qualification: author.qualification }];
      }
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.author.update({
        where: { id: author.id },
        data: updateData
      });
      console.log(`Migrated author ID ${author.id}`);
    }
  }
  
  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
