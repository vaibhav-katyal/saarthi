import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const markdownContent = `
# Privacy Policy for [Saarthi](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)

**Effective Date:** May 26, 2026
**Last Updated:** May 26, 2026

---

# 1. Introduction

Welcome to [Saarthi](https://saarthi-v2.vercel.app?utm_source=chatgpt.com) (“Saarthi,” “Platform,” “we,” “our,” or “us”).

This Privacy Policy explains how we collect, use, process, store, disclose, and safeguard information when you access or use our website, AI-powered educational platform, applications, services, and related features.

By accessing or using Saarthi, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy.

---

# 2. Information We Collect

We may collect the following categories of information:

## A. Personal Information

Information that may directly or indirectly identify a user, including:

* Full name
* Email address
* Phone number
* Educational institution details
* User profile information
* Login credentials
* Uploaded files and documents
* User-generated content

---

## B. Technical & Usage Information

We may automatically collect technical information, including:

* IP address
* Browser type and version
* Device identifiers
* Operating system
* Session activity
* Access timestamps
* Pages visited
* Interaction analytics
* Referring URLs

---

## C. AI Interaction Data

When using Saarthi services, we may collect and process:

* AI prompts and queries
* Chat conversations
* Generated responses
* Uploaded academic materials
* AI interaction history
* Usage patterns related to platform functionality

This information may be used to improve platform quality, personalization, security, performance, and AI capabilities.

---

## D. Cookies & Tracking Technologies

We may use technologies including:

* Cookies
* Local storage
* Analytics tools
* Session identifiers
* Performance monitoring technologies

These technologies help improve functionality, maintain security, analyze traffic, and optimize user experience.

---

# 3. How We Use Information

We may use collected information to:

* Provide and maintain platform services
* Deliver AI-powered educational assistance
* Personalize user experience
* Improve platform functionality and performance
* Respond to support requests
* Monitor security and prevent abuse
* Conduct analytics and research
* Enforce policies and terms
* Comply with legal obligations
* Improve AI systems and platform reliability

---

# 4. API Keys & Sensitive Credentials

Saarthi may allow users to connect third-party services or provide API keys, authentication tokens, credentials, or integration-related information (“Sensitive Credentials”) for platform functionality.

We implement commercially reasonable and industry-standard safeguards designed to protect Sensitive Credentials, including:

* Encryption during transmission and storage
* Restricted access controls
* Secure infrastructure protections
* Environment isolation and credential protection systems

Sensitive Credentials are treated as confidential information and are not intentionally disclosed, sold, or shared with unauthorized parties.

Access to encrypted credentials is strictly limited to authorized system processes and, where operationally necessary, the platform owner or authorized administrators for maintenance, security, compliance, or technical support purposes.

We are committed to protecting user credentials and implementing safeguards designed to prevent unauthorized access, including protection from internal misuse wherever reasonably practicable.

However, no digital system, transmission method, or storage infrastructure can be guaranteed to be completely secure. Users remain responsible for maintaining the security of their third-party accounts and permissions.

By providing API keys or integration credentials to Saarthi, users consent to their secure processing and storage solely for enabling requested platform functionality and services.

---

# 5. AI & Automated Processing

Saarthi utilizes artificial intelligence and automated systems to provide educational assistance and related services.

By using the platform, users acknowledge and understand that:

* AI-generated outputs may contain inaccuracies or incomplete information
* AI responses should be independently verified before reliance
* AI interactions may be processed through third-party AI infrastructure providers
* Uploaded content may be analyzed to improve platform functionality, security, and AI performance

We do not guarantee uninterrupted, error-free, or fully accurate AI-generated outputs.

---

# 6. Data Sharing & Disclosure

We do not sell personal information to third parties.

However, information may be shared with:

## A. Service Providers

Third-party vendors assisting with:

* Cloud infrastructure
* Authentication systems
* Database hosting
* AI infrastructure
* Analytics
* Security monitoring
* Customer support

---

## B. Legal Authorities

We may disclose information where required to:

* Comply with applicable laws
* Respond to lawful legal requests
* Enforce platform policies
* Protect platform security
* Prevent fraud, abuse, or illegal activities

---

## C. Business Transactions

Information may be transferred in connection with:

* Mergers
* Acquisitions
* Financing
* Asset sales
* Corporate restructuring

---

# 7. Data Retention

We retain information only for as long as reasonably necessary to:

* Provide services
* Maintain system integrity
* Resolve disputes
* Enforce agreements
* Comply with legal obligations

Aggregated or anonymized data may be retained for analytics, research, security, and platform improvement purposes.

---

# 8. Data Security

We implement commercially reasonable technical, administrative, and organizational safeguards designed to protect information against:

* Unauthorized access
* Misuse
* Disclosure
* Alteration
* Destruction

Security measures may include:

* Encryption technologies
* Secure authentication systems
* Access controls
* Protected infrastructure
* Monitoring systems

Despite these safeguards, no digital platform or storage system can guarantee absolute security.

---

# 9. User Rights

Depending on applicable laws and jurisdiction, users may have rights to:

* Access personal information
* Correct inaccurate information
* Request deletion of data
* Restrict or object to certain processing
* Withdraw consent where applicable
* Request data portability

Requests may be submitted through official platform support channels.

---

# 10. Children’s Privacy

Saarthi is not intended for children under the age permitted by applicable laws without appropriate parental, guardian, or institutional authorization.

We do not knowingly collect information from minors in violation of applicable legal requirements.

---

# 11. Third-Party Services

The platform may integrate with or contain links to third-party services, APIs, tools, or websites.

We are not responsible for:

* Third-party privacy practices
* External websites or services
* Third-party content or policies

Users should independently review the privacy policies of external providers.

---

# 12. International Data Transfers

User information may be processed or stored in jurisdictions outside the user’s country of residence where data protection laws may differ.

By using Saarthi, users consent to such transfers where legally permitted.

---

# 13. Intellectual Property & User Content

Users retain ownership of content they upload to the platform.

By uploading content, users grant Saarthi a limited, non-exclusive license to:

* Process content
* Store content
* Analyze content
* Display content where necessary for functionality
* Improve platform operations and AI systems

Users are solely responsible for ensuring they possess rights to uploaded materials.

---

# 14. Changes to This Privacy Policy

We reserve the right to modify or update this Privacy Policy at any time without prior notice.

Updated versions will be published on:

[Saarthi](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)

Continued use of the platform following updates constitutes acceptance of the revised Privacy Policy.

---

# 15. Contact Information

For privacy-related inquiries, legal notices, or data-related requests, contact:

**Saarthi Support Team**
Website: [Saarthi](https://saarthi-v2.vercel.app?utm_source=chatgpt.com)

---

# 16. Disclaimer

Saarthi is an AI-powered educational assistance platform intended for informational and educational purposes.

The platform does not provide legal, medical, financial, or officially accredited professional advice unless explicitly stated.

Users assume full responsibility for how they use AI-generated outputs, recommendations, and educational assistance provided through the platform.
`;

const PrivacyPolicy = () => {
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
             <Link to="/privacy" className="text-white">Privacy Policy</Link>
             <Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
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
           <span>© 2026 Saarthi. All rights reserved.</span>
           <div className="flex gap-6 font-medium">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
