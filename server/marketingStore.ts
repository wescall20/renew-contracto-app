import type { Prospect, Campaign, InboxMessage } from '../src/types.ts';

export const WORCESTER_COUNTY_TOWNS = [
  'Worcester', 'Webster', 'Auburn', 'Shrewsbury', 'Holden', 'Millbury',
  'Oxford', 'Dudley', 'Charlton', 'Southbridge', 'Sturbridge', 'Spencer',
  'Leicester', 'Grafton', 'Northborough', 'Westborough', 'Milford',
  'Fitchburg', 'Leominster', 'Gardner', 'Clinton', 'Uxbridge', 'Northbridge',
  'Hopedale', 'Mendon', 'Upton', 'Douglas', 'Brookfield', 'Rutland', 'Holden'
];

export const TRI_STATE_COUNTIES = [
  { name: 'Worcester County, MA', state: 'MA', primary: true, towns: WORCESTER_COUNTY_TOWNS },
  { name: 'Middlesex County, MA', state: 'MA', primary: false, towns: ['Framingham', 'Marlborough', 'Natick', 'Hopkinton', 'Ashland', 'Holliston', 'Sudbury'] },
  { name: 'Norfolk County, MA', state: 'MA', primary: false, towns: ['Franklin', 'Bellingham', 'Medway', 'Millis', 'Walpole', 'Wrentham'] },
  { name: 'Hampden County, MA', state: 'MA', primary: false, towns: ['Palmer', 'Monson', 'Wilbraham', 'Ludlow', 'Chicopee', 'Springfield'] },
  { name: 'Providence County, RI', state: 'RI', primary: false, towns: ['Burrillville', 'Glocester', 'North Smithfield', 'Woonsocket', 'Smithfield', 'Cumberland'] },
  { name: 'Windham County, CT', state: 'CT', primary: false, towns: ['Thompson', 'Putnam', 'Woodstock', 'Killingly', 'Pomfret', 'Plainfield'] },
  { name: 'Tolland County, CT', state: 'CT', primary: false, towns: ['Stafford', 'Union', 'Ellington', 'Tolland', 'Vernon'] }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-worcester-kitchens-2026',
    name: 'Worcester County Spring Kitchen Transformations',
    targetCounty: 'Worcester County, MA',
    targetTowns: ['Worcester', 'Shrewsbury', 'Holden', 'Auburn', 'Grafton', 'Westborough'],
    targetService: 'Kitchen Remodel',
    status: 'active',
    advertisingHeadline: 'Crafting the Heart of Worcester County Homes Since 1984',
    advertisingOffer: 'Complimentary In-Home Architectural Walkthrough + $1,500 Cabinetry Upgrade Credit on Confirmed Spring Projects',
    advertisingBadge: '42 Years of Trusted Local Craftsmanship',
    imageAsset: '/renew/assets/hero-kitchen.jpg',
    createdAt: '2026-03-01T09:00:00.000Z',
    stats: {
      sent: 342,
      opened: 228,
      clicked: 114,
      textApproved: 76,
      optedOut: 4,
      converted: 19
    },
    stages: [
      {
        stage: 1,
        title: 'Introduction & Local Portfolio',
        delayDays: 0,
        subject: 'A personal note on your {{town}} home from contractor Mark Karlon',
        previewText: '42 years transforming Worcester County kitchens. See recent local projects before & after.',
        body: `Hi {{name}},

For 42 years, my team and I at Renew Home Improvement have lived and worked right here in Worcester County. If you've been considering upgrading your kitchen at {{address}}, we'd welcome the chance to share some inspiring ideas tailored specifically to your home's layout.

No high-pressure sales pitch. Just honest, seasoned advice on functional layouts, custom quartz countertops, and cabinetry built to last.

Would you like me to stop by for a casual, no-obligation walkthrough to explore your options?`,
        callToAction: 'Explore Kitchen Portfolio & Request Walkthrough',
        ctaUrl: '/renew/#walkthrough',
        includeTextApproval: true,
        includeOptOut: true
      },
      {
        stage: 2,
        title: 'Customer Case Study & Value Proof',
        delayDays: 4,
        subject: 'How we saved a Shrewsbury family $12k on their open-concept kitchen',
        previewText: 'Smart layout redesigns without moving structural load-bearing walls.',
        body: `Hi {{name}},

Following up on my previous note. Many {{town}} homeowners hesitate to remodel because they fear unseen delays or cost overruns.

Our approach is different: Mark Karlon inspects the job site personally, verifies plumbing and electrical rough-ins before quoting, and provides guaranteed pricing milestones.

Take a look at the attached before-and-after photos of a recent 1980s colonial transformation in your area.`,
        callToAction: 'View Detailed Case Study & Pricing Guide',
        ctaUrl: '/renew/#portfolio',
        includeTextApproval: true,
        includeOptOut: true
      },
      {
        stage: 3,
        title: 'Walkthrough Invitation + Fast-Track SMS',
        delayDays: 8,
        subject: 'Can I drop by for 20 minutes next week, {{name}}?',
        previewText: 'Spots filling up for upcoming Worcester County walkthroughs.',
        body: `Hi {{name}},

I am scheduling site visits across {{town}} and neighboring towns for next Tuesday and Thursday. 

If you'd like an exact quote and 3D concept layout for your kitchen, tap below to select a walkthrough time that fits your schedule.

Prefer quick text updates instead of email? Reply YES or tap the Text Approval button below.`,
        callToAction: 'Book Your Walkthrough Date',
        ctaUrl: '/renew/#walkthrough',
        includeTextApproval: true,
        includeOptOut: true
      }
    ]
  },
  {
    id: 'camp-tristate-decks-2026',
    name: 'Tri-State Composite Deck & Porch Expansion',
    targetCounty: 'Worcester County, MA & Windham County, CT',
    targetTowns: ['Webster', 'Dudley', 'Oxford', 'Thompson', 'Putnam', 'Woodstock'],
    targetService: 'Custom Deck & Porch',
    status: 'active',
    advertisingHeadline: 'Built for New England Winters, Enjoyed All Summer Long',
    advertisingOffer: 'Early Bird Framing Reserve: Free Low-Voltage Stair & Railing Lighting Package with Any Custom Composite Deck',
    advertisingBadge: 'Trex & TimberTech Certified Master Builder',
    imageAsset: '/renew/assets/deck.jpg',
    createdAt: '2026-03-05T10:30:00.000Z',
    stats: {
      sent: 215,
      opened: 146,
      clicked: 68,
      textApproved: 49,
      optedOut: 2,
      converted: 12
    },
    stages: [
      {
        stage: 1,
        title: 'Spring Outdoor Living Kickoff',
        delayDays: 0,
        subject: 'Ready to expand your outdoor living space at {{address}}?',
        previewText: 'High-durability composite decking that never needs sanding or staining.',
        body: `Hi {{name}},

With warmer New England weather around the corner, now is the ideal time to design and permit your outdoor living space. At Renew, we specialize in custom multi-level composite decks, covered screened porches, and four-season outdoor entertainment areas.

As a Webster-based builder serving southern Worcester County and northeastern Connecticut for over four decades, we handle all town permitting and structural engineering.`,
        callToAction: 'See Custom Deck Designs for {{town}}',
        ctaUrl: '/renew/#deck-gallery',
        includeTextApproval: true,
        includeOptOut: true
      },
      {
        stage: 2,
        title: 'Deck Structural Inspection & Fast SMS Quote',
        delayDays: 5,
        subject: 'Is your current deck framing safe for another season?',
        previewText: 'Book a free 15-minute structural framing evaluation with Mark.',
        body: `Hi {{name}},

Did you know many wood decks built 15+ years ago have compromised ledger board flashing or rusted joist hangers? 

If your framing is sound, we can often re-skin your existing structure with maintenance-free composite boards for roughly half the cost of a full rebuild. 

Let me inspect your existing framing at {{address}} at no charge.`,
        callToAction: 'Request Free Deck Safety & Remodel Review',
        ctaUrl: '/renew/#walkthrough',
        includeTextApproval: true,
        includeOptOut: true
      }
    ]
  },
  {
    id: 'camp-bathroom-revival-2026',
    name: 'Luxury Bathrooms & Walk-In Showers',
    targetCounty: 'Worcester County, MA',
    targetTowns: ['Auburn', 'Millbury', 'Oxford', 'Leicester', 'Charlton', 'Southbridge'],
    targetService: 'Bathroom Renovation',
    status: 'active',
    advertisingHeadline: 'Convert Your Outdated Tub into a Barrier-Free Walk-In Spa',
    advertisingOffer: 'Custom Niche & Frameless Glass Enclosure Upgrade Included with Full Bath Remodels',
    advertisingBadge: 'Licensed Master Plumbers & Tile Artisans',
    imageAsset: '/renew/assets/bathroom.jpg',
    createdAt: '2026-03-10T14:15:00.000Z',
    stats: {
      sent: 180,
      opened: 112,
      clicked: 55,
      textApproved: 38,
      optedOut: 1,
      converted: 9
    },
    stages: [
      {
        stage: 1,
        title: 'Bathroom Renovation Showcase',
        delayDays: 0,
        subject: 'Transforming your master bath at {{address}}',
        previewText: 'Waterproof Schluter systems, curbless walk-in showers, and custom vanities.',
        body: `Hi {{name}},

A well-designed bathroom remodel is one of the highest return-on-investment projects for homes in {{town}}. Whether you want to replace an old fiberglass tub with a floor-to-ceiling porcelain walk-in shower or double your vanity space, Mark Karlon at Renew personally oversees every tile installation and plumbing detail.`,
        callToAction: 'View Bathroom Gallery & Schedule Walkthrough',
        ctaUrl: '/renew/#walkthrough',
        includeTextApproval: true,
        includeOptOut: true
      }
    ]
  },
  {
    id: 'camp-exterior-sunrooms-2026',
    name: 'Energy Efficient Sunrooms & Exterior Siding',
    targetCounty: 'Tri-State Area (MA, CT, RI)',
    targetTowns: ['Webster', 'Douglas', 'Uxbridge', 'Burrillville', 'Thompson'],
    targetService: 'Sunroom & Addition',
    status: 'draft',
    advertisingHeadline: 'Year-Round Natural Light: Energy Star 4-Season Sunrooms',
    advertisingOffer: 'Free Architectural 3D Rendering & Town Permit Expediting',
    advertisingBadge: '42 Years Engineering New England Additions',
    imageAsset: '/renew/assets/sunroom.jpg',
    createdAt: '2026-03-12T11:00:00.000Z',
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      textApproved: 0,
      optedOut: 0,
      converted: 0
    },
    stages: [
      {
        stage: 1,
        title: 'Sunroom Introduction',
        delayDays: 0,
        subject: 'Add 250+ sq ft of year-round sunlit living space to {{address}}',
        previewText: 'High-performance insulated glass that keeps cool in July and warm in January.',
        body: `Hi {{name}},

Imagine enjoying morning coffee surrounded by nature in a warm, climate-controlled 4-season sunroom. At Renew, we engineer custom sunrooms and exterior envelope additions designed specifically for New England weather.`,
        callToAction: 'Request Free Sunroom Consultation',
        ctaUrl: '/renew/#walkthrough',
        includeTextApproval: true,
        includeOptOut: true
      }
    ]
  }
];

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'prosp-001',
    name: 'David & Sarah Miller',
    email: 'smiller.worcester@gmail.com',
    phone: '508-791-4421',
    address: '42 Salisbury Street',
    town: 'Worcester',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Colonial',
    yearBuilt: 1988,
    estValue: 565000,
    primaryOpportunity: 'Kitchen Remodel',
    campaignId: 'camp-worcester-kitchens-2026',
    campaignName: 'Worcester County Spring Kitchen Transformations',
    dripStage: 2,
    status: 'text_approved',
    textApprovalStatus: 'approved',
    optOutStatus: false,
    lastContactedAt: '2026-03-16T14:20:00.000Z',
    notes: 'Interested in removing wall between kitchen and formal dining room. Approved SMS on March 16.',
    createdAt: '2026-03-02T10:00:00.000Z',
    engagementScore: 92,
    tags: ['High Value', 'Text Approved', 'Kitchen Priority']
  },
  {
    id: 'prosp-002',
    name: 'Robert & Elaine Fontaine',
    email: 'rfontaine@charter.net',
    phone: '508-943-8872',
    address: '18 Thompson Road',
    town: 'Webster',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Ranch',
    yearBuilt: 1974,
    estValue: 410000,
    primaryOpportunity: 'Custom Deck & Porch',
    campaignId: 'camp-tristate-decks-2026',
    campaignName: 'Tri-State Composite Deck & Porch Expansion',
    dripStage: 3,
    status: 'converted',
    textApprovalStatus: 'approved',
    optOutStatus: false,
    lastContactedAt: '2026-03-17T11:00:00.000Z',
    notes: 'Existing 12x14 deck has rot. Wants 16x24 Trex with privacy lattice. Converted to Renew Pipeline.',
    createdAt: '2026-03-06T09:30:00.000Z',
    leadId: 'RNW-WEBSTER-DECKS-771',
    engagementScore: 98,
    tags: ['Converted Lead', 'Lake Webster Area', 'Deck Ready']
  },
  {
    id: 'prosp-003',
    name: 'James Henderson',
    email: 'jhenderson.shrewsbury@verizon.net',
    phone: '508-842-1903',
    address: '115 Main Street',
    town: 'Shrewsbury',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Cape Cod',
    yearBuilt: 1996,
    estValue: 620000,
    primaryOpportunity: 'Bathroom Renovation',
    campaignId: 'camp-bathroom-revival-2026',
    campaignName: 'Luxury Bathrooms & Walk-In Showers',
    dripStage: 1,
    status: 'drip_active',
    textApprovalStatus: 'pending',
    optOutStatus: false,
    lastContactedAt: '2026-03-14T16:00:00.000Z',
    notes: 'Opened Stage 1 email twice, clicked link to view shower photo gallery.',
    createdAt: '2026-03-10T15:00:00.000Z',
    engagementScore: 78,
    tags: ['Active Drip', 'Shower Remodel']
  },
  {
    id: 'prosp-004',
    name: 'Patricia Sullivan',
    email: 'psullivan.auburn@gmail.com',
    phone: '508-832-5561',
    address: '89 Bryn Mawr Ave',
    town: 'Auburn',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Split-Level',
    yearBuilt: 1982,
    estValue: 475000,
    primaryOpportunity: 'Kitchen Remodel',
    campaignId: 'camp-worcester-kitchens-2026',
    campaignName: 'Worcester County Spring Kitchen Transformations',
    dripStage: 2,
    status: 'drip_active',
    textApprovalStatus: 'not_requested',
    optOutStatus: false,
    lastContactedAt: '2026-03-15T09:45:00.000Z',
    notes: 'Looking for quartz countertop replacement and island expansion.',
    createdAt: '2026-03-03T11:20:00.000Z',
    engagementScore: 65,
    tags: ['Active Drip', 'Countertop Focus']
  },
  {
    id: 'prosp-005',
    name: 'Mark & Kelly Gauthier',
    email: 'kgauthier@putnamlaw.com',
    phone: '860-928-3419',
    address: '64 Pomfret Road',
    town: 'Putnam',
    county: 'Windham County, CT',
    state: 'CT',
    homeType: 'Victorian',
    yearBuilt: 1912,
    estValue: 485000,
    primaryOpportunity: 'Sunroom & Addition',
    campaignId: 'camp-tristate-decks-2026',
    campaignName: 'Tri-State Composite Deck & Porch Expansion',
    dripStage: 1,
    status: 'text_approved',
    textApprovalStatus: 'approved',
    optOutStatus: false,
    lastContactedAt: '2026-03-17T15:10:00.000Z',
    notes: 'Text approved via automated link. Inquired about matching existing historic trim.',
    createdAt: '2026-03-08T13:00:00.000Z',
    engagementScore: 88,
    tags: ['Tri-State CT', 'Text Approved', 'Historic Addition']
  },
  {
    id: 'prosp-006',
    name: 'Thomas & Brenda Hayes',
    email: 'thayes1962@yahoo.com',
    phone: '508-892-7104',
    address: '204 Main Street',
    town: 'Leicester',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Ranch',
    yearBuilt: 1968,
    estValue: 395000,
    primaryOpportunity: 'Bathroom Renovation',
    campaignId: 'camp-bathroom-revival-2026',
    campaignName: 'Luxury Bathrooms & Walk-In Showers',
    dripStage: 1,
    status: 'contacted',
    textApprovalStatus: 'not_requested',
    optOutStatus: false,
    lastContactedAt: '2026-03-12T10:00:00.000Z',
    notes: 'Needs walk-in shower for aging in place.',
    createdAt: '2026-03-11T09:00:00.000Z',
    engagementScore: 55,
    tags: ['Accessibility', 'Bathroom']
  },
  {
    id: 'prosp-007',
    name: 'Arthur Pendelton',
    email: 'apendelton@outlook.com',
    phone: '508-347-9011',
    address: '35 Fiske Hill Road',
    town: 'Sturbridge',
    county: 'Worcester County, MA',
    state: 'MA',
    homeType: 'Colonial',
    yearBuilt: 2001,
    estValue: 690000,
    primaryOpportunity: 'Whole Home',
    dripStage: 0,
    status: 'new',
    textApprovalStatus: 'not_requested',
    optOutStatus: false,
    createdAt: '2026-03-16T17:00:00.000Z',
    engagementScore: 40,
    tags: ['Newly Imported', 'Google Places Enriched', 'Sturbridge Estate']
  },
  {
    id: 'prosp-008',
    name: 'Gregory Scott',
    email: 'gscott@ne-energy.net',
    phone: '401-568-2290',
    address: '142 East Avenue',
    town: 'Burrillville',
    county: 'Providence County, RI',
    state: 'RI',
    homeType: 'Cape Cod',
    yearBuilt: 1994,
    estValue: 460000,
    primaryOpportunity: 'Custom Deck & Porch',
    dripStage: 1,
    status: 'opted_out',
    textApprovalStatus: 'declined',
    optOutStatus: true,
    optOutAt: '2026-03-16T18:30:00.000Z',
    optOutReason: 'Homeowner just finished deck project last month.',
    lastContactedAt: '2026-03-16T14:00:00.000Z',
    notes: 'CAN-SPAM compliant opt-out honored immediately. Suppressed from further drip sequences.',
    createdAt: '2026-03-07T11:00:00.000Z',
    engagementScore: 10,
    tags: ['Opted Out', 'Tri-State RI', 'Suppressed']
  }
];

export const INITIAL_INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-001',
    prospectId: 'prosp-001',
    prospectName: 'David & Sarah Miller',
    prospectEmail: 'smiller.worcester@gmail.com',
    prospectPhone: '508-791-4421',
    channel: 'sms',
    direction: 'inbound',
    content: 'Hi Mark! We saw your email about kitchen transformations in Worcester. We would love to take you up on that walkthrough next week. Would Thursday after 4pm work for you?',
    sentiment: 'positive',
    read: false,
    timestamp: '2026-03-17T16:45:00.000Z'
  },
  {
    id: 'msg-002',
    prospectId: 'prosp-002',
    prospectName: 'Robert & Elaine Fontaine',
    prospectEmail: 'rfontaine@charter.net',
    prospectPhone: '508-943-8872',
    channel: 'email',
    direction: 'inbound',
    subject: 'Re: Ready to expand your outdoor living space at 18 Thompson Road?',
    content: 'Mark, thank you for checking in. We are ready to move forward with the Trex deck. I filled out the Renew intake form and uploaded 3 photos of our old deck. Looking forward to your call.',
    sentiment: 'positive',
    read: true,
    timestamp: '2026-03-17T11:15:00.000Z'
  },
  {
    id: 'msg-003',
    prospectId: 'prosp-005',
    prospectName: 'Mark & Kelly Gauthier',
    prospectEmail: 'kgauthier@putnamlaw.com',
    prospectPhone: '860-928-3419',
    channel: 'sms',
    direction: 'inbound',
    content: 'YES - please send project photos of 4-season sunrooms via text. What is typical lead time for town permits in northeastern CT?',
    sentiment: 'curious',
    read: false,
    timestamp: '2026-03-17T15:22:00.000Z'
  },
  {
    id: 'msg-004',
    prospectId: 'prosp-008',
    prospectName: 'Gregory Scott',
    prospectEmail: 'gscott@ne-energy.net',
    prospectPhone: '401-568-2290',
    channel: 'email',
    direction: 'inbound',
    subject: 'Opt out',
    content: 'Please unsubscribe me. We just rebuilt our back deck ourselves last month.',
    sentiment: 'opt_out',
    read: true,
    timestamp: '2026-03-16T18:28:00.000Z'
  }
];

// Helper to generate realistic Google Data enriched prospects for Worcester & Tri-State
export function generateGoogleEnrichedProspects(params: {
  county?: string;
  town?: string;
  service?: string;
  count?: number;
}): Prospect[] {
  const count = Math.min(params.count || 10, 50);
  const targetCounty = params.county || 'Worcester County, MA';
  const countyObj = TRI_STATE_COUNTIES.find(c => c.name.toLowerCase() === targetCounty.toLowerCase()) || TRI_STATE_COUNTIES[0];
  const towns = params.town ? [params.town] : countyObj.towns;

  const firstNames = ['Michael', 'Jessica', 'Christopher', 'Amanda', 'Matthew', 'Ashley', 'Brian', 'Jennifer', 'Jason', 'Stephanie', 'Andrew', 'Nicole', 'Daniel', 'Elizabeth', 'Joshua', 'Megan', 'Ryan', 'Rachel', 'Justin', 'Lauren'];
  const lastNames = ['Sullivan', 'Johnson', 'O\'Connor', 'Tremblay', 'Boucher', 'Kowalski', 'Smith', 'Pelletier', 'Murphy', 'Gagnon', 'White', 'Larson', 'Benoit', 'St. Martin', 'Nowak', 'Morin', 'Donnelly', 'Dube', 'Caruso', 'Fontaine'];
  
  const streetNames = ['Pleasant St', 'Maple Ave', 'Chestnut Hill Rd', 'Main St', 'Highland St', 'Prospect St', 'Oak St', 'Southbridge Rd', 'Gore Rd', 'Thompson Rd', 'School St', 'Hillside Ave', 'Brookside Dr', 'Country Way', 'Elm St', 'Forest Rd'];
  const homeTypes = ['Colonial', 'Cape Cod', 'Ranch', 'Split-Level', 'Craftsman', 'Victorian'];
  const services = ['Kitchen Remodel', 'Bathroom Renovation', 'Custom Deck & Porch', 'Sunroom & Addition', 'Siding & Exterior'];

  const results: Prospect[] = [];

  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const town = towns[Math.floor(Math.random() * towns.length)];
    const street = `${Math.floor(Math.random() * 280) + 12} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`;
    const opp = params.service || services[Math.floor(Math.random() * services.length)];
    const yearBuilt = Math.floor(Math.random() * 45) + 1965;
    const estValue = Math.floor(Math.random() * 380000) + 360000;
    const id = `prosp-gdata-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const emailDomain = Math.random() > 0.4 ? 'gmail.com' : (Math.random() > 0.5 ? 'charter.net' : 'verizon.net');
    const cleanEmail = `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 89 + 10)}@${emailDomain}`;
    
    // Area codes: 508 / 774 for Worcester/Central MA, 860 for CT, 401 for RI
    let areaCode = '508';
    if (countyObj.state === 'CT') areaCode = '860';
    else if (countyObj.state === 'RI') areaCode = '401';
    const phone = `${areaCode}-${Math.floor(Math.random() * 800 + 200)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    results.push({
      id,
      name: `${fName} ${lName}`,
      email: cleanEmail,
      phone,
      address: street,
      town,
      county: countyObj.name,
      state: countyObj.state,
      homeType: homeTypes[Math.floor(Math.random() * homeTypes.length)],
      yearBuilt,
      estValue,
      primaryOpportunity: opp,
      dripStage: 0,
      status: 'new',
      textApprovalStatus: 'not_requested',
      optOutStatus: false,
      createdAt: new Date().toISOString(),
      engagementScore: 50,
      tags: ['Google Places Enriched', 'Verified Homeowner', `${town} Area`]
    });
  }

  return results;
}
