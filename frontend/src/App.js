import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import LocationSetup from "@/pages/LocationSetup";
import { getLocation } from "@/lib/storage";

function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loc = getLocation();
    setLocation(loc);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-emerald-600 font-bold text-xl" data-testid="app-loading">
          جارٍ التحميل...
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: "'Tajawal', sans-serif",
            direction: "rtl",
            textAlign: "right",
          },
        }}
      />
      {!location ? (
        <LocationSetup onLocationSet={setLocation} />
      ) : (
        <HomePage location={location} onChangeLocation={() => setLocation(null)} />
      )}
    </>
  );
}

export default App;
