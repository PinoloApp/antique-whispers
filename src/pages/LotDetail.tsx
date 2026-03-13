import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useCategories } from "@/hooks/useCategories";
import { useFavorites } from "@/contexts/FavoritesContext";
import BidForm from "@/components/BidForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ArrowLeft, CircleDot, Bookmark, Hash, Check } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/contexts/authContexts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
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
import { useToast } from "@/hooks/use-toast";
const lotStateLabels = {
  new: { en: "New", sr: "Novo" },
  used: { en: "Used", sr: "Korišćeno" },
  refurbished: { en: "Refurbished", sr: "Obnovljeno" },
  antique: { en: "Antique", sr: "Antikvitet" },
  restored: { en: "Restored", sr: "Restaurirano" },
};

const LotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { products, auctions } = useData();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { userLoggedIn } = useAuth();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFavoriteAction, setIsFavoriteAction] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find((p) => p.id === Number(id));
  const auction = product ? auctions.find((a) => a.id === product.auctionId) : null;

  // Use product.id (unique numeric ID) for favorites, not lot number
  const favorited = product ? isFavorite(Number(product.id)) : false;
  const startingPrice = product?.startingPrice || 0;
  const hasBids = product ? (!!product.hasBids || product.currentBid > startingPrice) : false;

  const handleFavoriteClick = () => {
    setShowConfirm(true);
    
  };

  const handleConfirmFavorite = () => {
    if (!product) return;
    const willBeFavorite = !favorited;
    // Use product.id (unique numeric ID) for favorites, not lot number
    toggleFavorite(Number(product.id));
    toast({
      title: willBeFavorite
        ? language === "en" ? "Added to favorites" : "Dodato u omiljene"
        : language === "en" ? "Removed from favorites" : "Uklonjeno iz omiljenih",
      description: language === "en" ? product.name : product.namesr,
    });
    setShowConfirm(false);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            {language === "en" ? "Lot Not Found" : "Lot Nije Pronađen"}
          </h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back to Home" : "Nazad na Početnu"}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const { categories } = useCategories();
  const displayName = language === "en" ? product.name : product.namesr;
  const description = product.description[language];
  const images = product.images?.length > 0 ? product.images : [product.image];

  const category = categories.find((c) => c.id === product.category);
  const categoryName = category ? category.title[language as 'en' | 'sr'] || category.title.sr : product.category;

  const subcategory = category?.subcategories.find((s) => s.id === product.subcategory);
  const subcategoryName = subcategory ? subcategory.title[language as 'en' | 'sr'] || subcategory.title.sr : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Button variant="ghost" onClick={() => navigate("/")} className="px-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back" : "Nazad"}
          </Button>

          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
              {language === "en" ? "Home" : "Početna"}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/?category=${product.category}`)}
              className="hover:text-foreground transition-colors"
            >
              {categoryName}
            </button>
            {subcategoryName && (
              <>
                <span>/</span>
                <button
                  onClick={() => navigate(`/?category=${product.category}&subcategory=${product.subcategory}`)}
                  className="hover:text-foreground transition-colors"
                >
                  {subcategoryName}
                </button>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">Lot {product.lot}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={img}
                        alt={`${displayName} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                  <CarouselDots />
                </>
              )}
            </Carousel>

            {!userLoggedIn ? (
              <AuthDialog
                defaultTab="login"
                className="absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-10 bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
              >
                <button
                  className="absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-10 bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </AuthDialog>
            ) : (
              <button
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-10 ${favorited
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
                  }`}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
              </button>
            )}

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{language === "en" ? "Are you sure?" : "Da li ste sigurni?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === "en"
                      ? favorited
                        ? "Do you want to remove this item from your favorites?"
                        : "Do you want to add this item to your favorites?"
                      : favorited
                        ? "Da li želite da uklonite ovaj predmet iz omiljenih?"
                        : "Da li želite da dodate ovaj predmet u omiljene?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === "en" ? "Cancel" : "Otkaži"}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmFavorite}>
                    {language === "en" ? "Confirm" : "Potvrdi"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm gap-1">
                <Hash className="w-3 h-3" />
                {t("products.lot")} {product.lot}
              </Badge>
              {product.catalogMark && (
                <Badge variant="outline" className="text-sm gap-1">
                  <Bookmark className="w-3 h-3" />
                  {product.catalogMark}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm gap-1">
                <CircleDot className="w-3 h-3" />
                {lotStateLabels[product.lotState][language]}
              </Badge>
            </div>

            {/* 2. Main Title / Subtitle */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{displayName}</h1>
              {product.subtitle && <p className="text-lg text-muted-foreground">{product.subtitle[language]}</p>}
            </div>

            {/* 4. Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>

            {/* 5. Note / Author */}
            <div className="space-y-1">
              {product.additionalTitle && (
                <p className="text-sm text-primary font-medium tracking-wider">{product.additionalTitle[language]}</p>
              )}
              {product.noteSub && (
                <p className="text-sm text-muted-foreground leading-relaxed">{product.noteSub[language]}</p>
              )}
            </div>

            {/* Current Bid */}
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">{t("products.currentBid")}</p>
              <p className="text-4xl font-serif font-bold text-gold">€{(product.currentBid || 0).toLocaleString()}</p>
              {hasBids && (
                <div className="mt-3 flex items-center gap-1.5 text-green-600 font-medium text-sm">
                  <Check className="w-4 h-4" />
                  {language === "en" ? "Starting price reached" : "Početna cena ostvarena"}
                </div>
              )}
            </div>

            {/* Bid Form */}
            <div className="pt-4">
              {auction?.status === "active" ? (
                <BidForm
                  productId={product.id}
                  productName={displayName}
                  currentBid={product.currentBid}
                  lotNumber={product.lot}
                  auctionId={product.auctionId}
                />
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    {language === "en"
                      ? "Bidding is only available for active auctions."
                      : "Licitiranje je dostupno samo za aktivne aukcije."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LotDetail;
