import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "sr";

interface Translations {
  [key: string]: {
    en: string;
    sr: string;
  };
}

const translations: Translations = {
  // Header
  "nav.home": { en: "Home", sr: "Početna" },
  "nav.faq": { en: "FAQ", sr: "Česta Pitanja" },
  "nav.favorites": { en: "Favorites", sr: "Favoriti" },
  "nav.about": { en: "About Us", sr: "O nama" },
  "nav.contact": { en: "Contact", sr: "Kontakt" },

  // FAQ Page
  "faq.title": { en: "Frequently Asked Questions", sr: "Česta Pitanja" },
  "faq.subtitle": {
    en: "Find answers to common questions about our auctions",
    sr: "Pronađite odgovore na česta pitanja o našim aukcijama",
  },

  // Favorites Page
  "favorites.title": { en: "My Favorites", sr: "Moji Favoriti" },
  "favorites.empty": { en: "No favorites yet", sr: "Još nema favorita" },
  "favorites.emptyDescription": {
    en: "Start exploring and add items to your favorites",
    sr: "Počnite da istražujete i dodajte predmete u favorite",
  },
  "favorites.browse": { en: "Browse Catalog", sr: "Pregledaj Katalog" },
  "favorites.items": { en: "items", sr: "favorita" },
  "favorites.item": { en: "item", sr: "favorit" },

  // Hero
  "hero.title": { en: "Discover Timeless Treasures", sr: "Otkrijte Bezvremenska Blaga" },
  "hero.subtitle": {
    en: "Experience the elegance of curated antique auctions",
    sr: "Doživite eleganciju izabranih antikvitetnih aukcija",
  },
  "hero.nextAuction": { en: "Next Auction", sr: "Sledeća Aukcija" },
  "hero.viewCatalog": { en: "View Catalog", sr: "Pogledaj Katalog" },
  "hero.register": { en: "Register to Bid", sr: "Registruj se za Licitaciju" },

  // Countdown
  "countdown.days": { en: "Days", sr: "Dana" },
  "countdown.hours": { en: "Hours", sr: "Sati" },
  "countdown.minutes": { en: "Minutes", sr: "Minuta" },
  "countdown.seconds": { en: "Seconds", sr: "Sekundi" },

  // Products
  "products.title": { en: "Featured Lots", sr: "Istaknuti Lotovi" },
  "products.viewAll": { en: "View All Items", sr: "Pogledajte Sve Predmete" },
  "products.lot": { en: "Lot", sr: "Lot" },
  "products.currentBid": { en: "Current Price", sr: "Trenutna Cena" },
  "products.startingBid": { en: "Starting Price", sr: "Početna Cena" },
  "products.placeBid": { en: "Place Bid", sr: "Licitiraj" },

  // Search
  "search.placeholder": { en: "Search antiques...", sr: "Pretraži antikvitete..." },
  "search.filters": { en: "Filters", sr: "Filteri" },
  "search.category": { en: "Category", sr: "Kategorija" },
  "search.priceRange": { en: "Price Range", sr: "Raspon Cena" },
  "search.all": { en: "All Categories", sr: "Sve Kategorije" },

  // Categories
  "category.furniture": { en: "Furniture", sr: "Nameštaj" },
  "category.paintings": { en: "Paintings", sr: "Slike" },
  "category.jewelry": { en: "Jewelry", sr: "Nakit" },
  "category.ceramics": { en: "Ceramics", sr: "Keramika" },
  "category.clocks": { en: "Clocks", sr: "Satovi" },
  "category.silverware": { en: "Silverware", sr: "Srebrnarija" },

  // Subcategories
  "subcategory.tables": { en: "Tables & Desks", sr: "Stolovi i Pisaći Stolovi" },
  "subcategory.seating": { en: "Seating", sr: "Nameštaj za Sedenje" },
  "subcategory.storage": { en: "Storage & Mirrors", sr: "Ormari i Ogledala" },
  "subcategory.portraits": { en: "Portraits", sr: "Portreti" },
  "subcategory.landscapes": { en: "Landscapes", sr: "Pejzaži" },
  "subcategory.stillLife": { en: "Still Life", sr: "Mrtva Priroda" },
  "subcategory.necklaces": { en: "Necklaces", sr: "Ogrlice" },
  "subcategory.rings": { en: "Rings", sr: "Prstenje" },
  "subcategory.earrings": { en: "Earrings", sr: "Minđuše" },
  "subcategory.vases": { en: "Vases & Urns", sr: "Vaze i Urne" },
  "subcategory.dinnerware": { en: "Dinnerware", sr: "Posuđe" },
  "subcategory.figurines": { en: "Figurines", sr: "Figurine" },
  "subcategory.mantel": { en: "Mantel Clocks", sr: "Satovi za Kamin" },
  "subcategory.grandfather": { en: "Grandfather Clocks", sr: "Podni Satovi" },
  "subcategory.pocket": { en: "Pocket Watches", sr: "Džepni Satovi" },
  "subcategory.flatware": { en: "Flatware", sr: "Pribor za Jelo" },
  "subcategory.teaSets": { en: "Tea & Coffee Sets", sr: "Servisi za Čaj i Kafu" },
  "subcategory.decorative": { en: "Decorative", sr: "Dekorativni Predmeti" },

  // Footer
  "footer.terms": { en: "Terms of Use", sr: "Uslovi Korišćenja" },
  "footer.privacy": { en: "Privacy Policy", sr: "Politika Privatnosti" },
  "footer.contact": { en: "Contact Us", sr: "Kontaktirajte Nas" },
  "footer.faq": { en: "FAQ", sr: "Česta Pitanja" },
  "footer.rights": { en: "All rights reserved", sr: "Sva prava zadržana" },
  "footer.newsletter": { en: "Subscribe to Newsletter", sr: "Pretplatite se na Bilten" },
  "footer.emailPlaceholder": { en: "Your email address", sr: "Vaša email adresa" },
  "footer.subscribe": { en: "Subscribe", sr: "Pretplati se" },

  // Admin Users
  manageUsers: { en: "Manage Users", sr: "Upravljanje Korisnicima" },
  createUser: { en: "Create New User", sr: "Kreiraj Novog Korisnika" },
  editUser: { en: "Edit User", sr: "Uredi Korisnika" },
  firstName: { en: "First Name", sr: "Ime" },
  lastName: { en: "Last Name", sr: "Prezime" },
  phoneOptional: { en: "Phone (optional)", sr: "Telefon (opciono)" },
  role: { en: "Role", sr: "Uloga" },
  user: { en: "User", sr: "Korisnik" },
  active: { en: "Active", sr: "Aktivan" },
  banned: { en: "Banned", sr: "Banovan" },
  cancel: { en: "Cancel", sr: "Otkaži" },
  create: { en: "Create", sr: "Kreiraj" },
  saveChanges: { en: "Save Changes", sr: "Sačuvaj Izmene" },
  createUserConfirmTitle: { en: "Create User?", sr: "Kreirati Korisnika?" },
  saveChangesConfirmTitle: { en: "Save Changes?", sr: "Sačuvati Izmene?" },
  userDetails: { en: "User Details", sr: "Detalji Korisnika" },
  joined: { en: "Joined:", sr: "Pridružio se:" },
  lastLogin: { en: "Last login:", sr: "Poslednji login:" },
  totalBids: { en: "Total Bids", sr: "Ukupno Ponuda" },
  wonAuctions: { en: "Won Auctions", sr: "Dobijene Aukcije" },
  bidHistory: { en: "Bid History", sr: "Istorija Ponuda" },
  won: { en: "Won", sr: "Dobijeno" },
  outbid: { en: "Outbid", sr: "Nadmašeno" },
  activeBid: { en: "Active", sr: "Aktivno" },
  noBidHistory: { en: "No bid history available", sr: "Nema istorije ponuda" },
  close: { en: "Close", sr: "Zatvori" },
  edit: { en: "Edit", sr: "Uredi" },
  deleteUserTitle: { en: "Delete User?", sr: "Obrisati Korisnika?" },
  delete: { en: "Delete", sr: "Obriši" },
  banUserTitle: { en: "Ban User?", sr: "Banovati Korisnika?" },
  unbanUserTitle: { en: "Unban User?", sr: "Odbanovati Korisnika?" },
  ban: { en: "Ban", sr: "Banuj" },
  unban: { en: "Unban", sr: "Odbanuj" },
  changeUserRoleTitle: { en: "Change User Role?", sr: "Promeniti Ulogu Korisnika?" },
  changeRole: { en: "Change Role", sr: "Promeni Ulogu" },
  deleteSelectedUsersTitle: { en: "Delete Selected Users?", sr: "Obrisati Selektovane Korisnike?" },
  banSelectedUsersTitle: { en: "Ban Selected Users?", sr: "Banovati Selektovane Korisnike?" },
  unbanSelectedUsersTitle: { en: "Unban Selected Users?", sr: "Odbanovati Selektovane Korisnike?" },
  changeRoleSelectedUsersTitle: { en: "Change Role for Selected Users?", sr: "Promeniti Ulogu Selektovanim Korisnicima?" },
  perPage: { en: "Per page:", sr: "Po stranici:" },
  showing: { en: "Showing", sr: "Prikazano" },
  of: { en: "of", sr: "od" },
  users: { en: "users", sr: "korisnika" },
  noUsersYet: { en: "No users yet", sr: "Nema korisnika" },
  createFirstUser: { en: "Create your first user to get started.", sr: "Kreirajte prvog korisnika da biste započeli." },
  addUser: { en: "Add User", sr: "Dodaj Korisnika" },
  selected: { en: "selected", sr: "selektovano" },
  noUsersFound: { en: "No users found", sr: "Nema pronađenih korisnika" },
  tryAdjustingSearch: { en: "Try adjusting your search or filter criteria.", sr: "Pokušajte da prilagodite pretragu ili kriterijume filtriranja." },
  userCreated: { en: "User created", sr: "Korisnik kreiran" },
  userCreatedDesc: { en: "User has been created successfully.", sr: "Korisnik je uspešno kreiran." },
  userUpdated: { en: "User updated", sr: "Korisnik ažuriran" },
  userUpdatedDesc: { en: "User has been updated successfully.", sr: "Korisnik je uspešno ažuriran." },
  userDeleted: { en: "User deleted", sr: "Korisnik obrisan" },
  userDeletedDesc: { en: "User has been deleted successfully.", sr: "Korisnik je uspešno obrisan." },
  statusUpdated: { en: "Status updated", sr: "Status ažuriran" },
  statusUpdatedDesc: { en: "User status has been updated.", sr: "Status korisnika je ažuriran." },
  roleUpdated: { en: "Role updated", sr: "Uloga ažurirana" },
  roleUpdatedDesc: { en: "User role has been updated.", sr: "Uloga korisnika je ažurirana." },
  actionNotAllowed: { en: "Action Not Allowed", sr: "Akcija nije dozvoljena" },
  cannotBanAdmin: { en: "Cannot ban an admin user. Change their role first.", sr: "Nije moguće banovati administratora. Prvo promenite njegovu ulogu." },
  alreadyBanned: { en: "This user is already banned.", sr: "Ovaj korisnik je već banovan." },
  alreadyActive: { en: "This user is already active.", sr: "Ovaj korisnik je već aktivan." },
  alreadyAdmin: { en: "This user is already an admin.", sr: "Ovaj korisnik je već administrator." },
  cannotChangeOnlyAdmin: { en: "Cannot change the role of the only admin. Please assign another admin first.", sr: "Nije moguće promeniti ulogu jedinog administratora. Prvo dodelite ulogu administratora drugom korisniku." },
  cannotDeleteOnlyAdmin: { en: "Cannot delete the only admin. Please assign another admin first.", sr: "Nije moguće obrisati jedinog administratora. Prvo dodelite ulogu administratora drugom korisniku." },
  banUserDescP1: { en: "Are you sure you want to ban", sr: "Da li ste sigurni da želite da banujete korisnika" },
  banUserDescP2: { en: "They will no longer be able to access their account.", sr: "Neće više moći da pristupi svom nalogu." },
  unbanUserDescP1: { en: "Are you sure you want to unban", sr: "Da li ste sigurni da želite da odbanujete korisnika" },
  unbanUserDescP2: { en: "They will regain access to their account.", sr: "Ponovo će moći da pristupi svom nalogu." },
  deleteUserDesc: { en: "This action cannot be undone.", sr: "Ova akcija se ne može poništiti." },
  deleteUserConfirmDesc: { en: "Are you sure you want to delete", sr: "Da li ste sigurni da želite da obrišete" },
  changeRoleUserDesc: { en: "role to", sr: "u" },
  changeRoleUserConfirmDesc: { en: "Are you sure you want to change", sr: "Da li ste sigurni da želite da promenite ulogu korisnika" },
  adminRole: { en: "Admin", sr: "Admin" },
  createUserConfirmDesc: { en: "Are you sure you want to create a new user", sr: "Da li ste sigurni da želite da kreirate novog korisnika" },
  withEmail: { en: "with email", sr: "sa emailom" },
  editUserConfirmDesc: { en: "Are you sure you want to save changes for", sr: "Da li ste sigurni da želite da sačuvate izmene za korisnika" },

  // Category Management Admin
  manageCategories: { en: "Manage Categories", sr: "Upravljanje Kategorijama" },
  noCategoriesYet: { en: "No Categories Yet", sr: "Nema Kategorija" },
  addFirstCategory: { en: "Add First Category", sr: "Dodaj Prvu Kategoriju" },
  youHaventCreatedAnyCategoriesYet: { en: "You haven't created any categories yet. Start by adding your first category to organize your products.", sr: "Još uvek niste kreirali nijednu kategoriju. Počnite dodavanjem prve kategorije za organizaciju proizvoda." },
  searchCategories: { en: "Search categories...", sr: "Pretraži kategorije..." },
  categoriesFound: { en: "categories found", sr: "kategorija pronađeno" },
  noCriteriaFoundTitle: { en: "No categories found", sr: "Nema pronađenih kategorija" },
  noCriteriaFoundDesc: { en: "No categories found for", sr: "Nema pronađenih kategorija za" },
  noProductsFoundTitle: { en: "No products found", sr: "Nema pronađenih proizvoda" },
  noProductsFoundDesc: { en: "No products found for", sr: "Nema pronađenih proizvoda za" },
  noCollectionsFoundTitle: { en: "No collections found", sr: "Nema pronađenih kolekcija" },
  noCollectionsFoundDesc: { en: "No collections found for", sr: "Nema pronađenih kolekcija za" },

  // Collection Form
  addCollection: { en: "Add Collection", sr: "Dodaj Kolekciju" },
  editCollection: { en: "Edit Collection", sr: "Izmeni Kolekciju" },
  addNewCollection: { en: "Add New Collection", sr: "Dodaj Novu Kolekciju" },
  nameSrLabel: { en: "Name (SR)", sr: "Naziv (SR)" },
  nameEnLabel: { en: "Name (EN)", sr: "Naziv (EN)" },
  descriptionSrLabel: { en: "Description (SR)", sr: "Opis (SR)" },
  descriptionEnLabel: { en: "Description (EN)", sr: "Opis (EN)" },
  lotNumberLabel: { en: "Collection Lot Number", sr: "Broj Lota Kolekcije" },
  startingPriceLabel: { en: "Starting Price (€)", sr: "Početna Cena (€)" },
  collectionCategory: { en: "Collection Category", sr: "Kategorija za Kolekciju" },
  selectCategory: { en: "Select collection category", sr: "Izaberite kategoriju za kolekciju" },
  collectionSubcategory: { en: "Collection Subcategory", sr: "Podkategorija za Kolekciju" },
  selectSubcategory: { en: "Select subcategory", sr: "Izaberite podkategoriju" },
  collectionImageLabel: { en: "Collection Image (optional)", sr: "Slika Kolekcije (opciono)" },
  clickToUploadCollection: { en: "Click to upload collection image", sr: "Kliknite za dodavanje slike kolekcije" },
  maxOneImageOptional: { en: "Max. 1 image (optional)", sr: "Maks. 1 slika (opciono)" },
  lotsInCollection: { en: "Lots in Collection", sr: "Lotovi u Kolekciji" },
  add: { en: "Add", sr: "Dodaj" },
  atLeastOneLotRequired: { en: "At least one lot is required to create a collection.", sr: "Potreban je barem jedan lot za kreiranje kolekcije." },
  lot: { en: "Lot", sr: "Lot" },
  nameSrLot: { en: "Name (SR) *", sr: "Naziv (SR) *" },
  nameEnLot: { en: "Name (EN) *", sr: "Naziv (EN) *" },
  descriptionSrLot: { en: "Description (SR) *", sr: "Opis (SR) *" },
  descriptionEnLot: { en: "Description (EN) *", sr: "Opis (EN) *" },
  image: { en: "Image", sr: "Slika" },
  requiredOneImage: { en: "Required (1 image)", sr: "Obavezno (1 slika)" },
  imageIsRequired: { en: "Image is required", sr: "Slika je obavezna" },
  updateCollectionBtn: { en: "Update Collection", sr: "Ažuriraj Kolekciju" },
  createCollectionBtn: { en: "Create Collection", sr: "Kreiraj Kolekciju" },

};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("sr");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
