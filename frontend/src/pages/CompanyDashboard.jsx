import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Home, Package, TrendingUp, LogOut, Menu, X, Inbox, Clock, CheckCircle, Truck, Phone, MapPin, User, Check, XCircle, Plus, BarChart3 } from "lucide-react";
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

const STATUS_FLOW = ["assigned", "picked_up", "washing", "ready", "delivered"];

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

const Sidebar = ({ user, onLogout, mobileOpen, setMobileOpen, poolCount }) => {
  const location = useLocation();
  const links = [
    { path: "/company", icon: <Home className="w-5 h-5" />, label: "Ana Sayfa" },
    { path: "/company/pool", icon: <Inbox className="w-5 h-5" />, label: "Sipariş Havuzu", badge: poolCount },
    { path: "/company/orders", icon: <Package className="w-5 h-5" />, label: "Siparişlerim" },
    { path: "/company/reports", icon: <BarChart3 className="w-5 h-5" />, label: "Raporlar" }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <CarpetLogo className="w-10 h-10" />
          <div><span className="text-xl font-bold text-slate-800">HALIYOL</span><p className="text-xs text-slate-500">Firma Paneli</p></div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">Firma</p>
          <p className="font-semibold text-slate-800 truncate">{user?.name || "Firma"}</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}>
              {link.icon}{link.label}
              {link.badge > 0 && <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{link.badge}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-stone-200">
        <button onClick={onLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50"><LogOut className="w-5 h-5" />Çıkış Yap</button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 h-screen fixed left-0 top-0"><SidebarContent /></aside>
      <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      {mobileOpen && <div className="mobile-menu" onClick={() => setMobileOpen(false)}><aside className="mobile-menu-content flex flex-col" onClick={(e) => e.stopPropagation()}><SidebarContent /></aside></div>}
    </>
  );
};

const CompanyHome = ({ user, onRefresh }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const r = await axios.get(`${API}/company/stats`);
      setStats(r.data);
      onRefresh && onRefresh();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Firma Paneli 🏢</h1>
        <p className="text-orange-100">Siparişlerinizi buradan yönetin.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><Package className="w-8 h-8 text-orange-500" /><div className="stat-value">{stats?.total_orders || 0}</div><div className="stat-label">Toplam Sipariş</div></div>
        <div className="stat-card"><Inbox className="w-8 h-8 text-amber-500" /><div className="stat-value">{stats?.pool_orders || 0}</div><div className="stat-label">Havuzda Bekleyen</div></div>
        <div className="stat-card"><CheckCircle className="w-8 h-8 text-green-500" /><div className="stat-value">{stats?.completed_orders || 0}</div><div className="stat-label">Tamamlanan</div></div>
        <div className="stat-card"><TrendingUp className="w-8 h-8 text-indigo-500" /><div className="stat-value">{(stats?.total_area_washed || 0).toFixed(0)} m²</div><div className="stat-label">Toplam Yıkanan</div></div>
      </div>

      {stats?.pool_orders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center"><Inbox className="w-6 h-6 text-amber-600" /></div>
            <div className="flex-1"><h3 className="font-semibold text-amber-800">Yeni Siparişler Var!</h3><p className="text-amber-700">Sipariş havuzunda {stats?.pool_orders} adet bekleyen sipariş var.</p></div>
            <Link to="/company/pool"><Button className="bg-amber-500 hover:bg-amber-600">Havuza Git</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderPool = ({ user, onRefresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPool(); }, []);

  const fetchPool = async () => {
    try { const r = await axios.get(`${API}/orders/pool`); setOrders(r.data.orders); onRefresh && onRefresh(); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const acceptOrder = async (orderId) => {
    try { await axios.post(`${API}/orders/${orderId}/accept`); toast.success("Sipariş kabul edildi!"); fetchPool(); } 
    catch (e) { toast.error(e.response?.data?.detail || "Kabul başarısız"); }
  };

  const rejectOrder = async (orderId) => {
    try { await axios.post(`${API}/orders/${orderId}/reject`); toast.success("Sipariş reddedildi"); fetchPool(); } 
    catch (e) { toast.error(e.response?.data?.detail || "Red başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Inbox className="w-6 h-6 text-amber-500" />Sipariş Havuzu ({orders.length})</h1>
      <p className="text-slate-600 mb-6">Kabul ettiğiniz siparişler size atanır.</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Havuzda bekleyen sipariş bulunmuyor</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="dashboard-card border-2 border-amber-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3"><h3 className="font-bold text-slate-800">{order.order_id}</h3><Badge className="bg-amber-100 text-amber-800">Yeni Sipariş</Badge></div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="flex items-center gap-2"><User className="w-4 h-4" />{order.customer_name}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{order.customer_phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{order.customer_address}, {order.district}, {order.city}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.carpets?.map((c, i) => <span key={i} className="text-xs bg-stone-100 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>)}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Sipariş: {formatDate(order.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptOrder(order.order_id)} className="bg-green-500 hover:bg-green-600"><Check className="w-4 h-4 mr-1" />Kabul Et</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectOrder(order.order_id)} className="text-red-600 border-red-200 hover:bg-red-50"><XCircle className="w-4 h-4 mr-1" />Reddet</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [carpetModal, setCarpetModal] = useState(false);
  const [carpetEntries, setCarpetEntries] = useState([{ id: 1, carpet_type: "normal", area: "" }]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try { await axios.patch(`${API}/orders/${order.order_id}/status`, { status: newStatus }); toast.success("Durum güncellendi!"); onUpdate(); } 
    catch (e) { toast.error("Güncelleme başarısız!"); } finally { setUpdating(false); }
  };

  const addCarpetEntry = () => setCarpetEntries([...carpetEntries, { id: Date.now(), carpet_type: "normal", area: "" }]);
  const removeCarpetEntry = (id) => { if (carpetEntries.length > 1) setCarpetEntries(carpetEntries.filter(c => c.id !== id)); };
  const updateCarpetEntry = (id, field, value) => setCarpetEntries(carpetEntries.map(c => c.id === id ? { ...c, [field]: value } : c));

  const handleSaveCarpets = async () => {
    const carpets = carpetEntries.filter(c => c.area).map(c => ({ carpet_type: c.carpet_type, area: parseFloat(c.area) }));
    if (carpets.length === 0) { toast.error("En az bir halı bilgisi girin"); return; }
    try {
      await axios.post(`${API}/orders/${order.order_id}/update-carpets`, { carpets });
      toast.success("Halı bilgileri kaydedildi!");
      setCarpetModal(false);
      onUpdate();
    } catch (e) { toast.error("Kayıt başarısız"); }
  };

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  // Toplam fiyat hesapla
  const totalPrice = carpetEntries.reduce((sum, c) => {
    if (c.area && c.carpet_type) return sum + (parseFloat(c.area) * CARPET_TYPES[c.carpet_type].price);
    return sum;
  }, 0);

  return (
    <div className="bg-stone-50 rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3"><h3 className="font-bold text-slate-800">{order.order_id}</h3><Badge className={STATUS_MAP[order.status]?.color}>{STATUS_MAP[order.status]?.label}</Badge></div>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="flex items-center gap-2"><User className="w-4 h-4" />{order.customer_name} - {order.customer_phone}</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{order.customer_address}, {order.district}, {order.city}</p>
          </div>
          
          {/* Müşteri Tahmini */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-slate-400">Müşteri Tahmini:</span>
            {order.carpets?.map((c, i) => <span key={i} className="text-xs bg-stone-200 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>)}
          </div>

          {/* Firma Girişi */}
          {order.actual_carpets?.length > 0 && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <span className="text-xs text-green-600 font-medium">Gerçek Ölçüm:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {order.actual_carpets.map((c, i) => <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>)}
              </div>
              <p className="text-sm font-bold text-green-700 mt-1">Toplam: {order.actual_total_price?.toFixed(0)} ₺</p>
            </div>
          )}

          {/* Tarihler */}
          <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div><span className="text-slate-400">Sipariş:</span><br/><span className="font-medium">{formatDate(order.created_at)}</span></div>
            <div><span className="text-slate-400">Alındı:</span><br/><span className="font-medium">{formatDate(order.pickup_date)}</span></div>
            <div><span className="text-slate-400">Yıkama:</span><br/><span className="font-medium">{formatDate(order.washing_date)}</span></div>
            <div><span className="text-slate-400">Teslim:</span><br/><span className="font-medium">{formatDate(order.delivery_date)}</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Halı Bilgisi Gir Butonu */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button size="sm" variant="outline" onClick={() => setCarpetModal(true)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              Halı Bilgisi Gir
            </Button>
          )}
          {/* Durum Güncelle */}
          {nextStatus && order.status !== "delivered" && order.status !== "cancelled" && (
            <Button size="sm" onClick={() => handleStatusUpdate(nextStatus)} disabled={updating} className="bg-orange-500 hover:bg-orange-600">
              {updating ? "..." : STATUS_MAP[nextStatus]?.label}
            </Button>
          )}
        </div>
      </div>

      {/* Halı Bilgisi Modal */}
      <Dialog open={carpetModal} onOpenChange={setCarpetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Halı Bilgisi Gir</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {carpetEntries.map((entry, index) => (
              <div key={entry.id} className="bg-stone-50 rounded-lg p-3 relative">
                {carpetEntries.length > 1 && <button onClick={() => removeCarpetEntry(entry.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                <div className="text-sm font-medium text-slate-600 mb-2">Halı {index + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tür</Label>
                    <Select value={entry.carpet_type} onValueChange={(v) => updateCarpetEntry(entry.id, "carpet_type", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(CARPET_TYPES).map(([k, { name, price }]) => <SelectItem key={k} value={k}>{name} ({price}₺/m²)</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Alan (m²)</Label>
                    <Input type="number" step="0.1" min="0.1" placeholder="6.0" value={entry.area} onChange={(e) => updateCarpetEntry(entry.id, "area", e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCarpetEntry} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2" />Başka Halı Ekle</Button>
            
            {totalPrice > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-600">Hesaplanan Toplam</p>
                <p className="text-2xl font-bold text-green-700">{totalPrice.toFixed(0)} ₺</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCarpetModal(false)}>İptal</Button>
            <Button onClick={handleSaveCarpets} className="bg-orange-500 hover:bg-orange-600">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CompanyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const r = await axios.get(`${API}/orders`); setOrders(r.data.orders.filter(o => o.company_id === user?.user_id)); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Siparişlerim</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrele" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tümü</SelectItem>{Object.entries(STATUS_MAP).map(([k, { label }]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><Package className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Sipariş bulunmuyor</p></div>
      ) : (
        <div className="space-y-4">{filteredOrders.map((order) => <OrderCard key={order.order_id} order={order} onUpdate={fetchOrders} />)}</div>
      )}
    </div>
  );
};

const CompanyReports = () => {
  const [reports, setReports] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/company/reports?period=${period}`); setReports(r.data); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const periodLabels = { daily: "Bugün", weekly: "Bu Hafta", monthly: "Bu Ay", yearly: "Bu Yıl" };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-orange-500" />Raporlar</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Günlük</SelectItem>
            <SelectItem value="weekly">Haftalık</SelectItem>
            <SelectItem value="monthly">Aylık</SelectItem>
            <SelectItem value="yearly">Yıllık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <p className="text-sm opacity-80">{periodLabels[period]} Sipariş</p>
              <p className="text-3xl font-bold">{reports?.total_orders || 0}</p>
            </div>
            <div className="dashboard-card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <p className="text-sm opacity-80">{periodLabels[period]} Yıkanan Alan</p>
              <p className="text-3xl font-bold">{(reports?.total_area || 0).toFixed(1)} m²</p>
            </div>
            <div className="dashboard-card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-sm opacity-80">{periodLabels[period]} Ciro</p>
              <p className="text-3xl font-bold">{(reports?.total_price || 0).toLocaleString("tr-TR")} ₺</p>
            </div>
          </div>

          {/* Halı Türüne Göre Detay */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Halı Türüne Göre Detay ({periodLabels[period]})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Halı Türü</th>
                    <th className="text-right py-3 px-2 text-slate-500 font-medium">Alan (m²)</th>
                    <th className="text-right py-3 px-2 text-slate-500 font-medium">Tutar (₺)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CARPET_TYPES).map(([key, { name }]) => (
                    <tr key={key} className="border-b border-stone-100">
                      <td className="py-3 px-2 text-slate-700">{name}</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-800">{(reports?.carpet_stats?.[key]?.area || 0).toFixed(1)}</td>
                      <td className="py-3 px-2 text-right font-medium text-green-600">{(reports?.carpet_stats?.[key]?.price || 0).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 font-bold">
                    <td className="py-3 px-2 text-slate-800">TOPLAM</td>
                    <td className="py-3 px-2 text-right text-slate-800">{(reports?.total_area || 0).toFixed(1)}</td>
                    <td className="py-3 px-2 text-right text-green-600">{(reports?.total_price || 0).toLocaleString("tr-TR")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [poolCount, setPoolCount] = useState(0);

  useEffect(() => { fetchPoolCount(); }, []);

  const fetchPoolCount = async () => {
    try { const r = await axios.get(`${API}/company/stats`); setPoolCount(r.data.pool_orders || 0); } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    try { await axios.post(`${API}/auth/logout`); } catch (e) { console.error(e); }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar user={user} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} poolCount={poolCount} />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <Routes>
          <Route index element={<CompanyHome user={user} onRefresh={fetchPoolCount} />} />
          <Route path="pool" element={<OrderPool user={user} onRefresh={fetchPoolCount} />} />
          <Route path="orders" element={<CompanyOrders user={user} />} />
          <Route path="reports" element={<CompanyReports />} />
        </Routes>
      </main>
    </div>
  );
};

export default CompanyDashboard;
