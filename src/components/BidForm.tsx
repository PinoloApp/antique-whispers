import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/authContexts";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Lock } from "lucide-react";
import { getFieldError, nameRules, emailRules, type ValidationRule, validators } from "@/lib/validation";
import AuthDialog from "./AuthDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Info } from "lucide-react";

interface BidFormProps {
  productId: number;
  productName: string;
  currentBid: number;
  lotNumber: string;
  auctionId: number;
}

const BidForm = ({ productId, productName, currentBid, lotNumber, auctionId }: BidFormProps) => {
  const { language, t } = useLanguage();
  const { addBid, getBidStepForAmount, products, collectionProducts, collections } = useData();
  const { currentUser, userLoggedIn } = useAuth();
  const { isAdmin } = useAdminAuth();
  const [maxBidAmount, setMaxBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userLoggedIn && currentUser) {
      setBidderName(currentUser.displayName || "");
      setBidderEmail(currentUser.email || "");
    }
  }, [userLoggedIn, currentUser, isOpen]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if item has bids
  const pid = Number(productId);
  const product = products.find(p => Number(p.id) === pid) ||
    collectionProducts.find(p => Number(p.id) === pid);
  const collection = !product ? collections.find(c => Number(c.id) === pid) : null;

  const startingPrice = product ? product.startingPrice || currentBid : (collection ? collection.startingPrice || currentBid : currentBid);
  const hasBids = product
    ? (!!product.hasBids || product.currentBid > startingPrice)
    : (collection ? (!!collection.hasBids || collection.currentBid > startingPrice) : false);

  const step = getBidStepForAmount(auctionId, currentBid);
  const minimumBid = hasBids ? currentBid + step : currentBid;


  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const bidAmountRules: ValidationRule[] = [
    { validate: validators.required, message: { en: "Bid amount is required", sr: "Iznos ponude je obavezan" } },
    { validate: validators.minNumber(minimumBid), message: { en: `Minimum bid is €${minimumBid.toLocaleString()}`, sr: `Minimalna ponuda je €${minimumBid.toLocaleString()}` } },
  ];

  const nameError = touched.name ? getFieldError(bidderName, nameRules, language) : null;
  const emailError = touched.email ? getFieldError(bidderEmail, emailRules, language) : null;
  const bidError = touched.bid ? getFieldError(maxBidAmount, bidAmountRules, language) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, bid: true });

    const nErr = getFieldError(bidderName, nameRules, language);
    const eErr = getFieldError(bidderEmail, emailRules, language);
    const bErr = getFieldError(maxBidAmount, bidAmountRules, language);

    if (nErr || eErr || bErr) return;

    setShowConfirm(true);
  };

  const handleConfirmBid = async () => {
    const maxAmount = parseFloat(maxBidAmount);
    setIsSubmitting(true);

    try {
      await addBid({
        productId,
        auctionId,
        maxAmount,
        bidderName,
        bidderEmail,
      });

      setConfirmedAmount(maxAmount);
      setMaxBidAmount("");
      setBidderName("");
      setBidderEmail("");
      setShowConfirm(false);
      setIsOpen(false);
      setShowSuccess(true);
      setTouched({});
    } catch (error) {
      console.error("Bid error:", error);
      toast({
        title: language === "en" ? "Error placing bid" : "Greška pri licitiranju",
        description: language === "en" ? "There was a problem processing your bid. Please try again." : "Došlo je do problema prilikom obrade vaše ponude. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isAdmin ? (
        <div className="bg-muted/50 border border-primary/20 rounded-lg p-5 text-center flex flex-col items-center gap-3">
          <Info className="w-6 h-6 text-primary" />
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {language === "en"
              ? "Administrator accounts are not allowed to participate in bidding."
              : "Administratorski nalozi ne mogu učestvovati u licitaciji."}
          </p>
        </div>
      ) : currentUser?.status === "banned" ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-5 text-center flex flex-col items-center gap-3">
          <Lock className="w-6 h-6 text-destructive" />
          <p className="text-sm font-medium text-destructive leading-relaxed">
            {language === "en"
              ? "Your account has been suspended. Please contact support for assistance."
              : "Vaš nalog je suspendovan. Molimo Vas da se obratite podršci za pomoć."}
          </p>
        </div>
      ) : !userLoggedIn ? (
        <AuthDialog
          defaultTab="login"
          variant="default"
          className="w-full h-12 bg-primary hover:bg-burgundy-dark text-primary-foreground font-medium transition-colors"
          triggerLabel={language === "en" ? "Place Maximum Bid" : "Postavi Maksimalnu Ponudu"}
        />
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setTouched({}); }}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-burgundy-dark text-primary-foreground font-medium transition-colors">
              {language === "en" ? "Place Maximum Bid" : "Postavi Maksimalnu Ponudu"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {language === "en" ? "Place Your Maximum Bid" : "Postavite Vašu Maksimalnu Ponudu"}
              </DialogTitle>
              <DialogDescription>
                {language === "en" ? `Lot ${lotNumber}: ${productName}` : `Lot ${lotNumber}: ${productName}`}
              </DialogDescription>
            </DialogHeader>

            {/* Proxy Bidding Explanation */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {language === "en" ? "How Automatic Bidding Works:" : "Kako Funkcioniše Automatsko Licitiranje:"}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {language === "en"
                      ? "Enter the maximum amount you're willing to pay. The system will automatically bid on your behalf, only raising the price when needed to stay ahead of other bidders. You'll never pay more than necessary to win."
                      : "Unesite maksimalni iznos koji ste spremni platiti. Sistem će automatski licitirati u vaše ime, podižući cenu samo kada je potrebno da ostanete ispred drugih ponuđača. Nikada nećete platiti više nego što je neophodno za pobedu."}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === "en" ? "Current Price:" : "Trenutna Cena:"}</span>
                  <span className="font-semibold text-gold">€{currentBid.toLocaleString()}</span>
                </div>
                {hasBids && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "en" ? "Bid Increment:" : "Korak Licitacije:"}
                    </span>
                    <span className="font-medium">€{step.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "en" ? "Minimum Maximum Bid:" : "Minimalna Maksimalna Ponuda:"}
                  </span>
                  <span className="font-semibold">€{minimumBid.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-muted px-4 py-2 rounded-md text-sm border">
                <p className="text-muted-foreground font-medium">{language === "en" ? "Bidding as:" : "Licitirate kao:"}</p>
                <p className="font-semibold">{bidderName} ({bidderEmail})</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBidAmount">
                  {language === "en" ? "Your Maximum Bid (€)" : "Vaša Maksimalna Ponuda (€)"}
                </Label>
                <Input
                  id="maxBidAmount"
                  type="number"
                  min={minimumBid}
                  step="1"
                  value={maxBidAmount}
                  onChange={(e) => setMaxBidAmount(e.target.value)}
                  onBlur={() => markTouched('bid')}
                  placeholder={minimumBid.toString()}
                  className="text-lg"
                  required
                />
                {bidError && <p className="text-xs text-destructive">{bidError}</p>}
                <p className="text-xs text-muted-foreground">
                  {language === "en"
                    ? "This is the maximum you're willing to pay. The actual price may be lower."
                    : "Ovo je maksimum koji ste spremni platiti. Stvarna cena može biti niža."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  {language === "en" ? "Cancel" : "Otkaži"}
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-burgundy-dark">
                  {language === "en" ? "Confirm Maximum Bid" : "Potvrdi Maksimalnu Ponudu"}
                </Button>
              </div>
            </form>
          </DialogContent>

          <AlertDialog open={showConfirm} onOpenChange={(open) => { if (!isSubmitting) setShowConfirm(open); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === "en" ? "Confirm Your Bid" : "Potvrdite Vašu Ponudu"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === "en"
                    ? `You are about to place a maximum bid of €${parseFloat(maxBidAmount || "0").toLocaleString()} on Lot ${lotNumber}: ${productName}. The system will automatically bid on your behalf up to this amount.`
                    : `Postavljate maksimalnu ponudu od €${parseFloat(maxBidAmount || "0").toLocaleString()} za Lot ${lotNumber}: ${productName}. Sistem će automatski licitirati u vaše ime do ovog iznosa.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  {language === "en" ? "Cancel" : "Otkaži"}
                </AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirmBid(); }} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting
                    ? (language === "en" ? "Placing Bid..." : "Licitiranje...")
                    : (language === "en" ? "Confirm Bid" : "Potvrdi Ponudu")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Dialog >
      )}

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center" aria-describedby={undefined}>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="font-serif text-xl">
                {language === "en" ? "Bid Successfully Placed!" : "Ponuda Uspešno Postavljena!"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                {language === "en"
                  ? `Your maximum bid of €${confirmedAmount.toLocaleString()} has been placed on Lot ${lotNumber}: ${productName}. The system will automatically bid on your behalf. You will be notified about the status of your bid.`
                  : `Vaša maksimalna ponuda od €${confirmedAmount.toLocaleString()} je postavljena za Lot ${lotNumber}: ${productName}. Sistem će automatski licitirati u vaše ime. Bićete obavešteni o statusu vaše ponude.`}
              </DialogDescription>
            </DialogHeader>
            <Button className="w-full mt-2" onClick={() => setShowSuccess(false)}>
              {language === "en" ? "OK" : "U redu"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BidForm;
