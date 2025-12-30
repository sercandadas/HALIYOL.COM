import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Phone, Building2, MapPin } from "lucide-react";

// Halı Logo - basit ve etkili
const CarpetLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#F97316" />
    <rect x="8" y="10" width="24" height="20" rx="2" fill="white" />
    <rect x="12" y="14" width="16" height="12" rx="1" fill="#F97316" />
    <circle cx="20" cy="20" r="3" fill="white" />
  </svg>
);
import { API } from "@/App";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "login");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: searchParams.get("role") || "customer",
    city: "",
    district: "",
    address: "",
    company_name: "",
    service_areas: []
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (registerData.city) {
      fetchDistricts(registerData.city);
    }
  }, [registerData.city]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API}/locations/cities`);
      setCities(response.data.cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchDistricts = async (city) => {
    try {
      const response = await axios.get(`${API}/locations/districts/${city}`);
      setDistricts(response.data.districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      const { user } = response.data;
      toast.success("Giriş başarılı!");
      
      if (user.role === "company") {
        navigate("/company", { state: { user } });
      } else if (user.role === "admin") {
        navigate("/admin", { state: { user } });
      } else {
        navigate("/dashboard", { state: { user } });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Giriş başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      const { user } = response.data;
      toast.success("Kayıt başarılı!");
      
      if (user.role === "company") {
        navigate("/company", { state: { user } });
      } else {
        navigate("/dashboard", { state: { user } });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Kayıt başarısız!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <CarpetLogo className="w-10 h-10" />
            <span className="text-xl font-bold text-slate-800 tracking-tight">HALIYOL</span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="login-tab">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Kayıt Ol</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Tekrar Hoş Geldiniz</h1>
                  <p className="text-slate-600">Hesabınıza giriş yapın</p>
                </div>

                {/* Google Login */}
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full py-6 rounded-xl border-stone-300"
                  onClick={handleGoogleLogin}
                  data-testid="google-login-btn"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google ile Giriş Yap
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-stone-50 text-slate-500">veya</span>
                  </div>
                </div>

                {/* Email Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">E-posta</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ornek@email.com"
                        className="pl-10 py-6 rounded-xl"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="login-password">Şifre</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 py-6 rounded-xl"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl text-lg"
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Hesap Oluşturun</h1>
                  <p className="text-slate-600">Hemen ücretsiz kaydolun</p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, role: "customer" })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registerData.role === "customer" 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                    data-testid="role-customer-btn"
                  >
                    <User className={`w-6 h-6 mx-auto mb-2 ${registerData.role === "customer" ? "text-orange-500" : "text-slate-400"}`} />
                    <span className={`font-medium ${registerData.role === "customer" ? "text-orange-500" : "text-slate-600"}`}>
                      Müşteri
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, role: "company" })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registerData.role === "company" 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                    data-testid="role-company-btn"
                  >
                    <Building2 className={`w-6 h-6 mx-auto mb-2 ${registerData.role === "company" ? "text-orange-500" : "text-slate-400"}`} />
                    <span className={`font-medium ${registerData.role === "company" ? "text-orange-500" : "text-slate-600"}`}>
                      Firma
                    </span>
                  </button>
                </div>

                {/* Google Register */}
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full py-6 rounded-xl border-stone-300"
                  onClick={handleGoogleLogin}
                  data-testid="google-register-btn"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google ile Kayıt Ol
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-stone-50 text-slate-500">veya</span>
                  </div>
                </div>

                {/* Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-name">Ad Soyad</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Ad Soyad"
                          className="pl-10 py-5 rounded-xl"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          required
                          data-testid="register-name-input"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-phone">Telefon</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="05XX XXX XX XX"
                          className="pl-10 py-5 rounded-xl"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          data-testid="register-phone-input"
                        />
                      </div>
                    </div>
                  </div>

                  {registerData.role === "company" && (
                    <div>
                      <Label htmlFor="company-name">Firma Adı</Label>
                      <div className="relative mt-1">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="company-name"
                          type="text"
                          placeholder="Firma Adı"
                          className="pl-10 py-5 rounded-xl"
                          value={registerData.company_name}
                          onChange={(e) => setRegisterData({ ...registerData, company_name: e.target.value })}
                          required={registerData.role === "company"}
                          data-testid="register-company-name-input"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="register-email">E-posta</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ornek@email.com"
                        className="pl-10 py-5 rounded-xl"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-password">Şifre</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 py-5 rounded-xl"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>İl</Label>
                      <Select
                        value={registerData.city}
                        onValueChange={(value) => setRegisterData({ ...registerData, city: value, district: "" })}
                      >
                        <SelectTrigger className="mt-1 py-5 rounded-xl" data-testid="register-city-select">
                          <SelectValue placeholder="İl Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>İlçe</Label>
                      <Select
                        value={registerData.district}
                        onValueChange={(value) => setRegisterData({ ...registerData, district: value })}
                        disabled={!registerData.city}
                      >
                        <SelectTrigger className="mt-1 py-5 rounded-xl" data-testid="register-district-select">
                          <SelectValue placeholder="İlçe Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-address">Adres</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        id="register-address"
                        type="text"
                        placeholder="Açık adres"
                        className="pl-10 py-5 rounded-xl"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        data-testid="register-address-input"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl text-lg"
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.pexels.com/photos/38325/vacuum-cleaner-carpet-cleaner-housework-housekeeping-38325.jpeg"
          alt="Halı temizleme"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-orange-500/20" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Halınız Tertemiz,<br />Eviniz Pırıl Pırıl
          </h2>
          <p className="text-white/80">
            HALIYOL ile profesyonel halı yıkama hizmetine hemen ulaşın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
