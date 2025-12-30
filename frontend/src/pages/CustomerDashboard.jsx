import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Home, Plus, Clock, History, LogOut, Menu, X, Package, Truck, CheckCircle, MapPin, AlertCircle, XCircle, Calendar } from "lucide-react";
import { API } from "@/App";

const CarpetLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#F97316" />
    <rect x="8" y="10" width="24" height="20" rx="2" fill="white" />
    <rect x="12" y="14" width="16" height="12" rx="1" fill="#F97316" />
    <circle cx="20" cy="20" r="3" fill="white" />
  </svg>
);

const STATUS_MAP = {
  pending: { label: "Havuzda", color: "bg-amber-100 text-amber-800" },
  assigned: { label: "Atandı", color: "bg-blue-100 text-blue-800" },
  picked_up: { label: "Alındı", color: "bg-indigo-100 text-indigo-800" },
  washing: { label: "Yıkanıyor", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Hazır", color: "bg-emerald-100 text-emerald-800" },
  delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-800" }
};

const CARPET_TYPES = {
  normal: { name: "Normal Halı", price: 100 },
  shaggy: { name: "Shaggy Halı", price: 130 },
  silk: { name: "İpek Halı", price: 250 },
  antique: { name: "Antika Halı", price: 500 }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const Sidebar = ({ user, onLogout, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const links = [
    { path: "/dashboard", icon: <Home className="w-5 h-5" />, label: "Ana Sayfa" },
    { path: "/dashboard/new-order", icon: <Plus className="w-5 h-5" />, label: "Yeni Sipariş" },
    { path: "/dashboard/orders", icon: <Clock className="w-5 h-5" />, label: "Aktif Siparişler" },
    { path: "/dashboard/history", icon: <History className="w-5 h-5" />, label: "Geçmiş Siparişler" }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <CarpetLogo className="w-10 h-10" />
          <span className="text-xl font-bold text-slate-800">HALIYOL</span>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-stone-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">Hoş geldiniz,</p>
          <p className="font-semibold text-slate-800 truncate">{user?.name || "Kullanıcı"}</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-stone-200">
        <button onClick={onLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50">
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 h-screen fixed left-0 top-0"><SidebarContent /></aside>
      <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-menu-content flex flex-col" onClick={(e) => e.stopPropagation()}><SidebarContent /></aside>
        </div>
      )}
    </>
  );
};

const DashboardHome = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "delivered");

  return (
    <div className="space-y-8" data-testid="customer-dashboard">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Merhaba, {user?.name}! 👋</h1>
        <p className="text-orange-100">Halı yıkama siparişlerinizi buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><Package className="w-8 h-8 text-orange-500" /><div className="stat-value">{orders.length}</div><div className="stat-label">Toplam Sipariş</div></div>
        <div className="stat-card"><Clock className="w-8 h-8 text-amber-500" /><div className="stat-value">{activeOrders.length}</div><div className="stat-label">Aktif Sipariş</div></div>
        <div className="stat-card"><CheckCircle className="w-8 h-8 text-green-500" /><div className="stat-value">{completedOrders.length}</div><div className="stat-label">Tamamlanan</div></div>
        <div className="stat-card"><Truck className="w-8 h-8 text-indigo-500" /><div className="stat-value">{activeOrders.filter(o => o.status === "picked_up").length}</div><div className="stat-label">Yolda</div></div>
      </div>

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Hızlı İşlemler</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/dashboard/new-order"><Button className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl text-lg"><Plus className="w-5 h-5 mr-2" />Yeni Sipariş Oluştur</Button></Link>
          <Link to="/dashboard/orders"><Button variant="outline" className="w-full py-6 rounded-xl text-lg border-stone-300"><Clock className="w-5 h-5 mr-2" />Siparişlerimi Görüntüle</Button></Link>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Aktif Siparişler</h2>
          <div className="space-y-4">
            {activeOrders.slice(0, 3).map((order) => (
              <div key={order.order_id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">{order.order_id}</p>
                  <p className="text-sm text-slate-500">{order.carpet_count} halı - {order.city}, {order.district}</p>
                </div>
                <Badge className={STATUS_MAP[order.status]?.color}>{STATUS_MAP[order.status]?.label}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [carpetList, setCarpetList] = useState([{ id: 1, carpet_type: "normal", width: "", length: "" }]);
  const [formData, setFormData] = useState({ special_notes: "", city: "", district: "", address: "", phone: "" });

  useEffect(() => { fetchCities(); }, []);
  useEffect(() => { if (formData.city) fetchDistricts(formData.city); }, [formData.city]);

  const fetchCities = async () => { try { const r = await axios.get(`${API}/locations/cities`); setCities(r.data.cities); } catch (e) { console.error(e); } };
  const fetchDistricts = async (city) => { try { const r = await axios.get(`${API}/locations/districts/${city}`); setDistricts(r.data.districts); } catch (e) { console.error(e); } };

  const addCarpet = () => setCarpetList([...carpetList, { id: Date.now(), carpet_type: "normal", width: "", length: "" }]);
  const removeCarpet = (id) => { if (carpetList.length > 1) setCarpetList(carpetList.filter(c => c.id !== id)); };
  const updateCarpet = (id, field, value) => setCarpetList(carpetList.map(c => c.id === id ? { ...c, [field]: value } : c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const carpets = carpetList.filter(c => c.width && c.length).map(c => ({ carpet_type: c.carpet_type, width: parseFloat(c.width), length: parseFloat(c.length) }));
    if (carpets.length === 0) { toast.error("En az bir halı eklemelisiniz!"); setLoading(false); return; }
    try {
      await axios.post(`${API}/orders`, { carpets, ...formData });
      toast.success("Sipariş başarıyla oluşturuldu!");
      navigate("/dashboard/orders");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Sipariş oluşturulamadı!");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Yeni Sipariş Oluştur</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Halı Bilgileri (Tahmini)</h2>
          <div className="space-y-4">
            {carpetList.map((carpet, index) => (
              <div key={carpet.id} className="bg-orange-50 rounded-xl p-4 relative">
                {carpetList.length > 1 && <button type="button" onClick={() => removeCarpet(carpet.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                <div className="text-sm font-medium text-slate-600 mb-3">Halı {index + 1}</div>
                <div className="space-y-3">
                  <Select value={carpet.carpet_type} onValueChange={(v) => updateCarpet(carpet.id, "carpet_type", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(CARPET_TYPES).map(([key, { name }]) => <SelectItem key={key} value={key}>{name}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Genişlik (m)</Label><Input type="number" step="0.1" min="0.1" placeholder="2.0" value={carpet.width} onChange={(e) => updateCarpet(carpet.id, "width", e.target.value)} className="mt-1" required /></div>
                    <div><Label>Uzunluk (m)</Label><Input type="number" step="0.1" min="0.1" placeholder="3.0" value={carpet.length} onChange={(e) => updateCarpet(carpet.id, "length", e.target.value)} className="mt-1" required /></div>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCarpet} className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"><Plus className="w-4 h-4 mr-2" />Başka Halı Ekle</Button>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">Bu bilgiler tahminidir. Kesin ölçüm ve fiyat firma tarafından belirlenecektir.</p>
            </div>
            <div><Label>Özel Notlar (Opsiyonel)</Label><Textarea placeholder="Varsa özel isteklerinizi yazın..." value={formData.special_notes} onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })} className="mt-1" /></div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Adres Bilgileri</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>İl</Label><Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v, district: "" })}><SelectTrigger className="mt-1"><SelectValue placeholder="İl Seçin" /></SelectTrigger><SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>İlçe</Label><Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })} disabled={!formData.city}><SelectTrigger className="mt-1"><SelectValue placeholder="İlçe Seçin" /></SelectTrigger><SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Açık Adres</Label><Textarea placeholder="Mahalle, sokak, bina no..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1" required /></div>
            <div><Label>Telefon</Label><Input type="tel" placeholder="05XX XXX XX XX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1" required /></div>
          </div>
        </div>
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl text-lg" disabled={loading}>{loading ? "Sipariş Oluşturuluyor..." : "Siparişi Oluştur"}</Button>
      </form>
    </div>
  );
};

const OrdersList = ({ filter = "active" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const r = await axios.get(`${API}/orders`); setOrders(r.data.orders); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${API}/orders/${cancelModal.order.order_id}/cancel`, { reason: cancelReason });
      toast.success("Sipariş iptal edildi");
      setCancelModal({ open: false, order: null });
      setCancelReason("");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İptal başarısız");
    }
  };

  const filteredOrders = filter === "active" ? orders.filter(o => !["delivered", "cancelled"].includes(o.status)) : orders.filter(o => ["delivered", "cancelled"].includes(o.status));

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{filter === "active" ? "Aktif Siparişler" : "Geçmiş Siparişler"}</h1>
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><Package className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Henüz sipariş bulunmuyor</p></div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="dashboard-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-slate-800">{order.order_id}</h3>
                    <Badge className={STATUS_MAP[order.status]?.color}>{STATUS_MAP[order.status]?.label}</Badge>
                  </div>
                  
                  {/* Halı Detayları */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-600 mb-1">Halılar (Tahmini):</p>
                    <div className="flex flex-wrap gap-2">
                      {order.carpets?.map((c, i) => (
                        <span key={i} className="text-xs bg-stone-100 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Firma tarafından girilen gerçek bilgiler */}
                  {order.actual_carpets?.length > 0 && (
                    <div className="mb-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">Firma Ölçümü:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.actual_carpets.map((c, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>
                        ))}
                      </div>
                      {order.actual_total_price > 0 && <p className="text-sm font-bold text-green-700 mt-2">Toplam: {order.actual_total_price?.toFixed(0)} ₺</p>}
                    </div>
                  )}

                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{order.city}, {order.district}</p>
                    {order.company_name && <p className="flex items-center gap-2"><Truck className="w-4 h-4" />{order.company_name}</p>}
                  </div>

                  {/* Tarihler */}
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-slate-400">Sipariş:</span><br/><span className="font-medium">{formatDate(order.created_at)}</span></div>
                    <div><span className="text-slate-400">Alındı:</span><br/><span className="font-medium">{formatDate(order.pickup_date)}</span></div>
                    <div><span className="text-slate-400">Yıkama:</span><br/><span className="font-medium">{formatDate(order.washing_date)}</span></div>
                    <div><span className="text-slate-400">Teslim:</span><br/><span className="font-medium">{formatDate(order.delivery_date)}</span></div>
                  </div>
                </div>

                {/* İptal Butonu - sadece pending ve assigned durumunda */}
                {["pending", "assigned"].includes(order.status) && (
                  <Button variant="outline" size="sm" onClick={() => setCancelModal({ open: true, order })} className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-1" />İptal Et
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* İptal Modal */}
      <Dialog open={cancelModal.open} onOpenChange={(open) => setCancelModal({ ...cancelModal, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sipariş İptali</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4"><strong>{cancelModal.order?.order_id}</strong> numaralı siparişi iptal etmek istediğinize emin misiniz?</p>
            <Label>İptal Sebebi (Opsiyonel)</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="İptal sebebinizi yazabilirsiniz..." className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal({ open: false, order: null })}>Vazgeç</Button>
            <Button onClick={handleCancel} className="bg-red-500 hover:bg-red-600">İptal Et</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CustomerDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await axios.post(`${API}/auth/logout`); } catch (e) { console.error(e); }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar user={user} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <Routes>
          <Route index element={<DashboardHome user={user} />} />
          <Route path="new-order" element={<NewOrder />} />
          <Route path="orders" element={<OrdersList filter="active" />} />
          <Route path="history" element={<OrdersList filter="history" />} />
        </Routes>
      </main>
    </div>
  );
};

export default CustomerDashboard;
