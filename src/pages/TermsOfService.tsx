import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  const { language } = useLanguage();

  const sections = [
    {
      title: language === "en" ? "1. General Provisions" : "1. Opšte odredbe",
      content: language === "en"
         ? "These Terms of Service govern the use of the SFINK auction platform. By accessing or using our services, you agree to be bound by these terms. SFINK reserves the right to modify these terms at any time."
         : "Ovi Uslovi korišćenja regulišu upotrebu SFINK aukcijske platforme. Pristupanjem ili korišćenjem naših usluga, saglasni ste sa ovim uslovima. SFINK zadržava pravo da izmeni ove uslove u bilo kom trenutku.",
    },
    {
      title: language === "en" ? "2. User Registration" : "2. Registracija korisnika",
      content: language === "en"
        ? "To participate in auctions, users must create an account with valid personal information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
        : "Da biste učestvovali na aukcijama, korisnici moraju kreirati nalog sa validnim ličnim podacima. Odgovorni ste za čuvanje poverljivosti vaših pristupnih podataka i za sve aktivnosti na vašem nalogu.",
    },
    {
      title: language === "en" ? "3. Bidding Rules" : "3. Pravila licitiranja",
      content: language === "en"
         ? "All bids placed are binding and irrevocable. The highest bid at the close of an auction wins the item. SFINK reserves the right to cancel bids that are suspected to be fraudulent or placed in error."
         : "Sve ponude su obavezujuće i neopozive. Najviša ponuda na kraju aukcije osvaja predmet. SFINK zadržava pravo da poništi ponude za koje se sumnja da su lažne ili pogrešno postavljene.",
    },
    {
      title: language === "en" ? "4. Payments" : "4. Plaćanja",
      content: language === "en"
        ? "Winning bidders must complete payment within 7 business days of auction close. Accepted payment methods include bank transfer and credit card. A buyer's premium may apply to the final bid price."
        : "Pobednici aukcije moraju izvršiti plaćanje u roku od 7 radnih dana od završetka aukcije. Prihvaćeni načini plaćanja uključuju bankarski transfer i kreditnu karticu. Na konačnu cenu ponude može se primeniti provizija kupca.",
    },
    {
      title: language === "en" ? "5. Shipping and Delivery" : "5. Dostava i isporuka",
      content: language === "en"
         ? "SFINK arranges shipping for purchased items. Shipping costs are the responsibility of the buyer unless otherwise stated. Items are insured during transit. Delivery times vary depending on location."
         : "SFINK organizuje dostavu kupljenih predmeta. Troškovi dostave su na teret kupca osim ako nije drugačije navedeno. Predmeti su osigurani tokom transporta. Rokovi isporuke variraju u zavisnosti od lokacije.",
    },
    {
      title: language === "en" ? "6. Returns and Disputes" : "6. Povraćaj i sporovi",
      content: language === "en"
         ? "Items may be returned within 14 days if they significantly differ from the auction description. Disputes should be reported to our customer support team. SFINK will mediate any disputes between buyers and sellers."
         : "Predmeti se mogu vratiti u roku od 14 dana ukoliko se značajno razlikuju od opisa na aukciji. Sporovi se prijavljuju našem timu za korisničku podršku. SFINK posreduje u svim sporovima između kupaca i prodavaca.",
    },
    {
      title: language === "en" ? "7. Limitation of Liability" : "7. Ograničenje odgovornosti",
      content: language === "en"
         ? "SFINK acts as an intermediary between buyers and sellers. While we verify the authenticity of items to the best of our ability, we cannot guarantee absolute accuracy. Our liability is limited to the auction commission fees."
         : "SFINK deluje kao posrednik između kupaca i prodavaca. Iako proveravamo autentičnost predmeta po najboljim mogućnostima, ne možemo garantovati apsolutnu tačnost. Naša odgovornost je ograničena na proviziju od aukcije.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              {language === "en" ? "Terms of Service" : "Uslovi korišćenja"}
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

export default TermsOfService;
