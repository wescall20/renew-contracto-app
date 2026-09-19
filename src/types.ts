export type ProspectStatus = 'new' | 'contacted' | 'drip_active' | 'text_approved' | 'opted_out' | 'converted';
export type TextApprovalStatus = 'not_requested' | 'pending' | 'approved' | 'declined';

export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  town: string;
  county: string;
  state: string;
  homeType: string;
  yearBuilt: number;
  estValue: number;
  primaryOpportunity: string;
  campaignId?: string;
  campaignName?: string;
  dripStage: number;
  status: ProspectStatus;
  textApprovalStatus: TextApprovalStatus;
  optOutStatus: boolean;
  optOutAt?: string;
  optOutReason?: string;
  lastContactedAt?: string;
  notes?: string;
  createdAt: string;
  leadId?: string;
  engagementScore: number;
  tags: string[];
}

export interface CampaignStage {
  stage: number;
  title: string;
  delayDays: number;
  subject: string;
  previewText: string;
  body: string;
  callToAction: string;
  ctaUrl: string;
  includeTextApproval: boolean;
  includeOptOut: boolean;
}

export type DripStage = CampaignStage;

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color: string;
}

export interface PipelineLeadItem {
  id: string;
  leadId: string;
  submittedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    preferredContact?: string;
  };
  property: {
    address1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  project: {
    serviceLabel: string;
    budget: string;
    timeline: string;
  };
  walkthrough?: {
    preferredDate?: string;
    preferredTime?: string;
    status?: string;
  };
  ai?: {
    executiveSummary?: string;
  };
  markNotes?: string;
}

export interface PipelineData {
  pipelineStages: PipelineStage[];
  totalProspects: number;
  totalRenewLeads: number;
  leads: PipelineLeadItem[];
  conversionRate: string | number;
}

export interface Campaign {
  id: string;
  name: string;
  targetCounty: string;
  targetTowns: string[];
  targetService: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  advertisingHeadline: string;
  advertisingOffer: string;
  advertisingBadge: string;
  imageAsset: string;
  stages: CampaignStage[];
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    textApproved: number;
    optedOut: number;
    converted: number;
  };
  createdAt: string;
}

export interface InboxMessage {
  id: string;
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  prospectPhone: string;
  channel: 'email' | 'sms';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'curious' | 'opt_out' | 'urgent';
  read: boolean;
  timestamp: string;
}

export interface RenewPipelineLead {
  id: string;
  leadId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  stage: 'new' | 'contacted' | 'walkthrough_requested' | 'walkthrough_scheduled' | 'estimate_delivered' | 'contract_signed';
  submittedAt: string;
  estBudget: string;
  timeline: string;
  sourceProspectId?: string;
  aiSummary?: string;
  markNotes?: string;
  walkthroughDate?: string;
  smsApproved: boolean;
}
