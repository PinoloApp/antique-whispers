import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/authContexts";
import AuctionCountdown from "./AuctionCountdown";
import AuctionCalendar from "./AuctionCalendar";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, CheckCircle, Pause, XCircle, Loader2 } from "lucide-react";
import AuthDialog from "./AuthDialog";

interface Auction {
  id: number;
  date: Date | string;
  startDate: Date;
  endDate: Date;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  status: "upcoming" | "active" | "completed" | "paused" | "cancelled";
  lotIds: number[];
}

interface HeroSectionProps {
  nextAuctionDate: Date | null;
  auctions: Auction[];
  loading: boolean;
  selectedAuctionId: number | null;
  onSelectAuction: (auctionId: number | null) => void;
}

const statusConfig = {
  upcoming: {
    icon: Clock,
    badgeClass: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    accentClass: "text-yellow-600",
    gradientClass: "from-yellow-500/5 to-primary/5",
    showCountdown: true,
    ctaEnabled: true,
  },
  active: {
    icon: Play,
    badgeClass: "bg-green-500/20 text-green-600 border-green-500/30",
    accentClass: "text-green-600",
    gradientClass: "from-green-500/5 to-primary/5",
    showCountdown: true,
    ctaEnabled: true,
  },
  completed: {
    icon: CheckCircle,
    badgeClass: "bg-muted text-muted-foreground border-border",
    accentClass: "text-muted-foreground",
    gradientClass: "from-muted/20 to-background",
    showCountdown: false,
    ctaEnabled: true,
  },
  paused: {
    icon: Pause,
    badgeClass: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    accentClass: "text-yellow-600",
    gradientClass: "from-yellow-500/5 to-primary/5",
    showCountdown: false,
    ctaEnabled: false,
  },
  cancelled: {
    icon: XCircle,
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    accentClass: "text-red-400",
    gradientClass: "from-red-500/5 to-background",
    showCountdown: false,
    ctaEnabled: false,
  },
};

const statusLabels = {
  upcoming: { en: "Upcoming", sr: "Predstojeća" },
  active: { en: "Live Now", sr: "Uživo" },
  completed: { en: "Completed", sr: "Završena" },
  paused: { en: "Paused", sr: "Pauzirana" },
  cancelled: { en: "Cancelled", sr: "Otkazana" },
};

const HeroSection = ({ nextAuctionDate, auctions, selectedAuctionId, onSelectAuction, loading }: HeroSectionProps) => {
  const { t, language } = useLanguage();
  const { userLoggedIn } = useAuth();

  const hasAuctions = auctions.length > 0;
  const selectedAuction = selectedAuctionId ? auctions.find((a) => a.id === selectedAuctionId) : null;

  const currentStatus = selectedAuction?.status || "upcoming";
  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  const startDate = selectedAuction ? new Date(selectedAuction.startDate) : nextAuctionDate;
  const endDate = selectedAuction ? new Date(selectedAuction.endDate) : null;

  // Show end date for active/completed, start date for upcoming/paused/cancelled
  const displayDate = (currentStatus === "active" || currentStatus === "completed") && endDate
    ? endDate
    : startDate;

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const locale = language === "en" ? "en-US" : "sr-RS";

  const formattedDate = displayDate
    ? displayDate.toLocaleDateString(locale, dateFormatOptions)
    : null;

  const heroTitle = selectedAuction ? selectedAuction.title[language as "en" | "sr"] : t("hero.title");

  const heroSubtitle = selectedAuction ? selectedAuction.description[language as "en" | "sr"] : t("hero.subtitle");

  // For active auctions, countdown to end; for upcoming, countdown to start
  const countdownTarget = currentStatus === "active" && endDate ? endDate : startDate || new Date();

  // Empty state when no auctions exist
  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  } else if (!hasAuctions) {
    return (
      <section id="hero-section" className="relative scroll-mt-20 min-h-[85vh] flex justify-center bg-gradient-to-b from-primary/5 to-background overflow-hidden pt-6 sm:pt-10 lg:pt-20">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-border/30 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border/20 rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col justify-start lg:justify-center min-h-[60vh]">
          <div className="max-w-7xl mx-auto w-full flex flex-col-reverse lg:flex-row lg:justify-between lg:items-center gap-12 text-center lg:text-left">
            {/* Left Column */}
            <div className="flex-1 max-w-2xl mx-auto lg:mx-0 flex flex-col items-center lg:items-start">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8 animate-fade-in">
                <Clock className="w-10 h-10 text-secondary" />
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {language === "en" ? "Auctions Coming Soon" : "Aukcije Uskoro"}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {language === "en"
                  ? "We're preparing our next collection of exceptional pieces. Stay tuned for upcoming auctions featuring rare antiques and fine art."
                  : "Pripremamo našu sledeću kolekciju izuzetnih predmeta. Pratite nas za predstojeće aukcije sa retkim antikvitetima i umetničkim delima."}
              </p>

              {/* Decorative divider */}
              <div className="w-24 h-1 bg-gradient-gold rounded-full mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }} />

              {/* Info cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 w-full max-w-2xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 text-center min-w-0">
                  <div className="font-serif text-lg sm:text-xl font-bold text-foreground mb-1 truncate">
                    {language === "en" ? "Transparent" : "Transparentno"}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {language === "en" ? "Open bidding process" : "Otvoren proces licitiranja"}
                  </p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 text-center min-w-0">
                  <div className="font-serif text-lg sm:text-xl font-bold text-foreground mb-1 truncate">
                    {language === "en" ? "Verified" : "Verifikovano"}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {language === "en" ? "Authenticated pieces" : "Autentifikovani predmeti"}
                  </p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 text-center min-w-0">
                  <div className="font-serif text-lg sm:text-xl font-bold text-foreground mb-1 truncate">
                    {language === "en" ? "Secure" : "Sigurno"}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {language === "en" ? "Safe bidding" : "Bezbedno licitiranje"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-auto xl:max-w-none flex-shrink-0 mx-auto lg:mx-0 flex justify-center lg:justify-end animate-fade-in relative z-20">
              <AuctionCalendar
                auctions={[]}
                selectedAuctionId={null}
                onSelectAuction={onSelectAuction}
              />
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }

  return (
    <section
      id="hero-section"
      className={`relative scroll-mt-20 min-h-[85vh] flex justify-center bg-gradient-to-b ${config.gradientClass} overflow-hidden pt-10 sm:pt-10 lg:pt-20 transition-all duration-500`}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-border/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border/20 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-start lg:justify-center min-h-[60vh]">
        <div className="max-w-7xl mx-auto w-full flex flex-col-reverse lg:flex-row lg:justify-between lg:items-center gap-12 text-center lg:text-left">
          {/* Left Column */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0 flex flex-col items-center lg:items-start">
            {/* Status Badge */}
            {selectedAuction && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
                <Badge
                  variant="outline"
                  className={`${config.badgeClass} px-4 py-2 text-sm font-medium gap-2 transition-all duration-300`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {statusLabels[currentStatus][language as "en" | "sr"]}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1
              className={`font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in transition-all duration-300 ${currentStatus === "completed" || currentStatus === "cancelled"
                ? "text-muted-foreground"
                : "text-foreground"
                }`}
              style={{ animationDelay: "0.1s" }}
            >
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in transition-all duration-300"
              style={{ animationDelay: "0.2s" }}
            >
              {heroSubtitle}
            </p>

            {/* Date Display */}
            {formattedDate && (
              <p
                className={`font-serif text-lg mb-8 animate-fade-in transition-all duration-300 ${config.accentClass}`}
                style={{ animationDelay: "0.3s" }}
              >
                {currentStatus === "upcoming"
                  ? (language === "en" ? "Starts: " : "Počinje: ") + formattedDate
                  : currentStatus === "active"
                    ? (language === "en" ? "Ends: " : "Završava: ") + formattedDate
                    : currentStatus === "completed"
                      ? (language === "en" ? "Ended: " : "Završena: ") + formattedDate
                      : currentStatus === "paused"
                        ? (language === "en" ? "Started: " : "Počela: ") + formattedDate
                        : (language === "en" ? "Was scheduled: " : "Bila zakazana: ") + formattedDate}
              </p>
            )}

            {/* Countdown or Status Message */}
            <div className="flex justify-center lg:justify-start mb-10 animate-fade-in w-full" style={{ animationDelay: "0.4s" }}>
              {config.showCountdown ? (
                <div className="text-center lg:text-left">
                  {currentStatus === "active" && (
                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                      {language === "en" ? "Time remaining" : "Preostalo vreme"}
                    </p>
                  )}
                  <AuctionCountdown targetDate={countdownTarget} />
                </div>
              ) : (
                <div
                  className={`px-6 py-4 rounded-lg border inline-block ${currentStatus === "completed"
                    ? "border-border bg-muted/50"
                    : currentStatus === "paused"
                      ? "border-yellow-500/30 bg-yellow-500/10"
                      : "border-red-500/30 bg-red-500/10"
                    }`}
                >
                  <p className={`text-lg font-medium ${config.accentClass}`}>
                    {currentStatus === "completed" &&
                      (language === "en" ? "This auction has ended" : "Ova aukcija je završena")}
                    {currentStatus === "paused" &&
                      (language === "en" ? "This auction is temporarily paused" : "Ova aukcija je privremeno pauzirana")}
                    {currentStatus === "cancelled" &&
                      (language === "en" ? "This auction has been cancelled" : "Ova aukcija je otkazana")}
                  </p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in w-full"
              style={{ animationDelay: "0.5s" }}
            >
              <Button
                size="lg"
                className={`font-medium px-8 py-6 text-base transition-all duration-300 ${config.ctaEnabled
                  ? "bg-primary hover:bg-burgundy-dark text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  }`}
                disabled={!config.ctaEnabled}
                onClick={() => {
                  const el = document.getElementById('featured-lots');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {currentStatus === "active" ? (language === "en" ? "Bid Now" : "Licitiraj") : t("hero.viewCatalog")}
              </Button>
              {!userLoggedIn && (
                <AuthDialog
                  defaultTab="register"
                  variant="outline"
                  size="lg"
                  className={`font-medium px-8 py-6 text-base transition-all duration-300 ${config.ctaEnabled
                    ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    : "border-muted text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  triggerLabel={t("hero.register")}
                />
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-auto xl:max-w-none flex-shrink-0 mx-auto lg:mx-0 flex justify-center lg:justify-end animate-fade-in relative z-20">
            <AuctionCalendar
              auctions={auctions.map((a) => ({ ...a, date: new Date(a.date) }))}
              selectedAuctionId={selectedAuctionId}
              onSelectAuction={onSelectAuction}
            />
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
