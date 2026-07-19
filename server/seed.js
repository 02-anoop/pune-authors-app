const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const events = [
  {
    location: "Nyati Estate Community Hall",
    place: "Nyati Estate",
    city: "Pune",
    date: new Date("2024-11-15"),
    duration: "2 days",
    authors: 18,
    booksSold: 324,
    type: "Literary Event",
    description: "A vibrant two-day literary festival hosted at Nyati Estate's community hall featuring author readings, book launches, and a dedicated children's storytelling session that drew over 400 residents.",
    photoUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "AFMC Faculty Auditorium",
    place: "AFMC Campus",
    city: "Pune",
    date: new Date("2024-09-07"),
    duration: "1 day",
    authors: 9,
    booksSold: 187,
    type: "Corporate Activation",
    description: "A curated selection of medical and scientific non-fiction books for AFMC faculty and doctors. Featured author Dr. Anita Rao in discussion on science writing for general audiences.",
    photoUrl: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Pune Book Fair — Shivajinagar",
    place: "Bal Gandharva Rang Mandir",
    city: "Pune",
    date: new Date("2024-12-01"),
    duration: "5 days",
    authors: 32,
    booksSold: 812,
    type: "Book Fair",
    description: "PAA's most successful Book Fair participation to date. A dedicated PAA stall at Pune's annual book fair drew record footfall with live author interactions, a children's corner, and a debut book launch event.",
    photoUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Persistent Systems — TechHub",
    place: "Persistent Systems Campus",
    city: "Pune",
    date: new Date("2024-08-22"),
    duration: "1 day",
    authors: 7,
    booksSold: 142,
    type: "Corporate Activation",
    description: "An innovation-focused literary session at Persistent Systems featuring tech non-fiction, business biographies, and science books. A lunchtime author Q&A with Rahul Joshi ('Startup India') was the highlight.",
    photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Pune Airport — Terminal 1",
    place: "Pune International Airport",
    city: "Pune",
    date: new Date("2024-07-10"),
    duration: "Ongoing",
    authors: 24,
    booksSold: 398,
    type: "Airport Library",
    description: "PAA's first permanent flybrary installation at Pune Airport Terminal 1. 80 titles from 24 PAA authors displayed across a dedicated reading corner for passengers. Sales tracked monthly via QR-linked inventory system.",
    photoUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Kalyani Nagar Housing Society",
    place: "Malabar Heights Society",
    city: "Pune",
    date: new Date("2024-10-19"),
    duration: "1 day",
    authors: 11,
    booksSold: 98,
    type: "Literary Event",
    description: "A festive Diwali book pop-up in a premium Kalyani Nagar residential society. Gift-wrapping service and personalized author inscriptions were a hit with residents looking for literary Diwali gifts.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Goa Book Fair — Panaji",
    place: "Kala Academy",
    city: "Goa",
    date: new Date("2024-02-14"),
    duration: "3 days",
    authors: 15,
    booksSold: 421,
    type: "Book Fair",
    description: "PAA's debut at the Goa International Book Fair at Panaji's iconic Kala Academy. Our bilingual collection and children's corner received exceptional attention from Goa's literary community.",
    photoUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=250&fit=crop&auto=format",
  },
  {
    location: "Mumbai Airport — T2 Lounge",
    place: "Chhatrapati Shivaji International Airport",
    city: "Mumbai",
    date: new Date("2024-05-01"),
    duration: "Ongoing",
    authors: 30,
    booksSold: 567,
    type: "Airport Library",
    description: "Our busiest flybrary location. 100+ titles from PAA authors displayed in Mumbai T2's premium departure lounge. Monthly replenishment cycle managed by PAA operations team.",
    photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format",
  },
];

async function main() {
  console.log("Seeding Gallery mock data...");
  for (const event of events) {
    await prisma.galleryEvent.create({
      data: event
    });
  }
  console.log("Seeded successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
