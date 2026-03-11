import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logoAukcije from "@/assets/logoAukcije.svg";
import { useAuth } from "@/contexts/authContexts";

const Footer = () => {
  const { t, language } = useLanguage();
  const { userLoggedIn, isAdmin } = useAuth();

  const quickLinks = [
    { key: "nav.home", href: "/" },
    { key: "footer.faq", href: "/faq" },
    { key: "footer.contact", href: "/contact" },
  ];

  if (userLoggedIn && !isAdmin) {
    quickLinks.push({ key: "nav.notifications", href: "/notifications" });
  }

  const legalLinks = [
    { key: "footer.terms", href: "/terms" },
    { key: "footer.privacy", href: "/privacy" },
  ];

  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoAukcije} alt="SFINK logo" className="w-10 h-10" />
              <span className="font-serif text-2xl font-semibold text-burgundy">SFINK</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {language === "en"
                ? "Discover exceptional antiques from around the world. Expert curation, transparent bidding, and secure transactions."
                : "Otkrijte izuzetne antikvitete iz celog sveta. Stručna selekcija, transparentno licitiranje i sigurne transakcije."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-burgundy">
              {language === "en" ? "Quick Links" : "Brzi Linkovi"}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-burgundy transition-colors text-sm"
                    >
                      {t(link.key)}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-muted-foreground hover:text-burgundy transition-colors text-sm">
                      {t(link.key)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-burgundy">
              {language === "en" ? "Legal" : "Pravne Informacije"}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-burgundy transition-colors text-sm"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-burgundy">
              {language === "en" ? "Contact" : "Kontakt"}
            </h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>info@sfink.com</li>
              <li>+381 11 123 4567</li>
              <li>{language === "en" ? "Belgrade, Serbia" : "Beograd, Srbija"}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-burgundy/20 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-sm">© 2026 SFINK. {t("footer.rights")}.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-burgundy transition-colors text-sm">
              Facebook
            </a>
            <a href="#" className="text-muted-foreground hover:text-burgundy transition-colors text-sm">
              Instagram
            </a>
            <a href="#" className="text-muted-foreground hover:text-burgundy transition-colors text-sm">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
