import { useState } from "react";
import axios from "axios";
import { MapPin, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveLocation } from "@/lib/storage";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const POPULAR_CITIES = [
  { city: "Makkah", country: "Saudi Arabia", label: "مكة المكرمة" },
  { city: "Madinah", country: "Saudi Arabia", label: "المدينة المنورة" },
  { city: "Riyadh", country: "Saudi Arabia", label: "الرياض" },
  { city: "Cairo", country: "Egypt", label: "القاهرة" },
  { city: "Istanbul", country: "Turkey", label: "اسطنبول" },
  { city: "Dubai", country: "United Arab Emirates", label: "دبي" },
  { city: "Amman", country: "Jordan", label: "عمّان" },
  { city: "Casablanca", country: "Morocco", label: "الدار البيضاء" },
];

export default function LocationSetup({ onLocationSet }) {
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await axios.get(`${API}/prayer-times`, { params: { latitude, longitude, method: 4 } });
          const loc = { type: "coords", latitude, longitude, label: "موقعك الحالي" };
          saveLocation(loc);
          toast.success("تم تحديد موقعك بنجاح");
          onLocationSet(loc);
        } catch (e) {
          toast.error("تعذّر جلب أوقات الصلاة لموقعك");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        toast.error("تم رفض الوصول للموقع. اختر مدينة يدوياً.");
      },
      { timeout: 10000 }
    );
  };

  const handleCityPick = async (entry) => {
    setLoading(true);
    try {
      await axios.get(`${API}/prayer-times/by-city`, {
        params: { city: entry.city, country: entry.country, method: 4 },
      });
      const loc = { type: "city", city: entry.city, country: entry.country, label: entry.label };
      saveLocation(loc);
      toast.success(`تم تحديد ${entry.label}`);
      onLocationSet(loc);
    } catch (e) {
      toast.error("تعذّر جلب أوقات الصلاة لهذه المدينة");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomCity = async () => {
    if (!city.trim() || !country.trim()) {
      toast.error("أدخل اسم المدينة والدولة");
      return;
    }
    await handleCityPick({ city: city.trim(), country: country.trim(), label: city.trim() });
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4" data-testid="location-setup-page">
      <div className="w-full max-w-lg">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="https://customer-assets-7cd3h4nn.emergentagent.net/job_salah-first-daily/artifacts/eajow6kq_ChatGPT%20Image%20Sep%209%2C%202026%2C%2011_57_37%20AM.png"
              alt="عَزَمْتَ"
              className="w-40 h-40 md:w-48 md:h-48 object-contain mb-3"
              data-testid="welcome-mascot"
            />
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">عَزَمْتَ</h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              رتّب يومك حول الصلوات الخمس
              <br />
              واكسب نقاطاً مع كل عمل صالح
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700 mb-2">حدّد موقعك لجلب أوقات الصلاة:</p>

            <Button
              onClick={handleGeolocation}
              disabled={loading}
              data-testid="use-geolocation-btn"
              className="w-full bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-2 active:translate-y-[2px] rounded-2xl px-6 py-6 font-bold text-base btn-3d disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 ms-2 animate-spin" /> : <MapPin className="w-5 h-5 ms-2" strokeWidth={2.5} />}
              استخدم موقعي الحالي
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-bold">أو اختر مدينة</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2" data-testid="popular-cities">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.city}
                  onClick={() => handleCityPick(c)}
                  disabled={loading}
                  data-testid={`city-${c.city.toLowerCase().replace(/\s/g, "-")}`}
                  className="bg-white border-2 border-gray-200 border-b-4 hover:border-emerald-400 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 btn-3d disabled:opacity-50"
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">أو ابحث عن مدينتك:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="المدينة"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="custom-city-input"
                  className="rounded-xl border-2"
                />
                <Input
                  placeholder="الدولة"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  data-testid="custom-country-input"
                  className="rounded-xl border-2"
                />
                <Button
                  onClick={handleCustomCity}
                  disabled={loading}
                  data-testid="custom-city-search-btn"
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-4"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          البيانات تُحفظ في جهازك فقط. لا حساب ولا تسجيل.
        </p>
      </div>
    </div>
  );
}
