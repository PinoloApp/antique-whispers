import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { PaymentService } from '@/services/paymentService';
import { Payment } from '@/contexts/DataContext';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  Gavel,
  Euro,
  Clock,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ChevronDown,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { isAfter, isBefore, subDays, subMonths, subYears, startOfDay, endOfDay, differenceInDays, format } from 'date-fns';

type TimePeriod = '1D' | '7D' | '1M' | '1Y' | 'ALL';

interface MetricCard {
  label: { en: string; sr: string };
  value: string;
  change: number;
  icon: React.ElementType;
}

interface FixedCard {
  label: { en: string; sr: string };
  value: string;
  badge: { en: string; sr: string };
  badgeIcon: React.ElementType;
  icon: React.ElementType;
}

interface TimeSeriesPoint {
  label: string;
  users: number;
  totalUsers: number;
  revenue: number;
}

const getPeriodDates = (period: TimePeriod) => {
  const now = new Date();
  let start: Date;
  let prevStart: Date;

  switch (period) {
    case '1D':
      start = subDays(now, 1);
      prevStart = subDays(now, 2);
      break;
    case '7D':
      start = subDays(now, 7);
      prevStart = subDays(now, 14);
      break;
    case '1M':
      start = subMonths(now, 1);
      prevStart = subMonths(now, 2);
      break;
    case '1Y':
      start = subYears(now, 1);
      prevStart = subYears(now, 2);
      break;
    case 'ALL':
      start = new Date('2020-01-01');
      prevStart = new Date('1970-01-01');
      break;
    default:
      start = subDays(now, 7);
      prevStart = subDays(now, 14);
  }

  return { start, prevStart, end: now, prevEnd: start };
};

const getPercentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const AdminAnalytics = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('7D');
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    return PaymentService.subscribeToAll(setPayments);
  }, []);

  // Timezone helper for Belgrade
  const formatInBelgrade = (date: Date, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'sr-RS', {
      ...options,
      timeZone: 'Europe/Belgrade'
    }).format(date);
  };

  const { auctions, bids, products, collectionProducts } = useData();
  const { users } = useAdminUsers();

  const allProducts = useMemo(() => [...products, ...collectionProducts], [products, collectionProducts]);

  const { currentMetrics, previousMetrics, timeSeries, fixedStats, closedAuctionsData } = useMemo(() => {
    const dates = getPeriodDates(period);
    
    // Closed Auctions (Globally)
    const closedAuctionsList = auctions
      .filter(a => a.status === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    // Analytics computation
    const withinPeriod = (date: Date, start: Date, end: Date) => isAfter(date, start) && isBefore(date, end);

    const calculateMetrics = (start: Date, end: Date) => {
      const periodUsers = users.filter(u => withinPeriod(u.createdAt, start, end));
      const periodBids = bids.filter(b => b.timestamp && withinPeriod(b.timestamp, start, end));
      
      const activeUsers = users.filter(u => {
        const loginInPeriod = u.lastLoginAt && withinPeriod(u.lastLoginAt, start, end);
        const bidInPeriod = periodBids.some(b => b.bidderEmail === u.email);
        return loginInPeriod || bidInPeriod;
      });

      const periodAuctions = closedAuctionsList.filter(a => withinPeriod(new Date(a.endDate), start, end));
      
      const periodRevenue = payments
        .filter(p => p.status === 'paid' && p.paidDate && withinPeriod(new Date(p.paidDate), start, end))
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        users: periodUsers.length,
        activeUsers: activeUsers.length,
        bids: periodBids.length,
        revenue: periodRevenue,
      };
    };

    const current = calculateMetrics(dates.start, dates.end);
    const prev = calculateMetrics(dates.prevStart, dates.prevEnd);

    // Fixed Stats (Totals)
    const fixed = {
      pendingRevenue: payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
      totalRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      totalUsers: users.length,
    };

    // Closed Auctions details for dropdown
    const closedData = closedAuctionsList.map(a => {
      const auctionItems = allProducts.filter(p => p.auctionId === a.id);
      const auctionBids = bids.filter(b => b.auctionId === a.id);
      let rev = 0;
      auctionItems.forEach(item => { if (item.currentBid) rev += item.currentBid; });
      const uniqueBidders = new Set(auctionBids.map(b => b.bidderEmail)).size;
      return {
        id: a.id,
        title: a.title,
        date: formatInBelgrade(new Date(a.endDate), { day: '2-digit', month: '2-digit', year: 'numeric' }),
        lots: a.lotIds.length + a.collectionIds.length,
        bidders: uniqueBidders,
        revenue: rev
      };
    });

    // TimeSeries computation
    let seriesPoints: TimeSeriesPoint[] = [];
    const diffDays = differenceInDays(dates.end, dates.start);
    
    let runningUsers = users.filter(u => isBefore(u.createdAt, dates.start)).length;

    if (period === '1D') {
      for (let i = 0; i < 24; i += 4) {
        const pointStart = new Date(dates.start.getTime() + i * 60 * 60 * 1000);
        const pointEnd = new Date(dates.start.getTime() + (i + 4) * 60 * 60 * 1000);
        const { users: newU, revenue: rev } = calculateMetrics(pointStart, pointEnd);
        runningUsers += newU;
        seriesPoints.push({ 
          label: formatInBelgrade(pointStart, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }), 
          users: newU, 
          totalUsers: runningUsers, 
          revenue: rev 
        });
      }
    } else if (period === '7D' || period === '1M') {
      const step = period === '7D' ? 1 : Math.ceil(diffDays / 4);
      for (let i = 0; i < diffDays; i += step) {
        const pointStart = startOfDay(new Date(dates.start.getTime() + i * 24 * 60 * 60 * 1000));
        const pointEnd = endOfDay(new Date(dates.start.getTime() + (i + step - 1) * 24 * 60 * 60 * 1000));
        const { users: newU, revenue: rev } = calculateMetrics(pointStart, pointEnd);
        runningUsers += newU;
        seriesPoints.push({ 
          label: formatInBelgrade(pointStart, { day: '2-digit', month: '2-digit' }), 
          users: newU, 
          totalUsers: runningUsers, 
          revenue: rev 
        });
      }
    } else { // 1Y or ALL
      const stepMonths = period === '1Y' ? 1 : Math.max(1, Math.ceil(diffDays / 365));
      const chunks = period === '1Y' ? 12 : 10; // rough representation
      for (let i = 0; i < chunks; i++) {
        const pointStart = subMonths(dates.end, stepMonths * (chunks - i));
        const pointEnd = subMonths(dates.end, stepMonths * (chunks - i - 1));
        const { users: newU, revenue: rev } = calculateMetrics(pointStart, pointEnd);
        runningUsers += newU;
        seriesPoints.push({ 
          label: formatInBelgrade(pointEnd, { month: 'short', year: '2-digit' }), 
          users: newU, 
          totalUsers: runningUsers, 
          revenue: rev 
        });
      }
    }

    return { currentMetrics: current, previousMetrics: prev, timeSeries: seriesPoints, fixedStats: fixed, closedAuctionsData: closedData };
  }, [period, auctions, bids, users, allProducts, payments]);

  const metricCards: MetricCard[] = [
    {
      label: { en: 'Users', sr: 'Korisnici' },
      value: currentMetrics.users.toLocaleString(),
      change: getPercentChange(currentMetrics.users, previousMetrics.users),
      icon: Users,
    },
    {
      label: { en: 'Active Users', sr: 'Aktivni korisnici' },
      value: currentMetrics.activeUsers.toLocaleString(),
      change: getPercentChange(currentMetrics.activeUsers, previousMetrics.activeUsers),
      icon: UserCheck,
    },
    {
      label: { en: 'Bids', sr: 'Licitacije' },
      value: currentMetrics.bids.toLocaleString(),
      change: getPercentChange(currentMetrics.bids, previousMetrics.bids),
      icon: Gavel,
    },
    {
      label: { en: 'Revenue', sr: 'Prihod' },
      value: `€${currentMetrics.revenue.toLocaleString()}`,
      change: getPercentChange(currentMetrics.revenue, previousMetrics.revenue),
      icon: Euro,
    },
  ];

  const fixed = [
    {
      label: { en: 'Pending Revenue', sr: 'Prihod na čekanju' },
      value: `€${fixedStats.pendingRevenue.toLocaleString()}`,
      badge: { en: 'Current', sr: 'Trenutno' },
      badgeIcon: Clock,
      icon: Clock,
    },
    {
      label: { en: 'Refunded Amount', sr: 'Refundirani iznos' },
      value: `€${fixedStats.refundedAmount.toLocaleString()}`,
      badge: { en: 'Total', sr: 'Ukupno' },
      badgeIcon: RotateCcw,
      icon: RotateCcw,
    },
    {
      label: { en: 'Revenue per User', sr: 'Prihod po korisniku' },
      value: `€${fixedStats.totalUsers > 0 ? Math.round(fixedStats.totalRevenue / fixedStats.totalUsers).toLocaleString() : 0}`,
      badge: { en: 'Total', sr: 'Ukupno' },
      badgeIcon: TrendingUp,
      icon: TrendingUp,
    },
  ];

  const formatRevenue = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val}`;
  };

  const toggleLine = (dataKey: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const legendItems = [
    { dataKey: 'users', label: language === 'en' ? 'New Users' : 'Novi korisnici', color: 'hsl(var(--secondary))' },
    { dataKey: 'totalUsers', label: language === 'en' ? 'Total Users' : 'Ukupno korisnika', color: '#3b82f6' },
    { dataKey: 'revenue', label: language === 'en' ? 'Revenue' : 'Prihod', color: 'hsl(var(--primary))' },
  ];

  const periodLabels: Record<TimePeriod, string> = {
    '1D': '1D',
    '7D': '7D',
    '1M': '1M',
    '1Y': language === 'en' ? '1Y' : '1G',
    ALL: language === 'en' ? 'All' : 'Sve',
  };

  return (
    <div>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">
        {language === 'en' ? 'Analytics' : 'Analitika'}
      </h2>

      <div className="border border-border rounded-xl p-3 md:p-4 mb-6 bg-card/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {language === 'en' ? 'Finances' : 'Finansije'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 ml-4">
          {language === 'en' ? 'Current state — Since last page refresh' : 'Trenutno stanje — Rad ukupnog sistema'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {fixed.map((f) => (
            <Card key={f.label.en}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <f.icon className="w-4 h-4" />
                  <span className="text-xs">{f.label[language]}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{f.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-3 md:p-4 mb-6 bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {language === 'en' ? 'Filtered by period' : 'Filtrirano po periodu'}
            </span>
          </div>
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {(['1D', '7D', '1M', '1Y', 'ALL'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
          {metricCards.map((m) => (
            <Card key={m.label.en}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <m.icon className="w-4 h-4" />
                  <span className="text-xs">{m.label[language]}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {m.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${m.change >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {m.change >= 0 ? '+' : ''}{m.change}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              {language === 'en' ? 'Users vs Revenue' : 'Korisnici i prihod'}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{ value: language === 'en' ? 'Users' : 'Korisnici', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => formatRevenue(v)}
                  tick={{ fontSize: 11 }}
                  label={{ value: language === 'en' ? 'Revenue' : 'Prihod', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `€${value.toLocaleString()}` : value,
                    name === 'revenue'
                      ? (language === 'en' ? 'Revenue' : 'Prihod')
                      : name === 'totalUsers'
                        ? (language === 'en' ? 'Total Users' : 'Ukupno korisnika')
                        : (language === 'en' ? 'New Users' : 'Novi korisnici'),
                  ]}
                />
                <Line yAxisId="left" type="monotone" dataKey="users" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} hide={hiddenLines.has('users')} />
                <Line yAxisId="left" type="monotone" dataKey="totalUsers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} hide={hiddenLines.has('totalUsers')} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} hide={hiddenLines.has('revenue')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            {legendItems.map((item) => (
              <button
                key={item.dataKey}
                onClick={() => toggleLine(item.dataKey)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${
                  hiddenLines.has(item.dataKey) ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <span
                  className="inline-block w-3 h-[3px] rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
        </Card>
      </div>

      <div className="border border-border rounded-xl p-3 md:p-4 mt-6 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {language === 'en' ? 'Closed Auctions' : 'Zatvorene aukcije'}
          </span>
        </div>
        {closedAuctionsData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'en' ? 'No completed auctions yet.' : 'Još uvek nema završenih aukcija.'}
          </p>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-2 mb-3 hover:bg-background hover:text-foreground">
                  {selectedAuctionId 
                    ? closedAuctionsData.find(a => a.id === selectedAuctionId)?.title[language] + ' — ' + closedAuctionsData.find(a => a.id === selectedAuctionId)?.date 
                    : (language === 'en' ? 'Select auction...' : 'Izaberi aukciju...')}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover z-50 w-[var(--radix-dropdown-menu-trigger-width)]">
                {closedAuctionsData.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => setSelectedAuctionId(a.id)}
                    className={selectedAuctionId === a.id ? 'bg-accent' : ''}
                  >
                    {a.title[language]} — {a.date}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(() => {
              const currentSelect = selectedAuctionId || closedAuctionsData[0]?.id;
              const auction = closedAuctionsData.find((a) => a.id === currentSelect);
              if (!auction) return null;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-xs">{language === 'en' ? 'Lots' : 'Lotovi'}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{auction.lots}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">{language === 'en' ? 'Bidders' : 'Ponuđači'}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{auction.bidders}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Euro className="w-4 h-4" />
                        <span className="text-xs">{language === 'en' ? 'Revenue' : 'Prihod'}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">€{auction.revenue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
