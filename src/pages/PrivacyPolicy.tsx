import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  const sections = [
    {
      title: language === "en" ? "1. Data Collection" : "1. Prikupljanje podataka",
      content: language === "en"
        ? "We collect personal information that you voluntarily provide when registering, placing bids, or contacting us. This includes your name, email address, phone number, shipping address, and payment information."
        : "Prikupljamo lične podatke koje dobrovoljno pružate prilikom registracije, licitiranja ili kontaktiranja. To uključuje vaše ime, email adresu, broj telefona, adresu za dostavu i podatke o plaćanju.",
    },
    {
      title: language === "en" ? "2. Use of Information" : "2. Upotreba informacija",
      content: language === "en"
        ? "Your personal data is used to process auction transactions, deliver purchased items, communicate about your account, and improve our services. We may also use your data to send newsletters if you have opted in."
        : "Vaši lični podaci se koriste za obradu aukcijskih transakcija, dostavu kupljenih predmeta, komunikaciju o vašem nalogu i poboljšanje naših usluga. Takođe možemo koristiti vaše podatke za slanje biltena ukoliko ste se prijavili.",
    },
    {
      title: language === "en" ? "3. Data Protection" : "3. Zaštita podataka",
      content: language === "en"
        ? "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. All payment data is encrypted using industry-standard SSL technology."
        : "Primenjujemo odgovarajuće bezbednosne mere za zaštitu vaših ličnih podataka od neovlašćenog pristupa, izmene ili otkrivanja. Svi podaci o plaćanju su šifrovani korišćenjem SSL tehnologije prema industrijskim standardima.",
    },
    {
      title: language === "en" ? "4. Cookies" : "4. Kolačići",
      content: language === "en"
        ? "Our website uses cookies to enhance your browsing experience. Cookies help us remember your preferences, analyze site traffic, and provide personalized content. You can manage cookie settings through your browser."
        : "Naš sajt koristi kolačiće radi poboljšanja vašeg iskustva pregledanja. Kolačići nam pomažu da zapamtimo vaše postavke, analiziramo posećenost sajta i pružimo personalizovan sadržaj. Postavke kolačića možete upravljati kroz vaš pregledač.",
    },
    {
      title: language === "en" ? "5. Third-Party Sharing" : "5. Deljenje sa trećim stranama",
      content: language === "en"
        ? "We do not sell or rent your personal information to third parties. Data may be shared with trusted service providers (payment processors, shipping companies) solely for the purpose of completing transactions."
        : "Ne prodajemo niti izdajemo vaše lične podatke trećim stranama. Podaci se mogu deliti sa pouzdanim pružaocima usluga (procesori plaćanja, dostavne službe) isključivo u svrhu izvršenja transakcija.",
    },
    {
      title: language === "en" ? "6. Your Rights" : "6. Vaša prava",
      content: language === "en"
        ? "You have the right to access, correct, or delete your personal data at any time. You may also request a copy of the data we hold about you. To exercise these rights, please contact our support team."
        : "Imate pravo da pristupite, ispravite ili obrišete vaše lične podatke u bilo kom trenutku. Takođe možete zatražiti kopiju podataka koje čuvamo o vama. Za ostvarivanje ovih prava, kontaktirajte naš tim za podršku.",
    },
    {
      title: language === "en" ? "7. Data Retention" : "7. Čuvanje podataka",
      content: language === "en"
        ? "We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, data may be retained for a limited period to comply with legal obligations."
        : "Čuvamo vaše lične podatke dok je vaš nalog aktivan ili koliko je potrebno za pružanje usluga. Nakon brisanja naloga, podaci se mogu čuvati u ograničenom periodu radi ispunjavanja zakonskih obaveza.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              {language === "en" ? "Privacy Policy" : "Politika privatnosti"}
            </h1>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index}>
                <h2 className="font-serif text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
