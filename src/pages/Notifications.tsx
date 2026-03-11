import { useEffect } from "react";
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

const Notifications = () => {
  const { language } = useLanguage();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/");
    }
  }, [userLoggedIn, navigate]);

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
                onClick={markAllAsRead}
              >
                <Check className="w-4 h-4" />
                {language === "en" ? "Mark all as read" : "Označi sve kao pročitano"}
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No notifications yet." : "Još uvek nemate obaveštenja."}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`flex gap-4 p-4 rounded-lg border transition-all cursor-pointer ${notification.read
                    ? "bg-background border-border hover:bg-muted/30"
                    : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    }`}
                >
                  <div className="shrink-0 mt-0.5">{iconMap[notification.type] || <Bell className="w-5 h-5 text-muted-foreground" />}</div>
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
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
