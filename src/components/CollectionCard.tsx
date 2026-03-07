import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData, Collection } from "@/contexts/DataContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Layers, Heart } from "lucide-react";
import { useState } from "react";
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
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { userLoggedIn } = useAuth();
  const { collectionProducts: products } = useData();
  const { toggleCollectionFavorite, isCollectionFavorite } = useFavorites();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = collection.name[language];
  const description = collection.description[language];
  const collectionProducts = products.filter((p) => collection.productIds.includes(p.id));
  const previewImage = collection.image || collectionProducts[0]?.image || "/placeholder.svg";
  const favorited = isCollectionFavorite(collection.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmFavorite = () => {
    const willBeFavorite = !favorited;
    toggleCollectionFavorite(collection.id);
    toast({
      title: willBeFavorite
        ? language === "en" ? "Added to favorites" : "Dodato u omiljene"
        : language === "en" ? "Removed from favorites" : "Uklonjeno iz omiljenih",
      description: displayName,
    });
    setShowConfirm(false);
  };

  return (
    <div
      className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 border border-border cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/collection/${collection.id}`)}
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
        {!userLoggedIn ? (
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
        ) : (
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
      <div className="p-5 pt-3">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">
          {displayName}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground italic mb-3 line-clamp-1">{description}</p>
        )}

        <div className="mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {language === "en" ? "Current Price" : "Trenutna cena"}
          </p>
          <p className="text-xl font-serif font-bold text-gold">
            €{(collection.currentBid || 0).toLocaleString()}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/collection/${collection.id}`);
          }}
        >
          <Eye className="w-4 h-4" />
          {language === "en" ? "View Collection" : "Pogledajte kolekciju"}
        </Button>
      </div>

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
            <AlertDialogCancel>{language === "en" ? "Cancel" : "Otkaži"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFavorite}>{language === "en" ? "Yes" : "Da"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CollectionCard;
