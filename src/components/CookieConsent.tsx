import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = "cookie-consent";

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    setOpen(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Settings</DialogTitle>
          <DialogDescription>
            We use cookies to improve your experience on our site.{" "}
            <Link to="/cookie-policy" className="underline hover:text-primary">
              Learn more
            </Link>
          </DialogDescription>
        </DialogHeader>

        {showDetails ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="essential"
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="essential" className="text-sm font-medium leading-none">
                    Essential Cookies (Required)
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Necessary for authentication and core functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, functional: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="functional" className="text-sm font-medium leading-none cursor-pointer">
                    Functional Cookies
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Remember your preferences like theme settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="analytics" className="text-sm font-medium leading-none cursor-pointer">
                    Analytics Cookies
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us understand how visitors use our site.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={acceptEssential} className="w-full sm:w-auto">
                Essential Only
              </Button>
              <Button onClick={savePreferences} className="w-full sm:w-auto">
                Save Preferences
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetails(true)} className="w-full sm:w-auto">
              Customize
            </Button>
            <Button onClick={acceptAll} className="w-full sm:w-auto">
              Accept All
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
