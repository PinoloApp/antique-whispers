import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle,
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

// Mock data per period
const mockData: Record<TimePeriod, {
  metrics: { users: number; activeUsers: number; bids: number; revenue: number };
  changes: { users: number; activeUsers: number; bids: number; revenue: number };
  timeSeries: TimeSeriesPoint[];
}> = {
  '1D': {
    metrics: { users: 12, activeUsers: 8, bids: 47, revenue: 3200 },
    changes: { users: 20, activeUsers: 14.3, bids: -5.2, revenue: 8.7 },
    timeSeries: [
      { label: '00:00', users: 0, totalUsers: 102, revenue: 0 },
      { label: '04:00', users: 1, totalUsers: 105, revenue: 200 },
      { label: '08:00', users: 3, totalUsers: 112, revenue: 600 },
      { label: '12:00', users: 4, totalUsers: 118, revenue: 1100 },
      { label: '16:00', users: 2, totalUsers: 124, revenue: 800 },
      { label: '20:00', users: 2, totalUsers: 128, revenue: 500 },
    ],
  },
  '7D': {
    metrics: { users: 67, activeUsers: 42, bids: 312, revenue: 24500 },
    changes: { users: 12.5, activeUsers: 8.3, bids: 15.2, revenue: 22.1 },
    timeSeries: [
      { label: 'Pon', users: 8, totalUsers: 132, revenue: 3200 },
      { label: 'Uto', users: 12, totalUsers: 145, revenue: 4100 },
      { label: 'Sre', users: 10, totalUsers: 158, revenue: 3600 },
      { label: 'Čet', users: 9, totalUsers: 168, revenue: 2900 },
      { label: 'Pet', users: 14, totalUsers: 182, revenue: 4800 },
      { label: 'Sub', users: 8, totalUsers: 195, revenue: 3500 },
      { label: 'Ned', users: 6, totalUsers: 204, revenue: 2400 },
    ],
  },
  '1M': {
    metrics: { users: 245, activeUsers: 156, bids: 1340, revenue: 98700 },
    changes: { users: 18.2, activeUsers: 12.6, bids: 9.8, revenue: 25.4 },
    timeSeries: [
      { label: '1. ned', users: 52, totalUsers: 140, revenue: 18500 },
      { label: '2. ned', users: 68, totalUsers: 185, revenue: 26200 },
      { label: '3. ned', users: 61, totalUsers: 230, revenue: 24800 },
      { label: '4. ned', users: 64, totalUsers: 275, revenue: 29200 },
    ],
  },
  '1Y': {
    metrics: { users: 2840, activeUsers: 1620, bids: 15800, revenue: 1240000 },
    changes: { users: 35.2, activeUsers: 28.6, bids: 42.1, revenue: 55.3 },
    timeSeries: [
      { label: 'Jan', users: 180, totalUsers: 110, revenue: 78000 },
      { label: 'Feb', users: 195, totalUsers: 125, revenue: 82000 },
      { label: 'Mar', users: 220, totalUsers: 142, revenue: 95000 },
      { label: 'Apr', users: 210, totalUsers: 158, revenue: 88000 },
      { label: 'Maj', users: 240, totalUsers: 175, revenue: 102000 },
      { label: 'Jun', users: 260, totalUsers: 192, revenue: 115000 },
      { label: 'Jul', users: 235, totalUsers: 210, revenue: 98000 },
      { label: 'Avg', users: 245, totalUsers: 228, revenue: 108000 },
      { label: 'Sep', users: 270, totalUsers: 248, revenue: 118000 },
      { label: 'Okt', users: 280, totalUsers: 265, revenue: 125000 },
      { label: 'Nov', users: 310, totalUsers: 285, revenue: 142000 },
      { label: 'Dec', users: 195, totalUsers: 298, revenue: 89000 },
    ],
  },
  ALL: {
    metrics: { users: 4120, activeUsers: 2340, bids: 28500, revenue: 2180000 },
    changes: { users: 48.5, activeUsers: 38.2, bids: 56.7, revenue: 72.1 },
    timeSeries: [
      { label: '2022 Q1', users: 320, totalUsers: 105, revenue: 145000 },
      { label: '2022 Q2', users: 380, totalUsers: 118, revenue: 168000 },
      { label: '2022 Q3', users: 410, totalUsers: 132, revenue: 182000 },
      { label: '2022 Q4', users: 450, totalUsers: 148, revenue: 205000 },
      { label: '2023 Q1', users: 520, totalUsers: 165, revenue: 238000 },
      { label: '2023 Q2', users: 580, totalUsers: 182, revenue: 265000 },
      { label: '2023 Q3', users: 640, totalUsers: 198, revenue: 298000 },
      { label: '2023 Q4', users: 720, totalUsers: 218, revenue: 340000 },
      { label: '2024 Q1', users: 810, totalUsers: 238, revenue: 380000 },
      { label: '2024 Q2', users: 890, totalUsers: 255, revenue: 420000 },
      { label: '2024 Q3', users: 960, totalUsers: 275, revenue: 458000 },
      { label: '2024 Q4', users: 1040, totalUsers: 295, revenue: 510000 },
    ],
  },
};

const fixedCards = {
  pendingRevenue: 42700,
  refundedAmount: 18200,
  totalRevenue: 2180000,
  totalUsers: 4120,
};

interface ClosedAuction {
  id: number;
  title: { en: string; sr: string };
  date: string;
  lots: number;
  bidders: number;
  revenue: number;
}

const closedAuctions: ClosedAuction[] = [
  { id: 1, title: { en: 'Spring Antiques Fair', sr: 'Prolećni sajam antikviteta' }, date: '2024-03-15', lots: 48, bidders: 124, revenue: 87500 },
  { id: 2, title: { en: 'Fine Art & Jewelry', sr: 'Likovna umetnost i nakit' }, date: '2024-06-22', lots: 35, bidders: 89, revenue: 142000 },
  { id: 3, title: { en: 'Estate Collection Sale', sr: 'Prodaja zaostavštine' }, date: '2024-09-10', lots: 62, bidders: 156, revenue: 215000 },
  { id: 4, title: { en: 'Winter Classics', sr: 'Zimska klasika' }, date: '2024-11-28', lots: 41, bidders: 103, revenue: 98400 },
  { id: 5, title: { en: 'New Year Special', sr: 'Novogodišnji specijal' }, date: '2025-01-12', lots: 29, bidders: 72, revenue: 54300 },
];

const AdminAnalytics = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('7D');
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [selectedAuctionId, setSelectedAuctionId] = useState<number>(closedAuctions[0].id);

  const data = mockData[period];

  const periodLabels: Record<TimePeriod, string> = {
    '1D': '1D',
    '7D': '7D',
    '1M': '1M',
    '1Y': language === 'en' ? '1Y' : '1G',
    ALL: language === 'en' ? 'All' : 'Sve',
  };

  const metricCards: MetricCard[] = [
    {
      label: { en: 'Users', sr: 'Korisnici' },
      value: data.metrics.users.toLocaleString(),
      change: data.changes.users,
      icon: Users,
    },
    {
      label: { en: 'Active Users', sr: 'Aktivni korisnici' },
      value: data.metrics.activeUsers.toLocaleString(),
      change: data.changes.activeUsers,
      icon: UserCheck,
    },
    {
      label: { en: 'Bids', sr: 'Licitacije' },
      value: data.metrics.bids.toLocaleString(),
      change: data.changes.bids,
      icon: Gavel,
    },
    {
      label: { en: 'Revenue', sr: 'Prihod' },
      value: `€${data.metrics.revenue.toLocaleString()}`,
      change: data.changes.revenue,
      icon: Euro,
    },
  ];

  const fixed: FixedCard[] = [
    {
      label: { en: 'Pending Revenue', sr: 'Prihod na čekanju' },
      value: `€${fixedCards.pendingRevenue.toLocaleString()}`,
      badge: { en: 'Current', sr: 'Trenutno' },
      badgeIcon: Clock,
      icon: Clock,
    },
    {
      label: { en: 'Refunded Amount', sr: 'Refundirani iznos' },
      value: `€${fixedCards.refundedAmount.toLocaleString()}`,
      badge: { en: 'Total', sr: 'Ukupno' },
      badgeIcon: RotateCcw,
      icon: RotateCcw,
    },
    {
      label: { en: 'Revenue per User', sr: 'Prihod po korisniku' },
      value: `€${Math.round(fixedCards.totalRevenue / fixedCards.totalUsers).toLocaleString()}`,
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

  const lineChartData = data.timeSeries;

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

  return (
    <div>
      {/* Header + Period Toggle */}
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">
          {language === 'en' ? 'Analytics' : 'Analitika'}
        </h2>

      {/* Fixed Cards - Overall */}
      <div className="border border-border rounded-xl p-3 md:p-4 mb-6 bg-card/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {language === 'en' ? 'Finances' : 'Finansije'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 ml-4">
          {language === 'en' ? 'Current state — Since last page refresh' : 'Trenutno stanje — Od poslednjeg osvežavanja stranice'}
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

      {/* Period-filtered section */}
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

        {/* Filtered Metric Cards */}
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

        {/* Users vs Revenue Line Chart */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              {language === 'en' ? 'Users vs Revenue' : 'Korisnici i prihod'}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ left: 10, right: 10 }}>
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
          {/* Interactive Legend */}
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

      {/* Closed Auctions Section */}
      <div className="border border-border rounded-xl p-3 md:p-4 mt-6 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {language === 'en' ? 'Closed Auctions' : 'Zatvorene aukcije'}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between gap-2 mb-3 hover:bg-background hover:text-foreground">
              {closedAuctions.find((a) => a.id === selectedAuctionId)?.title[language]} — {closedAuctions.find((a) => a.id === selectedAuctionId)?.date}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50 w-[var(--radix-dropdown-menu-trigger-width)]">
            {closedAuctions.map((a) => (
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
          const auction = closedAuctions.find((a) => a.id === selectedAuctionId)!;
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
      </div>
    </div>
  );
};

export default AdminAnalytics;
