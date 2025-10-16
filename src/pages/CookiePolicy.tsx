import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="text-foreground/90 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-foreground/90 mb-4">
              We use cookies for the following purposes:
            </p>

            <div className="space-y-6 ml-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Essential Cookies (Required)</h3>
                <p className="text-foreground/90 mb-2">
                  These cookies are strictly necessary for the website to function properly. Without these cookies, services you have requested cannot be provided.
                </p>
                <ul className="list-disc ml-6 space-y-1 text-foreground/90">
                  <li><strong>Authentication:</strong> Supabase authentication tokens to keep you logged in</li>
                  <li><strong>Security:</strong> Protect your account and data</li>
                  <li><strong>Session Management:</strong> Maintain your session across pages</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                <p className="text-foreground/90 mb-2">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                </p>
                <ul className="list-disc ml-6 space-y-1 text-foreground/90">
                  <li><strong>Theme Preference:</strong> Remember your dark/light mode choice</li>
                  <li><strong>Language Settings:</strong> Store your preferred language</li>
                  <li><strong>UI Preferences:</strong> Remember your interface customizations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-foreground/90 mb-2">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <ul className="list-disc ml-6 space-y-1 text-foreground/90">
                  <li><strong>Portfolio Views:</strong> Track how many times portfolios are viewed</li>
                  <li><strong>Usage Patterns:</strong> Understand which features are most popular</li>
                  <li><strong>Performance:</strong> Monitor site performance and errors</li>
                </ul>
                <p className="text-foreground/90 mt-2">
                  We do not use third-party analytics services. All analytics data is stored in our own database.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Cookie Name</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-left p-3 font-semibold">Duration</th>
                    <th className="text-left p-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">sb-*-auth-token</td>
                    <td className="p-3">Essential</td>
                    <td className="p-3">Session/1 week</td>
                    <td className="p-3">Authentication and session management</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">lovable-ui-theme</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">Persistent</td>
                    <td className="p-3">Remember your theme preference</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">cookie-consent</td>
                    <td className="p-3">Essential</td>
                    <td className="p-3">1 year</td>
                    <td className="p-3">Store your cookie preferences</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-foreground/90 mb-4">
              You can manage your cookie preferences at any time by:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-foreground/90">
              <li>Using the cookie settings dialog that appears on your first visit</li>
              <li>Clearing cookies through your browser settings</li>
              <li>Disabling cookies in your browser (note: this may affect site functionality)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Browser Controls</h2>
            <p className="text-foreground/90 mb-4">
              Most web browsers allow you to control cookies through their settings:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-foreground/90">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="text-foreground/90">
              We do not use third-party cookies for advertising or tracking purposes. All cookies set by our application are first-party cookies necessary for core functionality or explicitly consented to by you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-foreground/90">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-foreground/90">
              If you have any questions about our use of cookies, please contact us through the contact information provided on our website.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default CookiePolicy;
