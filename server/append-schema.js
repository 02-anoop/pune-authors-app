const fs = require('fs');

const appendText = `
model Library {
  id               Int      @id @default(autoincrement())
  name             String
  type             String   // Airport Library, Public Library, etc.
  airportCode      String?
  airportName      String?
  city             String
  state            String
  country          String
  contactPerson    String
  contactNumber    String
  email            String?
  shippingAddress  String
  status           String   @default("Active") // Active / Inactive
  createdAt        DateTime @default(now())
  
  announcements    DonationAnnouncement[]
  logs             DonationLog[]
}

model DonationAnnouncement {
  id                     Int       @id @default(autoincrement())
  title                  String
  description            String
  libraryId              Int
  library                Library   @relation(fields: [libraryId], references: [id], onDelete: Cascade)
  eventDate              String?
  announcementDate       String
  registrationStartDate  String
  registrationEndDate    String
  expectedCollectionDate String
  expectedDispatchDate   String
  collectionPoint        String
  dispatchAddress        String
  contactPerson          String
  contactNumber          String
  feeType                String    @default("Free")
  feeAmount              Int?
  additionalInstructions String?
  visibility             String    @default("Draft") // Draft, Published, Closed
  createdAt              DateTime  @default(now())
  
  registrations          DonationRegistration[]
}

model DonationRegistration {
  id                 Int      @id @default(autoincrement())
  announcementId     Int
  authorId           Int
  status             String   @default("Registered") // Registered, Approved, Rejected, Changes Requested
  verificationStatus String   @default("Pending")
  dispatchStatus     String   @default("Pending")
  receivedStatus     String   @default("Pending")
  
  feePaid            Int?
  paymentStatus      String?  @default("Pending") // Pending, Completed, Failed
  
  dispatchDate       String?
  courierPartner     String?
  trackingNumber     String?
  collectionPoint    String?
  packedBy           String?
  
  receivedDate       String?
  receivedBy         String?
  libraryConfirmation Boolean @default(false)
  proofImageUrl      String?
  remarks            String?
  
  createdAt          DateTime @default(now())
  
  announcement       DonationAnnouncement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  author             Author               @relation(fields: [authorId], references: [id], onDelete: Cascade)
  books              DonationBook[]
}

model DonationBook {
  id               Int      @id @default(autoincrement())
  registrationId   Int
  bookId           Int
  quantityDonated  Int
  createdAt        DateTime @default(now())
  
  registration     DonationRegistration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  book             Book                 @relation(fields: [bookId], references: [id], onDelete: Cascade)
}

model DonationLog {
  id               Int      @id @default(autoincrement())
  date             DateTime @default(now())
  libraryId        Int
  authorId         Int
  bookId           Int
  quantity         Int
  dispatchDate     String?
  deliveryDate     String?
  status           String
  remarks          String?
  
  library          Library @relation(fields: [libraryId], references: [id], onDelete: Cascade)
  author           Author  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  book             Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
}
`;

fs.appendFileSync('prisma/schema.prisma', appendText);
console.log('Appended models to schema.prisma');
