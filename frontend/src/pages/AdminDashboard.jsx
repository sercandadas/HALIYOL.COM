import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Package, Users, Building2, LogOut, Menu, X, CheckCircle, Clock, MapPin, Phone, User, Mail, Ban, Trash2, UserCheck, XCircle, BarChart3 } from "lucide-react";
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
    { path: "/admin", icon: <Home className="w-5 h-5" />, label: "Ana Sayfa" },
    { path: "/admin/orders", icon: <Package className="w-5 h-5" />, label: "Siparişler" },
    { path: "/admin/reports", icon: <BarChart3 className="w-5 h-5" />, label: "Raporlar" },
    { path: "/admin/pending-companies", icon: <Building2 className="w-5 h-5" />, label: "Onay Bekleyen Firmalar" },
    { path: "/admin/companies", icon: <Building2 className="w-5 h-5" />, label: "Firmalar" },
    { path: "/admin/users", icon: <Users className="w-5 h-5" />, label: "Müşteriler" },
    { path: "/admin/create", icon: <FileText className="w-5 h-5" />, label: "Yeni Oluştur" }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <CarpetLogo className="w-10 h-10" />
          <div><span className="text-xl font-bold text-slate-800">HALIYOL</span><p className="text-xs text-slate-500">Admin Paneli</p></div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-slate-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">Yönetici</p>
          <p className="font-semibold text-slate-800 truncate">{user?.name || "Admin"}</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}>
              {link.icon}{link.label}
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

const AdminHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const r = await axios.get(`${API}/admin/stats`); setStats(r.data); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Paneli 🛡️</h1>
        <p className="text-orange-200">Platform yönetimi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><Package className="w-8 h-8 text-orange-500" /><div className="stat-value">{stats?.total_orders || 0}</div><div className="stat-label">Toplam Sipariş</div></div>
        <div className="stat-card"><Clock className="w-8 h-8 text-amber-500" /><div className="stat-value">{stats?.pending_orders || 0}</div><div className="stat-label">Havuzda</div></div>
        <div className="stat-card"><CheckCircle className="w-8 h-8 text-green-500" /><div className="stat-value">{stats?.completed_orders || 0}</div><div className="stat-label">Tamamlanan</div></div>
        <div className="stat-card"><XCircle className="w-8 h-8 text-red-500" /><div className="stat-value">{stats?.cancelled_orders || 0}</div><div className="stat-label">İptal</div></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="dashboard-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-80">Toplam Müşteri</p>
          <p className="text-3xl font-bold">{stats?.total_customers || 0}</p>
        </div>
        <div className="dashboard-card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <Building2 className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-80">Kayıtlı Firma</p>
          <p className="text-3xl font-bold">{stats?.total_companies || 0}</p>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Hızlı Erişim</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/admin/orders"><Button variant="outline" className="w-full py-6 rounded-xl border-stone-300"><Package className="w-5 h-5 mr-2" />Siparişler</Button></Link>
          <Link to="/admin/reports"><Button variant="outline" className="w-full py-6 rounded-xl border-stone-300"><BarChart3 className="w-5 h-5 mr-2" />Raporlar</Button></Link>
          <Link to="/admin/companies"><Button variant="outline" className="w-full py-6 rounded-xl border-stone-300"><Building2 className="w-5 h-5 mr-2" />Firmalar</Button></Link>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, order: null });
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [selectedCompany, setSelectedCompany] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [o, c] = await Promise.all([axios.get(`${API}/orders`), axios.get(`${API}/admin/companies`)]);
      setOrders(o.data.orders);
      setCompanies(c.data.companies);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!selectedCompany) { toast.error("Lütfen bir firma seçin"); return; }
    try {
      await axios.post(`${API}/orders/${assignModal.order.order_id}/assign`, { company_id: selectedCompany });
      toast.success("Sipariş atandı");
      setAssignModal({ open: false, order: null });
      setSelectedCompany("");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Atama başarısız"); }
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${API}/orders/${cancelModal.order.order_id}/cancel`, { reason: cancelReason });
      toast.success("Sipariş iptal edildi");
      setCancelModal({ open: false, order: null });
      setCancelReason("");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "İptal başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tüm Siparişler ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><Package className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Sipariş bulunmuyor</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="dashboard-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">{order.order_id}</h3>
                    <Badge className={STATUS_MAP[order.status]?.color}>{STATUS_MAP[order.status]?.label}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="flex items-center gap-2"><User className="w-4 h-4" />{order.customer_name} - {order.customer_phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{order.city}, {order.district}</p>
                    {order.company_name && <p className="flex items-center gap-2"><Building2 className="w-4 h-4" />Firma: {order.company_name}</p>}
                  </div>

                  {/* Halı Detayları */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-slate-400">Tahmini:</span>
                    {order.carpets?.map((c, i) => <span key={i} className="text-xs bg-stone-100 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>)}
                  </div>

                  {order.actual_carpets?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-green-600">Gerçek:</span>
                      {order.actual_carpets.map((c, i) => <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{c.area?.toFixed(1)} m² {CARPET_TYPES[c.carpet_type]?.name}</span>)}
                      <span className="text-xs font-bold text-green-700 ml-2">{order.actual_total_price?.toFixed(0)} ₺</span>
                    </div>
                  )}

                  {/* Tarihler */}
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-slate-400">Sipariş:</span><br/><span className="font-medium">{formatDate(order.created_at)}</span></div>
                    <div><span className="text-slate-400">Alındı:</span><br/><span className="font-medium">{formatDate(order.pickup_date)}</span></div>
                    <div><span className="text-slate-400">Yıkama:</span><br/><span className="font-medium">{formatDate(order.washing_date)}</span></div>
                    <div><span className="text-slate-400">Teslim:</span><br/><span className="font-medium">{formatDate(order.delivery_date)}</span></div>
                  </div>

                  {order.cancel_reason && <p className="text-xs text-red-600 mt-2">İptal Sebebi: {order.cancel_reason}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => { setAssignModal({ open: true, order }); setSelectedCompany(""); }} className="bg-orange-500 hover:bg-orange-600">Firmaya Ata</Button>
                  )}
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <Button size="sm" variant="outline" onClick={() => setCancelModal({ open: true, order })} className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-1" />İptal Et
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Atama Modal */}
      <Dialog open={assignModal.open} onOpenChange={(open) => setAssignModal({ ...assignModal, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sipariş Atama</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-4"><strong>{assignModal.order?.order_id}</strong> siparişini atayın.</p>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger><SelectValue placeholder="Firma Seçin" /></SelectTrigger>
              <SelectContent>{companies.filter(c => c.is_active).map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.company_name} ({c.city})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal({ open: false, order: null })}>İptal</Button>
            <Button onClick={handleAssign} className="bg-orange-500 hover:bg-orange-600">Ata</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İptal Modal */}
      <Dialog open={cancelModal.open} onOpenChange={(open) => setCancelModal({ ...cancelModal, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sipariş İptali</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4"><strong>{cancelModal.order?.order_id}</strong> siparişini iptal edin.</p>
            <Label>İptal Sebebi</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Sebep..." className="mt-1" />
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

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { fetchReports(); }, [period, selectedCompany, startDate, endDate, useCustomDate]);

  const fetchCompanies = async () => {
    try { const r = await axios.get(`${API}/admin/companies`); setCompanies(r.data.companies); } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `${API}/admin/reports?period=${period}`;
      if (selectedCompany && selectedCompany !== "all") url += `&company_id=${selectedCompany}`;
      if (useCustomDate && startDate && endDate) {
        url += `&start=${startDate}T00:00:00Z&end=${endDate}T23:59:59Z`;
      }
      const r = await axios.get(url);
      setReports(r.data);
    } catch (e) { console.error(e); setReports(null); } finally { setLoading(false); }
  };

  const periodLabels = { daily: "Bugün", weekly: "Bu Hafta", monthly: "Bu Ay", yearly: "Bu Yıl" };
  
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-orange-500" />Raporlar</h1>
      
      {/* Filtreler */}
      <div className="dashboard-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-slate-500">Dönem</Label>
            <Select value={period} onValueChange={(v) => { setPeriod(v); setUseCustomDate(false); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Günlük</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="yearly">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Firma</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Tüm Firmalar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Firmalar</SelectItem>
                {companies.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Başlangıç Tarihi</Label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setUseCustomDate(true); }} className="mt-1 w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Bitiş Tarihi</Label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setUseCustomDate(true); }} className="mt-1 w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
          </div>
        </div>
        {reports && (
          <p className="text-xs text-slate-500 mt-3">
            Tarih Aralığı: {formatDateDisplay(reports.start_date)} - {formatDateDisplay(reports.end_date)}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !reports ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Rapor yüklenemedi</p></div>
      ) : (
        <div className="space-y-6">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="dashboard-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <p className="text-sm opacity-80">Toplam Sipariş</p>
              <p className="text-3xl font-bold">{reports.total_orders || 0}</p>
            </div>
            <div className="dashboard-card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <p className="text-sm opacity-80">Toplam Yıkanan Alan</p>
              <p className="text-3xl font-bold">{(reports.total_area || 0).toFixed(1)} m²</p>
            </div>
            <div className="dashboard-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <p className="text-sm opacity-80">Toplam Ciro</p>
              <p className="text-3xl font-bold">{(reports.total_price || 0).toLocaleString("tr-TR")} ₺</p>
            </div>
            <div className="dashboard-card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-sm opacity-80">Net Ciro (İndirimli)</p>
              <p className="text-3xl font-bold">{(reports.total_final_price || 0).toLocaleString("tr-TR")} ₺</p>
              {reports.total_discount > 0 && (
                <p className="text-xs opacity-80 mt-1">-{reports.total_discount.toLocaleString("tr-TR")} ₺ indirim</p>
              )}
            </div>
          </div>

          {/* Halı Türüne Göre Detay */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Halı Türüne Göre Detay</h2>
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
                      <td className="py-3 px-2 text-right font-medium text-slate-800">{(reports.carpet_stats?.[key]?.area || 0).toFixed(1)}</td>
                      <td className="py-3 px-2 text-right font-medium text-green-600">{(reports.carpet_stats?.[key]?.price || 0).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 font-bold">
                    <td className="py-3 px-2 text-slate-800">TOPLAM</td>
                    <td className="py-3 px-2 text-right text-slate-800">{(reports.total_area || 0).toFixed(1)}</td>
                    <td className="py-3 px-2 text-right text-green-600">{(reports.total_price || 0).toLocaleString("tr-TR")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Firma Bazlı Detay */}
          {(!selectedCompany || selectedCompany === "all") && reports.company_stats?.length > 0 && (
            <div className="dashboard-card">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Firma Bazlı Detay</h2>
              <div className="space-y-4">
                {reports.company_stats.map((cs, i) => (
                  <div key={i} className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800">{cs.name}</h3>
                      <Badge className="bg-orange-100 text-orange-800">{cs.order_count} sipariş</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {Object.entries(CARPET_TYPES).map(([key, { name }]) => (
                        <div key={key} className="text-center p-2 bg-white rounded-lg">
                          <p className="text-xs text-slate-500">{name}</p>
                          <p className="font-bold text-slate-800">{(cs.carpet_stats?.[key]?.area || 0).toFixed(1)} m²</p>
                          <p className="text-xs text-green-600">{(cs.carpet_stats?.[key]?.price || 0).toLocaleString("tr-TR")} ₺</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                      <span className="text-slate-600">Toplam</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{(cs.total_area || 0).toFixed(1)} m²</span>
                        <span className="mx-2 text-slate-400">|</span>
                        <span className="font-bold text-green-600">{(cs.total_price || 0).toLocaleString("tr-TR")} ₺</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try { const r = await axios.get(`${API}/admin/companies`); setCompanies(r.data.companies); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleActive = async (company) => {
    try {
      await axios.patch(`${API}/admin/companies/${company.user_id}`, { is_active: !company.is_active });
      toast.success(company.is_active ? "Firma pasif yapıldı" : "Firma aktif yapıldı");
      fetchCompanies();
    } catch (e) { toast.error("İşlem başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Firmalar ({companies.length})</h1>
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl"><Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Firma bulunmuyor</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div key={company.user_id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{company.company_name}</h3>
                  <p className="text-sm text-slate-500">{company.city}</p>
                </div>
                <Badge className={company.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{company.is_active ? "Aktif" : "Pasif"}</Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{company.email}</p>
                {company.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{company.phone}</p>}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-sm text-slate-600">Toplam Yıkanan: <span className="font-bold text-orange-600">{(company.total_area_washed || 0).toFixed(1)} m²</span></p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => toggleActive(company)} className={company.is_active ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}>
                  {company.is_active ? "Pasif Yap" : "Aktif Yap"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: "", user: null });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const r = await axios.get(`${API}/admin/users`); setUsers(r.data.users); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleBan = async (userId) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (user?.is_banned) {
        await axios.post(`${API}/admin/users/${userId}/unban`);
        toast.success("Yasak kaldırıldı");
      } else {
        await axios.post(`${API}/admin/users/${userId}/ban`);
        toast.success("Kullanıcı yasaklandı");
      }
      fetchUsers();
    } catch (e) { toast.error(e.response?.data?.detail || "İşlem başarısız"); }
    setConfirmModal({ open: false, type: "", user: null });
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success("Kullanıcı silindi");
      fetchUsers();
    } catch (e) { toast.error(e.response?.data?.detail || "Silme başarısız"); }
    setConfirmModal({ open: false, type: "", user: null });
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  const customers = users.filter(u => u.role === "customer");
  const companyUsers = users.filter(u => u.role === "company");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Kullanıcı Yönetimi</h1>

      <h2 className="text-lg font-semibold text-slate-700 mb-4">Müşteriler ({customers.length})</h2>
      {customers.length === 0 ? (
        <div className="text-center py-8 bg-stone-50 rounded-2xl mb-8"><Users className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Müşteri bulunmuyor</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {customers.map((user) => (
            <div key={user.user_id} className={`dashboard-card ${user.is_banned ? "border-red-200 bg-red-50" : ""}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-orange-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                    {user.is_banned && <Badge className="bg-red-100 text-red-800">Yasaklı</Badge>}
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {user.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{user.phone}</p>}
                {user.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{user.city}, {user.district}</p>}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmModal({ open: true, type: "ban", user })} className={user.is_banned ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"}>
                  {user.is_banned ? <><UserCheck className="w-4 h-4 mr-1" />Yasağı Kaldır</> : <><Ban className="w-4 h-4 mr-1" />Yasakla</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmModal({ open: true, type: "delete", user })} className="text-red-600 border-red-200">
                  <Trash2 className="w-4 h-4 mr-1" />Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-700 mb-4">Firma Kullanıcıları ({companyUsers.length})</h2>
      {companyUsers.length === 0 ? (
        <div className="text-center py-8 bg-stone-50 rounded-2xl"><Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Firma kullanıcısı bulunmuyor</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companyUsers.map((user) => (
            <div key={user.user_id} className={`dashboard-card ${user.is_banned ? "border-red-200 bg-red-50" : ""}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"><Building2 className="w-6 h-6 text-indigo-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                    {user.is_banned && <Badge className="bg-red-100 text-red-800">Yasaklı</Badge>}
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmModal({ open: true, type: "ban", user })} className={user.is_banned ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"}>
                  {user.is_banned ? <><UserCheck className="w-4 h-4 mr-1" />Yasağı Kaldır</> : <><Ban className="w-4 h-4 mr-1" />Yasakla</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmModal({ open: true, type: "delete", user })} className="text-red-600 border-red-200">
                  <Trash2 className="w-4 h-4 mr-1" />Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal({ ...confirmModal, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{confirmModal.type === "ban" ? (confirmModal.user?.is_banned ? "Yasağı Kaldır" : "Yasakla") : "Sil"}</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              {confirmModal.type === "ban"
                ? (confirmModal.user?.is_banned ? `${confirmModal.user?.name} kullanıcısının yasağını kaldırmak istiyor musunuz?` : `${confirmModal.user?.name} kullanıcısını yasaklamak istiyor musunuz?`)
                : `${confirmModal.user?.name} kullanıcısını silmek istiyor musunuz? Bu işlem geri alınamaz.`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal({ open: false, type: "", user: null })}>İptal</Button>
            <Button onClick={() => confirmModal.type === "ban" ? handleBan(confirmModal.user?.user_id) : handleDelete(confirmModal.user?.user_id)} className={confirmModal.type === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}>
              {confirmModal.type === "ban" ? (confirmModal.user?.is_banned ? "Yasağı Kaldır" : "Yasakla") : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminDashboard = ({ user, setUser }) => {
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
          <Route index element={<AdminHome user={user} />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
