import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Phone, MessageSquare, Save } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: "",
    whatsapp_message: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/settings`);
      setSettings(res.data.settings);
    } catch (error) {
      console.error(error);
      toast.error("Ayarlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/admin/settings`, settings);
      toast.success("Ayarlar başarıyla kaydedildi");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-orange-500" />
        <h1 className="text-2xl font-bold text-slate-800">Sistem Ayarları</h1>
      </div>

      <div className="dashboard-card max-w-2xl space-y-6">
        {/* WhatsApp Ayarları */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-800">WhatsApp İletişim</h2>
          </div>

          <div>
            <Label>WhatsApp Numarası *</Label>
            <Input
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="905551234567"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Format: 90 ile başlayan 12 haneli numara (örn: 905551234567)
            </p>
          </div>

          <div>
            <Label>Varsayılan Mesaj</Label>
            <Textarea
              value={settings.whatsapp_message}
              onChange={(e) => setSettings({ ...settings, whatsapp_message: e.target.value })}
              placeholder="Merhaba, halı yıkama hizmeti hakkında bilgi almak istiyorum."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Müşteriler WhatsApp butonuna tıkladığında bu mesaj otomatik olarak yazılır
            </p>
          </div>
        </div>

        {/* Önizleme */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Önizleme</span>
          </div>
          <p className="text-sm text-green-700">
            WhatsApp'ta açılacak numara: <strong>{settings.whatsapp_number || "Belirtilmedi"}</strong>
          </p>
          <p className="text-sm text-green-700 mt-1">
            Mesaj: "{settings.whatsapp_message || "Belirtilmedi"}"
          </p>
        </div>

        {/* Kaydet Butonu */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>

      {/* Bilgi Kartı */}
      <div className="dashboard-card max-w-2xl mt-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Bilgi</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ana sayfada floating WhatsApp butonu görünecek</li>
          <li>• Burayı güncelleyince otomatik olarak butondaki numara değişir</li>
          <li>• WhatsApp Web veya mobil uygulama üzerinden açılır</li>
          <li>• Mesaj otomatik olarak yazılır, müşteri sadece gönder'e basar</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
