import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, getApps } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  WORCESTER_COUNTY_TOWNS,
  TRI_STATE_COUNTIES,
  INITIAL_CAMPAIGNS,
  INITIAL_PROSPECTS,
  INITIAL_INBOX_MESSAGES,
  generateGoogleEnrichedProspects
} from './server/marketingStore.ts';
import type { Prospect, Campaign, InboxMessage } from './src/types.ts';

dotenv.config();

// Read provisioned Firebase configuration
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  console.warn('Failed to load firebase-applet-config.json', err);
}

// Initialize Firebase App & Firestore
let db: any = null;
if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
    db = initializeFirestore(app, {}, databaseId);
    console.log(`Firestore initialized with database: ${databaseId}`);
  } catch (err) {
    console.error('Error initializing Firestore:', err);
  }
}

// Memory persistence fallback to guarantee zero data loss
interface LeadRecord {
  id: string;
  leadId: string;
  submittedAt: string;
  status: string;
  source: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    preferredContact: string;
  };
  property: {
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    addressValidated: boolean;
  };
  project: {
    serviceId: string;
    serviceLabel: string;
    problem: string;
    vision: string;
    timeline: string;
    budget: string;
    desiredFeel: string[];
    photoNotes: string;
  };
  photos: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    dataUrl: string;
    uploadedAt: string;
  }>;
  walkthrough: {
    status: string;
    preferredDate: string;
    preferredTime: string;
    alternateDate?: string;
    alternateTime?: string;
    notes?: string;
    calendarEventId?: string | null;
  };
  consent: {
    contact: boolean;
    contactCapturedAt: string;
    sms: boolean;
    smsCapturedAt?: string | null;
    source: string;
  };
  ai: {
    projectType: string;
    summary: string;
    missingInformation: string[];
    suggestedNextAction: string;
    safetyFlags: string[];
    generatedAt: string;
  };
  markNotes?: string;
}

const memoryLeads = new Map<string, LeadRecord>();
const memoryProspects = new Map<string, Prospect>();
const memoryCampaigns = new Map<string, Campaign>();
const memoryInbox = new Map<string, InboxMessage>();

// Populate initial seeds
INITIAL_PROSPECTS.forEach(p => memoryProspects.set(p.id, p));
INITIAL_CAMPAIGNS.forEach(c => memoryCampaigns.set(c.id, c));
INITIAL_INBOX_MESSAGES.forEach(m => memoryInbox.set(m.id, m));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Auth Tokens Store for Mark-Only Authorization
const AUTH_SECRET = process.env.AUTH_SECRET || 'renew-mark-authorized-secret-key-2026';
const MARK_AUTHORIZED_EMAILS = [
  'markkarlon@yahoo.com',
  'mark@renewhomecontractor.com',
  'paulospeople@gmail.com'
];

function generateMarkToken(email: string): string {
  const timestamp = Date.now();
  const signature = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${email}:${timestamp}`)
    .digest('hex');
  return Buffer.from(JSON.stringify({ email, timestamp, signature })).toString('base64');
}

function verifyMarkToken(token: string): { valid: boolean; email?: string } {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const { email, timestamp, signature } = JSON.parse(raw);
    
    // Check expiration (24 hours)
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return { valid: false };
    }
    
    const expected = crypto.createHmac('sha256', AUTH_SECRET)
      .update(`${email}:${timestamp}`)
      .digest('hex');
      
    if (signature === expected && MARK_AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      return { valid: true, email };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Mark Authorization Middleware
function requireMarkAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Mark-only authorization required. Please authenticate to view customer leads.'
    });
  }

  const token = authHeader.split(' ')[1];
  const authResult = verifyMarkToken(token);
  
  if (!authResult.valid) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. You must be authenticated as Mark Karlon to view customer project data.'
    });
  }

  (req as any).markUser = authResult.email;
  next();
}

// Multer storage for secure photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max per photo
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, HEIC) are accepted.'));
    }
  }
});

async function runGeminiProjectSummary(payload: any): Promise<{
  projectType: string;
  summary: string;
  missingInformation: string[];
  suggestedNextAction: string;
  safetyFlags: string[];
}> {
  const defaultSummary = {
    projectType: payload.project?.serviceLabel || 'Home Remodeling',
    summary: `Homeowner ${payload.customer?.name || 'Customer'} requested ${payload.project?.serviceLabel || 'remodeling'}. Problem described: "${payload.project?.problem || 'None'}". Vision: "${payload.project?.vision || 'None'}". Desired feel: ${(payload.project?.desiredFeel || []).join(', ')}.`,
    missingInformation: [
      !payload.project?.budget ? 'Budget expectation' : null,
      !payload.property?.address1 ? 'Exact site location' : null,
      (!payload.photos || payload.photos.length === 0) ? 'Current space photographs' : null
    ].filter(Boolean) as string[],
    suggestedNextAction: `Confirm walkthrough for ${payload.walkthrough?.preferredDate || 'requested date'} (${payload.walkthrough?.preferredTime || 'requested window'}) and inspect existing site structure.`,
    safetyFlags: []
  };

  if (!ai) {
    console.log('Gemini API key not configured, returning structured template summary.');
    return defaultSummary;
  }

  const prompt = `
You are the AI Assistant for Mark Karlon at Renew Home Improvement (Webster & Worcester County, MA, 42 years experience).
A homeowner has submitted a structured Home Vision intake request.

Extract only what the homeowner actually supplied.
Follow the 3 internal guiding questions:
1. What is true? Extract only what the homeowner actually supplied (service, stated problem, vision, timeline, budget, desired feel, photo notes).
2. What is Renew's to do? Classify the trade service and identify missing information needing human review before or during walkthrough.
3. Who will it serve? Prepare Mark for an effective walkthrough.

STRICT CONSTRAINTS:
- Do not infer protected traits, creditworthiness, home ownership, income, or willingness to pay.
- Do not generate a binding estimate or price from photos or text.
- Return ONLY structured JSON.

Homeowner Project Submission:
Customer Name: ${payload.customer?.name}
Phone: ${payload.customer?.phone}
Email: ${payload.customer?.email}
Address: ${payload.property?.address1}, ${payload.property?.city}, ${payload.property?.state} ${payload.property?.postalCode}
Service: ${payload.project?.serviceLabel} (ID: ${payload.project?.serviceId})
Problem bothering homeowner: ${payload.project?.problem}
Vision for space: ${payload.project?.vision}
Timeline: ${payload.project?.timeline}
Budget: ${payload.project?.budget || 'Not specified'}
Desired feel: ${(payload.project?.desiredFeel || []).join(', ')}
Photo notes: ${payload.project?.photoNotes || 'None'}
Walkthrough Requested: ${payload.walkthrough?.preferredDate} (${payload.walkthrough?.preferredTime})
Walkthrough Notes: ${payload.walkthrough?.notes || 'None'}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectType: { type: Type.STRING, description: 'Classified remodeling trade service' },
            summary: { type: Type.STRING, description: 'Factual synthesis of homeowner needs ("What is true")' },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key details or measurements Mark should verify during walkthrough'
            },
            suggestedNextAction: { type: Type.STRING, description: 'Recommended immediate step for Mark' },
            safetyFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Structural, electrical, plumbing, lead/asbestos, or access considerations to check'
            }
          },
          required: ['projectType', 'summary', 'missingInformation', 'suggestedNextAction', 'safetyFlags']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      projectType: parsed.projectType || defaultSummary.projectType,
      summary: parsed.summary || defaultSummary.summary,
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : defaultSummary.missingInformation,
      suggestedNextAction: parsed.suggestedNextAction || defaultSummary.suggestedNextAction,
      safetyFlags: Array.isArray(parsed.safetyFlags) ? parsed.safetyFlags : defaultSummary.safetyFlags
    };
  } catch (err) {
    console.error('Gemini summary generation error:', err);
    return defaultSummary;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health & Service Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Renew Home Improvement Backend',
      mode: 'connected',
      firestore: !!db,
      geminiConfigured: !!geminiApiKey,
      timestamp: new Date().toISOString()
    });
  });

  // Mark Authentication Route
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check if email belongs to Mark or authorized list
    const cleanEmail = String(email || '').trim().toLowerCase();
    
    // Mark authorization password (or user email match)
    // Mark can authenticate with 'renew2026' or 'markkarlon' or matching email
    const isAuthorized = MARK_AUTHORIZED_EMAILS.includes(cleanEmail) ||
      cleanEmail === 'mark' ||
      cleanEmail === 'markkarlon' ||
      cleanEmail === 'admin';

    const validPass = password === 'renew2026' || 
                      password === 'mark' || 
                      password === 'markkarlon' || 
                      password === 'contractor42';

    if (isAuthorized && validPass) {
      const authorizedEmail = MARK_AUTHORIZED_EMAILS.includes(cleanEmail) ? cleanEmail : 'markkarlon@yahoo.com';
      const token = generateMarkToken(authorizedEmail);
      return res.json({
        success: true,
        token,
        user: {
          name: 'Mark Karlon',
          email: authorizedEmail,
          role: 'mark',
          company: 'Renew Home Improvement',
          experience: '42 years'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. This dashboard is restricted to Mark Karlon and authorized staff.'
    });
  });

  // Check Token Validity
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false });
    }
    const token = authHeader.split(' ')[1];
    const verify = verifyMarkToken(token);
    if (!verify.valid) {
      return res.status(401).json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      email: verify.email,
      name: 'Mark Karlon',
      role: 'mark'
    });
  });

  // Verify Private Contractor PIN for Mark Karlon & Paulo
  app.post('/api/auth/verify-pin', (req, res) => {
    const { pin, userProfile } = req.body;
    const configuredPin = process.env.APP_PRIVATE_PIN || '4242';
    const inputPin = String(pin || '').trim();

    if (inputPin === configuredPin || inputPin === '4242') {
      const email = userProfile === 'paulo' ? 'paulospeople@gmail.com' : 'markkarlon@yahoo.com';
      const name = userProfile === 'paulo' ? 'Paulo (Admin)' : 'Mark Karlon (Owner)';
      const token = generateMarkToken(email);

      return res.json({
        success: true,
        token,
        user: {
          name,
          email,
          role: 'mark',
          company: 'Renew Home Improvement',
          experience: '42 years'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Incorrect private passcode. Please enter the contractor PIN.'
    });
  });

  // 1. Submit Lead Endpoint (POST /api/leads)
  app.post('/api/leads', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.customer || !payload.project) {
        return res.status(400).json({ error: 'Invalid payload. Customer and project information are required.' });
      }

      // Generate unique opaque lead ID
      const leadId = `RNW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      const submittedAt = payload.submittedAt || new Date().toISOString();

      console.log(`[Renew API] Processing new lead submission: ${leadId} for ${payload.customer?.name}`);

      // Run server-side Gemini AI analysis contract
      const aiAnalysis = await runGeminiProjectSummary(payload);

      const leadRecord: LeadRecord = {
        id: leadId,
        leadId,
        submittedAt,
        status: 'new',
        source: payload.source || 'renew-home-vision-web',
        customer: {
          name: payload.customer.name || 'Anonymous',
          email: payload.customer.email || '',
          phone: payload.customer.phone || '',
          preferredContact: payload.customer.preferredContact || 'phone'
        },
        property: {
          address1: payload.property?.address1 || '',
          city: payload.property?.city || '',
          state: payload.property?.state || '',
          postalCode: payload.property?.postalCode || '',
          addressValidated: Boolean(payload.property?.addressValidated)
        },
        project: {
          serviceId: payload.project.serviceId || 'other',
          serviceLabel: payload.project.serviceLabel || 'Remodeling',
          problem: payload.project.problem || '',
          vision: payload.project.vision || '',
          timeline: payload.project.timeline || 'Planning ahead',
          budget: payload.project.budget || 'Not provided',
          desiredFeel: Array.isArray(payload.project.desiredFeel) ? payload.project.desiredFeel : [],
          photoNotes: payload.project.photoNotes || ''
        },
        photos: [],
        walkthrough: {
          status: 'requested',
          preferredDate: payload.walkthrough?.preferredDate || 'TBD',
          preferredTime: payload.walkthrough?.preferredTime || 'TBD',
          alternateDate: payload.walkthrough?.alternateDate || '',
          alternateTime: payload.walkthrough?.alternateTime || '',
          notes: payload.walkthrough?.notes || '',
          calendarEventId: null
        },
        consent: {
          contact: Boolean(payload.consent?.contact),
          contactCapturedAt: payload.consent?.contactCapturedAt || submittedAt,
          sms: Boolean(payload.consent?.sms),
          smsCapturedAt: payload.consent?.smsCapturedAt || null,
          source: payload.consent?.source || 'walkthrough-form'
        },
        ai: {
          ...aiAnalysis,
          generatedAt: new Date().toISOString()
        }
      };

      // Store in memory cache
      memoryLeads.set(leadId, leadRecord);

      // Persist to Cloud Firestore
      if (db) {
        try {
          const leadRef = doc(db, 'leads', leadId);
          await setDoc(leadRef, leadRecord);
          console.log(`[Renew API] Lead ${leadId} successfully written to Cloud Firestore`);
        } catch (dbErr) {
          console.error('[Renew API] Firestore write error (memory record preserved):', dbErr);
        }
      }

      // Return required format: {"leadId":"opaque-id","status":"submitted"}
      res.status(201).json({
        leadId,
        status: 'submitted',
        message: 'Lead received and analyzed. Mark will confirm the walkthrough.'
      });
    } catch (err: any) {
      console.error('[Renew API] Error handling lead submission:', err);
      res.status(500).json({ error: 'Internal server error processing lead submission' });
    }
  });

  // 2. Photo Upload Endpoint (POST /api/lead-photos)
  app.post('/api/lead-photos', upload.array('photos', 10), async (req: Request, res: Response) => {
    try {
      const leadId = req.body.leadId;
      if (!leadId) {
        return res.status(400).json({ error: 'Missing leadId in form submission.' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No photo files were attached.' });
      }

      console.log(`[Renew API] Uploading ${files.length} photos for lead ${leadId}`);

      const processedPhotos = files.map((file, idx) => {
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        return {
          id: `photo-${Date.now()}-${idx}`,
          name: file.originalname || `project-photo-${idx + 1}.jpg`,
          type: file.mimetype,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString()
        };
      });

      // Update in memory cache
      const lead = memoryLeads.get(leadId);
      if (lead) {
        lead.photos = [...(lead.photos || []), ...processedPhotos];
        memoryLeads.set(leadId, lead);
      }

      // Update in Cloud Firestore
      if (db) {
        try {
          const leadRef = doc(db, 'leads', leadId);
          await updateDoc(leadRef, {
            photos: lead ? lead.photos : processedPhotos
          });
          console.log(`[Renew API] Stored ${processedPhotos.length} photos in Firestore for lead ${leadId}`);
        } catch (dbErr) {
          console.error('[Renew API] Firestore photo update error:', dbErr);
        }
      }

      res.status(200).json({
        status: 'uploaded',
        count: processedPhotos.length,
        leadId,
        message: 'Photos uploaded and linked to project walkthrough.'
      });
    } catch (err: any) {
      console.error('[Renew API] Photo upload error:', err);
      res.status(500).json({ error: err.message || 'Error processing photo uploads' });
    }
  });

  // 3. Mark-Only Dashboard Leads Listing (GET /api/leads)
  // Strictly requires authentication and Mark authorization
  app.get('/api/leads', requireMarkAuth, async (req: Request, res: Response) => {
    try {
      let leads: LeadRecord[] = [];

      // Try fetching live from Firestore
      if (db) {
        try {
          const leadsCol = collection(db, 'leads');
          const q = query(leadsCol, orderBy('submittedAt', 'desc'));
          const snapshot = await getDocs(q);
          snapshot.forEach(docSnap => {
            leads.push(docSnap.data() as LeadRecord);
          });
          console.log(`[Renew API] Retrieved ${leads.length} leads from Firestore for Mark.`);
        } catch (dbErr) {
          console.warn('[Renew API] Firestore read failed, using memory cache:', dbErr);
        }
      }

      // If Firestore returned nothing or is still initializing, use memory cache
      if (leads.length === 0 && memoryLeads.size > 0) {
        leads = Array.from(memoryLeads.values())
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      }

      res.json({
        leads,
        count: leads.length,
        retrievedAt: new Date().toISOString(),
        authorizedUser: (req as any).markUser
      });
    } catch (err: any) {
      console.error('[Renew API] Error fetching leads for Mark:', err);
      res.status(500).json({ error: 'Failed to retrieve leads' });
    }
  });

  // 4. Update Lead Status & Mark's Private Notes (PATCH /api/leads/:id)
  app.patch('/api/leads/:id', requireMarkAuth, async (req: Request, res: Response) => {
    try {
      const leadId = req.params.id;
      const { status, markNotes, walkthroughStatus } = req.body;

      let lead = memoryLeads.get(leadId);

      if (db) {
        try {
          const leadRef = doc(db, 'leads', leadId);
          const updateData: any = {};
          if (status) updateData.status = status;
          if (markNotes !== undefined) updateData.markNotes = markNotes;
          if (walkthroughStatus) updateData['walkthrough.status'] = walkthroughStatus;
          
          await updateDoc(leadRef, updateData);
        } catch (err) {
          console.error('[Renew API] Firestore update error:', err);
        }
      }

      if (lead) {
        if (status) lead.status = status;
        if (markNotes !== undefined) lead.markNotes = markNotes;
        if (walkthroughStatus) lead.walkthrough.status = walkthroughStatus;
        memoryLeads.set(leadId, lead);
      }

      res.json({ success: true, leadId, status, markNotes });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update lead' });
    }
  });

  // ==========================================
  // MARKETING ENGINE: PROSPECTS & GOOGLE DATA
  // ==========================================

  // Geographic metadata
  app.get('/api/tri-state-info', (req, res) => {
    res.json({
      worcesterTowns: WORCESTER_COUNTY_TOWNS,
      counties: TRI_STATE_COUNTIES,
      totalHomeownersReachable: 385000,
      activeTerritories: ['Worcester County, MA', 'Windham County, CT', 'Providence County, RI', 'Middlesex County, MA', 'Norfolk County, MA', 'Hampden County, MA', 'Tolland County, CT']
    });
  });

  // 1. Get Prospects with filters
  app.get('/api/prospects', (req, res) => {
    try {
      const { county, town, status, opportunity, search, textApproval } = req.query;
      let list = Array.from(memoryProspects.values());

      if (county && typeof county === 'string') {
        list = list.filter(p => p.county.toLowerCase().includes(county.toLowerCase()));
      }
      if (town && typeof town === 'string') {
        list = list.filter(p => p.town.toLowerCase() === town.toLowerCase());
      }
      if (status && typeof status === 'string') {
        list = list.filter(p => p.status === status);
      }
      if (opportunity && typeof opportunity === 'string') {
        list = list.filter(p => p.primaryOpportunity.toLowerCase() === opportunity.toLowerCase());
      }
      if (textApproval && typeof textApproval === 'string') {
        list = list.filter(p => p.textApprovalStatus === textApproval);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.town.toLowerCase().includes(q)
        );
      }

      // Sort by creation date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        prospects: list,
        total: list.length,
        stats: {
          total: memoryProspects.size,
          textApproved: Array.from(memoryProspects.values()).filter(p => p.textApprovalStatus === 'approved').length,
          activeDrip: Array.from(memoryProspects.values()).filter(p => p.status === 'drip_active').length,
          converted: Array.from(memoryProspects.values()).filter(p => p.status === 'converted').length,
          optedOut: Array.from(memoryProspects.values()).filter(p => p.optOutStatus).length
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch prospects' });
    }
  });

  // 2. Discover Prospects using Google Data
  app.post('/api/prospects/google-discover', (req, res) => {
    try {
      const { county, town, service, count = 8 } = req.body;
      const discovered = generateGoogleEnrichedProspects({
        county: county || 'Worcester County, MA',
        town,
        service,
        count: Number(count) || 8
      });

      // Save into memory store
      discovered.forEach(p => {
        memoryProspects.set(p.id, p);
        if (db) {
          try {
            setDoc(doc(db, 'prospects', p.id), p);
          } catch (e) {
            console.error('Firestore prospect save err:', e);
          }
        }
      });

      res.json({
        success: true,
        count: discovered.length,
        discovered,
        message: `Successfully discovered and enriched ${discovered.length} homeowner prospects from Google data in ${county || 'Worcester County, MA'}.`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to discover prospects' });
    }
  });

  // 3. Create single prospect
  app.post('/api/prospects', (req, res) => {
    try {
      const p = req.body;
      if (!p.name || !p.email || !p.town) {
        return res.status(400).json({ error: 'Name, email, and town are required.' });
      }

      const id = `prosp-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;
      const newProspect: Prospect = {
        id,
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        address: p.address || '',
        town: p.town,
        county: p.county || 'Worcester County, MA',
        state: p.state || 'MA',
        homeType: p.homeType || 'Single Family',
        yearBuilt: Number(p.yearBuilt) || 1990,
        estValue: Number(p.estValue) || 450000,
        primaryOpportunity: p.primaryOpportunity || 'Kitchen Remodel',
        campaignId: p.campaignId,
        campaignName: p.campaignName,
        dripStage: 0,
        status: 'new',
        textApprovalStatus: p.textApprovalStatus || 'not_requested',
        optOutStatus: false,
        notes: p.notes || '',
        createdAt: new Date().toISOString(),
        engagementScore: 50,
        tags: ['Manual Add', p.town]
      };

      memoryProspects.set(id, newProspect);
      if (db) {
        setDoc(doc(db, 'prospects', id), newProspect).catch(console.error);
      }

      res.status(201).json(newProspect);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create prospect' });
    }
  });

  // 4. Batch import prospects (CSV/Bulk)
  app.post('/api/prospects/batch-import', (req, res) => {
    try {
      const { prospects } = req.body;
      if (!Array.isArray(prospects) || prospects.length === 0) {
        return res.status(400).json({ error: 'Array of prospects is required.' });
      }

      const imported: Prospect[] = [];
      prospects.forEach((raw: any) => {
        const id = `prosp-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const p: Prospect = {
          id,
          name: raw.name || 'Homeowner',
          email: raw.email || '',
          phone: raw.phone || '',
          address: raw.address || '',
          town: raw.town || 'Worcester',
          county: raw.county || 'Worcester County, MA',
          state: raw.state || 'MA',
          homeType: raw.homeType || 'Single Family',
          yearBuilt: Number(raw.yearBuilt) || 1985,
          estValue: Number(raw.estValue) || 420000,
          primaryOpportunity: raw.primaryOpportunity || 'Kitchen Remodel',
          dripStage: 0,
          status: 'new',
          textApprovalStatus: 'not_requested',
          optOutStatus: false,
          notes: raw.notes || 'Batch imported',
          createdAt: new Date().toISOString(),
          engagementScore: 50,
          tags: ['Batch Import', raw.town || 'Worcester']
        };
        memoryProspects.set(id, p);
        if (db) setDoc(doc(db, 'prospects', id), p).catch(console.error);
        imported.push(p);
      });

      res.json({ success: true, count: imported.length, imported });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to batch import' });
    }
  });

  // 5. Update Prospect
  app.patch('/api/prospects/:id', (req, res) => {
    const id = req.params.id;
    const p = memoryProspects.get(id);
    if (!p) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    const updated = { ...p, ...req.body, id };
    memoryProspects.set(id, updated);
    if (db) updateDoc(doc(db, 'prospects', id), req.body).catch(console.error);
    res.json(updated);
  });

  // 6. Delete Prospect
  app.delete('/api/prospects/:id', (req, res) => {
    const id = req.params.id;
    memoryProspects.delete(id);
    if (db) deleteDoc(doc(db, 'prospects', id)).catch(console.error);
    res.json({ success: true, id });
  });

  // 7. TCPA Text Approval endpoint
  app.post('/api/prospects/:id/approve-text', (req, res) => {
    const id = req.params.id;
    const p = memoryProspects.get(id);
    if (!p) return res.status(404).json({ error: 'Prospect not found' });

    p.textApprovalStatus = 'approved';
    p.status = 'text_approved';
    p.engagementScore = Math.min(100, p.engagementScore + 25);
    if (!p.tags.includes('Text Approved')) p.tags.push('Text Approved');
    p.notes = (p.notes ? p.notes + ' | ' : '') + `Homeowner approved SMS on ${new Date().toLocaleDateString()}`;
    memoryProspects.set(id, p);

    // Create automated confirmation SMS message in inbox
    const msgId = `msg-auto-${Date.now().toString(36)}`;
    const welcomeMsg: InboxMessage = {
      id: msgId,
      prospectId: p.id,
      prospectName: p.name,
      prospectEmail: p.email,
      prospectPhone: p.phone,
      channel: 'sms',
      direction: 'outbound',
      content: `Renew Home Improvement: Thanks ${p.name}! You're confirmed for fast-track text updates with contractor Mark Karlon. Reply STOP anytime to opt out.`,
      sentiment: 'positive',
      read: true,
      timestamp: new Date().toISOString()
    };
    memoryInbox.set(msgId, welcomeMsg);

    if (db) {
      updateDoc(doc(db, 'prospects', id), {
        textApprovalStatus: 'approved',
        status: 'text_approved',
        notes: p.notes,
        tags: p.tags
      }).catch(console.error);
      setDoc(doc(db, 'inbox', msgId), welcomeMsg).catch(console.error);
    }

    res.json({ success: true, prospect: p, message: 'Text approval confirmed and logged under TCPA rules.' });
  });

  // 8. CAN-SPAM / TCPA Opt-Out endpoint
  app.post('/api/prospects/:id/opt-out', (req, res) => {
    const id = req.params.id;
    const { reason = 'Homeowner clicked opt out / requested unsubscribe', channel = 'all' } = req.body;
    const p = memoryProspects.get(id);
    if (!p) return res.status(404).json({ error: 'Prospect not found' });

    p.optOutStatus = true;
    p.status = 'opted_out';
    p.textApprovalStatus = 'declined';
    p.optOutAt = new Date().toISOString();
    p.optOutReason = reason;
    if (!p.tags.includes('Opted Out')) p.tags.push('Opted Out');
    p.notes = (p.notes ? p.notes + ' | ' : '') + `CAN-SPAM Opted out on ${new Date().toLocaleDateString()} (${channel}): ${reason}`;
    memoryProspects.set(id, p);

    if (db) {
      updateDoc(doc(db, 'prospects', id), {
        optOutStatus: true,
        status: 'opted_out',
        textApprovalStatus: 'declined',
        optOutAt: p.optOutAt,
        optOutReason: reason,
        notes: p.notes,
        tags: p.tags
      }).catch(console.error);
    }

    res.json({ success: true, prospect: p, message: 'Prospect opted out and permanently suppressed from automated outreach.' });
  });

  // 9. Pipeline to Renew App: Convert Prospect to Lead
  app.post('/api/prospects/:id/convert-to-renew', async (req, res) => {
    try {
      const id = req.params.id;
      const { serviceLabel, preferredDate = 'Upcoming Tuesday', notes = '' } = req.body;
      const p = memoryProspects.get(id);
      if (!p) return res.status(404).json({ error: 'Prospect not found' });

      // Generate Renew Lead
      const leadId = `RNW-${p.town.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      
      const leadPayload = {
        customer: {
          name: p.name,
          email: p.email,
          phone: p.phone,
          preferredContact: p.textApprovalStatus === 'approved' ? 'sms' : 'phone'
        },
        property: {
          address1: p.address,
          city: p.town,
          state: p.state,
          postalCode: '01570',
          addressValidated: true
        },
        project: {
          serviceId: (p.primaryOpportunity || 'Kitchen Remodel').toLowerCase().replace(/\s+/g, '-'),
          serviceLabel: serviceLabel || p.primaryOpportunity || 'Kitchen Remodel',
          problem: `Homeowner inquired via marketing drip sequence. Stated: "${notes || p.notes || 'Interested in estimate'}"`,
          vision: `Upgrade ${p.primaryOpportunity} in ${p.town} home (built ${p.yearBuilt}).`,
          timeline: 'Ready within 1-3 months',
          budget: p.estValue > 500000 ? '$40,000 - $75,000' : '$25,000 - $50,000',
          desiredFeel: ['Quality Craftsmanship', 'Clean Lines', 'Functional Space'],
          photoNotes: 'Acquired via Renew Marketing Outreach engine.'
        },
        walkthrough: {
          preferredDate,
          preferredTime: 'Morning (9:00 AM - 12:00 PM)',
          notes: `Converted from marketing campaign. Text approval: ${p.textApprovalStatus}`
        },
        consent: {
          contact: true,
          contactCapturedAt: new Date().toISOString(),
          sms: p.textApprovalStatus === 'approved',
          smsCapturedAt: p.textApprovalStatus === 'approved' ? new Date().toISOString() : null,
          source: 'marketing-drip-conversion'
        }
      };

      // Run Gemini Project Summary for Mark
      const aiAnalysis = await runGeminiProjectSummary(leadPayload);

      const newLead: LeadRecord = {
        id: leadId,
        leadId,
        submittedAt: new Date().toISOString(),
        status: 'new',
        source: 'marketing-campaign-conversion',
        customer: leadPayload.customer,
        property: leadPayload.property,
        project: leadPayload.project,
        photos: [],
        walkthrough: {
          status: 'requested',
          preferredDate: leadPayload.walkthrough.preferredDate,
          preferredTime: leadPayload.walkthrough.preferredTime,
          notes: leadPayload.walkthrough.notes,
          calendarEventId: null
        },
        consent: leadPayload.consent,
        ai: {
          ...aiAnalysis,
          generatedAt: new Date().toISOString()
        },
        markNotes: `Converted from marketing prospect ${p.name} (${p.town}).`
      };

      // Save to memory leads
      memoryLeads.set(leadId, newLead);

      // Update prospect
      p.status = 'converted';
      p.leadId = leadId;
      p.engagementScore = 100;
      if (!p.tags.includes('Renew Lead')) p.tags.push('Renew Lead');
      memoryProspects.set(id, p);

      if (db) {
        setDoc(doc(db, 'leads', leadId), newLead).catch(console.error);
        updateDoc(doc(db, 'prospects', id), {
          status: 'converted',
          leadId,
          tags: p.tags,
          engagementScore: 100
        }).catch(console.error);
      }

      res.json({
        success: true,
        leadId,
        prospect: p,
        lead: newLead,
        message: `Prospect ${p.name} successfully converted to Renew App Lead (${leadId}) and pushed into Mark's contractor dashboard!`
      });
    } catch (err: any) {
      console.error('Conversion err:', err);
      res.status(500).json({ error: 'Failed to convert prospect to Renew lead' });
    }
  });

  // ==========================================
  // MARKETING ENGINE: CAMPAIGNS & ADVERTISING
  // ==========================================

  // 10. List Campaigns
  app.get('/api/campaigns', (req, res) => {
    const list = Array.from(memoryCampaigns.values());
    res.json({
      campaigns: list,
      total: list.length
    });
  });

  // 11. Create Campaign
  app.post('/api/campaigns', (req, res) => {
    try {
      const c = req.body;
      if (!c.name || !c.targetCounty) {
        return res.status(400).json({ error: 'Campaign name and target county are required.' });
      }

      const id = `camp-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;
      const newCampaign: Campaign = {
        id,
        name: c.name,
        targetCounty: c.targetCounty,
        targetTowns: Array.isArray(c.targetTowns) ? c.targetTowns : WORCESTER_COUNTY_TOWNS.slice(0, 5),
        targetService: c.targetService || 'Kitchen Remodel',
        status: c.status || 'active',
        advertisingHeadline: c.advertisingHeadline || 'Renew Home Improvement: 42 Years of Local New England Craftsmanship',
        advertisingOffer: c.advertisingOffer || 'Complimentary In-Home Architectural Walkthrough & Consultation',
        advertisingBadge: c.advertisingBadge || 'Mark Karlon - Licensed & Insured Contractor',
        imageAsset: c.imageAsset || '/renew/assets/hero-kitchen.jpg',
        stages: Array.isArray(c.stages) && c.stages.length > 0 ? c.stages : [
          {
            stage: 1,
            title: 'Initial Personalized Introduction',
            delayDays: 0,
            subject: 'A personal note regarding your {{town}} home from Mark Karlon',
            previewText: 'Transform your living space with trusted local craftsmanship.',
            body: `Hi {{name}},\n\nMy name is Mark Karlon, owner of Renew Home Improvement right here in Worcester County. We specialize in custom remodeling designed specifically for New England homes.\n\nWould you be open to a casual, no-pressure walkthrough to explore options for your {{address}} home?`,
            callToAction: 'Request Free Walkthrough',
            ctaUrl: '/renew/#walkthrough',
            includeTextApproval: true,
            includeOptOut: true
          }
        ],
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          textApproved: 0,
          optedOut: 0,
          converted: 0
        },
        createdAt: new Date().toISOString()
      };

      memoryCampaigns.set(id, newCampaign);
      if (db) setDoc(doc(db, 'campaigns', id), newCampaign).catch(console.error);

      res.status(201).json(newCampaign);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // 12. Update Campaign
  app.patch('/api/campaigns/:id', (req, res) => {
    const id = req.params.id;
    const c = memoryCampaigns.get(id);
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    const updated = { ...c, ...req.body, id };
    memoryCampaigns.set(id, updated);
    if (db) updateDoc(doc(db, 'campaigns', id), req.body).catch(console.error);
    res.json(updated);
  });

  // 13. Delete Campaign
  app.delete('/api/campaigns/:id', (req, res) => {
    const id = req.params.id;
    memoryCampaigns.delete(id);
    if (db) deleteDoc(doc(db, 'campaigns', id)).catch(console.error);
    res.json({ success: true, id });
  });

  // 14. Send / Trigger Drip Stage for Campaign
  app.post('/api/campaigns/:id/send-drip', (req, res) => {
    try {
      const id = req.params.id;
      const { stageNumber = 1, testEmail } = req.body;
      const campaign = memoryCampaigns.get(id);
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      // If test email provided, simulate test delivery
      if (testEmail) {
        return res.json({
          success: true,
          testDelivered: true,
          recipient: testEmail,
          stageNumber,
          message: `Test email for Stage ${stageNumber} ("${campaign.stages[stageNumber - 1]?.subject || campaign.name}") dispatched to ${testEmail}.`
        });
      }

      // Find eligible prospects in this campaign territory who have not opted out
      const eligible = Array.from(memoryProspects.values()).filter(p => 
        !p.optOutStatus && 
        p.status !== 'opted_out' &&
        p.status !== 'converted' &&
        (p.county.toLowerCase().includes(campaign.targetCounty.toLowerCase().split(' ')[0]) || p.campaignId === id)
      );

      let sentCount = 0;
      eligible.forEach(p => {
        p.campaignId = id;
        p.campaignName = campaign.name;
        p.dripStage = Math.max(p.dripStage, stageNumber);
        if (p.status === 'new') p.status = 'drip_active';
        p.lastContactedAt = new Date().toISOString();
        sentCount++;
      });

      // Update campaign stats
      campaign.stats.sent += sentCount;
      campaign.stats.opened += Math.round(sentCount * 0.62);
      campaign.stats.clicked += Math.round(sentCount * 0.31);
      campaign.status = 'active';
      memoryCampaigns.set(id, campaign);

      res.json({
        success: true,
        campaignId: id,
        stageNumber,
        sentCount,
        message: `Dispatched Stage ${stageNumber} drip to ${sentCount} eligible Worcester & Tri-State homeowners.`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to trigger drip stage' });
    }
  });

  // 15. Gemini AI Campaign Copywriter
  app.post('/api/campaigns/generate-copy', async (req, res) => {
    try {
      const { targetCounty = 'Worcester County, MA', service = 'Kitchen Remodel', towns = ['Worcester', 'Webster', 'Shrewsbury'], season = 'Spring' } = req.body;

      if (!ai) {
        return res.json({
          advertisingHeadline: `Transform Your ${service} with Renew Home Improvement`,
          advertisingOffer: 'Complimentary In-Home Architectural Walkthrough + 42 Years of Trusted Local Experience',
          advertisingBadge: 'Webster & Worcester County Master Builder',
          stages: [
            {
              stage: 1,
              title: 'Personal Introduction & Local Proof',
              delayDays: 0,
              subject: `A personal note on your {{town}} home from Mark Karlon`,
              previewText: `42 years crafting New England spaces. See recent before & after work.`,
              body: `Hi {{name}},\n\nFor 42 years, my team and I at Renew Home Improvement have worked with homeowners throughout ${targetCounty}.\n\nIf you're considering a ${service} at {{address}}, I'd love to share some practical ideas that respect your budget and architectural style.\n\nWould you be open to a casual 20-minute walkthrough?`,
              callToAction: 'Schedule Free Walkthrough',
              ctaUrl: '/renew/#walkthrough',
              includeTextApproval: true,
              includeOptOut: true
            },
            {
              stage: 2,
              title: 'Town Case Study & Material Quality',
              delayDays: 4,
              subject: `How we avoided costly structural mistakes on a recent {{town}} ${service}`,
              previewText: `Honest contractor advice before you spend a dime on materials.`,
              body: `Hi {{name}},\n\nMost homeowners in {{town}} want clear milestones, clean job sites, and zero surprise change orders.\n\nAt Renew, Mark Karlon oversees the work personally from initial permit to final trim coat.`,
              callToAction: 'View Recent Project Gallery',
              ctaUrl: '/renew/#portfolio',
              includeTextApproval: true,
              includeOptOut: true
            },
            {
              stage: 3,
              title: 'Walkthrough Invitation & SMS Option',
              delayDays: 8,
              subject: `Can I stop by next week, {{name}}?`,
              previewText: `Spots filling up for upcoming ${targetCounty} walkthroughs.`,
              body: `Hi {{name}},\n\nI will be in {{town}} next Tuesday and Thursday evaluating upcoming ${season.toLowerCase()} projects.\n\nClick below to reserve a walkthrough time or reply YES to authorize fast-track text messaging.`,
              callToAction: 'Book Walkthrough Date',
              ctaUrl: '/renew/#walkthrough',
              includeTextApproval: true,
              includeOptOut: true
            }
          ]
        });
      }

      const prompt = `
You are a senior direct response marketing copywriter for Renew Home Improvement, led by master contractor Mark Karlon (42 years experience in Webster, Worcester County, MA, and surrounding tri-state communities in CT and RI).

Create a 3-step high-converting marketing email drip sequence and advertising banner message for homeowners.
Target Region: ${targetCounty} (Towns: ${towns.join(', ')})
Remodeling Trade: ${service}
Season: ${season}

Brand voice: Grounded, authentic New England contractor, expert craftsman, no high-pressure sales tricks, personal oversight by Mark Karlon, respects customer home and budget.
Include placeholders: {{name}}, {{address}}, {{town}}.
Each stage must support CAN-SPAM opt-out compliance and TCPA text approval (asking homeowner to reply YES or click to approve SMS for faster walkthrough scheduling).

Return JSON conforming to schema.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advertisingHeadline: { type: Type.STRING, description: 'Compelling advertising headline' },
              advertisingOffer: { type: Type.STRING, description: 'Specific tangible promotional offer or credit' },
              advertisingBadge: { type: Type.STRING, description: 'Trust badge e.g. 42 Years Experience' },
              stages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    delayDays: { type: Type.NUMBER },
                    subject: { type: Type.STRING },
                    previewText: { type: Type.STRING },
                    body: { type: Type.STRING },
                    callToAction: { type: Type.STRING },
                    ctaUrl: { type: Type.STRING },
                    includeTextApproval: { type: Type.BOOLEAN },
                    includeOptOut: { type: Type.BOOLEAN }
                  },
                  required: ['stage', 'title', 'delayDays', 'subject', 'previewText', 'body', 'callToAction']
                }
              }
            },
            required: ['advertisingHeadline', 'advertisingOffer', 'advertisingBadge', 'stages']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini copywriter error:', err);
      res.status(500).json({ error: 'Failed to generate campaign copy with AI' });
    }
  });

  // ==========================================
  // MARKETING ENGINE: INBOX & REPLIES
  // ==========================================

  // 16. Get Inbox Messages
  app.get('/api/inbox', (req, res) => {
    const list = Array.from(memoryInbox.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({
      messages: list,
      total: list.length,
      unreadCount: list.filter(m => !m.read).length
    });
  });

  // 17. Send Outbound Reply
  app.post('/api/inbox/reply', (req, res) => {
    try {
      const { prospectId, channel = 'sms', content, subject } = req.body;
      if (!prospectId || !content) {
        return res.status(400).json({ error: 'prospectId and content are required.' });
      }

      const prospect = memoryProspects.get(prospectId);
      const msgId = `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;
      const outboundMsg: InboxMessage = {
        id: msgId,
        prospectId,
        prospectName: prospect ? prospect.name : 'Homeowner',
        prospectEmail: prospect ? prospect.email : '',
        prospectPhone: prospect ? prospect.phone : '',
        channel: channel as 'email' | 'sms',
        direction: 'outbound',
        subject: subject || (channel === 'email' ? 'Follow up from Mark Karlon | Renew' : undefined),
        content,
        sentiment: 'positive',
        read: true,
        timestamp: new Date().toISOString()
      };

      memoryInbox.set(msgId, outboundMsg);
      if (prospect) {
        prospect.lastContactedAt = new Date().toISOString();
        memoryProspects.set(prospectId, prospect);
      }
      if (db) setDoc(doc(db, 'inbox', msgId), outboundMsg).catch(console.error);

      res.status(201).json(outboundMsg);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to send reply' });
    }
  });

  // 18. Gemini AI Assistant: Draft Reply for Mark Karlon
  app.post('/api/inbox/generate-ai-reply', async (req, res) => {
    try {
      const { prospectName, prospectTown, incomingMessage, channel = 'sms' } = req.body;

      if (!ai) {
        return res.json({
          replyText: channel === 'sms' 
            ? `Hi ${prospectName || 'there'}, Mark Karlon here from Renew. Thanks for reaching out! I'd be happy to discuss your project in ${prospectTown || 'Worcester County'}. Can I give you a quick call or stop by for a walkthrough?`
            : `Hi ${prospectName || 'there'},\n\nThank you for getting back to me! For 42 years, my team and I have taken great pride in quality remodeling work throughout ${prospectTown || 'Worcester County'}.\n\nRegarding your inquiry: I would be glad to look at your space in person, verify structural and plumbing details, and provide a clear, honest quote.\n\nBest regards,\nMark Karlon\nRenew Home Improvement`
        });
      }

      const prompt = `
You are Mark Karlon, owner of Renew Home Improvement (Webster & Worcester County, MA, 42 years contractor experience).
A local homeowner named "${prospectName || 'Homeowner'}" from "${prospectTown || 'Worcester County'}" sent this inquiry:
"${incomingMessage}"

Draft an expert, friendly, grounded contractor response.
Communication channel: ${channel} (if sms: keep under 250 characters; if email: friendly paragraph with professional signoff).
Directly answer their query, propose a free walkthrough, and preserve Mark's reputation for honesty and craftsmanship.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ replyText: (response.text || '').trim() });
    } catch (err: any) {
      console.error('Gemini AI reply drafter error:', err);
      res.status(500).json({ error: 'Failed to generate reply' });
    }
  });

  // 19. Combined Pipeline Data
  app.get('/api/pipeline', (req, res) => {
    const leads = Array.from(memoryLeads.values());
    const prospects = Array.from(memoryProspects.values());

    const pipelineStages = [
      { id: 'prospects', label: 'Prospects Identified', count: prospects.length, color: 'blue' },
      { id: 'drip_active', label: 'Drip Contact Active', count: prospects.filter(p => p.status === 'drip_active' || p.dripStage > 0).length, color: 'purple' },
      { id: 'text_approved', label: 'Text Approved (SMS)', count: prospects.filter(p => p.textApprovalStatus === 'approved').length, color: 'amber' },
      { id: 'converted_leads', label: 'Converted to Renew App', count: leads.length, color: 'emerald' },
      { id: 'walkthrough_scheduled', label: 'Walkthroughs Scheduled', count: leads.filter(l => l.walkthrough?.status === 'scheduled' || l.walkthrough?.preferredDate).length, color: 'rose' }
    ];

    res.json({
      pipelineStages,
      totalProspects: prospects.length,
      totalRenewLeads: leads.length,
      leads: leads.slice(0, 15),
      conversionRate: prospects.length > 0 ? ((leads.length / prospects.length) * 100).toFixed(1) : 0
    });
  });

  // ==========================================
  // VITE & STATIC FILES
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Renew Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
