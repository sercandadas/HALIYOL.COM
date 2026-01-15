import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Truck, Shield, Clock, Star, Phone, Mail, MapPin, Calculator, Ruler, Plus, X, AlertCircle } from "lucide-react";

// Halı motifi SVG - basit ve etkili
const CarpetLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#F97316" />
    <rect x="8" y="10" width="24" height="20" rx="2" fill="white" />
    <rect x="12" y="14" width="16" height="12" rx="1" fill="#F97316" />
    <circle cx="20" cy="20" r="3" fill="white" />
  </svg>
);

const CARPET_TYPES = {
  normal: { name: "Normal Halı", price: 100 },
  shaggy: { name: "Shaggy Halı", price: 130 },
  silk: { name: "İpek Halı", price: 500 },
  antique: { name: "Antika Halı", price: 750 }
};

const LandingPage = () => {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [carpetList, setCarpetList] = useState([
    { id: 1, carpet_type: "normal", width: "", length: "" }
  ]);

  const addCarpet = () => {
    setCarpetList([...carpetList, { 
      id: Date.now(), 
      carpet_type: "normal", 
      width: "", 
      length: "" 
    }]);
  };

  const removeCarpet = (id) => {
    if (carpetList.length > 1) {
      setCarpetList(carpetList.filter(c => c.id !== id));
    }
  };

  const updateCarpet = (id, field, value) => {
    setCarpetList(carpetList.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateTotal = () => {
    let totalArea = 0;
    let totalPrice = 0;
    const details = [];

    carpetList.forEach(carpet => {
      if (carpet.width && carpet.length) {
        const area = parseFloat(carpet.width) * parseFloat(carpet.length);
        const price = area * CARPET_TYPES[carpet.carpet_type].price;
        totalArea += area;
        totalPrice += price;
        details.push({
          type: CARPET_TYPES[carpet.carpet_type].name,
          dimensions: `${carpet.width}x${carpet.length}`,
          area: area,
          price: price
        });
      }
    });

    return { totalArea, totalPrice, details };
  };

  const priceInfo = calculateTotal();

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <CarpetLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-slate-800 tracking-tight">HALIYOL</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#nasil-calisir" className="text-slate-600 hover:text-orange-500 transition-colors">Nasıl Çalışır</a>
              <a href="#hizmetler" className="text-slate-600 hover:text-orange-500 transition-colors">Hizmetler</a>
              <a href="#iletisim" className="text-slate-600 hover:text-orange-500 transition-colors">İletişim</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600" data-testid="login-btn">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6" data-testid="register-btn">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <CarpetLogo className="w-5 h-5" />
                Türkiye'nin Halı Yıkama Platformu
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Halınız <span className="text-orange-500">Tertemiz</span>,<br />
                Eviniz Pırıl Pırıl
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                Bulunduğunuz bölgedeki halı yıkama firmamız ile
                halınızı alıp, profesyonelce yıkayıp, evinize teslim edelim.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  data-testid="hero-cta-btn"
                >
                  Hemen Sipariş Ver
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-lg border-orange-300 hover:bg-orange-50 text-orange-600"
                  onClick={() => setPriceModalOpen(true)}
                  data-testid="hero-price-calc-btn"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Fiyat Hesapla
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-slate-600 text-sm">500+ Mutlu Müşteri</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />
                  ))}
                  <span className="text-slate-600 text-sm ml-2">4.7/5</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1600166898405-da9535204843?w=800" 
                  alt="Renkli halılar"
                  className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-orange-500/20 rounded-3xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-300/30 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="nasil-calisir" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Nasıl Çalışır?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Sadece 3 adımda halınızı profesyonel ellere teslim edin
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Phone className="w-8 h-8" />,
                title: "Sipariş Oluşturun",
                description: "İster arayın, İster halı bilgilerini ve adresinizi girin, anlık fiyat hesaplayın.",
                step: "01"
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Halınızı Teslim Edin",
                description: "Bölgenizdeki firmamız halınızı adresinizden alır.",
                step: "02"
              },
              {
                icon: <CarpetLogo className="w-8 h-8" />,
                title: "Tertemiz Teslim",
                description: "Profesyonel yıkama sonrası halınız kapınıza gelir.",
                step: "03"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative bg-orange-50 rounded-3xl p-8 card-hover group"
                data-testid={`step-card-${index + 1}`}
              >
                <div className="absolute top-6 right-6 text-6xl font-bold text-orange-200 group-hover:text-orange-300 transition-colors">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="hizmetler" className="py-24 px-4 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Halı Türleri & Fiyatlar</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Her türlü halı için profesyonel yıkama hizmeti
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: "Normal Halı", price: "100", desc: "Standart dokuma halılar" },
              { type: "Shaggy Halı", price: "130", desc: "Uzun tüylü halılar" },
              { type: "İpek Halı", price: "500", desc: "Hassas ipek halılar" },
              { type: "Antika Halı", price: "750", desc: "Değerli antika halılar" }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-orange-200 card-hover"
                data-testid={`price-card-${index + 1}`}
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.type}</h3>
                <p className="text-sm text-slate-500 mb-4">{item.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-orange-500">{item.price}</span>
                  <span className="text-slate-500">₺/m²</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              onClick={() => setPriceModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-4"
              data-testid="services-price-calc-btn"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Fiyat Hesapla
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section - Neden HALIYOL */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Neden <span className="text-orange-500">HALIYOL</span>?
              </h2>
              <p className="text-slate-600 mb-8">
                Güvenilir hizmet, şeffaf fiyatlandırma ve müşteri memnuniyeti odaklı yaklaşım.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600"
                alt="Modern oturma odası halı"
                className="rounded-2xl"
              />
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
              {[
                { icon: <Shield className="w-6 h-6" />, title: "İki kez yıkama", desc: "İlk yıkama kirlerden arındırır, İkinci yıkama hijyen sağlar." },
                { icon: <Clock className="w-6 h-6" />, title: "Hızlı Teslimat", desc: "Ortalama 3 gün içinde tertemiz halınız kapınızda." },
                { icon: <Star className="w-6 h-6" />, title: "Kalite Garantisi", desc: "Profesyonel ekipman ve uzman kadro ile hizmet." },
                { icon: <Truck className="w-6 h-6" />, title: "Ücretsiz Alım", desc: "Halınızı ücretsiz olarak adresinizden alıyoruz." }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-orange-50 rounded-2xl p-6 card-hover"
                  data-testid={`feature-card-${index + 1}`}
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="iletisim" className="py-16 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <CarpetLogo className="w-10 h-10" />
                <span className="text-xl font-bold text-white tracking-tight">HALIYOL</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Türkiye'nin en güvenilir halı yıkama platformu. Evinizin konforunu koruyoruz.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
              <div className="space-y-3">
                <a href="#nasil-calisir" className="block text-slate-400 hover:text-orange-400 transition-colors">Nasıl Çalışır</a>
                <a href="#hizmetler" className="block text-slate-400 hover:text-orange-400 transition-colors">Fiyatlar</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">İletişim</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>destekhaliyol@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>0850 123 45 55</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>İstanbul, Türkiye</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2024 HALIYOL. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>

      {/* Price Calculator Modal */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-orange-500" />
              Fiyat Hesaplama
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Carpet List */}
            {carpetList.map((carpet, index) => (
              <div key={carpet.id} className="bg-orange-50 rounded-xl p-4 relative">
                {carpetList.length > 1 && (
                  <button 
                    onClick={() => removeCarpet(carpet.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="text-sm font-medium text-slate-600 mb-3">Halı {index + 1}</div>
                <div className="space-y-3">
                  <Select
                    value={carpet.carpet_type}
                    onValueChange={(value) => updateCarpet(carpet.id, "carpet_type", value)}
                  >
                    <SelectTrigger data-testid={`calc-carpet-type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CARPET_TYPES).map(([key, { name, price }]) => (
                        <SelectItem key={key} value={key}>{name} ({price}₺/m²)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Genişlik (m)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="2"
                        value={carpet.width}
                        onChange={(e) => updateCarpet(carpet.id, "width", e.target.value)}
                        data-testid={`calc-width-${index}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Uzunluk (m)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="3"
                        value={carpet.length}
                        onChange={(e) => updateCarpet(carpet.id, "length", e.target.value)}
                        data-testid={`calc-length-${index}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Carpet Button */}
            <Button 
              variant="outline" 
              onClick={addCarpet}
              className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
              data-testid="add-carpet-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Başka Halı Ekle
            </Button>

            {/* Price Result */}
            {priceInfo.totalPrice > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4" data-testid="calc-result">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-orange-800">Hesaplama Sonucu</h3>
                </div>
                
                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  {priceInfo.details.map((detail, i) => (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>{detail.type} ({detail.dimensions}m)</span>
                      <span>{detail.area.toFixed(1)}m² = {detail.price.toFixed(0)}₺</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-orange-200 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{priceInfo.totalArea.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">m² Toplam Alan</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-500">{priceInfo.totalPrice.toFixed(0)} ₺</p>
                      <p className="text-xs text-slate-500">Tahmini Tutar</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">
                <strong>Not:</strong> Bu hesaplama tahmini bir değerdir. Net fiyat, halı firmamız tarafından yapılacak inceleme sonrası belirlenecektir.
              </p>
            </div>

            <Button 
              onClick={handleGetStarted}
              className="w-full bg-orange-500 hover:bg-orange-600 py-5 rounded-xl"
              data-testid="calc-order-btn"
            >
              Hemen Sipariş Ver
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
