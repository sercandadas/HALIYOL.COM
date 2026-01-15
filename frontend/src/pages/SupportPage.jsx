import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Shield, Lock, Cookie } from "lucide-react";

const CarpetLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#F97316" />
    <rect x="8" y="10" width="24" height="20" rx="2" fill="white" />
    <rect x="12" y="14" width="16" height="12" rx="1" fill="#F97316" />
    <circle cx="20" cy="20" r="3" fill="white" />
  </svg>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-left">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
          <p className="text-slate-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

const SupportPage = () => {
  const [activeSection, setActiveSection] = useState("faq");

  const faqs = [
    {
      question: "Halılarımı nasıl sipariş verebilirim?",
      answer: "Ana sayfadaki 'Sipariş Ver' butonuna tıklayarak veya hesabınıza giriş yaparak kolayca sipariş oluşturabilirsiniz. Halı bilgilerinizi girin, adresinizi belirtin ve siparişinizi onaylayın."
    },
    {
      question: "Halı yıkama fiyatları nasıl hesaplanır?",
      answer: "Fiyatlar halı türüne ve metrekare cinsinden alana göre belirlenir. Normal halı: 100₺/m², Shaggy: 130₺/m², İpek: 250₺/m², Antika: 500₺/m². Ana sayfadaki fiyat hesaplayıcı ile tahmini fiyatı öğrenebilirsiniz."
    },
    {
      question: "Halılarım ne zaman teslim alınacak?",
      answer: "Siparişiniz onaylandıktan sonra firma tarafından belirlenen tarihte halılarınız adresinizden teslim alınır. Sipariş durumunuzu hesabınızdan takip edebilirsiniz."
    },
    {
      question: "Halılarımın yıkandığını nasıl takip ederim?",
      answer: "Hesabınıza giriş yaparak 'Siparişlerim' bölümünden halılarınızın durumunu anlık olarak takip edebilirsiniz. Alındı, Yıkanıyor, Hazır ve Teslim Edildi gibi durumlar görüntülenir."
    },
    {
      question: "Siparişimi iptal edebilir miyim?",
      answer: "Halılarınız teslim alınmadan önce (Beklemede veya Atandı durumunda) siparişinizi iptal edebilirsiniz. Halılar teslim alındıktan sonra iptal işlemi yapılamaz."
    },
    {
      question: "Ödeme nasıl yapılır?",
      answer: "Ödeme halılar teslim edilirken nakit olarak firmaya yapılır. Halılar yıkandıktan sonra gerçek metrekare üzerinden hesaplanan tutar tahsil edilir."
    },
    {
      question: "Halılarıma zarar gelirse ne olur?",
      answer: "Tüm firmalarımız sigortalıdır. Halılarınıza herhangi bir zarar gelirse sigorta kapsamında tazmin edilir. Ayrıca firmalarımız kalite garantisi vermektedir."
    },
    {
      question: "Hangi illerde hizmet veriyorsunuz?",
      answer: "HALIYOL olarak Türkiye'nin 81 ilinde hizmet vermekteyiz. Sipariş oluştururken şehrinizi ve ilçenizi seçerek bölgenizdeki firmaları görebilirsiniz."
    }
  ];

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
          <h1 className="text-5xl font-bold text-slate-800 mb-6">Yardım & Destek</h1>
          <p className="text-xl text-slate-600">
            Size yardımcı olmak için buradayız
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-2 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection("faq")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeSection === "faq" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Sıkça Sorulan Sorular
            </button>
            <button
              onClick={() => setActiveSection("kvkk")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeSection === "kvkk" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <Shield className="w-4 h-4" />
              KVKK
            </button>
            <button
              onClick={() => setActiveSection("privacy")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeSection === "privacy" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <Lock className="w-4 h-4" />
              Gizlilik Politikası
            </button>
            <button
              onClick={() => setActiveSection("cookies")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeSection === "cookies" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <Cookie className="w-4 h-4" />
              Çerez Politikası
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* FAQ */}
          {activeSection === "faq" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Sıkça Sorulan Sorular</h2>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KVKK */}
          {activeSection === "kvkk" && (
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Kişisel Verilerin Korunması (KVKK)</h2>
              <div className="prose prose-slate max-w-none space-y-4 text-slate-600">
                <h3 className="text-xl font-semibold text-slate-800">1. Veri Sorumlusu</h3>
                <p>
                  HALIYOL olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla, 
                  kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">2. İşlenen Kişisel Veriler</h3>
                <p>Platformumuz üzerinden toplanan kişisel veriler:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Kimlik Bilgileri: Ad, soyad, T.C. kimlik numarası</li>
                  <li>İletişim Bilgileri: E-posta adresi, telefon numarası, adres</li>
                  <li>Müşteri İşlem Bilgileri: Sipariş geçmişi, ödeme bilgileri</li>
                  <li>İşlem Güvenliği Bilgileri: IP adresi, çerez kayıtları</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">3. Kişisel Verilerin İşlenme Amaçları</h3>
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Halı yıkama hizmetlerinin sunulması</li>
                  <li>Sipariş takibi ve müşteri ilişkileri yönetimi</li>
                  <li>Faturalandırma ve ödeme işlemleri</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Hizmet kalitesinin artırılması</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">4. KVKK Kapsamındaki Haklarınız</h3>
                <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını öğrenme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                  <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">5. İletişim</h3>
                <p>
                  KVKK kapsamındaki taleplerinizi info@haliyol.com e-posta adresi üzerinden bize iletebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Privacy Policy */}
          {activeSection === "privacy" && (
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Gizlilik Politikası</h2>
              <div className="prose prose-slate max-w-none space-y-4 text-slate-600">
                <h3 className="text-xl font-semibold text-slate-800">1. Giriş</h3>
                <p>
                  HALIYOL olarak kullanıcılarımızın gizliliğine önem veriyoruz. Bu Gizlilik Politikası, 
                  platformumuz üzerinden topladığımız bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">2. Toplanan Bilgiler</h3>
                <p>Platformumuzda aşağıdaki bilgiler toplanmaktadır:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Hesap Bilgileri:</strong> Kayıt sırasında sağladığınız ad, e-posta, telefon numarası</li>
                  <li><strong>Sipariş Bilgileri:</strong> Halı türü, boyutları, teslimat adresi</li>
                  <li><strong>Ödeme Bilgileri:</strong> Fatura bilgileri (kredi kartı bilgileri saklanmaz)</li>
                  <li><strong>Kullanım Bilgileri:</strong> Platform kullanım istatistikleri, çerezler</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">3. Bilgilerin Kullanımı</h3>
                <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Hizmet sunumu ve sipariş takibi</li>
                  <li>Müşteri destek hizmetleri</li>
                  <li>Platform iyileştirmeleri ve analiz</li>
                  <li>Yasal gereksinimlerin karşılanması</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">4. Bilgi Güvenliği</h3>
                <p>
                  Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. 
                  Verileriniz şifreli bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">5. Üçüncü Taraf Paylaşımı</h3>
                <p>
                  Kişisel bilgilerinizi, yasal zorunluluklar veya hizmet sunumu için gerekli durumlar dışında 
                  üçüncü taraflarla paylaşmayız. Halı yıkama firmalarıyla yalnızca sipariş işleme için 
                  gerekli bilgiler paylaşılır.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">6. Kullanıcı Hakları</h3>
                <p>Kullanıcılarımız aşağıdaki haklara sahiptir:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Kişisel bilgilerini görüntüleme ve düzenleme</li>
                  <li>Hesabını silme ve verilerinin silinmesini talep etme</li>
                  <li>Pazarlama e-postalarından çıkma</li>
                  <li>Veri işleme faaliyetlerine itiraz etme</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">7. İletişim</h3>
                <p>
                  Gizlilik politikamız hakkında sorularınız için info@haliyol.com adresinden bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Cookie Policy */}
          {activeSection === "cookies" && (
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Çerez Politikası</h2>
              <div className="prose prose-slate max-w-none space-y-4 text-slate-600">
                <h3 className="text-xl font-semibold text-slate-800">1. Çerez Nedir?</h3>
                <p>
                  Çerezler, web sitelerinin kullanıcı deneyimini iyileştirmek için tarayıcınızda sakladığı 
                  küçük metin dosyalarıdır. HALIYOL platformu çeşitli amaçlarla çerezler kullanmaktadır.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">2. Kullandığımız Çerez Türleri</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800">Zorunlu Çerezler</h4>
                    <p>
                      Platform'un temel işlevleri için gereklidir. Oturum yönetimi, güvenlik ve kimlik doğrulama 
                      için kullanılır. Bu çerezler olmadan platform düzgün çalışmaz.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800">Performans Çerezleri</h4>
                    <p>
                      Platform'un nasıl kullanıldığını anlamamıza yardımcı olur. Sayfa görüntüleme sayısı, 
                      en çok ziyaret edilen sayfalar gibi anonim istatistikler toplar.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800">İşlevsellik Çerezleri</h4>
                    <p>
                      Tercihlerinizi hatırlamamıza olanak tanır. Örneğin dil seçimi, şehir/ilçe tercihleri 
                      gibi ayarlarınızı saklar.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800">Hedefleme/Reklam Çerezleri</h4>
                    <p>
                      İlgi alanlarınıza uygun içerik göstermek için kullanılır. Sosyal medya platformlarında 
                      HALIYOL reklamlarını görebilmeniz için gereklidir.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-800">3. Çerez Yönetimi</h3>
                <p>
                  Tarayıcı ayarlarınızdan çerezleri yönetebilir, silebilir veya tamamen engelleyebilirsiniz. 
                  Ancak zorunlu çerezleri engellemek platform işlevselliğini olumsuz etkileyebilir.
                </p>
                <p>Popüler tarayıcılarda çerez yönetimi:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                  <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                  <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Yönet</li>
                  <li><strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">4. Çerez Süresi</h3>
                <p>Platformumuzda kullanılan çerezlerin süreleri:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Oturum Çerezleri:</strong> Tarayıcı kapatıldığında silinir</li>
                  <li><strong>Kalıcı Çerezleri:</strong> Belirli bir süre (genellikle 1 yıl) saklanır</li>
                  <li><strong>Kimlik Doğrulama Çerezleri:</strong> 7 gün</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800">5. Çerez Politikası Güncellemeleri</h3>
                <p>
                  Bu çerez politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda 
                  kullanıcılarımızı bilgilendireceğiz.
                </p>

                <h3 className="text-xl font-semibold text-slate-800">6. İletişim</h3>
                <p>
                  Çerez kullanımı hakkında sorularınız için info@haliyol.com adresinden bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          )}
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

export default SupportPage;