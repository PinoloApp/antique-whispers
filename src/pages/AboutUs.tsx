import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Award, Clock, Shield, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: Clock,
      title: language === "en" ? "Years of Experience" : "Godina iskustva",
      description:
        language === "en"
          ? "Over two decades of expertise in fine art and antique auctions."
          : "Više od dve decenije stručnosti u aukcijama umetnosti i antikviteta.",
      value: "20+",
    },
    {
      icon: Users,
      title: language === "en" ? "Satisfied Clients" : "Zadovoljnih klijenata",
      description:
        language === "en"
          ? "Trusted by collectors and enthusiasts worldwide."
          : "Podrška kolekcionara i entuzijasta širom sveta.",
      value: "5000+",
    },
    {
      icon: Award,
      title: language === "en" ? "Successful Auctions" : "Uspešnih aukcija",
      description:
        language === "en"
          ? "Hundreds of auctions with exceptional results."
          : "Stotine aukcija sa izvanrednim rezultatima.",
      value: "500+",
    },
    {
      icon: Shield,
      title: language === "en" ? "Authenticity Guaranteed" : "Garantovana autentičnost",
      description:
        language === "en"
          ? "Every item verified by expert appraisers."
          : "Svaki predmet proveravan od strane stručnih procenitelja.",
      value: "100%",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              {language === "en" ? "About SFINK" : "O nama - SFINK"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                 ? "SFINK is a premier auction house specializing in fine art, antiques, and collectibles. Founded with a passion for preserving history, we connect discerning collectors with extraordinary pieces from around the world."
                 : "SFINK je vodeća aukcijska kuća specijalizovana za umetnost, antikvitete i kolekcionarstvo. Osnovana sa strašću za očuvanje istorije, povezujemo zahtevne kolekcionare sa izvanrednim delima iz celog sveta."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{feature.value}</div>
                  <h3 className="font-serif text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission & Values */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  {language === "en" ? "Our Mission" : "Naša misija"}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {language === "en"
                     ? "At SFINK, we believe that every antique tells a story. Our mission is to preserve these stories by connecting exceptional pieces with passionate collectors who will cherish them for generations to come."
                     : "U SFINK-u verujemo da svaki antikvitet priča priču. Naša misija je da sačuvamo te priče povezujući izuzetna dela sa strastvenim kolekcionarima koji će ih čuvati generacijama."}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {language === "en"
                    ? "We are committed to transparency, authenticity, and excellence in every auction we conduct. Our team of experts carefully curates each collection to ensure the highest standards of quality and provenance."
                    : "Posvećeni smo transparentnosti, autentičnosti i izvrsnosti u svakoj aukciji koju sprovodimo. Naš tim stručnjaka pažljivo bira svaku kolekciju kako bi osigurao najviše standarde kvaliteta i porekla."}
                </p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                    {language === "en" ? "Our Values" : "Naše vrednosti"}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { en: "Integrity in every transaction", sr: "Integritet u svakoj transakciji" },
                      { en: "Respect for history and heritage", sr: "Poštovanje istorije i nasleđa" },
                      { en: "Commitment to client satisfaction", sr: "Posvećenost zadovoljstvu klijenata" },
                      { en: "Expertise and professionalism", sr: "Stručnost i profesionalizam" },
                    ].map((value, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-foreground text-sm">{language === "en" ? value.en : value.sr}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-yellow-500/30 rounded-xl py-12 px-6">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              {language === "en" ? "Ready to Start Collecting?" : "Spremni da počnete da sakupljate?"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {language === "en"
                ? "Join our community of collectors and discover extraordinary pieces at our upcoming auctions."
                : "Pridružite se našoj zajednici kolekcionara i otkrijte izvanredna dela na našim predstojećim aukcijama."}
            </p>
            <Link to="/">
              <Button size="lg">{language === "en" ? "View Auctions" : "Pogledajte aukcije"}</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
