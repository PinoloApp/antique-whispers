import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/authContexts";
import { Bell, Gavel, TrendingUp, AlertCircle, CheckCircle, Info, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { sr, enUS } from "date-fns/locale";
import { NotificationService } from "@/services/notificationService";

const Notifications = () => {
  const { language } = useLanguage();
  const { unreadCount, markAllAsRead, markAsRead: contextMarkAsRead } = useNotifications();
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 10;

  const fetchNotifications = async (isFirstPage = false) => {
    if (!currentUser) return;

    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await NotificationService.getNotificationsPaginated(
        currentUser.uid,
        PAGE_SIZE,
        isFirstPage ? null : lastVisible
      );

      if (isFirstPage) {
        setNotificationList(result.notifications);
      } else {
        setNotificationList(prev => [...prev, ...result.notifications]);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/");
      return;
    }
    fetchNotifications(true);
  }, [userLoggedIn, navigate, currentUser]);

  const handleMarkAsRead = async (id: string) => {
    await contextMarkAsRead(id);
    // Locally update to avoid waiting for sync or refetching
    setNotificationList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Locally update all visible as read
    setNotificationList(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const iconMap = {
    bid_placed: <Gavel className="w-5 h-5 text-primary" />,
    outbid: <AlertCircle className="w-5 h-5 text-destructive" />,
    winning: <TrendingUp className="w-5 h-5 text-gold" />,
    auction: <Gavel className="w-5 h-5 text-primary" />,
    won: <CheckCircle className="w-5 h-5 text-primary" />,
    info: <Info className="w-5 h-5 text-muted-foreground" />,
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: language === "sr" ? sr : enUS,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  {language === "en" ? "Notifications" : "Obaveštenja"}
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} {language === "en" ? "unread" : "nepročitano"}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleMarkAllAsRead}
              >
                <Check className="w-4 h-4" />
                {language === "en" ? "Mark all as read" : "Označi sve kao pročitano"}
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg border border-border" />
                ))}
              </div>
            ) : notificationList.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No notifications yet." : "Još uvek nemate obaveštenja."}
                </p>
              </div>
            ) : (
              <>
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    className={`flex gap-4 p-4 rounded-lg border transition-all cursor-pointer ${notification.read
                      ? "bg-background border-border hover:bg-muted/30"
                      : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      }`}
                  >
                    <div className="shrink-0 mt-0.5">{iconMap[notification.type as keyof typeof iconMap] || <Bell className="w-5 h-5 text-muted-foreground" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {language === "en" ? notification.titleEn || notification.title : notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0 uppercase">
                            {language === "en" ? "New" : "Novo"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {language === "en" ? notification.descriptionEn || notification.description : notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{getTimeAgo(notification.timestamp)}</p>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="pt-6 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => fetchNotifications()}
                      disabled={loadingMore}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {loadingMore
                        ? (language === "en" ? "Loading..." : "Učitavanje...")
                        : (language === "en" ? "Load More" : "Učitaj još")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
