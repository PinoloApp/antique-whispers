import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData, Collection } from "@/contexts/DataContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Layers, Heart, Hash } from "lucide-react";
import { useState, useMemo } from "react";
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

interface CollectionCardProps {
  collection: Collection;
  auctionId?: number | null;
}

const CollectionCard = ({ collection, auctionId: contextAuctionId }: CollectionCardProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { userLoggedIn } = useAuth();
  const { collectionProducts: products, auctions } = useData();
  const { toggleCollectionFavorite, isCollectionFavorite } = useFavorites();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = collection.name[language];
  const description = collection.description[language];
  const collectionProducts = products.filter((p) => collection.productIds.includes(p.id));
  const previewImage = collection.image || collectionProducts[0]?.image || "/placeholder.svg";
  // Use collection.id (unique numeric ID) for favorites, not lot number
  const favorited = isCollectionFavorite(Number(collection.id));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmFavorite = () => {
    const willBeFavorite = !favorited;
    // Use collection.id (unique numeric ID) for favorites, not lot number
    toggleCollectionFavorite(Number(collection.id));
    toast({
      title: willBeFavorite
        ? language === "en" ? "Added to favorites" : "Dodato u omiljene"
        : language === "en" ? "Removed from favorites" : "Uklonjeno iz omiljenih",
      description: displayName,
    });
    setShowConfirm(false);
  };

  const effectiveAuctionId = contextAuctionId || collection.auctionId;

  const soldPriceFromResults = useMemo(() => {
    if (!effectiveAuctionId) return null;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    if (auction?.status === 'completed' && auction.results && auction.results[collection.id.toString()]) {
      return auction.results[collection.id.toString()];
    }
    return null;
  }, [effectiveAuctionId, auctions, collection.id]);

  const historicalStartingPrice = useMemo(() => {
    if (!effectiveAuctionId) return collection.startingPrice;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    if (auction?.initialPrices && auction.initialPrices[collection.id.toString()] !== undefined) {
      return auction.initialPrices[collection.id.toString()];
    }
    return collection.startingPrice;
  }, [effectiveAuctionId, auctions, collection.id, collection.startingPrice]);

  const isAuctionCompleted = useMemo(() => {
    if (!effectiveAuctionId) return false;
    const auction = auctions.find(a => a.id === effectiveAuctionId);
    return auction?.status === 'completed';
  }, [effectiveAuctionId, auctions]);

  const finalSoldPrice = soldPriceFromResults !== null ? soldPriceFromResults : collection.currentBid;

  return (
    <div className="relative h-full">
      <div
        className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 border border-border cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          sessionStorage.setItem('indexScrollPos', window.scrollY.toString());
          navigate(`/collection/${collection.id}${effectiveAuctionId ? `?auctionId=${effectiveAuctionId}` : ''}`);
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Collection image or first lot image */}
          <img
            src={previewImage}
            alt={displayName}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-12 flex flex-wrap gap-1.5 z-10">
            {collection.lotNumber && (
              <Badge variant="outline" className="text-xs gap-1 bg-background/80 backdrop-blur-sm">
                <Hash className="w-3 h-3" />
                {language === "en" ? "Lot" : "Lot"} {collection.lotNumber}
              </Badge>
            )}
            <Badge className="text-xs gap-1 bg-primary text-primary-foreground border-0">
              <Layers className="w-3 h-3" />
              {language === "en" ? "Collection" : "Kolekcija"}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 bg-background/80 backdrop-blur-sm">
              <Package className="w-3 h-3" />
              {collectionProducts.length} {language === "en"
                ? collectionProducts.length === 1 ? "lot" : "lots"
                : collectionProducts.length === 1
                  ? "lot"
                  : collectionProducts.length % 10 >= 2 && collectionProducts.length % 10 <= 4 && (collectionProducts.length % 100 < 10 || collectionProducts.length % 100 >= 20)
                    ? "lota"
                    : "lotova"}
            </Badge>
          </div>

          {/* Favorite button */}
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
            {displayName}
          </h3>

          {description && (
            <p className="text-sm text-muted-foreground italic mb-3 line-clamp-1">{description}</p>
          )}

          <div className="mb-3 flex flex-col gap-1 mt-5">
            {soldPriceFromResults !== null || collection.status === 'sold' ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                    {language === "en" ? "Starting Price" : "Početna cena"}
                  </p>
                  <p className="text-sm font-medium text-foreground mb-2">€{(historicalStartingPrice || 0).toLocaleString()}</p>
                </div>
                <div className="pt-2 border-t border-destructive/20">
                  <p className="text-xs text-destructive uppercase tracking-wider mb-1">
                    {language === "en" ? "Sold For" : "Prodato za"}
                  </p>
                  <p className="text-xl font-serif font-bold text-destructive">
                    €{(finalSoldPrice || 0).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                {isAuctionCompleted ? (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {language === "en" ? "Starting Price" : "Početna cena"}
                    </p>
                    <p className="text-xl font-serif font-bold text-foreground">
                      €{(historicalStartingPrice || 0).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {language === "en" ? "Current Price" : "Trenutna cena"}
                    </p>
                    <p className="text-xl font-serif font-bold text-gold">
                      €{Math.max(collection.currentBid || 0, historicalStartingPrice || 0).toLocaleString()}
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-2 bg-background text-black border-black hover:bg-black hover:text-white transition-all duration-300 group"
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('indexScrollPos', window.scrollY.toString());
              navigate(`/collection/${collection.id}${effectiveAuctionId ? `?auctionId=${effectiveAuctionId}` : ''}`);
            }}
          >
            <Eye className="w-4 h-4" />
            {language === "en" ? "View Collection" : "Pogledajte kolekciju"}
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

export default CollectionCard;
