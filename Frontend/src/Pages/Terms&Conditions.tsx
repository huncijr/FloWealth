import React from "react";
import { Link } from "react-router-dom";
import useDarkMode from "../Components/Mode";
import { Mail, Github, ArrowLeft } from "lucide-react";

const TermsConditions = () => {
  const { isDark } = useDarkMode();

  const sections = [
    { id: "about", num: "1", title: "About FloWealth" },
    { id: "eligibility", num: "2", title: "Eligibility" },
    { id: "accounts", num: "3", title: "Accounts and Access" },
    { id: "usercontent", num: "4", title: "User Content" },
    { id: "receipts", num: "5", title: "Receipts / Invoice Uploads" },
    { id: "ai", num: "6", title: "AI Features" },
    { id: "budgeting", num: "7", title: "Budgeting / Financial Disclaimer" },
    { id: "acceptable-use", num: "8", title: "Acceptable Use" },
    { id: "availability", num: "9", title: "Service Availability and Changes" },
    { id: "termination", num: "10", title: "Termination and Deletion" },
    { id: "privacy", num: "11", title: "Privacy" },
    { id: "third-party", num: "12", title: "Third-Party Services" },
    { id: "intellectual-property", num: "13", title: "Intellectual Property" },
    { id: "disclaimer", num: "14", title: "Disclaimer of Warranties" },
    { id: "liability", num: "15", title: "Limitation of Liability" },
    { id: "changes", num: "16", title: "Changes to These Terms" },
    { id: "contact", num: "17", title: "Contact" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-main-bg" : "bg-main-foreground"}`}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto p-6 pt-10">
        <Link
          to="/Account"
          className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold Abril-Fatface text-primary mb-2">
          Terms & Conditions
        </h1>
        <p className="text-sm opacity-70 mb-8">Last updated: 2026-04-10</p>

        {/* Table of Contents */}
        <div className="bg-content2 p-4 rounded-xl mb-8 border border-divider">
          <h2 className="text-lg font-bold mb-4 text-primary">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center gap-2 text-sm text-left hover:text-primary transition-colors py-1"
              >
                <span className="font-bold text-primary">{section.num}.</span>
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="about">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">1.</span> About FloWealth
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              FloWealth is a web app intended to help users track subscriptions,
              magazine costs, and general expenses, including optional notes,
              categories/themes, and budgeting features.
            </p>
          </section>

          {/* Section 2 */}
          <section id="eligibility">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">2.</span> Eligibility
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              You must be legally permitted to use the Service in your country
              and you must provide accurate information when creating and using
              an account.
            </p>
          </section>

          {/* Section 3 */}
          <section id="accounts">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">3.</span> Accounts and
              Access
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed opacity-90">
              <li>
                You may need to sign in (for example via email or third-party
                login providers).
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account and for all activities that occur under your account.
              </li>
              <li>
                You agree not to attempt to access accounts or data that are not
                yours.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="usercontent">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">4.</span> User Content
            </h2>
            <p className="text-base leading-relaxed opacity-90 mb-3">
              FloWealth may allow you to create, store, and manage content such
              as notes, themes, budgeting entries, and related data ("User
              Content").
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed opacity-90">
              <li>You retain ownership of your User Content.</li>
              <li>
                You grant FloWealth a limited license to host, store, and
                process your User Content solely for the purpose of providing
                the Service.
              </li>
            </ul>
            <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <h3 className="font-bold text-danger mb-2">
                4.1 Prohibited Content
              </h3>
              <p className="text-sm opacity-90">
                You agree not to upload, store, or share User Content that: is
                illegal, harmful, abusive, or infringing; contains malware or
                attempts to disrupt the Service; violates the rights of others.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="receipts">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">5.</span> Receipts / Invoice
              Uploads
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              If the Service allows uploading receipts, invoices, or similar
              files ("Receipts"):
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-base leading-relaxed opacity-90">
              <li>You confirm you have the right to upload those files.</li>
              <li>
                Receipts may contain personal data (e.g., names, addresses,
                order numbers). You should avoid uploading unnecessary sensitive
                information.
              </li>
              <li>
                You are responsible for reviewing files before uploading them.
              </li>
              <li>
                FloWealth does not guarantee that any extracted/recognized
                information from Receipts is complete or accurate.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="ai">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">6.</span> AI Features
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              If the Service includes AI-based features (such as summarization,
              comparisons, or extraction):
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-base leading-relaxed opacity-90">
              <li>AI output may be incorrect, incomplete, or misleading.</li>
              <li>
                Do not rely on AI output for financial, legal, tax, or other
                professional decisions.
              </li>
              <li>You are responsible for verifying results.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="budgeting">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">7.</span> Budgeting /
              Financial Disclaimer
            </h2>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="font-bold text-warning mb-2">Important</p>
              <p className="text-base leading-relaxed opacity-90">
                FloWealth is provided for informational and organizational
                purposes only. FloWealth is <strong>not</strong> a financial
                advisor. The Service does not provide professional financial,
                legal, or tax advice. Any budgets, limits, alerts, or
                recommendations are estimates and may not reflect your actual
                situation.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="acceptable-use">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">8.</span> Acceptable Use
            </h2>
            <p className="text-base leading-relaxed opacity-90 mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed opacity-90">
              <li>
                Misuse the Service, attempt unauthorized access, or interfere
                with normal operation.
              </li>
              <li>
                Reverse engineer or attempt to obtain source code from the
                Service (except where permitted by law).
              </li>
              <li>
                Use the Service to violate applicable laws or regulations.
              </li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="availability">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">9.</span> Service
              Availability and Changes
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              FloWealth is a hobby project and may change over time. Features
              may be modified, removed, or discontinued at any time. The Service
              may be temporarily unavailable due to maintenance, updates, or
              technical issues.
            </p>
          </section>

          {/* Section 10 */}
          <section id="termination">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">10.</span> Termination and
              Deletion
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed opacity-90">
              <li>You may stop using the Service at any time.</li>
              <li>
                If the Service provides an account deletion feature, you may
                request deletion of your account and associated data via the
                app.
              </li>
              <li>
                FloWealth may suspend or terminate access if you violate these
                Terms, to protect the Service, or for security reasons.
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section id="privacy">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">11.</span> Privacy
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              Your use of the Service is also governed by the Privacy Policy.
              Please read it to understand how your data is handled.
            </p>
          </section>

          {/* Section 12 */}
          <section id="third-party">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">12.</span> Third-Party
              Services
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              FloWealth may rely on third-party services (such as hosting
              providers, authentication providers, analytics tools, or AI
              providers). Your use of those third-party services may be subject
              to their own terms and policies.
            </p>
          </section>

          {/* Section 13 */}
          <section id="intellectual-property">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">13.</span> Intellectual
              Property
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              The FloWealth name, branding, and UI may be protected by
              intellectual property laws. You may not use FloWealth branding in
              a way that suggests endorsement or affiliation without permission.
            </p>
          </section>

          {/* Section 14 */}
          <section id="disclaimer">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">14.</span> Disclaimer of
              Warranties
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              The Service is provided "AS IS" and "AS AVAILABLE". FloWealth
              makes no warranties of any kind, express or implied, including
              fitness for a particular purpose, accuracy, or non-infringement.
            </p>
          </section>

          {/* Section 15 */}
          <section id="liability">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">15.</span> Limitation of
              Liability
            </h2>
            <p className="text-base leading-relaxed opacity-90 mb-3">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed opacity-90">
              <li>
                FloWealth will not be liable for indirect, incidental, special,
                consequential, or punitive damages.
              </li>
              <li>
                FloWealth is not responsible for financial losses, missed
                payments, incorrect budgeting decisions, or reliance on AI
                output.
              </li>
              <li>
                FloWealth's total liability for any claim related to the Service
                is limited to the amount you paid for the Service (if any). If
                the Service is free, this amount is <strong>$0</strong>.
              </li>
            </ul>
          </section>

          {/* Section 16 */}
          <section id="changes">
            <h2 className="text-xl font-bold mb-3 text-primary">
              <span className="text-secondary mr-2">16.</span> Changes to These
              Terms
            </h2>
            <p className="text-base leading-relaxed opacity-90">
              FloWealth may update these Terms from time to time. The "Last
              updated" date will reflect changes. Continued use of the Service
              means you accept the updated Terms.
            </p>
          </section>

          {/* Section 17 - Contact */}
          <section id="contact" className="border-t border-divider pt-8">
            <h2 className="text-xl font-bold mb-4 text-primary">
              <span className="text-secondary mr-2">17.</span> Contact
            </h2>
            <p className="text-base leading-relaxed opacity-90 mb-4">
              If you have questions or need support, contact:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:flowealthwebapp@gmail.com"
                className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>flowealthwebapp@gmail.com</span>
              </a>
              <a
                href="https://github.com/huncijr/FloWealth"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
