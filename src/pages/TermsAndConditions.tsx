import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const markdownContent = `
# Terms & Conditions

**Effective Date:** May 26, 2026
**Last Updated:** May 26, 2026

Welcome to [Saarthi](https://saarthi-v2.vercel.app?utm_source=chatgpt.com) (“Saarthi,” “Platform,” “we,” “our,” or “us”).

These Terms & Conditions (“Terms”) govern your access to and use of the Saarthi AI platform, website, applications, AI systems, educational services, and related features.

By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms. If you do not agree, you must discontinue use of the Platform immediately.

---

# 1. Eligibility

By using Saarthi, you represent and warrant that:

* You are legally capable of entering into binding agreements under applicable law
* All information provided by you is accurate and complete
* You will use the Platform only in compliance with applicable laws and these Terms

If you use Saarthi on behalf of an institution or organization, you represent that you have authority to bind that entity to these Terms.

---

# 2. Description of Services

Saarthi AI provides AI-powered educational assistance, academic tools, productivity systems, automation features, and related digital services.

Features may include:

* AI chat systems
* Educational assistance
* File uploads and analysis
* Personalized academic tools
* Integrations with third-party APIs and services
* AI-generated content and responses

We reserve the right to modify, suspend, limit, or discontinue any part of the Platform at any time without notice.

---

# 3. User Accounts

Users may be required to create an account to access certain features.

You are responsible for:

* Maintaining confidentiality of account credentials
* Restricting unauthorized access to your account
* All activities conducted under your account

You agree to notify Saarthi AI immediately of any unauthorized use or security breach.

We reserve the right to suspend or terminate accounts that violate these Terms or pose risks to the Platform or other users.

---

# 4. API Keys & Integrations

Saarthi AI may allow users to connect third-party platforms or provide API keys, access tokens, and integration credentials.

By submitting such credentials, you represent that:

* You possess lawful authorization to use them
* You grant Saarthi AI permission to process them solely for requested functionality
* You understand that integrations rely on third-party systems beyond our control

We implement commercially reasonable safeguards, including encrypted storage and restricted access protections, to protect sensitive credentials.

However, users remain responsible for:

* External account security
* Managing permissions
* Monitoring third-party integrations
* Revoking credentials where necessary

---

# 5. Acceptable Use

You agree not to:

* Violate any applicable laws or regulations
* Upload malicious code, malware, or harmful content
* Attempt unauthorized access to systems or data
* Interfere with platform security or operations
* Reverse engineer, exploit, or abuse the Platform
* Use the Platform for fraudulent, deceptive, or illegal purposes
* Circumvent system protections or rate limits
* Use AI outputs to spread misinformation, harmful content, or unlawful material
* Infringe intellectual property rights of others

We reserve the right to investigate and take action against violations, including suspension, termination, or legal reporting.

---

# 6. AI-Generated Content Disclaimer

Saarthi AI uses artificial intelligence and automated systems to generate responses and educational assistance.

Users acknowledge and agree that:

* AI-generated outputs may contain inaccuracies, incomplete information, or errors
* Responses are generated automatically and should not be solely relied upon
* Users are responsible for independently verifying outputs before relying on them
* Saarthi AI does not guarantee accuracy, reliability, or completeness of AI-generated content

The Platform does not provide legal, medical, financial, psychological, or officially accredited professional advice unless explicitly stated.

---

# 7. User Content

Users retain ownership of content uploaded to the Platform.

By uploading or submitting content, users grant Saarthi AI a limited, non-exclusive, worldwide license to:

* Store
* Process
* Analyze
* Display
* Transmit

such content solely for operating, securing, improving, and providing the Platform.

Users represent that they possess all necessary rights to uploaded materials.

We reserve the right to remove content that violates these Terms or applicable law.

---

# 8. Intellectual Property

All Platform content, branding, software, interfaces, AI systems, designs, trademarks, logos, and proprietary materials are owned by or licensed to Saarthi AI unless otherwise stated.

Users may not:

* Copy
* Modify
* Redistribute
* Sell
* Reverse engineer
* Reproduce
* Exploit

any part of the Platform without prior written authorization.

---

# 9. Privacy

Use of Saarthi AI is also governed by our Privacy Policy available at:

[Privacy Policy](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)

By using the Platform, you consent to the collection and processing practices described therein.

---

# 10. Third-Party Services

The Platform may integrate with third-party services, APIs, websites, or providers.

Saarthi AI is not responsible for:

* Third-party systems
* External service availability
* Third-party policies
* Third-party content
* Downtime or failures caused by external providers

Use of third-party services may be subject to separate terms and policies.

---

# 11. Service Availability

We do not guarantee uninterrupted or error-free access to the Platform.

The Platform may experience:

* Downtime
* Maintenance interruptions
* Delays
* System failures
* AI service disruptions

We reserve the right to modify or discontinue services without liability.

---

# 12. Limitation of Liability

To the maximum extent permitted by law, Saarthi AI and its owners, operators, affiliates, employees, or partners shall not be liable for:

* Indirect damages
* Incidental damages
* Consequential damages
* Data loss
* Loss of profits
* Academic outcomes
* Reliance on AI-generated outputs
* Third-party service failures
* Unauthorized access or breaches beyond reasonable control

Use of the Platform is at the user’s sole risk.

---

# 13. Indemnification

You agree to indemnify and hold harmless Saarthi AI, its owners, affiliates, operators, and partners from any claims, liabilities, damages, losses, or expenses arising from:

* Your use of the Platform
* Violation of these Terms
* Violation of applicable laws
* Infringement of third-party rights
* Uploaded or shared content

---

# 14. Termination

We reserve the right to suspend, restrict, or terminate access to the Platform at any time, with or without notice, for conduct that violates these Terms or threatens platform integrity or security.

---

# 15. Changes to Terms

We reserve the right to modify or update these Terms at any time without prior notice.

Updated versions will be published on:

[Saarthi AI](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)

Continued use of the Platform after updates constitutes acceptance of the revised Terms.

---

# 16. Governing Law

These Terms shall be governed and interpreted in accordance with applicable laws, without regard to conflict-of-law principles.

Any disputes arising from use of the Platform shall be subject to the jurisdiction of applicable courts determined by governing law.

---

# 17. Contact Information

For legal inquiries, support, or questions regarding these Terms, contact:

**Saarthi AI**
Website: [https://saarthi-v2.vercel.app](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)
`;

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground bg-[#020202]">
      {/* Background Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex gap-6 text-sm font-medium">
             <Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="text-white">Terms of Service</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 pb-32">
        <div className="prose prose-invert prose-neutral max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:tracking-tight prose-a:text-white prose-a:no-underline hover:prose-a:underline prose-hr:border-white/10 prose-ul:list-disc">
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-black/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
           <span>© 2026 Saarthi AI. All rights reserved.</span>
           <div className="flex gap-6 font-medium">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
