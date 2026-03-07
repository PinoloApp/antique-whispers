import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { getFieldError, nameRules, emailRules, messageRules } from "@/lib/validation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const nameError = touched.name ? getFieldError(formData.name, nameRules, language) : null;
  const emailError = touched.email ? getFieldError(formData.email, emailRules, language) : null;
  const messageError = touched.message ? getFieldError(formData.message, messageRules, language) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    const nErr = getFieldError(formData.name, nameRules, language);
    const eErr = getFieldError(formData.email, emailRules, language);
    const mErr = getFieldError(formData.message, messageRules, language);
    if (nErr || eErr || mErr) return;

    toast({
      title: language === "en" ? "Message sent!" : "Poruka poslata!",
      description:
        language === "en"
          ? "We will get back to you as soon as possible."
          : "Odgovorićemo vam u najkraćem mogućem roku.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTouched({});
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: language === "en" ? "Address" : "Adresa",
      value: language === "en" ? "Knez Mihailova 12, Belgrade, Serbia" : "Knez Mihailova 12, Beograd, Srbija",
    },
    { icon: Phone, label: language === "en" ? "Phone" : "Telefon", value: "+381 11 123 4567" },
    { icon: Mail, label: "Email", value: "info@sfink.com" },
    {
      icon: Clock,
      label: language === "en" ? "Working Hours" : "Radno vreme",
      value: language === "en" ? "Mon - Fri: 9:00 - 18:00" : "Pon - Pet: 9:00 - 18:00",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            {language === "en" ? "Contact Us" : "Kontaktirajte Nas"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "en"
              ? "Have a question about our auctions or a specific lot? We'd love to hear from you."
              : "Imate pitanje o našim aukcijama ili određenom lotu? Rado ćemo vam pomoći."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
                {language === "en" ? "Send us a message" : "Pošaljite nam poruku"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">{language === "en" ? "Full Name" : "Ime i prezime"}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    onBlur={() => markTouched("name")}
                    placeholder={language === "en" ? "Your name" : "Vaše ime"}
                    required
                    maxLength={100}
                  />
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    onBlur={() => markTouched("email")}
                    placeholder={language === "en" ? "Your email" : "Vaš email"}
                    required
                    maxLength={255}
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{language === "en" ? "Subject" : "Naslov"}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder={language === "en" ? "Message subject" : "Naslov poruke"}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{language === "en" ? "Message" : "Poruka"}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    onBlur={() => markTouched("message")}
                    placeholder={language === "en" ? "Write your message here..." : "Napišite vašu poruku ovde..."}
                    required
                    maxLength={1000}
                    rows={5}
                  />
                  {messageError && <p className="text-xs text-destructive">{messageError}</p>}
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  {language === "en" ? "Send Message" : "Pošalji poruku"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-muted-foreground text-sm">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
