import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'business' | 'admin';
  avatar: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  phone?: string;
  businessName?: string;
  businessCategory?: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface Product {
  id: string;
  userId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  condition: 'Brand New' | 'Refurbished' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';
  images: string[];
  country: string;
  state: string;
  city: string;
  status: 'available' | 'reserved' | 'sold';
  isFeatured: boolean;
  views: number;
  createdAt: string;
}

export interface ProductFavorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorState: string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface PostLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  memberCount: number;
  isArchived: boolean;
  createdAt: string;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  content: string;
  attachments: string[];
  replyToId?: string;
  replyToContent?: string;
  replyToSenderName?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'business' | 'group';
  title?: string;
  avatar?: string;
  participants: string[];
  participantDetails?: Array<{ id: string; name: string; avatar: string; username: string }>;
  relatedItemId?: string;
  relatedItemType?: 'product' | 'job' | 'service';
  relatedItemTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  attachments: string[];
  replyToId?: string;
  status: 'sent' | 'delivered' | 'read';
  readBy: string[];
  createdAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  title: string;
  description: string;
  category: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  state: string;
  country: string;
  isRemote: boolean;
  requirements: string[];
  deadline: string;
  status: 'active' | 'closed';
  applicantsCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl?: string;
  coverNote: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
}

export interface LocalService {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  title: string;
  category: string;
  description: string;
  serviceArea: string;
  state: string;
  country: string;
  startingPrice: number;
  currency: string;
  phone: string;
  completedBookings: number;
  rating: number;
  reviewCount: number;
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  scheduledDate: string;
  notes: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'cancelled';
  price: number;
  currency: string;
  createdAt: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'friend_accepted' | 'booking' | 'job_application' | 'enquiry' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'post' | 'user' | 'message' | 'job' | 'service';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'featured_listing' | 'job_promotion' | 'verified_badge' | 'service_boost';
  amount: number;
  currency: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
  gateway: 'Paystack' | 'Flutterwave';
  itemId?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  products: Product[];
  productFavorites: ProductFavorite[];
  posts: Post[];
  postLikes: PostLike[];
  postComments: PostComment[];
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  chatRooms: ChatRoom[];
  roomMessages: RoomMessage[];
  conversations: Conversation[];
  directMessages: DirectMessage[];
  jobs: Job[];
  jobApplications: JobApplication[];
  services: LocalService[];
  serviceBookings: ServiceBooking[];
  serviceReviews: ServiceReview[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  auditLogs: AuditLog[];
  transactions: Transaction[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'naijahub_db.json');

// Password security helper
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, chosenSalt, 64).toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (err) {
        console.error('Error reading existing DB file, re-initializing seed data', err);
      }
    }

    const seeded = this.createInitialData();
    this.persist(seeded);
    return seeded;
  }

  private persist(dataToSave?: DatabaseSchema) {
    const toSave = dataToSave || this.data;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmp = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(toSave, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  public save() {
    this.persist();
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  private createInitialData(): DatabaseSchema {
    const now = new Date().toISOString();
    const adminPass = hashPassword('Admin@123456');
    const demoPass = hashPassword('Password@123');

    const adminUser: User = {
      id: 'usr_admin',
      email: 'admin@naijahub.ng',
      username: 'naijahub_admin',
      fullName: 'NaijaHub System Admin',
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Official NaijaHub Platform Safety, Operations & Community Moderation.',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Victoria Island',
      phone: '+234 802 000 0000',
      businessName: 'NaijaHub HQ',
      isVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    const userChidi: User = {
      id: 'usr_chidi',
      email: 'chidi@africatech.ng',
      username: 'chidi_tech',
      fullName: 'Chidi Okonkwo',
      passwordHash: demoPass.hash,
      salt: demoPass.salt,
      role: 'business',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Founder at Lagos Hardware Lab. Importer of certified gadgets, solar inverters & electronics.',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      phone: '+234 803 111 2233',
      businessName: 'Lagos Tech Direct',
      businessCategory: 'Electronics & Gadgets',
      isVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    const userAmina: User = {
      id: 'usr_amina',
      email: 'amina@bellafashion.ng',
      username: 'amina_couture',
      fullName: 'Amina Bello',
      passwordHash: demoPass.hash,
      salt: demoPass.salt,
      role: 'business',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Creative Director at Bella AfroStyle. Contemporary bespoke Aso-Ebi, Senegalese caftans and ready-to-wear.',
      country: 'Nigeria',
      state: 'Abuja (FCT)',
      city: 'Maitama',
      phone: '+234 809 444 5566',
      businessName: 'Bella AfroStyle Couture',
      businessCategory: 'Fashion & Tailoring',
      isVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    const userEmeka: User = {
      id: 'usr_emeka',
      email: 'emeka@solarsolutions.ng',
      username: 'emeka_solar',
      fullName: 'Engr. Emeka Nwosu',
      passwordHash: demoPass.hash,
      salt: demoPass.salt,
      role: 'business',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Certified Clean Energy & Electrical Engineer. Residential inverter & solar installation specialist.',
      country: 'Nigeria',
      state: 'Rivers',
      city: 'Port Harcourt',
      phone: '+234 810 777 8899',
      businessName: 'Apex Solar & Electric Works',
      businessCategory: 'Solar & Electrical Engineering',
      isVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    const userFolake: User = {
      id: 'usr_folake',
      email: 'folake@naijagrow.com',
      username: 'folake_diaspora',
      fullName: 'Folake Adeleke',
      passwordHash: demoPass.hash,
      salt: demoPass.salt,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Supply chain consultant connecting London & Lagos. Keen explorer of agriculture, trade, and African brands.',
      country: 'United Kingdom',
      state: 'London',
      city: 'Westminster',
      phone: '+44 7700 900123',
      isVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    const users = [adminUser, userChidi, userAmina, userEmeka, userFolake];

    // Initial Marketplace Products
    const products: Product[] = [
      {
        id: 'prod_1',
        userId: userChidi.id,
        sellerName: userChidi.fullName,
        sellerAvatar: userChidi.avatar,
        title: 'Apple iPhone 15 Pro Max 256GB Titanium — Clean Factory Unlocked',
        description: 'Original Apple iPhone 15 Pro Max, Natural Titanium color, battery health 99%, factory unlocked, includes original 20W charger and silicone protective case. Fully tested with 30 days warranty.',
        category: 'Phones & Tablets',
        subcategory: 'Smartphones',
        price: 1350000,
        currency: 'NGN',
        isNegotiable: true,
        condition: 'Used - Like New',
        images: ['/src/assets/images/market_gadgets_phones_1791791824779.jpg'],
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Computer Village, Ikeja',
        status: 'available',
        isFeatured: true,
        views: 248,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'prod_2',
        userId: userAmina.id,
        sellerName: userAmina.fullName,
        sellerAvatar: userAmina.avatar,
        title: 'Luxury 3-Piece Agbada & Fila Set — Royal Midnight Blue Embroidered',
        description: 'Handcrafted luxury guinea brocade fabric with detailed chest embroidery, inner buba and matching fila cap. Perfect for high-profile weddings, diplomatic events, and celebratory dinners. Available in bespoke sizes.',
        category: 'Fashion & Clothing',
        subcategory: "Men's Traditional Wear",
        price: 185000,
        currency: 'NGN',
        isNegotiable: false,
        condition: 'Brand New',
        images: ['/src/assets/images/market_fashion_wear_1791791836844.jpg'],
        country: 'Nigeria',
        state: 'Abuja (FCT)',
        city: 'Maitama',
        status: 'available',
        isFeatured: true,
        views: 182,
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
      {
        id: 'prod_3',
        userId: userChidi.id,
        sellerName: userChidi.fullName,
        sellerAvatar: userChidi.avatar,
        title: '5KVA Hybrid Solar Inverter System + 48V 100Ah Lithium Battery',
        description: 'Complete backup power solution for home & office: 5KVA 48V Pure Sine Wave Inverter, built-in MPPT charge controller, paired with 5.12kWh LiFePO4 battery pack. Zero downtime.',
        category: 'Home Appliances',
        subcategory: 'Generators & Power Solutions',
        price: 2450000,
        currency: 'NGN',
        isNegotiable: true,
        condition: 'Brand New',
        images: ['/src/assets/images/service_pro_tech_1791791847514.jpg'],
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lekki Phase 1',
        status: 'available',
        isFeatured: true,
        views: 310,
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
      {
        id: 'prod_4',
        userId: userFolake.id,
        sellerName: userFolake.fullName,
        sellerAvatar: userFolake.avatar,
        title: 'Premium Raw Organic Shea Butter (Grade A) — Export Bulk Cartons',
        description: 'Unrefined, Grade A ivory shea butter sourced directly from organic cooperatives in Niger State. Laboratory tested, free of chemicals, certified for export to UK, EU and US.',
        category: 'Food & Groceries',
        subcategory: 'Raw Agricultural Products',
        price: 75000,
        currency: 'NGN',
        isNegotiable: true,
        condition: 'Brand New',
        images: ['/src/assets/images/hero_naijahub_hub_1791791813531.jpg'],
        country: 'Nigeria',
        state: 'Niger',
        city: 'Minna',
        status: 'available',
        isFeatured: false,
        views: 94,
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      },
    ];

    // Initial Social Posts
    const posts: Post[] = [
      {
        id: 'post_1',
        userId: userChidi.id,
        authorName: userChidi.fullName,
        authorUsername: userChidi.username,
        authorAvatar: userChidi.avatar,
        authorState: 'Lagos, Nigeria',
        content: 'Huge milestone today! We just completed shipping our first batch of verified renewable solar micro-inverters to entrepreneurs in Onitsha and Aba. Nigerian craftsmanship and tech distribution are expanding rapidly. Let us connect if you need reliable clean energy for your workshop.',
        images: ['/src/assets/images/hero_naijahub_hub_1791791813531.jpg'],
        likesCount: 24,
        commentsCount: 6,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'post_2',
        userId: userAmina.id,
        authorName: userAmina.fullName,
        authorUsername: userAmina.username,
        authorAvatar: userAmina.avatar,
        authorState: 'Abuja, Nigeria',
        content: 'Delivering bespoke pieces to clients across London, Toronto, and Lagos this month. The appetite for authentic Nigerian textile design on the world stage has never been higher! Thank you to everyone supporting local artisans and ethical fashion.',
        images: ['/src/assets/images/market_fashion_wear_1791791836844.jpg'],
        likesCount: 38,
        commentsCount: 9,
        createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
      },
    ];

    const postComments: PostComment[] = [
      {
        id: 'cmt_1',
        postId: 'post_1',
        userId: userEmeka.id,
        authorName: userEmeka.fullName,
        authorAvatar: userEmeka.avatar,
        content: 'Super proud of this accomplishment Chidi! Clean energy is the future for our industrial clusters.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'cmt_2',
        postId: 'post_2',
        userId: userFolake.id,
        authorName: userFolake.fullName,
        authorAvatar: userFolake.avatar,
        content: 'The quality of the midnight blue Agbada is outstanding. London reception was fantastic!',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];

    // Initial Chat Rooms (Public Business Connect Spaces)
    const chatRooms: ChatRoom[] = [
      {
        id: 'room_worldwide_biz',
        name: 'Worldwide Business Chat',
        description: 'International networking, global trade discussions, cross-border partnerships, and diaspora commerce.',
        category: 'International Business',
        iconName: 'Globe',
        memberCount: 412,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_naija_community',
        name: 'Nigerian Business Community',
        description: 'Local business owners, SMEs, policy discussions, startup collaboration, and economic opportunities across Nigeria.',
        category: 'Local Commerce',
        iconName: 'Briefcase',
        memberCount: 680,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_buy_sell',
        name: 'Buy and Sell Worldwide',
        description: 'Wholesale suppliers, product discoveries, buyer inquiries, flash stock updates, and trade verification.',
        category: 'Marketplace Deals',
        iconName: 'ShoppingBag',
        memberCount: 520,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_tech_startups',
        name: 'Technology & Startups',
        description: 'Developers, product builders, fintech, AI innovation, software engineering, and investment leads.',
        category: 'Technology',
        iconName: 'Cpu',
        memberCount: 395,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_jobs_career',
        name: 'Jobs and Career Opportunities',
        description: 'Direct hiring managers, job openings, CV reviews, career coaching, and freelance project broadcasts.',
        category: 'Employment',
        iconName: 'UserCheck',
        memberCount: 460,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_agric_export',
        name: 'Agriculture, Food & Export',
        description: 'Farm gate supplies, agro-commodities, grain storage, cold chain logistics, and non-oil export standards.',
        category: 'Agriculture & Trade',
        iconName: 'Sprout',
        memberCount: 290,
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'room_freelancers_services',
        name: 'Freelancers & Digital Services',
        description: 'Graphic designers, copywriters, digital marketers, technical consultants, and project collaboration.',
        category: 'Digital Services',
        iconName: 'Laptop',
        memberCount: 310,
        isArchived: false,
        createdAt: now,
      },
    ];

    const roomMessages: RoomMessage[] = [
      {
        id: 'rmsg_1',
        roomId: 'room_worldwide_biz',
        userId: userFolake.id,
        senderName: userFolake.fullName,
        senderAvatar: userFolake.avatar,
        senderRole: 'user',
        content: 'Hello everyone from London! Looking for verified exporters of dried ginger and hibiscus (Zobo) in Kano or Kaduna for UK distribution.',
        attachments: [],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'rmsg_2',
        roomId: 'room_worldwide_biz',
        userId: userChidi.id,
        senderName: userChidi.fullName,
        senderAvatar: userChidi.avatar,
        senderRole: 'business',
        content: 'Welcome Folake! I can connect you with certified farming cooperatives with phytosanitary certificates ready for export.',
        attachments: [],
        replyToId: 'rmsg_1',
        replyToContent: 'Looking for verified exporters of dried ginger and hibiscus...',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'rmsg_3',
        roomId: 'room_naija_community',
        userId: userEmeka.id,
        senderName: userEmeka.fullName,
        senderAvatar: userEmeka.avatar,
        senderRole: 'business',
        content: 'Reminder for SMEs: The federal solar rebate program application window is open until Friday. Reach out if you need technical audits!',
        attachments: [],
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];

    // Initial Direct Conversation
    const conversation1: Conversation = {
      id: 'conv_chidi_folake',
      type: 'direct',
      participants: [userChidi.id, userFolake.id],
      relatedItemId: 'prod_1',
      relatedItemType: 'product',
      relatedItemTitle: 'Apple iPhone 15 Pro Max 256GB Titanium',
      lastMessage: 'Sounds great! I will take the package with DHL express shipping.',
      lastMessageAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    };

    const directMessages: DirectMessage[] = [
      {
        id: 'dmsg_1',
        conversationId: 'conv_chidi_folake',
        senderId: userFolake.id,
        senderName: userFolake.fullName,
        senderAvatar: userFolake.avatar,
        content: 'Hi Chidi, is the iPhone 15 Pro Max still available? Can you ship to the UK or a Lagos handling agent?',
        attachments: [],
        status: 'read',
        readBy: [userChidi.id, userFolake.id],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'dmsg_2',
        conversationId: 'conv_chidi_folake',
        senderId: userChidi.id,
        senderName: userChidi.fullName,
        senderAvatar: userChidi.avatar,
        content: 'Hello Folake! Yes, completely available. We can do direct dispatch via DHL Worldwide Express or hand over to your agent in Ikeja.',
        attachments: [],
        status: 'read',
        readBy: [userChidi.id, userFolake.id],
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: 'dmsg_3',
        conversationId: 'conv_chidi_folake',
        senderId: userFolake.id,
        senderName: userFolake.fullName,
        senderAvatar: userFolake.avatar,
        content: 'Sounds great! I will take the package with DHL express shipping.',
        attachments: [],
        status: 'read',
        readBy: [userChidi.id, userFolake.id],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];

    // Initial Jobs
    const jobs: Job[] = [
      {
        id: 'job_1',
        employerId: userChidi.id,
        employerName: 'Lagos Tech Direct',
        employerAvatar: userChidi.avatar,
        title: 'Senior Hardware Systems & Solar Technician',
        description: 'We are expanding our installation teams across Lagos and Ibadan. You will oversee solar inverter sizing, battery rack assemblies, circuit balancing, and customer support audits.',
        category: 'Engineering & Technical',
        employmentType: 'Full-time',
        salaryMin: 350000,
        salaryMax: 500000,
        currency: 'NGN',
        location: 'Ikeja & Greater Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        isRemote: false,
        requirements: ['Minimum 3 years hands-on experience in solar PV & inverters', 'COREN or technical diploma in Electrical Engineering', 'Valid driver license and safety certification'],
        deadline: '2026-11-30',
        status: 'active',
        applicantsCount: 7,
        isFeatured: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'job_2',
        employerId: userAmina.id,
        employerName: 'Bella AfroStyle Couture',
        employerAvatar: userAmina.avatar,
        title: 'Master Pattern Cutter & Bespoke Tailor',
        description: 'Seeking a seasoned pattern cutter skilled in precision luxury garment making, Aso-Ebi structured corsetry, and contemporary caftans for an international clientele.',
        category: 'Fashion & Design',
        employmentType: 'Full-time',
        salaryMin: 220000,
        salaryMax: 320000,
        currency: 'NGN',
        location: 'Maitama, Abuja',
        state: 'Abuja (FCT)',
        country: 'Nigeria',
        isRemote: false,
        requirements: ['Extensive portfolio in bridal, traditional and contemporary fashion', 'Mastery of industrial embroidery machines', 'Keen eye for symmetry and finishing'],
        deadline: '2026-11-15',
        status: 'active',
        applicantsCount: 4,
        isFeatured: true,
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
      {
        id: 'job_3',
        employerId: adminUser.id,
        employerName: 'NaijaHub Operations',
        employerAvatar: adminUser.avatar,
        title: 'Full Stack Web & Mobile Engineer (TypeScript / React)',
        description: 'Join the core engineering team building scalable communication and commerce pipelines for African businesses worldwide. Remote position with competitive compensation.',
        category: 'Technology & IT',
        employmentType: 'Remote',
        salaryMin: 1200000,
        salaryMax: 1800000,
        currency: 'NGN',
        location: 'Remote Worldwide / Nigeria',
        state: 'Lagos',
        country: 'Nigeria',
        isRemote: true,
        requirements: ['Demonstrated mastery of React 19, TypeScript, Express, WebSockets, PostgreSQL', 'Experience building resilient offline-first PWAs and low-bandwidth web architectures', 'Strong security and API design mindset'],
        deadline: '2026-12-01',
        status: 'active',
        applicantsCount: 19,
        isFeatured: true,
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      },
    ];

    // Initial Local Services
    const services: LocalService[] = [
      {
        id: 'srv_1',
        providerId: userEmeka.id,
        providerName: userEmeka.fullName,
        providerAvatar: userEmeka.avatar,
        title: 'Solar Inverter Inspection, Maintenance & Load Auditing',
        category: 'Electrical & Clean Energy',
        description: 'Professional comprehensive diagnosis of existing solar installations, inverter firmware calibration, battery health restoration, wiring safety tests, and load optimization.',
        serviceArea: 'Port Harcourt, Rivers State & South-South Region',
        state: 'Rivers',
        country: 'Nigeria',
        startingPrice: 35000,
        currency: 'NGN',
        phone: userEmeka.phone || '+234 810 777 8899',
        completedBookings: 43,
        rating: 4.9,
        reviewCount: 31,
        images: ['/src/assets/images/service_pro_tech_1791791847514.jpg'],
        isVerified: true,
        createdAt: now,
      },
      {
        id: 'srv_2',
        providerId: userAmina.id,
        providerName: userAmina.fullName,
        providerAvatar: userAmina.avatar,
        title: 'Custom Bridal & Event Styling Consultation',
        category: 'Fashion & Tailoring',
        description: 'Personalized styling sessions for brides, grooms, and high-net-worth event attendees. Includes fabric sourcing, body proportion analysis, and expedited production scheduling.',
        serviceArea: 'Abuja, Lagos, and Global Virtual Consultations',
        state: 'Abuja (FCT)',
        country: 'Nigeria',
        startingPrice: 50000,
        currency: 'NGN',
        phone: userAmina.phone || '+234 809 444 5566',
        completedBookings: 28,
        rating: 5.0,
        reviewCount: 22,
        images: ['/src/assets/images/market_fashion_wear_1791791836844.jpg'],
        isVerified: true,
        createdAt: now,
      },
    ];

    const serviceReviews: ServiceReview[] = [
      {
        id: 'srev_1',
        serviceId: 'srv_1',
        bookingId: 'sb_seed1',
        customerId: userFolake.id,
        customerName: userFolake.fullName,
        customerAvatar: userFolake.avatar,
        rating: 5,
        comment: 'Engr Emeka quickly diagnosed a loose busbar on our family compound in Port Harcourt. Honest, punctual, and highly skilled!',
        createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      },
    ];

    const notifications: NotificationItem[] = [
      {
        id: 'notif_1',
        userId: userChidi.id,
        type: 'enquiry',
        title: 'New Product Inquiry',
        message: 'Folake Adeleke inquired about "Apple iPhone 15 Pro Max 256GB Titanium".',
        link: '/messages?conv=conv_chidi_folake',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'log_1',
        actorId: adminUser.id,
        actorName: adminUser.fullName,
        action: 'PLATFORM_INITIALIZATION',
        targetType: 'SYSTEM',
        targetId: 'naijahub_core',
        details: 'NaijaHub core ecosystem databases initialized with secure schema enforcement.',
        createdAt: now,
      },
    ];

    return {
      users,
      sessions: [],
      products,
      productFavorites: [],
      posts,
      postLikes: [],
      postComments,
      friendRequests: [],
      friendships: [
        {
          id: 'fr_1',
          user1Id: userChidi.id,
          user2Id: userFolake.id,
          createdAt: now,
        },
      ],
      chatRooms,
      roomMessages,
      conversations: [conversation1],
      directMessages,
      jobs,
      jobApplications: [],
      services,
      serviceBookings: [],
      serviceReviews,
      notifications,
      reports: [],
      auditLogs,
      transactions: [],
    };
  }
}

export const db = new Database();
