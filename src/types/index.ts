export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
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
  isFavorited?: boolean;
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
  isLiked?: boolean;
  comments?: PostComment[];
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
  participantDetails?: Array<{
    id: string;
    name: string;
    avatar: string;
    username: string;
    role?: string;
    businessName?: string;
  }>;
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
  hasApplied?: boolean;
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
