import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface AuctionCountdownProps {
  targetDate: Date;
}

const AuctionCountdown = ({ targetDate }: AuctionCountdownProps) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.minutes') },
    { value: timeLeft.seconds, label: t('countdown.seconds') },
  ];

  return (
    <div className="flex gap-3 sm:gap-6">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-card rounded-lg shadow-card flex items-center justify-center border border-border">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 text-gold text-xl font-bold hidden sm:block">
                :
              </span>
            )}
          </div>
          <span className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AuctionCountdown;
