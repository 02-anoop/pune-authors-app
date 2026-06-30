const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const author = await prisma.author.create({
      data: {
        name: "Test",
        email: "test@test.com",
        phone: "1234567890",
        whatsapp: "NA",
        bio: "NA",
        penName: "NA",
        city: "NA",
        state: "NA",
        instagram: "",
        facebook: "",
        photoUrl: "",
        qrCodeUrl: "",
        transactionId: "NA",
        paymentScreenshot: "",
        qualification: JSON.stringify([]),
        institution: "NA",
        subject: "NA",
        certificateUrl: "",
        age: "NA",
        experience: "0",
        skills: "NA",
        hobbies: "NA",
        whyJoining: "NA",
        aadharNumber: "NA",
        address: "NA",
        district: "NA",
        pincode: "000000",
        dob: "NA",
        skillsJson: [],
        hobbiesJson: [],
        qualificationsJson: [],
        extraData: {},
        books: {
          create: [{
            title: "Test",
            subtitle: "NA",
            genre: "Test",
            subGenre: "NA",
            synopsis: "NA",
            pages: 0,
            mrp: 0,
            stock: 0,
            language: "NA",
            isbn: "000",
            publisher: "NA",
            publicationDate: "NA",
            edition: "1",
            format: "NA",
            printFormat: "NA",
            purpose: "NA",
            coverUrl: "",
            status: "Pending"
          }]
        }
      },
      include: { books: true }
    });
    console.log("Success");
  } catch(e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
