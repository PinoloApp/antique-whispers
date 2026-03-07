import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  CreditCard,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded' | 'cancelled';
type BulkAction = 'paid' | 'pending' | 'cancelled' | 'refunded' | 'delete';

interface Payment {
  id: string;
  lotNumber: string;
  lotName: { en: string; sr: string };
  auctionTitle: { en: string; sr: string };
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: PaymentStatus;
  wonDate: string;
  paymentDeadline: string;
  paidDate?: string;
}

const initialPayments: Payment[] = [
  {
    id: 'PAY-001',
    lotNumber: 'Lot #002',
    lotName: { en: '18th Century Oil Portrait', sr: 'Uljani portret iz 18. veka' },
    auctionTitle: { en: 'Winter Fine Art & Antiques', sr: 'Zimska Aukcija Umetnosti i Antikviteta' },
    buyerName: 'Marko Petrović',
    buyerEmail: 'marko@example.com',
    amount: 12000,
    status: 'paid',
    wonDate: '2024-01-10',
    paymentDeadline: '2024-01-17',
    paidDate: '2024-01-14',
  },
  {
    id: 'PAY-002',
    lotNumber: 'Lot #006',
    lotName: { en: 'Georgian Sterling Silver Tea Set', sr: 'Gruzijski čajni set od sterling srebra' },
    auctionTitle: { en: 'Autumn Furniture Auction', sr: 'Jesenja Aukcija Nameštaja' },
    buyerName: 'Ana Jovanović',
    buyerEmail: 'ana@example.com',
    amount: 6200,
    status: 'pending',
    wonDate: '2024-01-18',
    paymentDeadline: '2024-01-25',
  },
  {
    id: 'PAY-003',
    lotNumber: 'Lot #003',
    lotName: { en: 'Art Deco Diamond Necklace', sr: 'Art Deko dijamantska ogrlica' },
    auctionTitle: { en: 'Estate Jewelry Collection', sr: 'Kolekcija Nakita iz Ostavština' },
    buyerName: 'Nikola Ilić',
    buyerEmail: 'nikola@example.com',
    amount: 28000,
    status: 'overdue',
    wonDate: '2024-01-05',
    paymentDeadline: '2024-01-12',
  },
  {
    id: 'PAY-004',
    lotNumber: 'Lot #001',
    lotName: { en: 'Victorian Mahogany Writing Desk', sr: 'Viktorijanski pisaći sto od mahagonija' },
    auctionTitle: { en: 'Winter Fine Art & Antiques', sr: 'Zimska Aukcija Umetnosti i Antikviteta' },
    buyerName: 'Jelena Đorđević',
    buyerEmail: 'jelena@example.com',
    amount: 4500,
    status: 'refunded',
    wonDate: '2024-01-08',
    paymentDeadline: '2024-01-15',
    paidDate: '2024-01-12',
  },
  {
    id: 'PAY-005',
    lotNumber: 'Lot #005',
    lotName: { en: 'French Ormolu Mantel Clock', sr: 'Francuski sat za kamin od ormolua' },
    auctionTitle: { en: 'Winter Fine Art & Antiques', sr: 'Zimska Aukcija Umetnosti i Antikviteta' },
    buyerName: 'Stefan Nikolić',
    buyerEmail: 'stefan@example.com',
    amount: 8500,
    status: 'pending',
    wonDate: '2024-01-20',
    paymentDeadline: '2024-01-27',
  },
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

const AdminPayments = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [confirmAction, setConfirmAction] = useState<{ paymentId: string; action: BulkAction } | null>(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<BulkAction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Paid' : 'Plaćeno'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Pending' : 'Na čekanju'}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Overdue' : 'Istekao rok'}
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Refunded' : 'Refundirano'}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">
            <Ban className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Cancelled' : 'Otkazano'}
          </Badge>
        );
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lotName[language].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.wonDate).getTime() - new Date(a.wonDate).getTime();
      case 'oldest':
        return new Date(a.wonDate).getTime() - new Date(b.wonDate).getTime();
      case 'amount-high':
        return b.amount - a.amount;
      case 'amount-low':
        return a.amount - b.amount;
      case 'buyer-az':
        return a.buyerName.localeCompare(b.buyerName);
      case 'buyer-za':
        return b.buyerName.localeCompare(a.buyerName);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Single item actions
  const handleStatusChange = () => {
    if (!confirmAction) return;
    const { paymentId, action } = confirmAction;
    if (action === 'delete') {
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(paymentId); return n; });
      toast({
        title: language === 'en' ? 'Payment Deleted' : 'Plaćanje Obrisano',
        description: language === 'en' ? `Payment ${paymentId} has been deleted.` : `Plaćanje ${paymentId} je obrisano.`,
      });
    } else {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: action, paidDate: action === 'paid' ? new Date().toISOString().split('T')[0] : p.paidDate }
            : p
        )
      );
      const statusLabels: Record<string, { en: string; sr: string }> = {
        paid: { en: 'paid', sr: 'plaćena' },
        pending: { en: 'pending', sr: 'na čekanju' },
        refunded: { en: 'refunded', sr: 'refundirana' },
        cancelled: { en: 'cancelled', sr: 'otkazana' },
      };
      toast({
        title: language === 'en' ? 'Status Updated' : 'Status Ažuriran',
        description: language === 'en'
          ? `Payment ${paymentId} marked as ${statusLabels[action]?.en}`
          : `Uplata ${paymentId} označena kao ${statusLabels[action]?.sr}`,
      });
    }
    setConfirmAction(null);
  };

  // Bulk actions
  const handleBulkAction = () => {
    if (!bulkConfirmAction || selectedIds.size === 0) return;
    const action = bulkConfirmAction;

    if (action === 'delete') {
      const count = selectedIds.size;
      setPayments((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      toast({
        title: language === 'en' ? 'Payments Deleted' : 'Plaćanja Obrisana',
        description: language === 'en' ? `${count} payment(s) deleted.` : `${count} plaćanje/a obrisano.`,
      });
    } else {
      const affected = payments.filter((p) => selectedIds.has(p.id) && p.status !== action).length;
      setPayments((prev) =>
        prev.map((p) =>
          selectedIds.has(p.id) && p.status !== action
            ? { ...p, status: action, paidDate: action === 'paid' ? new Date().toISOString().split('T')[0] : p.paidDate }
            : p
        )
      );
      const statusLabels: Record<string, { en: string; sr: string }> = {
        paid: { en: 'paid', sr: 'plaćena' },
        pending: { en: 'pending', sr: 'na čekanju' },
        refunded: { en: 'refunded', sr: 'refundirana' },
        cancelled: { en: 'cancelled', sr: 'otkazana' },
      };
      toast({
        title: language === 'en' ? 'Status Updated' : 'Status Ažuriran',
        description: language === 'en'
          ? `${affected} payment(s) marked as ${statusLabels[action]?.en}`
          : `${affected} plaćanje/a označeno kao ${statusLabels[action]?.sr}`,
      });
    }
    setSelectedIds(new Set());
    setBulkConfirmAction(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedPayments.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        pageIds.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        pageIds.forEach((id) => n.add(id));
        return n;
      });
    }
  };

  const allPageSelected = paginatedPayments.length > 0 && paginatedPayments.every((p) => selectedIds.has(p.id));
  const somePageSelected = paginatedPayments.some((p) => selectedIds.has(p.id)) && !allPageSelected;


  const getBulkDialogTitle = (action: BulkAction) => {
    const titles: Record<BulkAction, { en: string; sr: string }> = {
      paid: { en: 'Confirm Bulk Payment', sr: 'Potvrdi Grupnu Uplatu' },
      pending: { en: 'Mark as Pending', sr: 'Označiti kao Na čekanju' },
      cancelled: { en: 'Confirm Bulk Cancellation', sr: 'Potvrdi Grupno Otkazivanje' },
      refunded: { en: 'Confirm Bulk Refund', sr: 'Potvrdi Grupnu Refundaciju' },
      delete: { en: 'Confirm Bulk Deletion', sr: 'Potvrdi Grupno Brisanje' },
    };
    return titles[action][language];
  };

  const getBulkAffectedCount = (action: BulkAction) => {
    if (action === 'delete') return selectedIds.size;
    return payments.filter((p) => selectedIds.has(p.id) && p.status !== action).length;
  };

  const getBulkDialogDescription = (action: BulkAction) => {
    const affected = getBulkAffectedCount(action);
    const total = selectedIds.size;
    const skipped = total - affected;
    const skippedNote = skipped > 0
      ? (language === 'en' ? ` (${skipped} already have this status)` : ` (${skipped} već ima ovaj status)`)
      : '';
    const descriptions: Record<BulkAction, { en: string; sr: string }> = {
      paid: {
        en: `Mark ${affected} of ${total} selected payment(s) as paid?${skippedNote}`,
        sr: `Označiti ${affected} od ${total} izabranih plaćanja kao plaćena?${skippedNote}`,
      },
      pending: {
        en: `Mark ${affected} of ${total} selected payment(s) as pending?${skippedNote}`,
        sr: `Označiti ${affected} od ${total} izabranih plaćanja kao na čekanju?${skippedNote}`,
      },
      cancelled: {
        en: `Cancel ${affected} of ${total} selected payment(s)?${skippedNote}`,
        sr: `Otkazati ${affected} od ${total} izabranih plaćanja?${skippedNote}`,
      },
      refunded: {
        en: `Refund ${affected} of ${total} selected payment(s)?${skippedNote}`,
        sr: `Refundirati ${affected} od ${total} izabranih plaćanja?${skippedNote}`,
      },
      delete: {
        en: `Are you sure you want to delete ${affected} selected payment(s)? This action cannot be undone.`,
        sr: `Da li ste sigurni da želite da obrišete ${affected} izabranih plaćanja? Ova akcija se ne može poništiti.`,
      },
    };
    return descriptions[action][language];
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          {language === 'en' ? 'Payments' : 'Plaćanja'}
        </h2>
      </div>


      {payments.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {language === 'en' ? 'No payments yet' : 'Još nema plaćanja'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Payments will appear here when lots are won.' : 'Plaćanja će se pojaviti kada se lotovi osvoje.'}
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={language === 'en' ? 'Search by buyer, lot, ID...' : 'Pretraži po kupcu, lotu, ID-u...'}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Filter by status' : 'Filtriraj po statusu'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'en' ? 'All Statuses' : 'Svi Statusi'}</SelectItem>
                  <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Na čekanju'}</SelectItem>
                  <SelectItem value="paid">{language === 'en' ? 'Paid' : 'Plaćeno'}</SelectItem>
                  <SelectItem value="overdue">{language === 'en' ? 'Overdue' : 'Istekao rok'}</SelectItem>
                  <SelectItem value="refunded">{language === 'en' ? 'Refunded' : 'Refundirano'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'Otkazano'}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Sort by' : 'Sortiraj po'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{language === 'en' ? 'Newest First' : 'Najnovije prvo'}</SelectItem>
                  <SelectItem value="oldest">{language === 'en' ? 'Oldest First' : 'Najstarije prvo'}</SelectItem>
                  <SelectItem value="amount-high">{language === 'en' ? 'Amount: High to Low' : 'Iznos: Najviši prvo'}</SelectItem>
                  <SelectItem value="amount-low">{language === 'en' ? 'Amount: Low to High' : 'Iznos: Najniži prvo'}</SelectItem>
                  <SelectItem value="buyer-az">{language === 'en' ? 'Buyer: A-Z' : 'Kupac: A-Ž'}</SelectItem>
                  <SelectItem value="buyer-za">{language === 'en' ? 'Buyer: Z-A' : 'Kupac: Ž-A'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {filteredPayments.length} {language === 'en' ? 'payments found' : 'plaćanja pronađeno'}
                {totalPages > 1 && (
                  <span className="ml-2">
                    ({language === 'en' ? 'Page' : 'Stranica'} {currentPage} {language === 'en' ? 'of' : 'od'} {totalPages})
                  </span>
                )}
              </span>
              {totalPages > 1 && (
                <span>
                  {language === 'en' ? 'Showing' : 'Prikazano'} {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} {language === 'en' ? 'of' : 'od'} {filteredPayments.length}
                </span>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <div className={`rounded-lg border mb-4 px-4 py-3 ${selectedIds.size > 0 ? 'border-border' : 'border-transparent'}`}>
            {selectedIds.size > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">
                  {selectedIds.size} {language === 'en' ? 'selected' : 'selektovano'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Change Status' : 'Promeni Status'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(['paid', 'pending', 'cancelled', 'refunded'] as BulkAction[]).map((status) => {
                        const selectedPayments = payments.filter((p) => selectedIds.has(p.id));
                        const allHaveStatus = selectedPayments.every((p) => p.status === status);
                        const colorClass = status === 'paid' ? 'text-green-600' : status === 'pending' ? 'text-yellow-600' : status === 'cancelled' ? 'text-gray-600' : 'text-blue-600';
                        const Icon = status === 'paid' ? CheckCircle : status === 'pending' ? Clock : status === 'cancelled' ? Ban : XCircle;
                        const labels: Record<string, { en: string; sr: string }> = {
                          paid: { en: 'Paid', sr: 'Plaćeno' },
                          pending: { en: 'Pending', sr: 'Na čekanju' },
                          cancelled: { en: 'Cancelled', sr: 'Otkazano' },
                          refunded: { en: 'Refunded', sr: 'Refundirano' },
                        };
                        return (
                          <DropdownMenuItem
                            key={status}
                            className={allHaveStatus ? 'opacity-50 pointer-events-none' : colorClass}
                            disabled={allHaveStatus}
                            onClick={() => setBulkConfirmAction(status)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {labels[status][language]}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkConfirmAction('delete')}
                    className="text-destructive hover:text-destructive hover:bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Delete' : 'Obriši'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-9" />
            )}
          </div>

          {filteredPayments.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {language === 'en' ? 'No payments found' : 'Nema pronađenih plaćanja'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Try adjusting your search or filter criteria.' : 'Pokušajte da prilagodite pretragu ili kriterijume filtriranja.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {paginatedPayments.map((payment) => (
                  <div key={payment.id} className={`bg-card rounded-lg border p-4 ${selectedIds.has(payment.id) ? 'border-primary' : 'border-border'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedIds.has(payment.id)}
                          onCheckedChange={() => toggleSelect(payment.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{payment.lotName[language]}</div>
                          <div className="text-sm text-muted-foreground">{payment.lotNumber} · {payment.id}</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {payment.status !== 'paid' && (
                            <DropdownMenuItem className="text-green-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'paid' })}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Mark as Paid' : 'Označiti kao Plaćeno'}
                            </DropdownMenuItem>
                          )}
                          {payment.status !== 'pending' && (
                            <DropdownMenuItem className="text-yellow-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'pending' })}>
                              <Clock className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Mark as Pending' : 'Označiti kao Na čekanju'}
                            </DropdownMenuItem>
                          )}
                          {payment.status !== 'cancelled' && (
                            <DropdownMenuItem className="text-gray-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'cancelled' })}>
                              <Ban className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Mark as Cancelled' : 'Označiti kao Otkazano'}
                            </DropdownMenuItem>
                          )}
                          {payment.status !== 'refunded' && (
                            <DropdownMenuItem className="text-blue-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'refunded' })}>
                              <XCircle className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Mark as Refunded' : 'Označiti kao Refundirano'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'delete' })}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Delete' : 'Obriši'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">{payment.buyerName}</span> — {payment.buyerEmail}
                      </div>
                      <div className="text-muted-foreground">
                        {language === 'en' ? 'Deadline:' : 'Rok:'} {payment.paymentDeadline}
                      </div>
                      {payment.paidDate && (
                        <div className="text-muted-foreground">
                          {language === 'en' ? 'Paid:' : 'Plaćeno:'} {payment.paidDate}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-lg font-bold text-foreground">€{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-4 text-left">
                          <Checkbox
                            checked={allPageSelected}
                            ref={(el) => {
                              if (el) {
                                (el as unknown as HTMLInputElement).indeterminate = somePageSelected;
                              }
                            }}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Lot' : 'Lot'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Buyer' : 'Kupac'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Amount' : 'Iznos'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Deadline' : 'Rok'}
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Actions' : 'Akcije'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedPayments.map((payment) => (
                        <tr key={payment.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.has(payment.id) ? 'bg-muted/20' : ''}`}>
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={selectedIds.has(payment.id)}
                              onCheckedChange={() => toggleSelect(payment.id)}
                            />
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{payment.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-sm text-primary">{payment.lotNumber}</p>
                              <p className="text-xs text-muted-foreground">{payment.lotName[language]}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-sm text-foreground">{payment.buyerName}</p>
                              <p className="text-xs text-muted-foreground">{payment.buyerEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-foreground">€{payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{payment.paymentDeadline}</td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {payment.status !== 'paid' && (
                                  <DropdownMenuItem className="text-green-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'paid' })}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {language === 'en' ? 'Mark as Paid' : 'Označiti kao Plaćeno'}
                                  </DropdownMenuItem>
                                )}
                                {payment.status !== 'pending' && (
                                  <DropdownMenuItem className="text-yellow-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'pending' })}>
                                    <Clock className="w-4 h-4 mr-2" />
                                    {language === 'en' ? 'Mark as Pending' : 'Označiti kao Na čekanju'}
                                  </DropdownMenuItem>
                                )}
                                {payment.status !== 'cancelled' && (
                                  <DropdownMenuItem className="text-gray-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'cancelled' })}>
                                    <Ban className="w-4 h-4 mr-2" />
                                    {language === 'en' ? 'Mark as Cancelled' : 'Označiti kao Otkazano'}
                                  </DropdownMenuItem>
                                )}
                                {payment.status !== 'refunded' && (
                                  <DropdownMenuItem className="text-blue-600" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'refunded' })}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {language === 'en' ? 'Mark as Refunded' : 'Označiti kao Refundirano'}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ paymentId: payment.id, action: 'delete' })}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {language === 'en' ? 'Delete' : 'Obriši'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Per page:' : 'Po stranici:'}
                  </span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8">
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                          return false;
                        })
                        .map((page, index, arr) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && arr[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button variant={currentPage === page ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(page)} className="h-8 w-8">
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8">
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Showing' : 'Prikazano'} {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} {language === 'en' ? 'of' : 'od'} {filteredPayments.length} {language === 'en' ? 'payments' : 'plaćanja'}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Single Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'paid' && (language === 'en' ? 'Confirm Payment' : 'Potvrdi Uplatu')}
              {confirmAction?.action === 'pending' && (language === 'en' ? 'Mark as Pending' : 'Označiti kao Na čekanju')}
              {confirmAction?.action === 'cancelled' && (language === 'en' ? 'Confirm Cancellation' : 'Potvrdi Otkazivanje')}
              {confirmAction?.action === 'refunded' && (language === 'en' ? 'Confirm Refund' : 'Potvrdi Refundaciju')}
              {confirmAction?.action === 'delete' && (language === 'en' ? 'Confirm Deletion' : 'Potvrdi Brisanje')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'paid' && (language === 'en'
                ? `Mark payment ${confirmAction?.paymentId} as paid?`
                : `Označiti uplatu ${confirmAction?.paymentId} kao plaćenu?`)}
              {confirmAction?.action === 'pending' && (language === 'en'
                ? `Mark payment ${confirmAction?.paymentId} as pending?`
                : `Označiti uplatu ${confirmAction?.paymentId} kao na čekanju?`)}
              {confirmAction?.action === 'cancelled' && (language === 'en'
                ? `Cancel payment ${confirmAction?.paymentId}? This will mark it as cancelled.`
                : `Otkazati uplatu ${confirmAction?.paymentId}? Ovo će označiti uplatu kao otkazanu.`)}
              {confirmAction?.action === 'refunded' && (language === 'en'
                ? `Refund payment ${confirmAction?.paymentId}?`
                : `Refundirati uplatu ${confirmAction?.paymentId}?`)}
              {confirmAction?.action === 'delete' && (language === 'en'
                ? `Are you sure you want to delete payment ${confirmAction?.paymentId}? This action cannot be undone.`
                : `Da li ste sigurni da želite da obrišete uplatu ${confirmAction?.paymentId}? Ova akcija se ne može poništiti.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Otkaži'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              className={
                confirmAction?.action === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
                  confirmAction?.action === 'paid' ? 'bg-green-600 text-white hover:bg-green-600' :
                    confirmAction?.action === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-500' :
                      confirmAction?.action === 'cancelled' ? 'bg-gray-500 text-white hover:bg-gray-500' :
                        confirmAction?.action === 'refunded' ? 'bg-blue-600 text-white hover:bg-blue-600' : ''
              }
            >
              {confirmAction?.action === 'paid' && (language === 'en' ? 'Mark as Paid' : 'Označi kao Plaćeno')}
              {confirmAction?.action === 'pending' && (language === 'en' ? 'Mark as Pending' : 'Označi kao Na čekanju')}
              {confirmAction?.action === 'cancelled' && (language === 'en' ? 'Cancel Payment' : 'Otkaži Uplatu')}
              {confirmAction?.action === 'refunded' && (language === 'en' ? 'Refund' : 'Refundiraj')}
              {confirmAction?.action === 'delete' && (language === 'en' ? 'Delete' : 'Obriši')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Confirm Dialog */}
      <AlertDialog open={!!bulkConfirmAction} onOpenChange={(open) => !open && setBulkConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkConfirmAction && getBulkDialogTitle(bulkConfirmAction)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkConfirmAction && getBulkDialogDescription(bulkConfirmAction)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Otkaži'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                bulkConfirmAction === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
                  bulkConfirmAction === 'paid' ? 'bg-green-600 text-white hover:bg-green-600' :
                    bulkConfirmAction === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-500' :
                      bulkConfirmAction === 'cancelled' ? 'bg-gray-500 text-white hover:bg-gray-500' :
                        bulkConfirmAction === 'refunded' ? 'bg-blue-600 text-white hover:bg-blue-600' : ''
              }
            >
              {bulkConfirmAction === 'paid' && (language === 'en' ? `Mark as Paid (${getBulkAffectedCount('paid')})` : `Označi kao Plaćeno (${getBulkAffectedCount('paid')})`)}
              {bulkConfirmAction === 'pending' && (language === 'en' ? `Mark as Pending (${getBulkAffectedCount('pending')})` : `Označi kao Na čekanju (${getBulkAffectedCount('pending')})`)}
              {bulkConfirmAction === 'cancelled' && (language === 'en' ? `Cancel (${getBulkAffectedCount('cancelled')})` : `Otkaži (${getBulkAffectedCount('cancelled')})`)}
              {bulkConfirmAction === 'refunded' && (language === 'en' ? `Refund (${getBulkAffectedCount('refunded')})` : `Refundiraj (${getBulkAffectedCount('refunded')})`)}
              {bulkConfirmAction === 'delete' && (language === 'en' ? `Delete (${selectedIds.size})` : `Obriši (${selectedIds.size})`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPayments;
