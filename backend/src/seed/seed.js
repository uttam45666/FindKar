import dns from "dns";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Provider from '../models/Provider.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import Notification from '../models/Notification.model.js';
import SosAlert from '../models/SosAlert.model.js';

const CATEGORIES = ['plumber', 'electrician', 'carpenter', 'ac_technician', 'painter', 'maid', 'cook', 'driver'];

const seedProviders = [
  {
    fullName: 'Ramesh Kumar', username: 'rameshplumber', email: 'ramesh@findkar.com',
    phone: '9876543201', category: 'plumber',
    shopName: 'Ramesh Plumbing Works', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: '15 years experience. Leakage, pipe fitting, bathroom renovation.',
    services: [
      { serviceName: 'Pipe Leakage Fix', description: 'Fix all types of leakages', price: 200, priceType: 'starting' },
      { serviceName: 'Bathroom Fitting', description: 'Full bathroom plumbing', price: 800, priceType: 'starting' },
      { serviceName: 'Tap Replacement', description: 'Replace old taps', price: 150, priceType: 'fixed' },
    ],
    trustScore: 88, completedJobs: 143, neighborShares: 42,
    tagStats: { onTime: 130, transparent: 138, noSurprises: 125, workDone: 140, wouldCallAgain: 128, totalReviews: 143 },
  },
  {
    fullName: 'Suresh Patel', username: 'sureshelectric', email: 'suresh@findkar.com',
    phone: '9876543202', category: 'electrician',
    shopName: 'Suresh Electricals', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: 'Licensed electrician. Wiring, MCB, fans, AC installation.',
    services: [
      { serviceName: 'Wiring & Rewiring', description: 'Complete house wiring', price: 500, priceType: 'starting' },
      { serviceName: 'Fan Installation', description: 'Ceiling fan fitting', price: 150, priceType: 'fixed' },
      { serviceName: 'MCB & Switchboard', description: 'MCB repair and replacement', price: 300, priceType: 'starting' },
    ],
    trustScore: 92, completedJobs: 201, neighborShares: 78,
    tagStats: { onTime: 195, transparent: 196, noSurprises: 190, workDone: 198, wouldCallAgain: 192, totalReviews: 201 },
  },
  {
    fullName: 'Mohan Carpenter', username: 'mohancarpenter', email: 'mohan@findkar.com',
    phone: '9876543203', category: 'carpenter',
    shopName: 'Mohan Wood Works', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: 'Custom furniture, door repair, modular kitchen.',
    services: [
      { serviceName: 'Furniture Repair', description: 'Chair, table, sofa repair', price: 250, priceType: 'starting' },
      { serviceName: 'Door & Window Fix', description: 'Hinges, locks, frames', price: 200, priceType: 'starting' },
      { serviceName: 'Custom Furniture', description: 'Made-to-order furniture', price: 5000, priceType: 'starting' },
    ],
    trustScore: 79, completedJobs: 87, neighborShares: 31,
    tagStats: { onTime: 75, transparent: 82, noSurprises: 70, workDone: 85, wouldCallAgain: 74, totalReviews: 87 },
  },
  {
    fullName: 'Dinesh AC Tech', username: 'dineshac', email: 'dinesh@findkar.com',
    phone: '9876543204', category: 'ac_technician',
    shopName: 'Cool Air Services', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: 'AC service, gas refill, installation. All brands.',
    services: [
      { serviceName: 'AC Service', description: 'Full AC cleaning and service', price: 400, priceType: 'fixed' },
      { serviceName: 'Gas Refill', description: 'AC refrigerant refill', price: 800, priceType: 'starting' },
      { serviceName: 'AC Installation', description: 'New AC fitting', price: 1200, priceType: 'fixed' },
    ],
    trustScore: 85, completedJobs: 156, neighborShares: 55,
    tagStats: { onTime: 148, transparent: 150, noSurprises: 145, workDone: 154, wouldCallAgain: 149, totalReviews: 156 },
  },
  {
    fullName: 'Priya Maid Services', username: 'priyamaid', email: 'priya@findkar.com',
    phone: '9876543205', category: 'maid',
    shopName: 'Priya Home Services', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: 'Experienced in housekeeping, cooking, childcare.',
    services: [
      { serviceName: 'Daily Cleaning', description: 'Sweeping, mopping, dusting', price: 300, priceType: 'fixed' },
      { serviceName: 'Deep Cleaning', description: 'Full house deep clean', price: 800, priceType: 'starting' },
      { serviceName: 'Kitchen Cleaning', description: 'Kitchen and utensils', price: 400, priceType: 'fixed' },
    ],
    trustScore: 94, completedJobs: 312, neighborShares: 120,
    tagStats: { onTime: 305, transparent: 308, noSurprises: 300, workDone: 310, wouldCallAgain: 308, totalReviews: 312 },
  },
  {
    fullName: 'Anita Cook', username: 'anitacook', email: 'anita@findkar.com',
    phone: '9876543206', category: 'cook',
    shopName: 'Anita Home Kitchen', shopCity: 'Ahmedabad', shopState: 'Gujarat',
    bio: 'Home cook, Gujarati and North Indian cuisine expert.',
    services: [
      { serviceName: 'Daily Cooking', description: 'Lunch and dinner for family', price: 500, priceType: 'starting' },
      { serviceName: 'Party Catering', description: 'Events and functions', price: 2000, priceType: 'starting' },
    ],
    trustScore: 90, completedJobs: 98, neighborShares: 44,
    tagStats: { onTime: 92, transparent: 95, noSurprises: 90, workDone: 96, wouldCallAgain: 93, totalReviews: 98 },
  },
  {
    fullName: 'Vijay Painter', username: 'vijaypainter', email: 'vijay@findkar.com',
    phone: '9876543207', category: 'painter',
    shopName: 'Vijay Color Works', shopCity: 'Surat', shopState: 'Gujarat',
    bio: 'Interior and exterior painting. 10 years experience.',
    services: [
      { serviceName: 'Room Painting', description: 'Full room paint job', price: 1500, priceType: 'starting' },
      { serviceName: 'Wall Putty', description: 'Putty and primer application', price: 800, priceType: 'starting' },
    ],
    trustScore: 76, completedJobs: 64, neighborShares: 22,
    tagStats: { onTime: 58, transparent: 60, noSurprises: 55, workDone: 62, wouldCallAgain: 57, totalReviews: 64 },
  },
  {
    fullName: 'Raju Driver', username: 'rajudriver', email: 'raju@findkar.com',
    phone: '9876543208', category: 'driver',
    shopName: 'Raju Cab Services', shopCity: 'Surat', shopState: 'Gujarat',
    bio: 'Experienced driver. Available for outstation and local trips.',
    services: [
      { serviceName: 'Local Trip', description: 'City rides', price: 200, priceType: 'starting' },
      { serviceName: 'Outstation', description: 'Long distance trips', price: 1500, priceType: 'starting' },
    ],
    trustScore: 82, completedJobs: 211, neighborShares: 67,
    tagStats: { onTime: 200, transparent: 205, noSurprises: 198, workDone: 208, wouldCallAgain: 202, totalReviews: 211 },
  },
];

const seedCustomers = [
  { fullName: 'Amit Shah', username: 'amitshah', email: 'amit@example.com', phone: '9876540001' },
  { fullName: 'Neha Mehta', username: 'nehamehta', email: 'neha@example.com', phone: '9876540002' },
  { fullName: 'Raj Gupta', username: 'rajgupta', email: 'raj@example.com', phone: '9876540003' },
];

async function seed() {
  await connectDB();
  console.log('🌱 Starting seed...');

  // Clear all
  await Promise.all([
    User.deleteMany({}), Provider.deleteMany({}),
    Booking.deleteMany({}), Review.deleteMany({}),
    Notification.deleteMany({}), SosAlert.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Password must be plain text here; User pre-save hook handles hashing once.
  const seedPassword = 'Password@123';

  // Create admin
  const admin = await User.create({
    fullName: 'Findkar Admin', username: 'findkaradmin',
    email: 'admin@findkar.com', password: seedPassword,
    phone: '9000000000', role: 'admin',
    isEmailVerified: true, isPhoneVerified: true,
  });
  console.log('👤 Admin created');

  // Create customers
  const customerUsers = await Promise.all(seedCustomers.map(c =>
    User.create({ ...c, password: seedPassword, role: 'customer', isPhoneVerified: true })
  ));
  console.log(`👥 ${customerUsers.length} customers created`);

  // Create provider users + profiles
  const createdProviders = [];
  for (const p of seedProviders) {
    const user = await User.create({
      fullName: p.fullName, username: p.username,
      email: p.email, password: seedPassword,
      phone: p.phone, role: 'provider',
      isPhoneVerified: true,
      address: { city: p.shopCity, state: p.shopState },
    });

    const provider = await Provider.create({
      userId: user._id,
      shopName: p.shopName, shopCity: p.shopCity, shopState: p.shopState,
      bio: p.bio, primaryCategory: p.category,
      services: p.services,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}&scale=80`,
      shopImages: [
        `https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop`,
      ],
      isVerified: true, aadhaarVerified: true, isApproved: true,
      trustScore: p.trustScore, completedJobs: p.completedJobs,
      neighborShares: p.neighborShares, tagStats: p.tagStats,
      isProfileComplete: true, availability: true,
      totalEarnings: p.completedJobs * 450,
    });

    createdProviders.push({ user, provider });
  }
  console.log(`🔧 ${createdProviders.length} providers created`);

  // Create sample completed bookings with reviews
  const sampleBookings = [];
  for (let i = 0; i < 3; i++) {
    const customer = customerUsers[i % customerUsers.length];
    const { provider } = createdProviders[i];

    const booking = await Booking.create({
      customerId: customer._id,
      providerId: provider._id,
      serviceType: provider.services[0].serviceName,
      scheduledAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      address: '12, Green Park Society', city: 'Ahmedabad', state: 'Gujarat',
      status: 'completed',
      jobAmount: 500 + i * 100,
      platformFee: (500 + i * 100) * 0.05,
      reviewed: true,
      completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      otpVerified: true,
      statusHistory: [
        { status: 'pending', note: 'Booking placed' },
        { status: 'confirmed', note: 'Confirmed by provider' },
        { status: 'departed', note: 'Provider departed' },
        { status: 'arrived', note: 'Provider arrived' },
        { status: 'in_progress', note: 'Work started' },
        { status: 'completed', note: 'Work completed' },
      ],
    });

    await Review.create({
      bookingId: booking._id, customerId: customer._id, providerId: provider._id,
      rating: [5, 4, 5][i],
      tags: { onTime: true, transparent: true, noSurprises: i !== 1, workDone: true, wouldCallAgain: true },
      comment: [
        'Great service, very professional and courteous!',
        'Good work done on time. Minor communication delay.',
        'Excellent! Will definitely call again for future needs.'
      ][i],
      complaint: i === 1 ? 'Arrived 15 minutes late, but notified in advance.' : '',
    });

    sampleBookings.push(booking);
  }
  console.log(`📋 ${sampleBookings.length} sample bookings + reviews created`);

  // Welcome notifications for customers
  for (const customer of customerUsers) {
    await Notification.create({
      userId: customer._id, type: 'platform_update',
      title: 'Welcome to Findkar!',
      message: 'Find trusted local service providers in your area.',
      icon: 'home',
    });
  }

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 LOGIN CREDENTIALS (password: Password@123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:    admin@findkar.com');
  console.log('Customer: amit@example.com');
  console.log('Provider: ramesh@findkar.com  (plumber)');
  console.log('Provider: suresh@findkar.com  (electrician)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
