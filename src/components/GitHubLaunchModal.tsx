import React, { useState } from 'react';
import {
  Github,
  Globe,
  Smartphone,
  Shield,
  Server,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Lock,
  Download,
  Flame,
  Cloud
} from 'lucide-react';

interface GitHubLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubLaunchModal: React.FC<GitHubLaunchModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'host' | 'pwa' | 'configs'>('guide');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const gitSnippet = `# 1. Create a PRIVATE repo on github.com (e.g. 'renew-portal')
git init
git add .
git commit -m "Launch private Renew Home Improvement marketing portal"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/renew-portal.git
git push -u origin main`;

  const renderSnippet = `# Build Command
npm run build

# Start Command
npm run start

# Environment Variables
PORT=3000
NODE_ENV=production
APP_PRIVATE_PIN=4242
GEMINI_API_KEY=YOUR_GEMINI_KEY`;

  const dockerSnippet = `# Build & Run container
docker build -t renew-portal .
docker run -d -p 3000:3000 \\
  -e GEMINI_API_KEY="YOUR_KEY" \\
  -e APP_PRIVATE_PIN="4242" \\
  --name renew-app renew-portal`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden my-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center shadow-md">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Launch on GitHub & Private Host</h3>
                <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                  Mark & Paulo Private
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step instructions to deploy to a private host and install to your phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4 p-1 bg-slate-950/60 rounded-2xl border border-slate-800 relative z-10 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Launch Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('host')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'host'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. Private Hosts</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>3. Phone Download</span>
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'configs'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Quick Scripts</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-4 relative z-10">
          {/* TAB 1: FLOW */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-400" />
                  How to Export Directly to Private GitHub
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Exporting to a <strong>Private GitHub Repository</strong> ensures nobody on the internet can see Mark&apos;s homeowner leads, contracts, or outreach data.
                </p>
              </div>

              {/* Direct 1-Click AI Studio Export Card */}
              <div className="bg-gradient-to-r from-slate-900 to-rose-950/40 border border-rose-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-rose-400" />
                    Option 1: Direct 1-Click AI Studio Export (Easiest)
                  </span>
                  <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Recommended
                  </span>
                </div>
                <ol className="text-xs text-slate-300 space-y-1.5 pl-1 list-none">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Click the <strong>Settings</strong> gear or <strong>Export</strong> button in the top-right header of Google AI Studio.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Select <strong>Export to GitHub</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Important: Choose <strong>Private Repository</strong> (e.g. <code>renew-contractor-portal</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span>Click <strong>Push</strong>. Your private GitHub repository is instantly created with all code and assets!</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Export to Private GitHub</h5>
                    <p className="text-xxs text-slate-400 mt-0.5">
                      Use the top-right AI Studio menu &gt; <strong>Export to GitHub</strong> &gt; set to <strong>Private</strong>. Or download ZIP and push manually.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Connect to Private Cloud Host</h5>
                    <p className="text-xxs text-slate-400 mt-0.5">
                      Connect your private GitHub repo to <strong>Render.com</strong> or <strong>Railway.app</strong> (free/low-cost with automatic zero-downtime deploys on every push).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Download to Mark&apos;s &amp; Paulo&apos;s Phones</h5>
                    <p className="text-xxs text-slate-400 mt-0.5">
                      Open your private URL on iPhone Safari or Android Chrome and install the Renew Home Improvement app to your home screen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOSTING OPTIONS */}
          {activeTab === 'host' && (
            <div className="space-y-3">
              {/* Option A: Direct Google Cloud Run */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950/50 border border-indigo-500/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-sm text-white">Google Cloud Run (Direct from AI Studio)</span>
                    <span className="text-xxs bg-indigo-950 text-indigo-300 border border-indigo-700 px-1.5 py-0.5 rounded font-bold">
                      Zero Third-Party Accounts
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  You can deploy this entire application directly to Google Cloud Run right from Google AI Studio. It runs on Google&apos;s fast, secure serverless cloud with instant private HTTPS.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl text-xxs font-mono text-slate-300 space-y-1">
                  <div>1. Click <strong>Deploy</strong> in the Google AI Studio menu.</div>
                  <div>2. Select <strong>Cloud Run</strong>.</div>
                  <div>3. It automatically compiles and gives you your dedicated live URL.</div>
                </div>
              </div>

              {/* Option B: Railway.app */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Railway.app (Recommended GitHub Host)</span>
                    <span className="text-xxs bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                      Easiest & Fastest
                    </span>
                  </div>
                  <a
                    href="https://railway.app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xxs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    railway.app <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Much smoother and faster than Render. Takes under 45 seconds to launch directly from your private GitHub repository with zero build issues.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl text-xxs font-mono text-slate-300 space-y-1">
                  <div>1. Go to <strong>railway.app</strong> &gt; Click <em>Start a New Project</em>.</div>
                  <div>2. Choose <em>Deploy from GitHub repo</em> &gt; Select <strong>renew-contractor-portal</strong>.</div>
                  <div>3. Under Variables, add <code>GEMINI_API_KEY</code> and <code>APP_PRIVATE_PIN=4242</code>.</div>
                  <div>4. Done! Railway auto-assigns an HTTPS domain.</div>
                </div>
              </div>

              {/* Option C: DigitalOcean App Platform */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-sm text-white">DigitalOcean App Platform</span>
                  </div>
                  <a
                    href="https://cloud.digitalocean.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xxs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    digitalocean.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Ultra-reliable standard Node.js hosting. Detects the repository and runs standard build/start commands seamlessly.
                </p>
              </div>

              {/* Custom Domain Note */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xxs text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Tip: Both Railway and Cloud Run allow you to attach your own custom domain (e.g. <code>portal.renewhomeimprovement.com</code>) with free automatic HTTPS SSL certificates.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: PHONE DOWNLOAD */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* iPhone */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-amber-300">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    Mark&apos;s iPhone (Safari)
                  </div>
                  <ol className="text-xxs text-slate-300 space-y-2 pl-2 list-decimal">
                    <li>Open your private site URL in <strong>Safari</strong>.</li>
                    <li>Tap the <strong>Share</strong> button at bottom.</li>
                    <li>Tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong>. The Renew icon appears on the phone screen!</li>
                  </ol>
                </div>

                {/* Android */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-emerald-300">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Android (Chrome)
                  </div>
                  <ol className="text-xxs text-slate-300 space-y-2 pl-2 list-decimal">
                    <li>Open the site in <strong>Google Chrome</strong>.</li>
                    <li>Tap the <strong>Download to Phone</strong> button on screen.</li>
                    <li>Or tap Chrome menu (⋮) &gt; <strong>Install App</strong>.</li>
                    <li>Installs directly to apps list and home screen!</li>
                  </ol>
                </div>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xxs text-slate-300">
                <strong>Why this is ideal:</strong> By using PWA technology, you don&apos;t need Apple App Store review or Google Play developer fees. You and Mark have an authentic full-screen app on your phones that syncs real-time contractor leads.
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPTS & CONFIGS */}
          {activeTab === 'configs' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300">Git Push Snippet</span>
                  <button
                    onClick={() => copyToClipboard(gitSnippet, 'git')}
                    className="text-xxs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'git' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xxs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                  {gitSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300">Render / Host Settings</span>
                  <button
                    onClick={() => copyToClipboard(renderSnippet, 'render')}
                    className="text-xxs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'render' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'render' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xxs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                  {renderSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300">Docker Command (Optional)</span>
                  <button
                    onClick={() => copyToClipboard(dockerSnippet, 'docker')}
                    className="text-xxs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'docker' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xxs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                  {dockerSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
          <div className="text-xxs text-slate-400">
            Files created: <code>Dockerfile</code>, <code>README-DEPLOY.md</code>, <code>manifest.json</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
