import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronRight, ChevronDown, ChevronLeft, PlayCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Auction {
  id: number;
  date: Date;
  startDate: Date;
  endDate: Date;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  status: "upcoming" | "active" | "completed" | "paused" | "cancelled";
}

interface AuctionCalendarProps {
  auctions: Auction[];
  selectedAuctionId: number | null;
  onSelectAuction: (auctionId: number | null) => void;
}

const ITEMS_PER_PAGE = 3;

const AuctionCalendar = ({ auctions, selectedAuctionId, onSelectAuction }: AuctionCalendarProps) => {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get auction dates for highlighting
  const auctionDates = auctions.map((a) => a.date);

  // Check if a date has an auction
  const hasAuction = (date: Date) => {
    return auctionDates.some((aDate) => isSameDay(aDate, date));
  };

  // Get auction for a specific date
  const getAuctionForDate = (date: Date) => {
    return auctions.find((a) => isSameDay(a.date, date));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      // When deselecting, auto-select first auction (same as clear)
      if (sortedAuctions.length > 0) {
        onSelectAuction(sortedAuctions[0].id);
      }
    }
  };

  const selectedAuction = selectedAuctionId ? auctions.find((a) => a.id === selectedAuctionId) : null;

  // Sort auctions: active/paused first, then upcoming (including future cancelled), then completed/cancelled
  const sortedAuctions = [...auctions].sort((a, b) => {
    const getOrder = (auction: Auction) => {
      if (auction.status === "active" || auction.status === "paused") return 0;
      if (auction.status === "upcoming") return 1;
      if (auction.status === "cancelled" && auction.date >= new Date()) return 1;
      if (auction.status === "completed") return 2;
      return 3;
    };
    return getOrder(a) - getOrder(b);
  });

  // Filter auctions by selected date
  const filteredAuctions = selectedDate
    ? sortedAuctions.filter((auction) => isSameDay(auction.date, selectedDate))
    : sortedAuctions;

  // Reset page when date changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedDate]);

  // Pagination
  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const paginatedAuctions = filteredAuctions.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <Collapsible
      open={isDesktop ? true : isOpen}
      onOpenChange={(open) => {
        if (isDesktop) return;
        setIsOpen(open);
        if (!open) {
          // Reset selected date when closing
          setSelectedDate(undefined);
        } else {
          // When opening, find the page where selected auction is located
          if (selectedAuctionId) {
            const auctionIndex = sortedAuctions.findIndex((a) => a.id === selectedAuctionId);
            if (auctionIndex !== -1) {
              setCurrentPage(Math.floor(auctionIndex / ITEMS_PER_PAGE));
            }
          } else {
            setCurrentPage(0);
          }
        }
      }}
      className="flex flex-col items-center"
    >
      <CollapsibleTrigger asChild>
        <div className="lg:hidden inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft mb-8 animate-fade-in border border-border cursor-pointer hover:bg-muted/50 transition-colors">
          <CalendarDays className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-foreground">
            {language === "en" ? "Auction Calendar" : "Kalendar Aukcija"}
          </span>
          <ChevronDown
            className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slide-down w-full">
        <div className="flex flex-col lg:flex-row gap-6 max-w-[90vw] xl:max-w-none mx-auto pt-4 pb-8 items-center lg:items-start justify-center lg:justify-end">
          {/* Calendar */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center flex-shrink-0 w-full min-w-[320px] max-w-[350px]">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="pointer-events-auto"
              modifiers={{
                auction: (date) => hasAuction(date),
                noAuction: (date) => !hasAuction(date),
                active: (date) => {
                  const auction = getAuctionForDate(date);
                  return auction?.status === "active" || auction?.status === "paused";
                },
                upcoming: (date) => {
                  const auction = getAuctionForDate(date);
                  const isUpcoming = auction?.status === "upcoming";
                  const isCancelledButFuture = auction?.status === "cancelled" && auction.date >= new Date();
                  return isUpcoming || isCancelledButFuture;
                },
                completed: (date) => {
                  const auction = getAuctionForDate(date);
                  return auction?.status === "completed";
                },
              }}
              modifiersClassNames={{
                auction: "font-bold",
                noAuction: "hover:bg-muted hover:text-muted-foreground",
                active: "bg-green-500/20 text-green-600 hover:bg-green-500/30",
                upcoming: "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30",
                completed: "bg-muted text-muted-foreground hover:bg-muted/80",
              }}
              classNames={{
                day_today: "border-2 border-muted bg-transparent text-foreground hover:bg-muted",
              }}
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
                <span className="text-muted-foreground">{language === "en" ? "Live" : "Uživo"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/40" />
                <span className="text-muted-foreground">{language === "en" ? "Upcoming" : "Predstojeće"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted border border-muted-foreground/30" />
                <span className="text-muted-foreground">{language === "en" ? "Past" : "Prošle"}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-10 text-xs text-muted-foreground/70 text-center italic w-[90%] mx-auto">
              {language === "en"
                ? "* The calendar information is preliminary and subject to change by the organizer."
                : "* Informacije iz kalendara su preliminarne i mogu biti izmenjene od strane organizatora."}
            </p>
          </div>

          {/* Auction List & Details */}
          <div className="w-full lg:flex-1 lg:max-w-[60vw] flex flex-col overflow-hidden">
            {/* Selected date indicator */}
            {selectedDate && (
              <div className="flex items-center justify-between mb-4 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                <span className="text-xs text-muted-foreground">
                  {language === "en" ? "Showing auctions for:" : "Prikazane aukcije za:"}{" "}
                  <span className="font-medium text-foreground/80">
                    {format(selectedDate, language === "en" ? "MMMM d, yyyy" : "d. MMMM yyyy.")}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(undefined);
                    // Select first auction when clearing
                    if (sortedAuctions.length > 0) {
                      onSelectAuction(sortedAuctions[0].id);
                    }
                  }}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Clear" : "Poništi"}
                </Button>
              </div>
            )}

            {/* Auction Cards Container */}
            <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4 snap-x items-start">
              {auctions.length === 0 ? (
                <div className="text-left py-8 text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed bg-muted/20 p-6 rounded-lg border border-border/50 max-w-2xl">
                  <p>
                    {language === "en"
                      ? "Auctions are held twice a year. Internet auctions last from April 1st to the last week of June and from October 1st to the last week of December."
                      : "Aukcije se održavaju dva puta godišnje. Internet aukcije traju od 01.04. do poslednje nedelje juna i od 01.10. do poslednje nedelje u decembru."}
                  </p>
                  <p>
                    {language === "en"
                      ? "Auctions close after the live auction held in Belgrade at the Nobel Hotel in Višegradska Street."
                      : "Aukcije se zatvaraju nakon sprovedene aukcije koja se održava u Beogradu u hotelu Nobel u Višegradskoj ulici."}
                  </p>
                  <p>
                    {language === "en"
                      ? "Details about the live auction schedule will be published in a timely manner in the user notifications section."
                      : "Detalji o terminu live aukcija će blagovremeno biti objavljeni u sekciji obaveštenja za korisnike."}
                  </p>
                </div>
              ) : paginatedAuctions.length === 0 ? (
                <div className="w-full lg:w-[320px] flex-shrink-0 snap-center min-h-[120px] p-4 flex items-center justify-center text-center text-muted-foreground opacity-70 bg-transparent border-transparent">
                  {language === "en" ? "No auctions on this date" : "Nema aukcija na ovaj datum"}
                </div>
              ) : (
                paginatedAuctions.map((auction) => (
                  <button
                    key={auction.id}
                    onClick={() => {
                      onSelectAuction(auction.id);
                      setIsOpen(false);
                      const heroSection = document.getElementById("hero-section");
                      if (heroSection) {
                        heroSection.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={cn(
                      "w-full lg:w-[320px] flex-shrink-0 snap-center min-h-[120px] p-4 rounded-lg border transition-all duration-300 text-left",
                      selectedAuctionId === auction.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                              auction.status === "active" || auction.status === "paused"
                                ? selectedAuctionId === auction.id
                                  ? "bg-primary-foreground/20"
                                  : "bg-green-500/10 text-green-600"
                                : auction.status === "upcoming" ||
                                  (auction.status === "cancelled" && auction.date >= new Date())
                                  ? selectedAuctionId === auction.id
                                    ? "bg-primary-foreground/20"
                                    : "bg-yellow-500/10 text-yellow-600"
                                  : selectedAuctionId === auction.id
                                    ? "bg-primary-foreground/20"
                                    : "bg-muted text-muted-foreground",
                            )}
                          >
                            {auction.status === "active" || auction.status === "paused" ? (
                              <PlayCircle className="w-3 h-3" />
                            ) : auction.status === "upcoming" ||
                              (auction.status === "cancelled" && auction.date >= new Date()) ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {auction.status === "active" || auction.status === "paused"
                              ? language === "en"
                                ? "Live"
                                : "Uživo"
                              : auction.status === "upcoming" ||
                                (auction.status === "cancelled" && auction.date >= new Date())
                                ? language === "en"
                                  ? "Upcoming"
                                  : "Predstojeća"
                                : language === "en"
                                  ? "Completed"
                                  : "Završena"}
                          </span>
                        </div>
                        <h4 className="font-serif font-semibold mb-1 line-clamp-1">{auction.title[language as "en" | "sr"]}</h4>
                        <p
                          className={cn(
                            "text-sm mb-2 line-clamp-2",
                            selectedAuctionId === auction.id ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {auction.description[language as "en" | "sr"]}
                        </p>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            selectedAuctionId === auction.id ? "text-primary-foreground/90" : "text-foreground",
                          )}
                        >
                          {format(auction.date, language === "en" ? "MMMM d, yyyy" : "d. MMMM yyyy.")}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 transition-transform flex-shrink-0",
                          selectedAuctionId === auction.id ? "translate-x-1" : "",
                        )}
                      />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AuctionCalendar;
