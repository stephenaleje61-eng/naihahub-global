import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Job, LocalService } from '../types';
import {
  Briefcase,
  Wrench,
  Search,
  MapPin,
  CheckCircle,
  Plus,
  ShieldAlert,
  Calendar,
  X,
  Loader2,
  DollarSign,
  Star,
  Clock,
  Send,
  Building,
  Zap,
} from 'lucide-react';

interface ServicesViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenReport: (targetType: string, targetId: string, title: string) => void;
  onOpenPayment: (packageId: string, itemId: string, title: string) => void;
}

const JOB_CATEGORIES = [
  'All',
  'Technology & IT',
  'Engineering & Technical',
  'Sales & Marketing',
  'Fashion & Design',
  'Education & Training',
  'Healthcare',
  'Hospitality & Tourism',
  'Customer Support',
  'Remote & Digital Services',
];

const SERVICE_CATEGORIES = [
  'All',
  'Electrical & Clean Energy',
  'Fashion & Tailoring',
  'Gadget & Phone Repair',
  'Plumbing & Water Systems',
  'Carpentry & Furniture',
  'Catering & Food Services',
  'Automobile Repair & Mechanics',
  'Photography & Media',
];

export const ServicesView: React.FC<ServicesViewProps> = ({
  onOpenAuth,
  onOpenReport,
  onOpenPayment,
}) => {
  const { user, formatPrice } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'artisans'>('jobs');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJobCategory, setSelectedJobCategory] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Job application modal
  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Post a Job Modal
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [postJobTitle, setPostJobTitle] = useState('');
  const [postJobCategory, setPostJobCategory] = useState('Technology & IT');
  const [postJobType, setPostJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>('Full-time');
  const [postJobSalaryMin, setPostJobSalaryMin] = useState('');
  const [postJobSalaryMax, setPostJobSalaryMax] = useState('');
  const [postJobLocation, setPostJobLocation] = useState('Lagos');
  const [postJobState, setPostJobState] = useState('Lagos');
  const [postJobDescription, setPostJobDescription] = useState('');
  const [postJobRequirements, setPostJobRequirements] = useState('');
  const [isPostingJob, setIsPostingJob] = useState(false);

  // Artisans / Local Services state
  const [services, setServices] = useState<LocalService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [selectedService, setSelectedService] = useState<LocalService | null>(null);

  // Book Service Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Register Service Provider Modal
  const [isRegisterProviderModalOpen, setIsRegisterProviderModalOpen] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Electrical & Clean Energy');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('Lagos Island & Mainland');
  const [newServiceStartingPrice, setNewServiceStartingPrice] = useState('25000');
  const [newServicePhone, setNewServicePhone] = useState('');
  const [isRegisteringProvider, setIsRegisteringProvider] = useState(false);

  const fetchJobs = () => {
    setLoadingJobs(true);
    api.getJobs({
      q: jobSearch || undefined,
      category: selectedJobCategory !== 'All' ? selectedJobCategory : undefined,
      isRemote: remoteOnly ? 'true' : undefined,
    })
      .then((res) => setJobs(res.jobs || []))
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  };

  const fetchServices = () => {
    setLoadingServices(true);
    api.getProviders({
      q: serviceSearch || undefined,
      category: selectedServiceCategory !== 'All' ? selectedServiceCategory : undefined,
    })
      .then((res) => setServices(res.services || []))
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  };

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    } else {
      fetchServices();
    }
  }, [activeTab, jobSearch, selectedJobCategory, remoteOnly, serviceSearch, selectedServiceCategory]);

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!selectedJob) return;

    setIsSubmittingApp(true);
    try {
      await api.applyJob(selectedJob.id, {
        coverNote,
        applicantPhone,
      });
      setApplicationSuccess(true);
      setTimeout(() => {
        setApplicationSuccess(false);
        setIsApplying(false);
        fetchJobs();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Application submission failed');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsPostingJob(true);
    try {
      await api.createJob({
        title: postJobTitle,
        category: postJobCategory,
        employmentType: postJobType,
        salaryMin: postJobSalaryMin ? Number(postJobSalaryMin) : undefined,
        salaryMax: postJobSalaryMax ? Number(postJobSalaryMax) : undefined,
        location: postJobLocation,
        state: postJobState,
        description: postJobDescription,
        requirements: postJobRequirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        isRemote: postJobType === 'Remote',
      });
      setIsPostJobModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!selectedService) return;

    setIsSubmittingBooking(true);
    try {
      await api.bookService({
        serviceId: selectedService.id,
        scheduledDate: bookingDate,
        notes: bookingNotes,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setIsBookingModalOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleRegisterProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsRegisteringProvider(true);
    try {
      await api.createProvider({
        title: newServiceTitle,
        category: newServiceCategory,
        description: newServiceDescription,
        serviceArea: newServiceArea,
        startingPrice: Number(newServiceStartingPrice),
        phone: newServicePhone,
      });
      setIsRegisterProviderModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to register provider profile');
    } finally {
      setIsRegisteringProvider(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008751]">
              NaijaServices
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Employment, Skills & Verified Local Artisans</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Jobs, Careers & Local Service Marketplace
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Find vetted jobs with transparent salaries or hire experienced local technicians, tailors, and engineers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'jobs' ? (
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setIsPostJobModalOpen(true);
              }}
              className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-all hover:translate-y-[-1px] flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job Ad</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setIsRegisterProviderModalOpen(true);
              }}
              className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-all hover:translate-y-[-1px] flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>List Your Services</span>
            </button>
          )}
        </div>
      </div>

      {/* Anti-Scam Protection Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">NaijaHub Anti-Scam Security Pledge:</span>
          <p className="text-amber-800">
            Legitimate Nigerian employers and clients never require upfront "recruitment fees", "interview clearance payments", or "visa booking charges". Report any suspicious listings immediately to Safety Trust.
          </p>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'jobs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jobs & Vacancies
        </button>
        <button
          onClick={() => setActiveTab('artisans')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'artisans'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Local Service Providers
        </button>
      </div>

      {/* ================= SECTION 1: JOBS BOARD ================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Jobs Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search job title, employer, or technical keyword..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div className="lg:col-span-4">
                <select
                  value={selectedJobCategory}
                  onChange={(e) => setSelectedJobCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white text-slate-700 font-medium"
                >
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex items-center justify-end px-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded text-[#008751] focus:ring-[#008751]"
                  />
                  <span>Remote Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Jobs Listing */}
          {loadingJobs ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#008751] animate-spin mx-auto" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No job openings found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-[#008751]/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.employerAvatar}
                          alt={job.employerName}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#008751] transition-colors line-clamp-1">
                            {job.title}
                          </h4>
                          <span className="text-[11px] text-slate-500">{job.employerName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {job.employmentType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location} {job.isRemote ? '· Remote Friendly' : ''}</span>
                      </div>
                      {job.salaryMin && (
                        <div className="font-extrabold text-[#008751] tabular-nums">
                          ₦{job.salaryMin.toLocaleString()} - ₦{job.salaryMax?.toLocaleString()} / mo
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {job.applicantsCount} applicants
                    </span>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsApplying(true);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors shadow-xs"
                    >
                      {job.hasApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: LOCAL SERVICE PROVIDERS ================= */}
      {activeTab === 'artisans' && (
        <div className="space-y-6">
          {/* Services Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search electricians, solar engineers, fashion tailors, phone repair..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div className="lg:col-span-4">
                <select
                  value={selectedServiceCategory}
                  onChange={(e) => setSelectedServiceCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white text-slate-700 font-medium"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service Providers Grid */}
          {loadingServices ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#008751] animate-spin mx-auto" />
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No service providers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-[#008751]/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={srv.providerAvatar}
                        alt={srv.providerName}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#008751] transition-colors truncate">
                            {srv.title}
                          </h4>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <span>{srv.providerName}</span>
                          {srv.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-[#008751]" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{srv.category}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{srv.serviceArea}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#008751] tabular-nums">
                          Starting at {formatPrice(srv.startingPrice)}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{srv.rating} ({srv.reviewCount} reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedService(srv);
                        setIsBookingModalOpen(true);
                      }}
                      className="flex-1 py-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors shadow-xs"
                    >
                      Book Appointment
                    </button>
                    <button
                      onClick={() => onOpenReport('service', srv.id, srv.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                      title="Report Provider"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply for Job Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Apply for Position</h3>
                <p className="text-xs text-slate-500">{selectedJob.title} at {selectedJob.employerName}</p>
              </div>
              <button onClick={() => setIsApplying(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-[#008751] mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-500">The employer has received your details.</p>
              </div>
            ) : (
              <form onSubmit={handleApplyJob} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Letter / Introduction *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Briefly state your relevant experience and why you are a great fit..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingApp ? 'Submitting Application...' : 'Send Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Book Service Modal */}
      {isBookingModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Book Appointment</h3>
                <p className="text-xs text-slate-500">{selectedService.title} with {selectedService.providerName}</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-[#008751] mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-slate-900">Booking Request Sent</h4>
                <p className="text-xs text-slate-500">The service provider will review and contact you.</p>
              </div>
            ) : (
              <form onSubmit={handleBookService} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date & Time *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description & Location Details *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your requirement, issue, address, or specifications..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600">Starting Price</span>
                  <span className="font-bold text-[#008751]">
                    {formatPrice(selectedService.startingPrice)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Submitting Booking...' : 'Confirm Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post a Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Publish a Job Advertisement</h3>
              <button onClick={() => setIsPostJobModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Electrical Inverter Engineer"
                  value={postJobTitle}
                  onChange={(e) => setPostJobTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={postJobCategory}
                    onChange={(e) => setPostJobCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {JOB_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={postJobType}
                    onChange={(e) => setPostJobType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary (₦/mo)</label>
                  <input
                    type="number"
                    placeholder="e.g. 350000"
                    value={postJobSalaryMin}
                    onChange={(e) => setPostJobSalaryMin(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary (₦/mo)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={postJobSalaryMax}
                    onChange={(e) => setPostJobSalaryMax(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the roles and day-to-day responsibilities..."
                  value={postJobDescription}
                  onChange={(e) => setPostJobDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Requirements (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="BSc / HND in relevant discipline&#10;3+ years experience&#10;Technical certification"
                  value={postJobRequirements}
                  onChange={(e) => setPostJobRequirements(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isPostingJob}
                className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {isPostingJob ? 'Publishing Advertisement...' : 'Publish Job Opening'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register as Service Provider Modal */}
      {isRegisterProviderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">List Your Professional Service</h3>
              <button onClick={() => setIsRegisterProviderModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterProvider} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Solar Inverter & Battery Installations"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {SERVICE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={newServiceStartingPrice}
                    onChange={(e) => setNewServiceStartingPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Area Coverage *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos Island, Lekki, Victoria Island, Ikeja"
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your expertise, certifications, and what is included in your consultation..."
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isRegisteringProvider}
                className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {isRegisteringProvider ? 'Registering Service Profile...' : 'Publish Service Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
