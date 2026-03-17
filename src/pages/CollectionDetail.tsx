import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useCategories } from "@/hooks/useCategories";
import { useFavorites } from "@/contexts/FavoritesContext";
import BidForm from "@/components/BidForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ArrowLeft, Layers, Info, Package, Check, Hash, ChevronLeft, ChevronRight, Gavel, LayoutGrid, List, Tag, Calendar, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/contexts/authContexts";
import { useToast } from "@/hooks/use-toast";
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
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const auctionIdFromUrl = searchParams.get("auctionId");
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { collections, collectionProducts: products, auctions, loading } = useData();
  const { categories } = useCategories();
  const { toggleCollectionFavorite, isCollectionFavorite } = useFavorites();
  const { userLoggedIn } = useAuth();
  const { toast } = useToast();

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi, onSelect]);

  const collection = collections.find((c) => c.id === Number(id));
  const auction = collection ? auctions.find((a) => a.id === collection.auctionId) : null;
  const collectionProducts = collection
    ? products.filter((p) => collection.productIds.includes(p.id))
    : [];

  // Use collection.id (unique numeric ID) for favorites, not lot number
  const favorited = collection ? isCollectionFavorite(Number(collection.id)) : false;
  const startingPrice = collection?.startingPrice || 0;
  const hasBids = collection ? (!!collection.hasBids || collection.currentBid > startingPrice) : false;

  const handleFavoriteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmFavorite = () => {
    if (!collection) return;
    const willBeFavorite = !favorited;
    // Use collection.id (unique numeric ID) for favorites, not lot number
    toggleCollectionFavorite(Number(collection.id));
    toast({
      title: willBeFavorite
        ? language === "en" ? "Added to favorites" : "Dodato u omiljene"
        : language === "en" ? "Removed from favorites" : "Uklonjeno iz omiljenih",
      description: language === "en" ? collection.name.en : collection.name.sr,
    });
    setShowConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-serif italic">
          {language === "en" ? "Loading collection details..." : "Učitavanje detalja..."}
        </p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            {language === "en" ? "Collection Not Found" : "Kolekcija Nije Pronađena"}
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

  const displayName = collection.name[language];
  const description = collection.description[language];

  // Collect all images with product label mapping
  const imageEntries: { src: string; label: string; subtitle?: string; productId?: number }[] = [];
  if (collection.image) imageEntries.push({ src: collection.image, label: displayName, subtitle: description });
  collectionProducts.forEach((p) => {
    const productLabel = language === "en" ? p.name : p.namesr;
    const productDesc = p.description?.[language] || undefined;
    if (p.images?.length > 0) {
      p.images.forEach((img) => {
        if (!imageEntries.some((e) => e.src === img))
          imageEntries.push({ src: img, label: productLabel, subtitle: productDesc, productId: p.id });
      });
    } else if (p.image && !imageEntries.some((e) => e.src === p.image)) {
      imageEntries.push({ src: p.image, label: productLabel, subtitle: productDesc, productId: p.id });
    }
  });
  if (imageEntries.length === 0) imageEntries.push({ src: "/placeholder.svg", label: displayName, subtitle: description });

  const activeProductId = imageEntries[currentSlide]?.productId;

  const category = categories.find((c) => c.id === collection.category);
  const categoryName = category ? category.title[language as 'en' | 'sr'] || category.title.sr : collection.category;
  const subcategory = category?.subcategories.find((s) => s.id === collection.subcategory);
  const subcategoryName = subcategory ? subcategory.title[language as 'en' | 'sr'] || subcategory.title.sr : null;

  const isAuctionCompleted = auction?.status === 'completed';
  const targetAuctionId = auctionIdFromUrl ? Number(auctionIdFromUrl) : auction?.id;
  const targetAuction = auctions.find(a => a.id === targetAuctionId);
  const soldPriceFromResults = targetAuction?.results?.[collection.id.toString()];
  const historicalStartingPrice = targetAuction?.initialPrices?.[collection.id.toString()] ?? collection.startingPrice;

  const showSoldPrice = (collection.status === 'sold' || soldPriceFromResults !== undefined);
  const finalSoldPrice = soldPriceFromResults !== undefined ? soldPriceFromResults : collection.currentBid;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back" : "Nazad"}
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              {language === "en" ? "Home" : "Početna"}
            </Link>
            <span>/</span>
            {categoryName && (
              <>
                <Link
                  to={`/?category=${collection.category}`}
                  className="hover:text-foreground transition-colors"
                >
                  {categoryName}
                </Link>
                <span>/</span>
              </>
            )}
            {subcategoryName && (
              <>
                <Link
                  to={`/?category=${collection.category}&subcategory=${collection.subcategory}`}
                  className="hover:text-foreground transition-colors"
                >
                  {subcategoryName}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {displayName}
            </span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Carousel */}
          <div className="relative">
            <Carousel className="w-full" setApi={setCarouselApi}>
              <CarouselContent>
                {imageEntries.map((entry, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                      <img
                        src={entry.src}
                        alt={`${entry.label} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Product name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-6 pt-20">
                        <p className="text-white font-serif font-semibold text-lg line-clamp-2">
                          {entry.label}
                        </p>
                        {entry.subtitle && (
                          <p className="text-white/80 text-base mt-2 line-clamp-2">
                            {entry.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {imageEntries.length > 1 && (
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
                        ? "Do you want to remove this collection from your favorites?"
                        : "Do you want to add this collection to your favorites?"
                      : favorited
                        ? "Da li želite da uklonite ovu kolekciju iz omiljenih?"
                        : "Da li želite da dodate ovu kolekciju u omiljene?"}
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

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {collection.lotNumber && (
                <Badge variant="outline" className="text-sm gap-1 bg-background/80 backdrop-blur-sm">
                  <Hash className="w-3 h-3" />
                  {language === "en" ? "Lot" : "Lot"} {collection.lotNumber}
                </Badge>
              )}
              <Badge className="text-sm gap-1 bg-primary text-primary-foreground border-0">
                <Layers className="w-3 h-3" />
                {language === "en" ? "Collection" : "Kolekcija"}
              </Badge>
              <Badge variant="outline" className="text-sm gap-1">
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

            {/* Title */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {displayName}
              </h1>
              {description && (
                <p className="text-lg text-muted-foreground">{description}</p>
              )}
            </div>

            {/* Notice */}
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-foreground">
                {language === "en"
                  ? "Items in this collection cannot be bid on individually. Bids are placed on the entire collection as a single lot."
                  : "Za predmete u ovoj kolekciji nije moguće licitirati pojedinačno. Ponuda se daje za kolekciju u celini."}
              </AlertDescription>
            </Alert>

            {/* Current Bid / Sold Price Section */}
            <div className="bg-muted/50 rounded-lg p-6">
              {showSoldPrice ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                      {language === "en" ? "Starting Price" : "Početna cena"}
                    </p>
                    <p className="text-xl font-serif font-medium text-foreground">€{(historicalStartingPrice || 0).toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t border-destructive/20 text-destructive">
                    <p className="text-sm uppercase tracking-wider mb-1 font-bold">
                      {language === "en" ? "Sold For" : "Prodato za"}
                    </p>
                    <p className="text-4xl font-serif font-bold">€{(finalSoldPrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    {language === "en" ? "Current Bid" : "Trenutna ponuda"}
                  </p>
                  <p className="text-4xl font-serif font-bold text-gold">
                    €{Math.max(collection.currentBid || 0, historicalStartingPrice || 0).toLocaleString()}
                  </p>
                  {hasBids && (
                    <div className="mt-3 flex items-center gap-1.5 text-green-600 font-medium text-sm">
                      <Check className="w-4 h-4" />
                      {language === "en" ? "Starting price reached" : "Početna cena ostvarena"}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bid Form */}
            <div className="pt-4">
              {auction?.status === "active" ? (
                <BidForm
                  productId={collection.id}
                  productName={displayName}
                  currentBid={collection.currentBid}
                  lotNumber={collection.lotNumber}
                  auctionId={collection.auctionId}
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

        {/* Lots in Collection */}
        {collectionProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
              {language === "en" ? "Lots in this Collection" : "Lotovi u ovoj kolekciji"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {collectionProducts.map((product) => {
                const productName = language === "en" ? product.name : product.namesr;
                const productImage = product.images?.length > 0 ? product.images[0] : product.image;
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      const idx = imageEntries.findIndex((e) => e.productId === product.id);
                      if (idx >= 0 && carouselApi) carouselApi.scrollTo(idx);
                    }}
                    className={`bg-card rounded-lg border-2 overflow-hidden transition-all duration-300 cursor-pointer ${activeProductId === product.id
                      ? "border-primary shadow-lg ring-1 ring-primary/20"
                      : "border-border hover:shadow-card"
                      }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={productImage || "/placeholder.svg"}
                        alt={productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-semibold text-foreground line-clamp-2 text-sm">
                        {productName}
                      </h3>
                      {product.description[language] && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.description[language]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CollectionDetail;
