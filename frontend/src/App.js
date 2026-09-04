import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import LocationSetup from "@/pages/LocationSetup";
import NameSetup from "@/pages/NameSetup";
import { getLocation, getUser } from "@/lib/storage";

function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    const loc = getLocation();
    setUser(u.name ? u : null);
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

  const toasterEl = (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        style: { fontFamily: "'Tajawal', sans-serif", direction: "rtl", textAlign: "right" },
      }}
    />
  );

  if (!user) {
    return (
      <>
        {toasterEl}
        <NameSetup onDone={setUser} />
      </>
    );
  }

  if (!location) {
    return (
      <>
        {toasterEl}
        <LocationSetup onLocationSet={setLocation} />
      </>
    );
  }

  return (
    <>
      {toasterEl}
      <HomePage
        user={user}
        location={location}
        onChangeLocation={() => setLocation(null)}
        onChangeUser={(u) => setUser(u)}
      />
    </>
  );
}

export default App;
