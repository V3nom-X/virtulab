import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Play, 
  Mail, 
  Github, 
  ExternalLink,
  Search,
  BookOpen,
  MessageCircle
} from "lucide-react";

const faqs = [
  {
    question: "How do I start an experiment?",
    answer: "Navigate to the Library page, browse or search for an experiment, and click on it to open it in the Workspace. From there, you can adjust variables using the control panel and run the simulation."
  },
  {
    question: "Can I create my own experiments?",
    answer: "Yes! Use the Custom Builder to create your own simulations. Drag and drop components from the palette, configure their properties, and save your creation to share with the community."
  },
  {
    question: "Is VirtuLab free to use?",
    answer: "Absolutely! VirtuLab is completely free with no ads or in-app purchases. Our mission is to make science education accessible to everyone."
  },
  {
    question: "Can I use VirtuLab offline?",
    answer: "Yes, VirtuLab supports offline mode. Download experiments you want to access without internet, and your progress will sync automatically when you reconnect."
  },
  {
    question: "How does the collaboration feature work?",
    answer: "You can invite others to join a collaboration session where you can work on experiments together in real-time. All participants see synchronized views and can communicate via integrated chat."
  },
  {
    question: "Are the simulations scientifically accurate?",
    answer: "All simulations are developed with scientific accuracy in mind and reviewed by educators. However, some simplifications may be made for educational purposes."
  },
];

const Help = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Help & About</h1>
            <p className="text-muted-foreground">
              Get help and learn more about VirtuLab
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Search */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQ */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="w-5 h-5" />
                  <h2 className="font-semibold text-xl">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-5 h-5" />
                  <h2 className="font-semibold">Contact Us</h2>
                </div>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={4} className="mt-1.5" />
                  </div>
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* About */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5" />
                  <h2 className="font-semibold">About VirtuLab</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  VirtuLab is a free, interactive science education platform 
                  designed to make learning engaging and accessible for everyone.
                </p>
                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Developer:</strong> Benjamin Menya</p>
                  <p><strong>Manager:</strong> NEX VENTURES</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="https://instagram.com/b._.noir" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Instagram
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Help;
