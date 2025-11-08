import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>Last updated: January 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using SelfHub AI ("the Platform"), you agree to be bound by these Terms of Service
                ("Terms"). If you disagree with any part of these terms, you may not access the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">2. Description of Service</h2>
              <p>
                SelfHub AI is a booking platform that connects customers with beauty and wellness service providers.
                We facilitate the booking process but are not a party to the actual service provided by businesses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Creation</h3>
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in
                fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">4. Booking Services</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Booking Process</h3>
              <p>
                When you book an appointment through our Platform, you enter into a contract directly with the
                business owner. SelfHub AI acts as a facilitator and is not responsible for the quality of services
                provided by businesses.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Cancellation and Refunds</h3>
              <p>
                Cancellation and refund policies are set by individual businesses. Please review the business's
                cancellation policy before booking. SelfHub AI is not responsible for refunds or disputes between
                customers and businesses.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.3 No-Shows</h3>
              <p>
                If you fail to show up for a scheduled appointment without canceling, the business may charge you
                according to their policy. SelfHub AI is not responsible for no-show fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">5. Business Owner Responsibilities</h2>
              <p>If you list your business on our Platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate business information</li>
                <li>Honor all confirmed bookings</li>
                <li>Maintain appropriate licenses and insurance</li>
                <li>Provide services as described</li>
                <li>Respond to customer inquiries in a timely manner</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">6. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post false, misleading, or defamatory content</li>
                <li>Interfere with the Platform's operation</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Use automated systems to access the Platform without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">7. Reviews and Content</h2>
              <p>
                You may submit reviews and other content. By submitting content, you grant us a non-exclusive,
                worldwide, royalty-free license to use, reproduce, and display your content on the Platform.
                You represent that your content is accurate and does not violate any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">8. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are owned by SelfHub AI and
                are protected by international copyright, trademark, patent, trade secret, and other intellectual
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SELFHUB AI SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
                LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless SelfHub AI from any claims, damages, losses, liabilities,
                and expenses (including legal fees) arising from your use of the Platform or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">11. Dispute Resolution</h2>
              <p>
                Any disputes arising from these Terms or your use of the Platform shall be resolved through binding
                arbitration in accordance with the rules of [Arbitration Organization], except where prohibited by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes
                by posting the updated Terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-6 mb-4">13. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@selfhubai.com<br />
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

export default Terms;

