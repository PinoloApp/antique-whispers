import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/authContexts";
import { db, functions, auth } from "@/firebase/firebase";
import { doc, setDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useData, Bid } from "@/contexts/DataContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  ShieldCheck,
  Gavel,
  Clock,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  ChevronDown,
  Landmark,
  Check,
  X,
  Ban,
  CirclePause,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentService } from "@/services/paymentService";
import { Payment as PaymentType } from "@/contexts/DataContext";

import { useToast } from "@/hooks/use-toast";
import { getFieldError, nameRules, emailRules, phoneRules } from "@/lib/validation";
import { signOut } from "@/firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: language === "en" ? "Logged out" : "Odjavljeni ste",
        description: language === "en" ? "You have successfully logged out." : "Uspešno ste se odjavili.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: language === "en" ? "Failed to log out." : "Odjava nije uspela.",
        variant: "destructive",
      });
    }
  };

  const { currentUser, userLoggedIn } = useAuth();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/");
    }
  }, [userLoggedIn, navigate]);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setProfile({
        firstName: currentUser.firstName || currentUser.displayName?.split(" ")[0] || "",
        lastName: currentUser.lastName || currentUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  const { products, collections, collectionProducts, auctions } = useData();
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    auctionStart: true,
    auctionEnd: true,
    newsletter: false,
    sms: false,
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileTouched, setProfileTouched] = useState<Record<string, boolean>>({});
  const markProfileTouched = (field: string) => setProfileTouched((prev) => ({ ...prev, [field]: true }));

  const profileFirstNameError = profileTouched.firstName && isEditing ? getFieldError(profile.firstName, nameRules, language) : null;
  const profileLastNameError = profileTouched.lastName && isEditing ? getFieldError(profile.lastName, nameRules, language) : null;
  const profileEmailError = profileTouched.email && isEditing ? getFieldError(profile.email, emailRules, language) : null;
  const profilePhoneError = profileTouched.phone && isEditing ? getFieldError(profile.phone, phoneRules, language) : null;

  const passwordRules = useMemo(() => [
    { label: { en: "At least 8 characters", sr: "Najmanje 8 karaktera" }, met: passwords.newPassword.length >= 8 },
    { label: { en: "At least 1 number", sr: "Minimum 1 broj" }, met: /\d/.test(passwords.newPassword) },
    { label: { en: "At least 1 uppercase letter", sr: "Minimum 1 veliko slovo" }, met: /[A-Z]/.test(passwords.newPassword) },
    { label: { en: "At least 1 special character", sr: "Minimum 1 specijalni karakter" }, met: /[^A-Za-z0-9]/.test(passwords.newPassword) },
  ], [passwords.newPassword]);

  const isNewPasswordValid = passwordRules.every((r) => r.met);
  const passwordsMatch = passwords.newPassword === passwords.confirm;

  const handlePasswordChange = async () => {
    const errors: string[] = [];
    if (!isNewPasswordValid)
      errors.push(language === "en" ? "New password does not meet all requirements" : "Nova lozinka ne ispunjava sve zahteve");
    if (!passwordsMatch)
      errors.push(language === "en" ? "Passwords do not match" : "Lozinke se ne poklapaju");

    setPasswordErrors(errors);
    if (errors.length > 0) return;

    setPasswordLoading(true);
    try {
      const updatePasswordFn = httpsCallable(functions, 'updatePassword');
      await updatePasswordFn({ newPassword: passwords.newPassword });

      // Re-login on client side to refresh the session and prevent sign-out
      if (currentUser?.email) {
        await signInWithEmailAndPassword(auth, currentUser.email, passwords.newPassword);
      }

      setPasswords({ newPassword: "", confirm: "" });
      toast({
        title: language === "en" ? "Password Changed" : "Lozinka Promenjena",
        description:
          language === "en" ? "Your password has been updated successfully." : "Vaša lozinka je uspešno ažurirana.",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordErrors([error.message || (language === "en" ? "Failed to update password" : "Greška pri promeni lozinke")]);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Subscribe to user's bids
  useEffect(() => {
    if (!currentUser) {
      setUserBids([]);
      setBidsLoading(false);
      return;
    }

    const q = query(
      collection(db, "bids"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bids = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Bid[];
      setUserBids(bids);
      setBidsLoading(false);
    }, (error) => {
      console.error("Error fetching user bids:", error);
      setBidsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const [userPayments, setUserPayments] = useState<PaymentType[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Subscribe to user's payments
  useEffect(() => {
    if (!currentUser) {
      setUserPayments([]);
      setPaymentsLoading(false);
      return;
    }

    const unsubscribe = PaymentService.subscribeToUser(currentUser.uid, (payments) => {
      setUserPayments(payments);
      setPaymentsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Map bids to UI data (Highest bid per unique Lot participation)
  const bidHistory = useMemo(() => {
    const uniqueLots: Record<string, any> = {};

    userBids.sort((a, b) => b.maxAmount - a.maxAmount).forEach(bid => {
      const bidPid = String(bid.productId);
      const auctionIdVal = String(bid.auctionId);
      const key = `${auctionIdVal}-${bidPid}`;

      if (!uniqueLots[key]) {
        const item = products.find(p => String(p.id) === bidPid) ||
          collections.find(c => String(c.id) === bidPid) ||
          collectionProducts.find(p => String(p.id) === bidPid);

        const itemName = item
          ? (item as any).name?.[language] || (language === "en" ? (item as any).name : (item as any).namesr)
          : `Lot #${bid.productId}`;

        const itemImage = item ? (item as any).image || ((item as any).images?.[0]) : "/placeholder.svg";
        const lotNumber = item ? ((item as any).lot || (item as any).lotNumber) : bid.productId;

        const auction = auctions.find(a => String(a.id) === auctionIdVal);
        const auctionId = auction?.id || auctionIdVal || "unknown";

        // snapshot fallback if auction is deleted
        const snapTitle = (bid as any).auctionTitle?.[language] || (bid as any).auctionTitle;
        const auctionName = (auction as any)?.title?.[language] || (auction as any)?.title || snapTitle || (language === "en" ? "Unknown Auction" : "Nepoznata Aukcija");

        const snapEndDate = (bid as any).auctionEndDate;
        const auctionDate = auction?.endDate
          ? new Date(auction.endDate).toLocaleDateString()
          : (snapEndDate ? (snapEndDate.toDate ? snapEndDate.toDate().toLocaleDateString() : new Date(snapEndDate).toLocaleDateString()) : "N/A");

        const isAuctionCompleted = auction?.status === "completed" || (auction === undefined && snapEndDate && new Date() > (snapEndDate.toDate ? snapEndDate.toDate() : new Date(snapEndDate)));

        const snapStatus = (bid as any).auctionStatus;
        let status: "won" | "lost" | "active" | "cancelled" | "paused" = "active";

        const effectiveStatus = auction?.status || snapStatus || "active";

        if (effectiveStatus === "cancelled") {
          status = "cancelled";
        } else if (effectiveStatus === "paused") {
          status = "paused";
        } else if (isAuctionCompleted || effectiveStatus === "completed") {
          status = bid.isWinning ? "won" : "lost";
        } else {
          status = "active";
        }

        const itemType = collections.find(c => c.id === bid.productId) ? 'collection' : 'lot';

        uniqueLots[key] = {
          id: bid.id,
          lot: `Lot #${lotNumber}`,
          name: itemName,
          amount: bid.maxAmount,
          status,
          date: bid.timestamp instanceof Date ? bid.timestamp.toLocaleDateString() : new Date().toLocaleDateString(),
          image: itemImage,
          auctionId,
          auctionName,
          auctionDate,
          productId: bid.productId,
          itemType
        };
      }
    });

    return Object.values(uniqueLots);
  }, [userBids, products, collections, collectionProducts, auctions, language]);

  // Group bids by auction
  const bidsByAuction = useMemo(() => {
    const grouped = bidHistory.reduce<Record<string, any>>((acc, bid) => {
      if (!acc[bid.auctionId]) {
        acc[bid.auctionId] = {
          id: bid.auctionId,
          name: bid.auctionName,
          date: bid.auctionDate,
          lots: []
        };
      }
      acc[bid.auctionId].lots.push(bid);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [bidHistory]);

  // Derived stats from real data
  const stats = useMemo(() => [
    { label: language === "en" ? "Total Bids" : "Ukupno Licitacija", value: userBids.length, icon: Gavel },
    { label: language === "en" ? "Won Auctions" : "Dobijene Aukcije", value: bidHistory.filter(h => h.status === "won").length, icon: ShieldCheck },
  ], [userBids.length, bidHistory, language]);


  // Won auctions for payment section - Grouped by auctionTitle (which is an object {en, sr})
  const wonAuctions = useMemo(() => {
    const grouped = userPayments.reduce<Record<string, any>>((acc, payment) => {
      // Use the sr auction title as the key for grouping, or a combo
      const auctionNameKey = payment.auctionTitle.sr;

      if (!acc[auctionNameKey]) {
        acc[auctionNameKey] = {
          id: auctionNameKey, // Using title as ID for grouping UI
          name: payment.auctionTitle[language] || payment.auctionTitle.sr,
          date: payment.wonDate,
          paymentStatus: payment.status, // overall status for the group, usually they are same
          wonLots: []
        };
      }

      const auction = auctions.find(a => a.title.sr === payment.auctionTitle.sr || a.title.en === payment.auctionTitle.en);
      const auctionId = (payment as any).auctionId || auction?.id;

      acc[auctionNameKey].wonLots.push({
        lot: payment.lotNumber.startsWith('Lot #') ? payment.lotNumber : `Lot #${payment.lotNumber}`,
        name: payment.lotName[language] || payment.lotName.sr,
        amount: payment.amount,
        image: "/placeholder.svg", // We don't have image in payment doc yet, could add it
        paymentId: payment.id, // link to individual payment
        itemId: payment.itemId,
        itemType: payment.itemType === 'product' ? 'lot' : 'collection',
        auctionId
      });

      // Update group status to 'overdue' if any item is overdue
      if (payment.status === 'overdue' && acc[auctionNameKey].paymentStatus !== 'overdue') {
        acc[auctionNameKey].paymentStatus = 'overdue';
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }, [userPayments, language]);

  const [expandedLots, setExpandedLots] = useState<Record<string, boolean>>({});
  const [bidFilter, setBidFilter] = useState<string>("all");
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; auctionName: string; totalAmount: number }>({
    open: false,
    auctionName: "",
    totalAmount: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // Sort won auctions for display
  const sortedWonAuctions = useMemo(() => {
    return [...wonAuctions].sort((a, b) => {
      const order = { overdue: 0, pending: 1, paid: 2 };
      return (order[a.paymentStatus] || 1) - (order[b.paymentStatus] || 1);
    });
  }, [wonAuctions]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        updatedAt: new Date(),
      }, { merge: true });

      setIsEditing(false);
      toast({
        title: language === "en" ? "Profile Updated" : "Profil Ažuriran",
        description: language === "en" ? "Your profile has been saved successfully." : "Vaš profil je uspešno sačuvan.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: language === "en" ? "Update Failed" : "Ažuriranje Nije Uspelo",
        description: language === "en" ? "Failed to save profile changes." : "Došlo je do greške prilikom čuvanja profila.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      won: {
        label: language === "en" ? "Won" : "Dobijeno",
        className: "bg-green-500/10 text-green-700 border-green-200",
        icon: Check,
      },
      active: {
        label: language === "en" ? "Active" : "Aktivno",
        className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
        icon: Clock,
      },
      lost: {
        label: language === "en" ? "Lost" : "Izgubljeno",
        className: "bg-red-500/10 text-red-700 border-red-200",
        icon: X,
      },
      cancelled: {
        label: language === "en" ? "Cancelled" : "Otkazano",
        className: "bg-slate-500/10 text-slate-600 border-slate-200",
        icon: Ban,
      },
      paused: {
        label: language === "en" ? "Paused" : "Pauzirano",
        className: "bg-orange-500/10 text-orange-600 border-orange-200",
        icon: CirclePause,
      },
    };
    const v = variants[status] || variants.lost;
    const Icon = v.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 py-0.5 px-2.5 font-medium ${v.className}`}>
        <Icon className="w-3 h-3 stroke-[2.5px]" />
        {v.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-serif">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="gap-2"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing
                  ? language === "en"
                    ? "Save"
                    : "Sačuvaj"
                  : language === "en"
                    ? "Edit Profile"
                    : "Izmeni Profil"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <Lock className="w-4 h-4" /> {/* Or LogOut icon if imported */}
                {language === "en" ? "Log Out" : "Odjavi se"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="info" className="gap-2">
                <User className="w-4 h-4" />
                {language === "en" ? "Personal Info" : "Lični Podaci"}
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="w-4 h-4" />
                {language === "en" ? "Password" : "Lozinka"}
              </TabsTrigger>
              <TabsTrigger value="bids" className="gap-2">
                <Gavel className="w-4 h-4" />
                {language === "en" ? "My Bids" : "Moje Licitacije"}
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="w-4 h-4" />
                {language === "en" ? "Payments" : "Plaćanje"}
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">
                    {language === "en" ? "Personal Information" : "Lični Podaci"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {language === "en" ? "First Name" : "Ime"}
                      </Label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        onBlur={() => markProfileTouched('firstName')}
                        disabled={!isEditing}
                      />
                      {profileFirstNameError && <p className="text-xs text-destructive">{profileFirstNameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {language === "en" ? "Last Name" : "Prezime"}
                      </Label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        onBlur={() => markProfileTouched('lastName')}
                        disabled={!isEditing}
                      />
                      {profileLastNameError && <p className="text-xs text-destructive">{profileLastNameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        onBlur={() => markProfileTouched('email')}
                        disabled={!isEditing}
                      />
                      {profileEmailError && <p className="text-xs text-destructive">{profileEmailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {language === "en" ? "Phone" : "Telefon"}
                      </Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        onBlur={() => markProfileTouched('phone')}
                        disabled={!isEditing}
                      />
                      {profilePhoneError && <p className="text-xs text-destructive">{profilePhoneError}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {language === "en" ? "Address" : "Adresa"}
                    </Label>
                    <Input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">
                    {language === "en" ? "Change Password" : "Promena Lozinke"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 max-w-md">
                  {passwordErrors.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
                      {passwordErrors.map((err, i) => (
                        <p key={i} className="text-sm text-destructive">
                          {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {language === "en" ? "New Password" : "Nova Lozinka"}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.newPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwords.newPassword.length > 0 && (
                      <ul className="space-y-1 mt-2">
                        {passwordRules.map((rule, i) => (
                          <li key={i} className={`flex items-center gap-2 text-xs ${rule.met ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {rule.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {language === "en" ? rule.label.en : rule.label.sr}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {language === "en" ? "Confirm Password" : "Potvrdi Lozinku"}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwords.confirm.length > 0 && (
                      <p className={`flex items-center gap-2 text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                        {passwordsMatch
                          ? <><Check className="w-3 h-3" />{language === "en" ? "Passwords match" : "Lozinke se poklapaju"}</>
                          : <><X className="w-3 h-3" />{language === "en" ? "Passwords do not match" : "Lozinke se ne poklapaju"}</>
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    className="w-full gap-2 mt-4"
                    disabled={!isNewPasswordValid || !passwordsMatch || passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {language === "en" ? "Updating..." : "Ažuriranje..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        {language === "en" ? "Update Password" : "Ažuriraj Lozinku"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bid History Tab */}
            <TabsContent value="bids">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{language === "en" ? "My Bids" : "Moje Licitacije"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { value: "all", label: language === "en" ? "All" : "Sve" },
                      { value: "won", label: language === "en" ? "Won" : "Dobijeno" },
                      { value: "active", label: language === "en" ? "Active" : "Aktivno" },
                      { value: "lost", label: language === "en" ? "Lost" : "Izgubljeno" },
                      { value: "cancelled", label: language === "en" ? "Cancelled" : "Otkazano" },
                      { value: "paused", label: language === "en" ? "Paused" : "Pauzirano" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setBidFilter(filter.value)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${bidFilter === filter.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {bidsByAuction
                      .filter((auction) => {
                        if (bidFilter === "all") return true;
                        return auction.lots.some((bid: any) => bid.status === bidFilter);
                      })
                      .map((auction) => {
                        const isExpanded = expandedLots[`auction-bid-${auction.id}`] ?? false;
                        const filteredLots = auction.lots.filter((bid: any) => {
                          if (bidFilter === "all") return true;
                          return bid.status === bidFilter;
                        });

                        return (
                          <Collapsible
                            key={auction.id}
                            open={isExpanded}
                            onOpenChange={(open) =>
                              setExpandedLots((prev) => ({ ...prev, [`auction-bid-${auction.id}`]: open }))
                            }
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{auction.name}</p>
                                  <p className="text-xs text-muted-foreground">{auction.date}</p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {filteredLots.length}{" "}
                                    {language === "en"
                                      ? filteredLots.length === 1 ? "lot" : "lots"
                                      : filteredLots.length === 1 ? "lot" : "lotova"}
                                  </Badge>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-4 border-l-2 border-primary/20 pl-4 space-y-3 mt-1 mb-4">
                                {filteredLots.map((bid: any) => (
                                  <div
                                    key={bid.id}
                                    onClick={() => navigate(`/${bid.itemType}/${bid.productId}${bid.auctionId ? `?auctionId=${bid.auctionId}` : ''}`)}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                  >
                                    <img
                                      src={bid.image}
                                      alt={bid.name}
                                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-primary">{bid.lot}</span>
                                        {getStatusBadge(bid.status)}
                                      </div>
                                      <p className="font-medium text-foreground">{bid.name}</p>
                                      <p className="text-xs text-muted-foreground">{bid.date}</p>
                                    </div>
                                    <p className="font-bold text-foreground">€{bid.amount.toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    {bidsByAuction.filter((auction) => {
                      if (bidFilter === "all") return true;
                      return auction.lots.some((bid: any) => bid.status === bidFilter);
                    }).length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Gavel className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>{language === "en" ? "No bids found" : "Nema pronađenih licitacija"}</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{language === "en" ? "Payments" : "Plaćanje"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const getPaymentStatusBadge = (status: string) => {
                        const variants: Record<string, { label: string; className: string }> = {
                          paid: {
                            label: language === "en" ? "Paid" : "Plaćeno",
                            className: "bg-green-500/20 text-green-600 border-green-500/30",
                          },
                          pending: {
                            label: language === "en" ? "Awaiting Payment" : "Čeka plaćanje",
                            className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                          },
                          overdue: {
                            label: language === "en" ? "Past Due" : "Isteklo",
                            className: "bg-red-500/20 text-red-600 border-red-500/30",
                          },
                        };
                        const v = variants[status] || variants.pending;
                        return <Badge className={v.className}>{v.label}</Badge>;
                      };

                      if (paymentsLoading) {
                        return <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg border border-border" />
                          ))}
                        </div>;
                      }

                      if (sortedWonAuctions.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{language === "en" ? "No items awaiting payment." : "Nema stavki za plaćanje."}</p>
                          </div>
                        );
                      }

                      return sortedWonAuctions
                        .map((auction) => {
                          const totalAmount = auction.wonLots.reduce((sum: number, lot: any) => sum + lot.amount, 0);
                          const needsPayment = auction.paymentStatus !== "paid";
                          const isExpanded = needsPayment || (expandedLots[`payment-${auction.id}`] ?? false);

                          return (
                            <Collapsible
                              key={auction.id}
                              open={isExpanded}
                              onOpenChange={(open) =>
                                setExpandedLots((prev) => ({ ...prev, [`payment-${auction.id}`]: open }))
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer mb-2">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">{auction.name}</p>
                                    <p className="text-xs text-muted-foreground">{auction.date}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {auction.wonLots.length}{" "}
                                      {language === "en"
                                        ? auction.wonLots.length === 1
                                          ? "lot"
                                          : "lots"
                                        : auction.wonLots.length === 1
                                          ? "lot"
                                          : "lotova"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getPaymentStatusBadge(auction.paymentStatus)}
                                    <div className="flex flex-col items-end gap-2 text-right min-w-[100px]">
                                      <p className="text-lg font-bold text-foreground">€{totalAmount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-4 border-l-2 border-primary/20 pl-4 space-y-2 mt-1 mb-4">
                                  {auction.wonLots.map((lot: any, idx: number) => (
                                    <div
                                      key={idx}
                                      onClick={() => navigate(`/${lot.itemType}/${lot.itemId}${lot.auctionId ? `?auctionId=${lot.auctionId}` : ''}`)}
                                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                      <img
                                        src={lot.image}
                                        alt={lot.name}
                                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                      />
                                      <div className="flex-1">
                                        <span className="text-xs font-medium text-primary">{lot.lot}</span>
                                        <p className="text-sm font-medium text-foreground">{lot.name}</p>
                                      </div>
                                      <p className="text-sm font-bold text-foreground">€{lot.amount.toLocaleString()}</p>
                                    </div>
                                  ))}
                                  {needsPayment && (
                                    <Button
                                      className="w-full gap-2 mt-2 font-serif"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentMethod("card");
                                        setPaymentModal({
                                          open: true,
                                          auctionName: auction.name,
                                          totalAmount,
                                        });
                                      }}
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      {language === "en" ? "Pay All" : "Platite Sve"} — €{totalAmount.toLocaleString()}
                                    </Button>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>

      {/* Payment Method Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-serif">
              {language === "en" ? "Choose Payment Method" : "Izaberite način plaćanja"}
            </DialogTitle>
            <DialogDescription>
              {paymentModal.auctionName} — €{paymentModal.totalAmount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4 mt-2">
            <label
              htmlFor="card"
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{language === "en" ? "Credit/Debit Card" : "Karticom"}</p>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Redirecting to Checkout Page" : "Preusmeravanje na stranu za sigurno plaćanje"}
                </p>
              </div>
            </label>
            <label
              htmlFor="bank"
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
            >
              <RadioGroupItem value="bank" id="bank" />
              <Landmark className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{language === "en" ? "Bank Transfer" : "Bankovni račun"}</p>
                <p className="text-xs text-muted-foreground">
                  {language === "en"
                    ? "We'll send you an invoice to pay via bank transfer"
                    : "Poslaćemo vam fakturu za plaćanje preko banke"}
                </p>
              </div>
            </label>
          </RadioGroup>
          <Separator className="my-2" />

          {paymentMethod === "card" ? (
            <div className="space-y-4">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  setPaymentModal((prev) => ({ ...prev, open: false }));
                  toast({
                    title: language === "en" ? "Payment Initiated" : "Plaćanje Pokrenuto",
                    description:
                      language === "en"
                        ? `Card payment of €${paymentModal.totalAmount.toLocaleString()} initiated.`
                        : `Plaćanje karticom od €${paymentModal.totalAmount.toLocaleString()} je pokrenuto.`,
                  });
                }}
              >
                <CreditCard className="w-4 h-4" />
                {language === "en"
                  ? `Pay €${paymentModal.totalAmount.toLocaleString()}`
                  : `Platite €${paymentModal.totalAmount.toLocaleString()}`}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <DialogTitle className="font-serif">
                {language === "en" ? "Bank Transfer Instructions" : "Instrukcije za plaćanje"}
              </DialogTitle>
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Recipient" : "Naziv Primaoca"}:</span>
                    <span className="font-medium text-foreground">Aukcijska kuća DOO Beograd</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Address" : "Adresa"}:</span>
                    <span className="font-medium text-foreground">Majkla Dzeksona 44</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Bank" : "Banka"}:</span>
                    <span className="font-medium text-foreground">Banca Intesa AD Beograd</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Account Number" : "Broj računa"}:</span>
                    <span className="font-medium text-foreground">160-0000000123456-78</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{"BIC/SWIFT"}:</span>
                    <span className="font-medium text-foreground">RIOBRSDXXX</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{"IBAN"}:</span>
                    <span className="font-medium text-foreground">RS783462876432467832</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Amount" : "Iznos"}:</span>
                    <span className="font-medium text-foreground">€{paymentModal.totalAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Reference" : "Poziv na broj"}:</span>
                    <span className="font-medium text-foreground">
                      AUK-{paymentModal.auctionName?.replace(/\s/g, "-")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
