import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, Eye, Hash, Bookmark, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData, Product, LotState } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import HighlightText from "@/components/HighlightText";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "./AuthDialog";
import { useAuth } from "@/contexts/authContexts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  searchQuery?: string;
  auctionId?: number | null;
}

const lotStateLabels: Record<LotState, { en: string; sr: string }> = {
  new: { en: "New", sr: "Novo" },
  used: { en: "Used", sr: "Korišćeno" },
  refurbished: { en: "Refurbished", sr: "Obnovljeno" },
  antique: { en: "Antique", sr: "Antikvitet" },
  restored: { en: "Restored", sr: "Restaurirano" },
};

const ProductCard = ({ product, searchQuery = "", auctionId: contextAuctionId }: ProductCardProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { auctions } = useData();
  const { userLoggedIn } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = language === "en" ? product.name : product.namesr;
  // Use product.id (unique numeric ID) for favorites, not lot number
  const favorited = isFavorite(Number(product.id));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmFavorite = () => {
    const willBeFavorite = !favorited;
    // Use product.id (unique numeric ID) for favorites, not lot number
    toggleFavorite(Number(product.id));

    toast({
      title: willBeFavorite
        ? language === "en"
          ? "Added to favorites"
          : "Dodato u omiljene"
        : language === "en"
          ? "Removed from favorites"
          : "Uklonjeno iz omiljenih",
      description: displayName,
    });
    setShowConfirm(false);
  };

  const effectiveAuctionId = contextAuctionId || product.auctionId;

  const handleCardClick = () => {
    sessionStorage.setItem('indexScrollPos', window.scrollY.toString());
    navigate(`/lot/${product.id}${effectiveAuctionId ? `?auctionId=${effectiveAuctionId}` : ''}`);
  };

  const soldPriceFromResults = useMemo(() => {
    if (!effectiveAuctionId) return null;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    if (auction?.status === 'completed' && auction.results && auction.results[product.id.toString()]) {
      return auction.results[product.id.toString()];
    }
    return null;
  }, [effectiveAuctionId, auctions, product.id]);

  const historicalStartingPrice = useMemo(() => {
    if (!effectiveAuctionId) return product.startingPrice;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    if (auction?.initialPrices && auction.initialPrices[product.id.toString()] !== undefined) {
      return auction.initialPrices[product.id.toString()];
    }
    return product.startingPrice;
  }, [effectiveAuctionId, auctions, product.id, product.startingPrice]);

  const startingPrice = historicalStartingPrice ?? product.currentBid;
  const isAuctionCompleted = useMemo(() => {
    if (!effectiveAuctionId) return false;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    return auction?.status === 'completed';
  }, [effectiveAuctionId, auctions]);

  const finalSoldPrice = soldPriceFromResults !== null ? soldPriceFromResults : product.currentBid;

  return (
    <div className="relative h-full">
      <div
        className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 border border-border cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={displayName}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
              }`}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 right-12 flex flex-wrap gap-1.5 z-10">
            <Badge variant="outline" className="text-xs gap-1 bg-background/80 backdrop-blur-sm">
              <Hash className="w-3 h-3" />
              {t("products.lot")} <HighlightText text={product.lot} highlight={searchQuery} />
            </Badge>
            {product.catalogMark && (
              <Badge variant="outline" className="text-xs gap-1 bg-background/80 backdrop-blur-sm">
                <Bookmark className="w-3 h-3" />
                <HighlightText text={product.catalogMark} highlight={searchQuery} />
              </Badge>
            )}
            {product.lotState && (
              <Badge variant="outline" className="text-xs gap-1 bg-background/80 backdrop-blur-sm">
                <CircleDot className="w-3 h-3" />
                {lotStateLabels[product.lotState][language]}
              </Badge>
            )}
          </div>
          {userLoggedIn && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-20 ${favorited
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
                }`}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
            </button>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-5 pt-3 flex-1 flex flex-col">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2">
            <HighlightText text={displayName} highlight={searchQuery} />
          </h3>

          {product.subtitle && (
            <p className="text-sm text-muted-foreground italic mb-3 line-clamp-1">{product.subtitle[language]}</p>
          )}

          <div className="mb-3 flex flex-col gap-1 mt-5">
            {soldPriceFromResults !== null || product.status === 'sold' ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{t("products.startingBid")}</p>
                  <p className="text-sm font-medium text-foreground mb-2">€{(historicalStartingPrice || 0).toLocaleString()}</p>
                </div>
                <div className="pt-2 border-t border-destructive/20">
                  <p className="text-xs text-destructive uppercase tracking-wider mb-1">{t("products.soldFor")}</p>
                  <p className="text-xl font-serif font-bold text-destructive">€{(finalSoldPrice || 0).toLocaleString()}</p>
                </div>
              </>
            ) : (
              <>
                {isAuctionCompleted ? (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("products.startingBid")}</p>
                    <p className="text-xl font-serif font-bold text-foreground">€{(historicalStartingPrice || 0).toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("products.currentBid")}</p>
                    <p className="text-xl font-serif font-bold text-gold">€{Math.max(product.currentBid || 0, historicalStartingPrice || 0).toLocaleString()}</p>
                  </>
                )}
              </>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full mt-2 bg-background text-black border-black hover:bg-background hover:text-black transition-all duration-300 group"
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('indexScrollPos', window.scrollY.toString());
              navigate(`/lot/${product.id}${effectiveAuctionId ? `?auctionId=${effectiveAuctionId}` : ''}`);
            }}
          >
            <Eye className="w-4 h-4" />
            {language === "en" ? "View Lot" : "Pogledajte lot"}
          </Button>
        </div>

      </div>

      {!userLoggedIn && (
        <AuthDialog
          defaultTab="login"
          className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-20 bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
        >
          <button
            className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-20 bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
            aria-label="Add to favorites"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-4 h-4" />
          </button>
        </AuthDialog>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "en" ? "Are you sure?" : "Da li ste sigurni?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {favorited
                ? language === "en"
                  ? `Remove "${displayName}" from favorites?`
                  : `Ukloniti "${displayName}" iz omiljenih?`
                : language === "en"
                  ? `Add "${displayName}" to favorites?`
                  : `Dodati "${displayName}" u omiljene?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>{language === "en" ? "Cancel" : "Otkaži"}</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.stopPropagation();
              handleConfirmFavorite();
            }}>{language === "en" ? "Yes" : "Da"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductCard;
