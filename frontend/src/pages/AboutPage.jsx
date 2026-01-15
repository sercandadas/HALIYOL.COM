import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Shield, Users, Target } from "lucide-react";

const CarpetLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#F97316" />
    <rect x="8" y="10" width="24" height="20" rx="2" fill="white" />
    <rect x="12" y="14" width="16" height="12" rx="1" fill="#F97316" />
    <circle cx="20" cy="20" r="3" fill="white" />
  </svg>
);

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <CarpetLogo className="w-10 h-10" />
              <span className="text-2xl font-bold text-slate-800">HALIYOL</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">Hakkımızda</h1>
          <p className="text-xl text-slate-600">
            Türkiye'nin en güvenilir dijital halı yıkama platformu
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Hikayemiz</h2>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                HALIYOL, halı yıkama sektöründe dijital dönüşümün öncüsü olarak 2024 yılında kuruldu. 
                Amacımız, geleneksel halı yıkama hizmetini modern teknoloji ile buluşturarak müşterilerimize 
                en kaliteli ve güvenilir hizmeti sunmaktır.
              </p>
              <p>
                Platformumuz üzerinden müşteriler, halılarını temizletmek için kolayca sipariş verebilir, 
                firmalar siparişleri yönetebilir ve tüm süreç şeffaf bir şekilde takip edilebilir.
              </p>
              <p>
                Bugün yüzlerce firma ve binlerce mutlu müşteri ile Türkiye'nin dört bir yanında hizmet veriyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Değerlerimiz</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Güvenilirlik</h3>
              <p className="text-slate-600">
                Halılarınızı güvenle teslim edebileceğiniz, sigortalı ve garantili hizmet
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Kalite</h3>
              <p className="text-slate-600">
                Profesyonel ekipman ve uzman kadro ile en yüksek kalite standartları
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Müşteri Memnuniyeti</h3>
              <p className="text-slate-600">
                Her adımda müşteri memnuniyetini ön planda tutan hizmet anlayışı
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Şeffaflık</h3>
              <p className="text-slate-600">
                Net fiyatlandırma, sipariş takibi ve açık iletişim
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Rakamlarla HALIYOL</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-orange-100">Anlaşmalı Firma</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">10K+</div>
                <div className="text-orange-100">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50K+</div>
                <div className="text-orange-100">Yıkanan Halı</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">81</div>
                <div className="text-orange-100">İl Kapsamı</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CarpetLogo className="w-8 h-8" />
                <span className="text-xl font-bold">HALIYOL</span>
              </div>
              <p className="text-slate-400">
                Halılarınız için en iyi yıkama hizmeti
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-slate-400 hover:text-white transition-colors">Ana Sayfa</Link>
                <Link to="/about" className="block text-slate-400 hover:text-white transition-colors">Hakkımızda</Link>
                <Link to="/support" className="block text-slate-400 hover:text-white transition-colors">Yardım & Destek</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <div className="space-y-2 text-slate-400">
                <p>Email: info@haliyol.com</p>
                <p>Tel: 0850 123 45 67</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 HALIYOL. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;