import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last updated: January 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduction</h2>
              <p>
                Welcome to SelfHub AI ("we," "our," or "us"). We are committed to protecting your privacy
                and ensuring you have a positive experience on our platform. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when you use our booking platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials (email, password)</li>
                <li>Business information (if you're a business owner)</li>
                <li>Appointment booking details</li>
                <li>Payment information (processed through secure third-party providers)</li>
                <li>Reviews and ratings you submit</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Automatically Collected Information</h3>
              <p>We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and manage your bookings</li>
                <li>Send you booking confirmations and reminders</li>
                <li>Communicate with you about our services</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">4. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>With Business Owners:</strong> When you book an appointment, we share your booking
                  information with the business owner to facilitate the appointment.
                </li>
                <li>
                  <strong>Service Providers:</strong> We may share information with third-party service providers
                  who perform services on our behalf (e.g., hosting, analytics, email delivery).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect
                  our rights and safety.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets,
                  your information may be transferred.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of
                transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to collect and use personal information about you.
                You can control cookies through your browser settings, but this may affect the functionality of
                our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">8. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@selfhubai.com<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;

