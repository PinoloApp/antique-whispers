import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ = () => {
  const { language, t } = useLanguage();

  const faqItems = [
    {
      question: language === 'en' ? 'How do I register for an auction?' : 'Kako da se registrujem za aukciju?',
      answer: language === 'en' 
        ? 'To register for an auction, click the "Register" button in the header and fill out the registration form. Once your account is verified, you can start bidding on items.'
        : 'Da biste se registrovali za aukciju, kliknite na dugme "Registracija" u zaglavlju i popunite formular za registraciju. Nakon što vaš nalog bude verifikovan, možete početi da licititrate.'
    },
    {
      question: language === 'en' ? 'How does bidding work?' : 'Kako funkcioniše licitiranje?',
      answer: language === 'en'
        ? 'Place your bid on any item you are interested in. If you are outbid, you will receive a notification. The highest bid at the end of the auction wins the item.'
        : 'Postavite svoju ponudu na bilo koji predmet koji vas zanima. Ako neko nadmaši vašu ponudu, dobićete obaveštenje. Najviša ponuda na kraju aukcije osvaja predmet.'
    },
    {
      question: language === 'en' ? 'What payment methods do you accept?' : 'Koje načine plaćanja prihvatamo?',
      answer: language === 'en'
        ? 'We accept payment via PayPal as well as cash payment upon item pickup. Payment must be completed within 7 days of winning an auction. If payment is not made within the specified period, the auction house reserves the right to offer the item to the second-highest bidder.'
        : 'Prihvatamo plaćanje putem PayPal-a kao i gotovinsko plaćanje prilikom preuzimanja predmeta. Plaćanje mora biti izvršeno u roku od 7 dana od pobede na aukciji. U slučaju da se ne izvrši uplata u navedenom roku aukcijska kuća zadržava pravo da predmet ponudi drugoplasiranom ponuđaču.'
    },
    {
      question: language === 'en' ? 'How is shipping handled?' : 'Kako se vrši dostava?',
      answer: language === 'en'
        ? 'We offer worldwide shipping through trusted delivery companies. Shipping costs are calculated based on the item size, weight, and destination, and are charged separately. Insurance is included for all shipments.'
        : 'Nudimo dostavu širom sveta preko pouzdanih kompanija za dostavu. Troškovi dostave se izračunavaju na osnovu veličine, težine predmeta i destinacije i naplaćuju se posebno. Osiguranje je uključeno za sve pošiljke.'
    },
    {
      question: language === 'en' ? 'Can I view items before the auction?' : 'Mogu li da pregledam predmet pre aukcije?',
      answer: language === 'en'
        ? 'You can view the item right before the live auction or prior to the live auction at a time that you need to schedule through our contact page.'
        : 'Predmet možete pregledati neposredno pred live aukciju ili pre održavanja live aukcije u terminu koji treba da zakažete putem naše kontakt stranice.'
    },
    {
      question: language === 'en' ? 'What is the buyer\'s premium?' : 'Šta je premija kupca?',
      answer: language === 'en'
        ? 'A buyer\'s premium of 10% is added to the hammer price. This fee covers the costs of running the auction and is standard in the industry.'
        : 'Premija kupca od 10% se dodaje na cenu postignutu na aukciji. Ova naknada pokriva troškove održavanja aukcije i standardna je u industriji.'
    },
    {
      question: language === 'en' ? 'How do I know if an item is authentic?' : 'Kako znam da je predmet autentičan?',
      answer: language === 'en'
        ? 'All items are carefully examined by our experts. We provide detailed provenance information when available.'
        : 'Sve predmete pažljivo pregledaju naši stručnjaci. Pružamo detaljne informacije o poreklu kada su dostupne.'
    },
    {
      question: language === 'en' ? 'What is your return policy?' : 'Kakva je vaša politika vraćanja?',
      answer: language === 'en'
        ? 'Due to the unique nature of auction items, all sales are final. However, if an item significantly differs from its description and you did not pick it up in person, you can contact us within 48 hours of receipt.'
        : 'Zbog jedinstvene prirode predmeta na aukciji, sve prodaje su konačne. Međutim, ako se predmet značajno razlikuje od opisa, a isti niste preuzeli lično, možete da nas kontaktirate u roku od 48 sati od prijema.'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              {t('faq.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
