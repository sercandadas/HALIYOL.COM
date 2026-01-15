import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Download, Plus, User, Building2, Package } from "lucide-react";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

// Pending Companies Component
export const PendingCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchPendingCompanies(); }, []);

  const fetchPendingCompanies = async () => {
    try {
      const res = await axios.get(`${API}/admin/companies/pending`);
      setCompanies(res.data.companies);
    } catch (error) {
      console.error(error);
      toast({ title: "Hata", description: "Firmalar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post(`${API}/admin/companies/${userId}/approve`);
      toast({ title: "Başarılı", description: "Firma onaylandı" });
      fetchPendingCompanies();
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Bu firmayı reddetmek istediğinize emin misiniz?")) return;
    try {
      await axios.post(`${API}/admin/companies/${userId}/reject`);
      toast({ title: "Başarılı", description: "Firma reddedildi" });
      fetchPendingCompanies();
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Onay Bekleyen Firmalar</h1>
        <span className="text-sm text-slate-500">{companies.length} firma</span>
      </div>

      {companies.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Onay bekleyen firma yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <div key={company.user_id} className="dashboard-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">{company.company_name}</h3>
                  <div className="text-sm text-slate-600 space-y-1 mt-2">
                    <p><strong>Email:</strong> {company.email}</p>
                    <p><strong>Telefon:</strong> {company.phone}</p>
                    <p><strong>Şehir:</strong> {company.city}</p>
                    <p><strong>Hizmet Bölgeleri:</strong> {company.districts?.join(", ") || "Belirtilmemiş"}</p>
                    <p><strong>Kayıt Tarihi:</strong> {new Date(company.created_at).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(company.user_id)} className="bg-green-500 hover:bg-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    Onayla
                  </Button>
                  <Button onClick={() => handleReject(company.user_id)} variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Forms Component
export const AdminCreate = () => {
  const [activeTab, setActiveTab] = useState("customer");
  const { toast } = useToast();

  const tabs = [
    { id: "customer", label: "Müşteri Oluştur", icon: <User className="w-4 h-4" /> },
    { id: "company", label: "Firma Oluştur", icon: <Building2 className="w-4 h-4" /> },
    { id: "order", label: "Sipariş Oluştur", icon: <Package className="w-4 h-4" /> }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Yeni Oluştur</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-stone-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "customer" && <CustomerForm toast={toast} />}
      {activeTab === "company" && <CompanyForm toast={toast} />}
      {activeTab === "order" && <OrderForm toast={toast} />}
    </div>
  );
};

const CustomerForm = ({ toast }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    district: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      toast({ title: "Hata", description: "Ad soyad ve şifre zorunludur", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/customers/create`, formData);
      toast({ title: "Başarılı", description: "Müşteri oluşturuldu" });
      setFormData({ name: "", email: "", password: "", phone: "", city: "", district: "", address: "" });
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "İşlem başarısız", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-card space-y-4 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Ad Soyad *</Label>
          <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ahmet Yılmaz" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ornek@email.com" />
        </div>
        <div>
          <Label>Şifre *</Label>
          <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Güvenli şifre" />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0532 123 4567" />
        </div>
        <div>
          <Label>Şehir</Label>
          <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="İstanbul" />
        </div>
        <div>
          <Label>İlçe</Label>
          <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="Kadıköy" />
        </div>
      </div>
      <div>
        <Label>Adres</Label>
        <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Tam adres" />
      </div>
      <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
        <Plus className="w-4 h-4 mr-2" />
        {loading ? "Oluşturuluyor..." : "Müşteri Oluştur"}
      </Button>
    </form>
  );
};

const CompanyForm = ({ toast }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    districts: [],
    address: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.password || !formData.phone) {
      toast({ title: "Hata", description: "Firma adı, şifre ve telefon zorunludur", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/companies/create`, formData);
      toast({ title: "Başarılı", description: "Firma oluşturuldu" });
      setFormData({ company_name: "", email: "", password: "", phone: "", city: "", districts: [], address: "" });
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "İşlem başarısız", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-card space-y-4 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Firma Adı *</Label>
          <Input required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="ABC Halı Yıkama" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="firma@example.com" />
        </div>
        <div>
          <Label>Şifre *</Label>
          <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Güvenli şifre" />
        </div>
        <div>
          <Label>Telefon *</Label>
          <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0532 123 4567" />
        </div>
        <div>
          <Label>Şehir</Label>
          <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="İstanbul" />
        </div>
        <div>
          <Label>Hizmet Bölgeleri (virgülle ayırın)</Label>
          <Input value={formData.districts.join(", ")} onChange={(e) => setFormData({ ...formData, districts: e.target.value.split(",").map(d => d.trim()).filter(d => d) })} placeholder="Kadıköy, Üsküdar" />
        </div>
      </div>
      <div>
        <Label>Adres</Label>
        <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Tam adres" />
      </div>
      <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
        <Plus className="w-4 h-4 mr-2" />
        {loading ? "Oluşturuluyor..." : "Firma Oluştur"}
      </Button>
    </form>
  );
};

const OrderForm = ({ toast }) => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    carpets: [{ carpet_type: "normal", width: "", length: "" }],
    special_notes: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setCustomers(res.data.users.filter(u => u.role === "customer"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.phone || !formData.city || !formData.address) {
      toast({ title: "Hata", description: "Müşteri, telefon, şehir ve adres zorunludur", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/orders/create`, formData);
      toast({ title: "Başarılı", description: "Sipariş oluşturuldu" });
      setFormData({ customer_id: "", phone: "", city: "", district: "", address: "", carpets: [{ carpet_type: "normal", width: "", length: "" }], special_notes: "" });
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "İşlem başarısız", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addCarpet = () => {
    setFormData({ ...formData, carpets: [...formData.carpets, { carpet_type: "normal", width: "", length: "" }] });
  };

  const removeCarpet = (index) => {
    setFormData({ ...formData, carpets: formData.carpets.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-card space-y-4 max-w-2xl">
      <div>
        <Label>Müşteri Seç *</Label>
        <Select value={formData.customer_id} onValueChange={(val) => setFormData({ ...formData, customer_id: val })}>
          <SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
          <SelectContent>
            {customers.map(c => (
              <SelectItem key={c.user_id} value={c.user_id}>{c.name} ({c.email})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Telefon *</Label>
          <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0532 123 4567" />
        </div>
        <div>
          <Label>Şehir *</Label>
          <Input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="İstanbul" />
        </div>
        <div>
          <Label>İlçe</Label>
          <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="Kadıköy" />
        </div>
      </div>

      <div>
        <Label>Adres *</Label>
        <Input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Tam teslimat adresi" />
      </div>

      <div>
        <Label>Halılar</Label>
        {formData.carpets.map((carpet, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Select value={carpet.carpet_type} onValueChange={(val) => {
              const newCarpets = [...formData.carpets];
              newCarpets[index].carpet_type = val;
              setFormData({ ...formData, carpets: newCarpets });
            }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="shaggy">Shaggy</SelectItem>
                <SelectItem value="silk">İpek</SelectItem>
                <SelectItem value="antique">Antika</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="En (m)" type="number" step="0.1" value={carpet.width} onChange={(e) => {
              const newCarpets = [...formData.carpets];
              newCarpets[index].width = parseFloat(e.target.value) || "";
              setFormData({ ...formData, carpets: newCarpets });
            }} />
            <Input placeholder="Boy (m)" type="number" step="0.1" value={carpet.length} onChange={(e) => {
              const newCarpets = [...formData.carpets];
              newCarpets[index].length = parseFloat(e.target.value) || "";
              setFormData({ ...formData, carpets: newCarpets });
            }} />
            {formData.carpets.length > 1 && (
              <Button type="button" variant="destructive" size="sm" onClick={() => removeCarpet(index)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addCarpet} className="mt-2">
          <Plus className="w-4 h-4 mr-2" />
          Halı Ekle
        </Button>
      </div>

      <div>
        <Label>Özel Notlar</Label>
        <Input value={formData.special_notes} onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })} placeholder="Halı hakkında notlar" />
      </div>

      <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
        <Plus className="w-4 h-4 mr-2" />
        {loading ? "Oluşturuluyor..." : "Sipariş Oluştur"}
      </Button>
    </form>
  );
};

// Excel Export Component
export const ExportButtons = () => {
  const { toast } = useToast();

  const handleExport = async (type) => {
    try {
      const response = await axios.get(`${API}/admin/export/${type}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Başarılı", description: "Dosya indirildi" });
    } catch (error) {
      toast({ title: "Hata", description: "İndirme başarısız", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => handleExport("customers")} variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Müşteriler (CSV)
      </Button>
      <Button onClick={() => handleExport("companies")} variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Firmalar (CSV)
      </Button>
      <Button onClick={() => handleExport("orders")} variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Siparişler (CSV)
      </Button>
    </div>
  );
};
