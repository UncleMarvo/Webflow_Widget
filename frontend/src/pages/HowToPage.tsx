import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';

const tabs = [
  { id: 'getting-started', label: 'Getting Started', estimate: '5 min read' },
  { id: 'rounds', label: 'Rounds', estimate: '10 min read' },
  { id: 'mobile', label: 'Mobile', estimate: '5 min read' },
  { id: 'dashboard', label: 'Dashboard', estimate: '10 min read' },
  { id: 'api', label: 'API', estimate: '15 min read' },
];

function CodeBlock({ code, language = '' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-md overflow-hidden border border-border my-4">
      {language && (
        <div className="bg-gray-100 px-4 py-1.5 text-xs text-text-secondary font-mono border-b border-border">
          {language}
        </div>
      )}
      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed" tabIndex={0}>
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2.5 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Copy code to clipboard"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function StepCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ScreenshotPlaceholder({ alt, aspect = '16/9' }: { alt: string; aspect?: string }) {
  return (
    <div
      className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center my-4"
      style={{ aspectRatio: aspect }}
      role="img"
      aria-label={alt}
    >
      <div className="text-center text-gray-400 px-4">
        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
        <p className="text-sm">{alt}</p>
      </div>
    </div>
  );
}

function VideoEmbed({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 my-6 text-center">
      <div className="bg-gray-200 rounded-lg flex items-center justify-center mb-4" style={{ aspectRatio: '16/9' }} role="img" aria-label={`Video: ${title}`}>
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function GettingStartedTab() {
  return (
    <section aria-labelledby="getting-started-heading">
      <h2 id="getting-started-heading" className="text-2xl font-bold text-text-primary mb-2">Getting Started</h2>
      <p className="text-text-secondary mb-8">Get up and running in under 5 minutes. Create a project, embed the widget, and start collecting feedback.</p>

      <StepCard number={1} title="Create a project">
        <ScreenshotPlaceholder alt="Empty projects page with Create new project button highlighted" />
        <p className="text-text-secondary">Click <strong>"Create Project"</strong>, give it a name (e.g., "My Webflow Site"), and you're done. Your project is ready to receive feedback.</p>
      </StepCard>

      <StepCard number={2} title="Get your embed code">
        <ScreenshotPlaceholder alt="Copy button next to the embed code snippet" />
        <p className="text-text-secondary mb-3">We'll generate a unique script tag for your project. Copy it.</p>
        <CodeBlock language="html" code={`<script src="https://widget.webflowfeedback.com/embed.js"></script>`} />
      </StepCard>

      <StepCard number={3} title="Paste into Webflow">
        <ScreenshotPlaceholder alt="Webflow Designer custom code section in Project Settings" />
        <p className="text-text-secondary">In Webflow Designer, go to <strong>Project Settings &gt; Custom Code &gt; Footer Code</strong>. Paste the script. Publish your site for the widget to appear.</p>
      </StepCard>

      <StepCard number={4} title="Invite team members">
        <ScreenshotPlaceholder alt="Settings page showing Team section with Invite button" />
        <p className="text-text-secondary">Click <strong>"Invite"</strong>, enter their email, select a role (Admin or Member). They'll receive an invite email with a link to join your project.</p>
      </StepCard>

      <StepCard number={5} title="Test feedback">
        <ScreenshotPlaceholder alt="Feedback widget popup showing annotation interface" />
        <p className="text-text-secondary">Reload your published site. Look for the feedback icon in the corner. Click it, annotate the page, and submit test feedback to make sure everything works.</p>
      </StepCard>

      <VideoEmbed
        title="Quick Start Walkthrough"
        description="2-minute screencast showing all 5 steps from project creation to first feedback submission."
      />
    </section>
  );
}

function RoundsTab() {
  return (
    <section aria-labelledby="rounds-heading">
      <h2 id="rounds-heading" className="text-2xl font-bold text-text-primary mb-2">Rounds Workflow</h2>
      <p className="text-text-secondary mb-8">Organize feedback by design phase with rounds.</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">What are rounds?</h3>
        <p className="text-blue-800">
          Rounds are feedback phases. Use them to organize feedback by design stage: <strong>Discovery</strong>, <strong>Wireframes</strong>, <strong>Design</strong>, <strong>Revisions</strong>, <strong>Final</strong>. Freeze a round to prevent new feedback during that phase.
        </p>
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-4">How to create a round</h3>
      <ScreenshotPlaceholder alt="Create Round button in the Rounds tab of a project" />

      <StepCard number={1} title="Go to your project's Rounds tab">
        <p className="text-text-secondary">Open your project from the dashboard and navigate to the <strong>Rounds</strong> tab.</p>
      </StepCard>

      <StepCard number={2} title='Click "+Create Round"'>
        <ScreenshotPlaceholder alt="Create Round modal with name input field" />
        <p className="text-text-secondary">The create round dialog will appear.</p>
      </StepCard>

      <StepCard number={3} title="Name your round">
        <p className="text-text-secondary">Give it a descriptive name, e.g., <strong>"Round 1: Initial Design"</strong> or <strong>"Wireframes Review"</strong>.</p>
      </StepCard>

      <StepCard number={4} title="Choose freeze status">
        <p className="text-text-secondary">Decide whether to freeze the round immediately or leave it active to collect feedback.</p>
      </StepCard>

      <StepCard number={5} title="Click Save">
        <p className="text-text-secondary">Your round is now created and visible in the Rounds tab.</p>
      </StepCard>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">How to freeze &amp; unfreeze</h3>
      <ScreenshotPlaceholder alt="Freeze toggle switch on a round card showing frozen and unfrozen states" />
      <p className="text-text-secondary mb-6">Frozen rounds prevent new feedback from being assigned to them. This is perfect for locking down feedback during revision work or when moving to the next design phase.</p>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Best practices</h3>
      <div className="bg-surface border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 justify-center flex-wrap text-sm font-medium text-gray-700 mb-4">
          {['Discovery', 'Design', 'Revisions', 'Final'].map((phase, i, arr) => (
            <span key={phase} className="flex items-center gap-3">
              <span className="bg-white border border-gray-300 rounded-md px-3 py-1.5">{phase}</span>
              {i < arr.length - 1 && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              )}
            </span>
          ))}
        </div>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            Create one round per design phase.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            Freeze when moving to the next phase to lock down feedback.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            Auto-assign new feedback to the active (unfrozen) round.
          </li>
        </ul>
      </div>

      <VideoEmbed
        title="Rounds Workflow Demo"
        description="3-minute screencast showing full round creation, naming, and freezing workflow."
      />
    </section>
  );
}

function MobileTab() {
  return (
    <section aria-labelledby="mobile-heading">
      <h2 id="mobile-heading" className="text-2xl font-bold text-text-primary mb-2">Mobile Annotation</h2>
      <p className="text-text-secondary mb-8">Annotate on any device. The feedback widget is fully mobile-optimized so your clients can annotate from phones, tablets, and desktops.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">How to annotate on mobile</h3>
      <ScreenshotPlaceholder alt="Mobile phone displaying the feedback widget annotation interface" aspect="9/16" />

      <StepCard number={1} title="Open your site on mobile">
        <p className="text-text-secondary">Navigate to your published Webflow site on any mobile device.</p>
      </StepCard>

      <StepCard number={2} title="Tap the feedback icon">
        <p className="text-text-secondary">Look for the feedback icon in the corner of the screen. Tap it to open the widget.</p>
      </StepCard>

      <StepCard number={3} title="Tap to annotate">
        <p className="text-text-secondary">Tap anywhere on the screen to place an annotation pin at that location.</p>
      </StepCard>

      <StepCard number={4} title="Drag to highlight">
        <p className="text-text-secondary">Press and drag to draw a highlight rectangle around the area you want to call out.</p>
      </StepCard>

      <StepCard number={5} title="Type your feedback">
        <p className="text-text-secondary">Enter your feedback text in the input field. Add as much detail as you need.</p>
      </StepCard>

      <StepCard number={6} title="Swipe down to close">
        <p className="text-text-secondary">When you're done, swipe down on the widget to dismiss it. A visual indicator shows the swipe direction.</p>
      </StepCard>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Gestures explained</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { gesture: 'Tap', description: 'Start annotation at a specific point', icon: '👆' },
          { gesture: 'Drag', description: 'Draw or highlight an area on screen', icon: '✋' },
          { gesture: 'Pinch', description: 'Zoom in or out (optional)', icon: '🤏' },
          { gesture: 'Swipe down', description: 'Dismiss widget (visual indicator shows)', icon: '👇' },
        ].map(({ gesture, description, icon }) => (
          <div key={gesture} className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
            <div>
              <p className="font-semibold text-text-primary">{gesture}</p>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Responsive breakpoints</h3>
      <ScreenshotPlaceholder alt="Widget UI shown at four breakpoints: mobile, small tablet, large tablet, and desktop" />
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-surface">
              <th className="text-left px-4 py-3 font-semibold text-text-primary border-b border-border">Device</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary border-b border-border">Width</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary border-b border-border">Widget style</th>
            </tr>
          </thead>
          <tbody>
            {[
              { device: 'Mobile', width: '< 480px', style: 'Bottom sheet' },
              { device: 'Small Tablet', width: '480 – 640px', style: 'Compact floating panel' },
              { device: 'Large Tablet', width: '641 – 1024px', style: 'Floating panel' },
              { device: 'Desktop', width: '> 1024px', style: 'Floating side panel' },
            ].map(({ device, width, style }, i) => (
              <tr key={device} className={i % 2 === 1 ? 'bg-surface' : ''}>
                <td className="px-4 py-3 border-b border-gray-100 font-medium text-text-primary">{device}</td>
                <td className="px-4 py-3 border-b border-gray-100 text-text-secondary font-mono text-xs">{width}</td>
                <td className="px-4 py-3 border-b border-gray-100 text-text-secondary">{style}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-text-secondary mb-6">The widget adapts to screen size automatically. Bottom sheet on mobile for easy thumb access, floating panel on desktop for maximum context.</p>

      <VideoEmbed
        title="Mobile Annotation Demo"
        description="2-minute demo on actual iPhone and Android devices showing the full annotation flow."
      />
    </section>
  );
}

function DashboardTab() {
  return (
    <section aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" className="text-2xl font-bold text-text-primary mb-2">Dashboard Walkthrough</h2>
      <p className="text-text-secondary mb-8">Manage, organize, and act on feedback from one place.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Finding feedback</h3>
      <ScreenshotPlaceholder alt="Feedback list view showing submissions in reverse-chronological order" />
      <p className="text-text-secondary mb-8">Click a project, go to the <strong>Feedback</strong> tab. See all submissions in reverse-chronological order with previews of annotations and metadata.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Filtering &amp; sorting</h3>
      <ScreenshotPlaceholder alt="Filter panel showing Round, Status, and Priority filter options" />
      <p className="text-text-secondary mb-2">Filter by <strong>Round</strong>, <strong>Status</strong> (Open / In Progress / Resolved), or <strong>Priority</strong> (Low / Medium / High).</p>
      <div className="bg-surface border border-border rounded-lg p-4 mb-8 text-sm text-text-secondary">
        <strong>Example:</strong> "Show me all <span className="text-error font-medium">High</span> priority items in <span className="text-primary font-medium">Round 2: Design</span>"
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Exporting feedback</h3>
      <ScreenshotPlaceholder alt="Export dropdown menu showing CSV export option" />
      <p className="text-text-secondary mb-8">Click <strong>"Export"</strong>, select <strong>CSV</strong>. Downloads all feedback with timestamps, device info, annotations, and metadata.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Viewing device context</h3>
      <ScreenshotPlaceholder alt="Feedback detail view showing Browser, OS, Resolution, and Device Pixel Ratio" />
      <p className="text-text-secondary mb-8">Each piece of feedback includes <strong>browser</strong>, <strong>OS</strong>, <strong>screen size</strong>, and <strong>device pixel ratio</strong>. This helps you understand exactly where issues occur and reproduce them accurately.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Email notifications</h3>
      <ScreenshotPlaceholder alt="Settings page showing notification toggle switches per project" />
      <p className="text-text-secondary mb-8">Get email when feedback is submitted, commented on, or when status changes. Toggle notifications per project from <strong>Settings &gt; Notifications</strong>.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Bulk actions</h3>
      <ScreenshotPlaceholder alt="Checkbox selection with bulk action menu showing Resolve, Change Priority, Assign to Round, and Delete options" />
      <p className="text-text-secondary mb-8">Select multiple feedback items with checkboxes. Then use the bulk action menu to <strong>mark as resolved</strong>, <strong>change priority</strong>, <strong>assign to a round</strong>, or <strong>delete</strong>.</p>

      <VideoEmbed
        title="Full Dashboard Walkthrough"
        description="4-minute walkthrough covering finding, filtering, exporting, and managing feedback."
      />
    </section>
  );
}

function ApiTab() {
  return (
    <section aria-labelledby="api-heading">
      <h2 id="api-heading" className="text-2xl font-bold text-text-primary mb-2">API Setup</h2>
      <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1 text-sm font-medium mb-4">
        Pro &amp; Agency tiers only
      </div>
      <p className="text-text-secondary mb-8">The API lets you programmatically access feedback, create feedback, manage webhooks, and integrate with your tools.</p>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Generate API key</h3>
      <ScreenshotPlaceholder alt="Settings page showing API Keys section with Generate New Key button" />

      <StepCard number={1} title="Go to Settings > API Keys">
        <p className="text-text-secondary">Navigate to Settings in the top navigation and find the API Keys section.</p>
      </StepCard>

      <StepCard number={2} title='"Generate New Key"'>
        <p className="text-text-secondary">Click the button to create a new API key for your account.</p>
      </StepCard>

      <StepCard number={3} title="Copy key (shown once)">
        <p className="text-text-secondary">Copy the key immediately. For security, the full key is <strong>only shown once</strong> and cannot be retrieved later.</p>
      </StepCard>

      <StepCard number={4} title="Store securely">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
          <strong>Important:</strong> Never commit API keys to Git. Store them in environment variables or a secrets manager.
        </div>
      </StepCard>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Authentication</h3>
      <p className="text-text-secondary mb-3">Include your API key in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">Authorization</code> header as a Bearer token:</p>
      <CodeBlock language="http" code="Authorization: Bearer your_api_key_here" />

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Example requests</h3>

      <h4 className="text-base font-semibold text-gray-700 mb-2">cURL</h4>
      <CodeBlock language="bash" code={`curl -H "Authorization: Bearer YOUR_KEY" \\
  https://api.webflowfeedback.com/api/v1/projects`} />

      <h4 className="text-base font-semibold text-gray-700 mb-2">Node.js (fetch)</h4>
      <CodeBlock language="javascript" code={`const response = await fetch('https://api.webflowfeedback.com/api/v1/projects', {
  headers: { 'Authorization': 'Bearer YOUR_KEY' }
});
const projects = await response.json();`} />

      <h4 className="text-base font-semibold text-gray-700 mb-2">Python</h4>
      <CodeBlock language="python" code={`import requests

headers = {'Authorization': 'Bearer YOUR_KEY'}
response = requests.get(
    'https://api.webflowfeedback.com/api/v1/projects',
    headers=headers
)
projects = response.json()`} />

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Webhook setup</h3>
      <ScreenshotPlaceholder alt="Webhooks settings page showing registered webhooks and Register Webhook button" />

      <StepCard number={1} title="Go to Settings > Webhooks">
        <p className="text-text-secondary">Find the Webhooks section in your project Settings.</p>
      </StepCard>

      <StepCard number={2} title='"Register Webhook"'>
        <p className="text-text-secondary">Click the button to register a new webhook endpoint.</p>
      </StepCard>

      <StepCard number={3} title="Enter webhook URL">
        <p className="text-text-secondary">Provide the URL where you want to receive webhook events (e.g., your server endpoint).</p>
      </StepCard>

      <StepCard number={4} title="Select events">
        <p className="text-text-secondary">Choose which events to subscribe to:</p>
        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
          <li className="flex items-center gap-2"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">feedback.created</code> — New feedback submitted</li>
          <li className="flex items-center gap-2"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">feedback.updated</code> — Feedback modified</li>
          <li className="flex items-center gap-2"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">feedback.deleted</code> — Feedback removed</li>
        </ul>
      </StepCard>

      <StepCard number={5} title="Save and test">
        <p className="text-text-secondary">Click <strong>Save</strong>, then use <strong>"Send Test Event"</strong> to verify your endpoint receives the payload correctly.</p>
      </StepCard>

      <h3 className="text-xl font-semibold text-text-primary mt-10 mb-4">Webhook signature verification</h3>
      <p className="text-text-secondary mb-3">Each webhook request is signed with <strong>HMAC-SHA256</strong>. Verify the signature to ensure requests are authentically from WebflowFeedback.</p>

      <CodeBlock language="javascript" code={`const crypto = require('crypto');

const secret = 'your_webhook_secret';
const signature = req.headers['x-webhook-signature'];
const body = JSON.stringify(req.body);

const hash = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (hash === signature) {
  // Request is authentic — process the event
} else {
  // Reject the request
  res.status(401).send('Invalid signature');
}`} />

      <VideoEmbed
        title="API Walkthrough"
        description="5-minute walkthrough with live API requests, webhook setup, and signature verification."
      />
    </section>
  );
}

export default function HowToPage() {
  const [activeTab, setActiveTab] = useState('getting-started');

  const renderTab = () => {
    switch (activeTab) {
      case 'getting-started': return <GettingStartedTab />;
      case 'rounds': return <RoundsTab />;
      case 'mobile': return <MobileTab />;
      case 'dashboard': return <DashboardTab />;
      case 'api': return <ApiTab />;
      default: return <GettingStartedTab />;
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-gradient-to-b from-surface to-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">How To Guide</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Everything you need to set up, use, and get the most out of WebflowFeedback.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto -mb-px scrollbar-hide" role="tablist" aria-label="How-to guide sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-gray-400 hidden sm:inline">({tab.estimate})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {renderTab()}
      </div>
    </PublicLayout>
  );
}
