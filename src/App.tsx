import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Eye, Pencil, Trash2, Shield, Smartphone, CreditCard, Calendar,
  X, Download, ExternalLink, FileText, Clock, MapPin,
  User, Armchair, KeyRound, Plus, ShieldCheck, Wifi,
  Wallet, PartyPopper, AlertTriangle, CalendarClock,
  Building2, Hash, FileImage, Sparkles, Car, Home as HomeIcon,
  Heart, Activity, Tv, Check, Upload,
  Copy, FileJson, Archive, RefreshCw, Merge,
  Search, Bell, BellRing, Settings2, Share2, Share, Code2, MonitorSmartphone
} from 'lucide-react';

type Category = 'insurance' | 'cellular' | 'credit' | 'personal';
type ReminderType = 'car' | 'home' | 'life' | 'health' | 'cellular' | 'tv' | 'credit' | 'personal' | 'other';

interface Offer {
  company: string;
  amount: number;
  coverage?: string;
  period?: 'monthly' | 'yearly';
  contact?: string;
}

interface TazFile {
  data: string;
  name: string;
  type: 'image' | 'pdf';
}

interface TazItem {
  id: string;
  category: Category;
  reminderType?: ReminderType;
  providerName: string;
  subType: string;
  expiryDate: string;
  cost?: number;
  period?: 'monthly' | 'yearly';
  notes?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  policyNumber?: string;
  insuranceKind?: string;
  accountNumber?: string;
  eventEmoji?: string;
  eventTime?: string;
  location?: string;
  contactPerson?: string;
  seats?: string;
  entryCode?: string;
  fileData?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf';
  files?: TazFile[];
  offers?: Offer[];
  ticketLink?: string;
  ticketLinks?: string[];
}

const CATEGORY_META: Record<Category, { label: string; icon: any; color: string; bg: string; light: string }> = {
  insurance: { label: 'ביטוחים', icon: Shield, color: 'text-zinc-700', bg: 'bg-zinc-900', light: 'bg-zinc-100' },
  cellular: { label: 'תקשורת ו-TV', icon: Wifi, color: 'text-zinc-700', bg: 'bg-zinc-800', light: 'bg-zinc-100' },
  credit: { label: 'כרטיסי אשראי', icon: CreditCard, color: 'text-zinc-700', bg: 'bg-zinc-800', light: 'bg-zinc-100' },
  personal: { label: 'אירועים אישיים', icon: Calendar, color: 'text-zinc-700', bg: 'bg-zinc-900', light: 'bg-zinc-100' },
};

const CARD_TINT: Record<Category, string> = {
  insurance: 'bg-white',
  cellular: 'bg-white',
  credit: 'bg-white',
  personal: 'bg-white',
};

const REMINDER_TYPES: { key: ReminderType; label: string; icon: any; cat: Category }[] = [
  { key: 'car', label: 'ביטוח רכב', icon: Car, cat: 'insurance' },
  { key: 'home', label: 'ביטוח דירה', icon: HomeIcon, cat: 'insurance' },
  { key: 'life', label: 'ביטוח חיים', icon: Heart, cat: 'insurance' },
  { key: 'health', label: 'ביטוח בריאות', icon: Activity, cat: 'insurance' },
  { key: 'cellular', label: 'חבילת סלולר', icon: Smartphone, cat: 'cellular' },
  { key: 'tv', label: 'טלוויזיה/אינטרנט', icon: Tv, cat: 'cellular' },
  { key: 'credit', label: 'כרטיס אשראי', icon: CreditCard, cat: 'credit' },
  { key: 'personal', label: 'אירועים אישיים', icon: Calendar, cat: 'personal' },
  { key: 'other', label: 'אחר', icon: FileText, cat: 'insurance' },
];

const PERSONAL_TYPES = ["תור לרופא","חתונה","בר מצווה","בת מצווה","אירוע בעבודה","הופעה","יום הולדת","טיסה / חופשה","אחר"];
const PERSONAL_EMOJI: Record<string,string> = {
  "תור לרופא":"🩺",
  "חתונה":"💒",
  "בר מצווה":"✡️",
  "בת מצווה":"👧",
  "אירוע בעבודה":"💼",
  "הופעה":"🎤",
  "יום הולדת":"🎂",
  "טיסה / חופשה":"✈️",
  "אחר":"📅",
};
const PERSONAL_BADGE: Record<string,{bg:string;color:string;border:string}> = {
  "תור לרופא":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "חתונה":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "בר מצווה":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "בת מצווה":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "אירוע בעבודה":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "הופעה":{bg:"bg-zinc-900",color:"text-white",border:"border-zinc-900"},
  "יום הולדת":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "טיסה / חופשה":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
  "אחר":{bg:"bg-zinc-50",color:"text-zinc-700",border:"border-zinc-200"},
};

const PROVIDERS_KH = ["הראל","כלל","מגדל","הפניקס","ביטוח ישיר","AIG","שירביט","שלמה ביטוח","ליברה","פרטנר","סלקום","פלאפון","הוט","הוט מובייל","יס","סלקום TV","ישראכרט","כאל","מקס","לאומי קארד","בזק","בזק בינלאומי"];
const COMPANIES_SH = ["הראל","כלל","מגדל","הפניקס","ביטוח ישיר","AIG","שירביט","ביטוח חקלאי","ליברה","פרטנר","סלקום","פלאפון","הוט","יס","ישראכרט","כאל","מקס"];
const NA_MAP: Record<string,string[]> = {
  car: ["חובה","מקיף","צד ג'"],
  credit: ["ישראכרט זהב","מקס Platinum","כאל Business","ישראכרט Black","הוט ויזה"],
};
const EH_VEHICLE = ["פרטי","מסחרי","אופנוע","ג'יפ","חשמלי"];

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000*60*60*24));
}
function getStatus(days: number) {
  // Amber Glow - warm premium tags
  if (days < 0) return { key: 'expired', label: 'פג תוקף', color: 'bg-amber-400', text: 'text-amber-800', bgLight: 'bg-amber-100', border: 'border-amber-200', dot: 'bg-red-500' };
  if (days <= 7) return { key: 'week', label: 'מסתיים השבוע', color: 'bg-amber-400', text: 'text-amber-800', bgLight: 'bg-amber-100', border: 'border-amber-200', dot: 'bg-amber-600' };
  if (days <= 30) return { key: 'month', label: 'מסתיים החודש', color: 'bg-amber-400', text: 'text-amber-800', bgLight: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
  return { key: 'ok', label: 'בתוקף', color: 'bg-amber-400', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-400' };
}
function reminderTypeToCategory(rt: ReminderType): Category {
  const found = REMINDER_TYPES.find(r=>r.key===rt);
  return found ? found.cat : 'insurance';
}
function getItemFiles(item: TazItem): TazFile[] {
  if (item.files && item.files.length > 0) return item.files;
  if (item.fileData) return [{ data: item.fileData, name: item.fileName || 'קובץ', type: (item.fileType as any) || 'image' }];
  return [];
}

function getTodayStr() {
  return new Date().toISOString().slice(0,10);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : '';
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function matchesSearch(item: TazItem, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const fields = [
    item.providerName,
    item.subType,
    item.notes,
    item.policyNumber,
    item.vehicleNumber,
    item.location,
    item.contactPerson,
    item.accountNumber,
    item.insuranceKind,
    item.vehicleType,
    item.ticketLink,
  ].filter(Boolean) as string[];
  const fileNames = getItemFiles(item).map(f=>f.name).join(' ');
  const hay = [...fields, fileNames].join(' ').toLowerCase();
  return hay.includes(lower);
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-yellow-200/80 text-slate-900 rounded-[3px] px-0.5 py-0">{match}</mark>
      {after.length > 60 ? after.slice(0, 60) : after}
      {after.length > 60 ? '…' : ''}
    </>
  );
}

export default function App() {
  const [items, setItems] = useState<TazItem[]>(()=>[]);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'week' | 'month'>('all');
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all');
  const [viewItem, setViewItem] = useState<TazItem | null>(null);
  const [showView, setShowView] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TazItem | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // import/export states
  const [showExport, setShowExport] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<TazItem[] | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragOverApp, setIsDragOverApp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TazItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(()=>{
    const t = setTimeout(()=>setDebouncedSearch(search.trim()), 200);
    return ()=>clearTimeout(t);
  },[search]);

  // notifications - REAL WEB PUSH
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(()=> {
    if (typeof window !== 'undefined' && 'Notification' in window) return Notification.permission;
    return 'unsupported';
  });
  const [notifEnabled, setNotifEnabled] = useState<boolean>(()=>{
    try { return localStorage.getItem('tazkorato_notifications_enabled') !== 'false'; } catch { return true; }
  });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [lastNotifDate, setLastNotifDate] = useState<string>(()=>{
    try { return localStorage.getItem('tazkorato_lastNotificationDate') || ''; } catch { return ''; }
  });
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [pushSub, setPushSub] = useState<PushSubscription | null>(null);
  const [notifHour, setNotifHour] = useState<string>(()=>{
    try { return localStorage.getItem('tazkorato_notif_hour') || '09:00'; } catch { return '09:00'; }
  });
  const [showBackendCode, setShowBackendCode] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [swReady, setSwReady] = useState(false);
  const [swError, setSwError] = useState<string | null>(null);
  const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LF8C7h1yP5v2K9aB8cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aBcDeFgHiJkLmNoPqRsTuVwXyZAB';

  // PWA install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [showManualInstall, setShowManualInstall] = useState(false);
  const [showVercelFiles, setShowVercelFiles] = useState(false);
  const [isSecure, setIsSecure] = useState<boolean>(false);

  useEffect(() => {
    try {
      const keys = ['tazkorato_items_v2', 'tazkorato_items', 'tazkorato', 'tazkorato_list'];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw !== null) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const migrated = (parsed as TazItem[]).map((it: any) => {
                if (it.fileData && (!it.files || it.files.length === 0)) {
                  return { ...it, files: [{ data: it.fileData, name: it.fileName || 'קובץ', type: it.fileType || 'image' }] };
                }
                return it;
              });
              setItems(migrated);
              hasLoadedRef.current = true;
              return;
            }
          } catch {}
        }
      }
      setItems([]);
      hasLoadedRef.current = true;
    } catch {
      setItems([]);
      hasLoadedRef.current = true;
    }
  }, []);
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    try {
      localStorage.setItem('tazkorato_items_v2', JSON.stringify(items));
      localStorage.setItem('tazkorato_items', JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(()=>{
    try { localStorage.setItem('tazkorato_notifications_enabled', String(notifEnabled)); } catch {}
  },[notifEnabled]);

  useEffect(()=>{
    try { localStorage.setItem('tazkorato_notif_hour', notifHour); } catch {}
  },[notifHour]);

  // === PWA: manifest + meta tags + SW registration ===
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    try {
      setIsSecure(window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    } catch {}
    const iconSvg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2318181b'/><text x='50' y='68' font-size='60' text-anchor='middle' fill='white' font-weight='bold'>ת</text></svg>";
    // manifest link - real file for GitHub/Vercel, fallback blob for single-file preview
    try {
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      // try real file first - if we are in single file preview, use blob
      link.href = '/manifest.json';
      // quick check: if fetch fails, fallback to blob
      fetch('/manifest.json').then(r=>{
        if (!r.ok) throw new Error('no manifest');
      }).catch(()=>{
        try {
          const manifestObj = {
            name: "תזכורתו - ניהול תזכורות",
            short_name: "תזכורתו",
            description: "ניהול ביטוחים, אשראי, הופעות והתחייבויות",
            start_url: "/",
            display: "standalone",
            background_color: "#FFFBEB",
            theme_color: "#F59E0B",
            orientation: "portrait-primary",
            icons: [
              { src: iconSvg, sizes: "192x192", type: "image/svg+xml" },
              { src: iconSvg, sizes: "512x512", type: "image/svg+xml" }
            ]
          };
          const blob = new Blob([JSON.stringify(manifestObj)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          link!.href = url;
        } catch {}
      });
    } catch {}
    // theme-color + apple meta
    try {
      const ensureMeta = (name:string, content:string, attr: 'name' | 'property' = 'name') => {
        let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };
      ensureMeta('theme-color', '#F59E0B');
      ensureMeta('apple-mobile-web-app-capable', 'yes');
      ensureMeta('apple-mobile-web-app-status-bar-style', 'default');
      ensureMeta('apple-mobile-web-app-title', 'תזכורתו');
      // apple-touch-icon
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = iconSvg;
    } catch {}
  },[]);

  // === Service Worker registration - robust for Vercel - NO STUCK ===
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const supported = 'serviceWorker' in navigator;
    setIsPushSupported(supported && 'PushManager' in window && 'Notification' in window);
    if (!supported) {
      setSwError('דפדפן לא תומך ב-Service Worker - התראות יעבדו רק כשהאתר פתוח');
      setSwReady(false);
      return;
    }
    let timeoutId: any = null;
    const failSafe = () => {
      console.log('SW timeout - fallback to no-SW mode');
      setSwError('SW לא נטען (timeout) - התראות יעבדו רק כשהאתר פתוח בדפדפן');
      setSwReady(false);
    };
    // אם תוך 6 שניות לא נרשם - אל תתקע על "טוען"
    timeoutId = setTimeout(failSafe, 6000);

    (async () => {
      try {
        // נסה /sw.js - חייב להיות ב-root ב-Vercel
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
        clearTimeout(timeoutId);
        console.log('SW registered /sw.js', reg.scope);
        setSwReg(reg);
        setSwReady(true);
        setSwError(null);
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setPushSub(sub);
            try { localStorage.setItem('pushSubscription', JSON.stringify(sub)); } catch {}
          }
        } catch {}
      } catch (e: any) {
        console.log('SW /sw.js failed, trying inline blob', e?.message);
        try {
          // fallback: inline SW - עובד גם אם אין קובץ ב-Vercel
          const swCode = `
            self.addEventListener('install', (e) => { self.skipWaiting(); });
            self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
            self.addEventListener('push', (event) => {
              let data = { title: 'תזכורתו', body: 'יש לך תזכורות דחופות' };
              try { if (event.data) { const p = event.data.json(); data = { ...data, ...p }; } } catch {}
              event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/favicon.ico', vibrate: [200,100,200], tag: 'tazkorto', data: { url: '/' } }));
            });
            self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(clients.openWindow('/')); });
          `;
          const blob = new Blob([swCode], { type: 'application/javascript' });
          const url = URL.createObjectURL(blob);
          const reg = await navigator.serviceWorker.register(url, { scope: '/' });
          await navigator.serviceWorker.ready;
          clearTimeout(timeoutId);
          setSwReg(reg);
          setSwReady(true);
          setSwError(null);
          console.log('SW blob ok', reg.scope);
        } catch (e2: any) {
          clearTimeout(timeoutId);
          console.error('SW all failed', e2);
          // לא נתקע - אפשר התראות בלי SW
          setSwError('Service Worker נכשל, אבל התראות בדפדפן עדיין יעבדו כשהאתר פתוח');
          setSwReady(false);
          setIsPushSupported(false);
        }
      }
    })();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  },[]);

  useEffect(()=>{
    if (!swReg) return;
    try {
      swReg.pushManager.getSubscription().then(sub=>{
        if (sub) {
          setPushSub(sub);
          try { localStorage.setItem('pushSubscription', JSON.stringify(sub)); } catch {}
        }
      }).catch(()=>{});
    } catch {}
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  },[swReg]);

  // PWA install prompt handling
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const checkInstalled = () => {
      try {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsInstalled(true);
        }
        // @ts-ignore iOS
        if ((window.navigator as any).standalone === true) {
          setIsInstalled(true);
        }
      } catch {}
    };
    checkInstalled();
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setToast('האפליקציה הותקנה בהצלחה! ✅');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  },[]);

  const filteredByCategory = useMemo(() => {
    if (activeTab === 'all') return [...items];
    return items.filter(i => i.category === activeTab);
  }, [items, activeTab]);

  const urgentItems = useMemo(()=>{
    return [...items].filter(i=>daysUntil(i.expiryDate) <= 7).sort((a,b)=>daysUntil(a.expiryDate)-daysUntil(b.expiryDate));
  },[items]);

  const statsData = useMemo(() => {
    const expired = filteredByCategory.filter(i => daysUntil(i.expiryDate) < 0).length;
    const week = filteredByCategory.filter(i => { const d = daysUntil(i.expiryDate); return d >= 0 && d <= 7; }).length;
    const month = filteredByCategory.filter(i => { const d = daysUntil(i.expiryDate); return d >= 0 && d <= 30; }).length;
    return { expired, week, month };
  }, [filteredByCategory]);

  const finalFiltered = useMemo(()=>{
    let list = [...filteredByCategory];
    if (debouncedSearch) list = list.filter(i=>matchesSearch(i, debouncedSearch));
    if (expiryFilter === 'expired') list = list.filter(i => daysUntil(i.expiryDate) < 0);
    else if (expiryFilter === 'week') list = list.filter(i => { const d = daysUntil(i.expiryDate); return d >= 0 && d <= 7; });
    else if (expiryFilter === 'month') list = list.filter(i => { const d = daysUntil(i.expiryDate); return d >= 0 && d <= 30; });
    return list.sort((a,b)=>daysUntil(a.expiryDate)-daysUntil(b.expiryDate));
  },[filteredByCategory, expiryFilter, debouncedSearch]);

  const toggleExpiry = (key: 'expired' | 'week' | 'month') => {
    setExpiryFilter(prev => prev === key ? 'all' : key);
  };
  const openDeleteConfirm = (item: TazItem) => {
    setDeleteConfirmItem(item);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setTimeout(()=>setDeleteConfirmItem(null), 200);
  };
  const confirmDelete = () => {
    if (!deleteConfirmItem) return;
    const id = deleteConfirmItem.id;
    setItems(prev => prev.filter(i => i.id !== id));
    if (viewItem?.id === id) { setShowView(false); setViewItem(null); }
    setShowDeleteConfirm(false);
    setToast(`נמחק: ${deleteConfirmItem.providerName}`);
    setTimeout(()=>setDeleteConfirmItem(null), 250);
  };
  const handleDelete = (id: string) => {
    const found = items.find(i=>i.id===id) || (viewItem?.id===id ? viewItem : null);
    if (found) openDeleteConfirm(found);
  };
  const openView = (item: TazItem) => { setViewItem(item); setShowView(true); };
  const openEdit = (item: TazItem) => { setEditing(item); setShowForm(true); setShowView(false); };
  const openNew = () => { setEditing(null); setShowForm(true); };
  const closeView = () => { setShowView(false); setViewItem(null); };
  const downloadSingle = (f: TazFile) => {
    const a = document.createElement('a');
    a.href = f.data;
    a.download = f.name || 'file';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const downloadAllFiles = (files: TazFile[]) => {
    files.forEach((f, idx) => {
      setTimeout(() => downloadSingle(f), idx * 300);
    });
  };

  // === notifications logic - REAL + spec compliant ===
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { setNotifPermission('unsupported'); return; }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setNotifEnabled(true);
        const urgentCount = items.filter(i=>daysUntil(i.expiryDate)<=7).length;
        // spec: התראת בדיקה
        try {
          if (swReg) {
            await swReg.showNotification('תזכורתו - התראות הופעלו! 🎉', {
              body: `תקבל התראה כל יום עבור ${urgentCount} תזכורות`,
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2318181b'/><text x='50' y='68' font-size='60' text-anchor='middle' fill='white' font-weight='bold'>ת</text></svg>",
              badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2318181b'/><text x='50' y='68' font-size='60' text-anchor='middle' fill='white' font-weight='bold'>ת</text></svg>",
              vibrate: [200, 100, 200],
              tag: 'tazkorto-activated',
              requireInteraction: true,
              data: { url: '/' }
            } as any);
          } else {
            new Notification('תזכורתו - התראות הופעלו! 🎉', { body: `תקבל התראה כל יום עבור ${urgentCount} תזכורות` } as any);
          }
          setToast('התראות הופעלו! 🎉');
        } catch {
          setToast('התראות אושרו ✅');
        }
        try { localStorage.setItem('tazkorato_lastNotificationDate', getTodayStr()); setLastNotifDate(getTodayStr()); } catch {}
      } else if (perm === 'denied') {
        setToast('התראות נחסמו בדפדפן - אפשר בהגדרות האתר');
      }
    } catch {}
  };

  const subscribeToPush = async () => {
    if (!isPushSupported) {
      setToast('הדפדפן לא תומך ב-Push. נסה כרום באנדרואיד');
      return;
    }
    if (!swReg) {
      setToast('Service Worker עדיין נטען... נסה שוב בעוד שניה');
      return;
    }
    try {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm !== 'granted') {
          setToast('צריך לאשר התראות');
          return;
        }
      }
      const existing = await swReg.pushManager.getSubscription();
      if (existing) {
        setPushSub(existing);
        try { localStorage.setItem('pushSubscription', JSON.stringify(existing)); } catch {}
        setNotifEnabled(true);
        setToast('כבר רשום ל-Push ✅');
        // שימוש ב-reg.showNotification לפי דרישה
        await swReg.showNotification('תזכורתו - מחובר! 📲', {
          body: `ההתראות פעילות. תקבל סיכום כל יום ב-${notifHour}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: 'tazkorto-connected',
          data: { url: '/' },
        } as any);
        return;
      }
      let subscription: PushSubscription | null = null;
      try {
        subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
        });
      } catch (e) {
        console.log('VAPID failed, trying without key for local demo', e);
        try {
          // @ts-ignore
          subscription = await swReg.pushManager.subscribe({ userVisibleOnly: true });
        } catch (e2) {
          console.log('push subscribe failed completely', e2);
        }
      }
      if (subscription) {
        setPushSub(subscription);
        try { localStorage.setItem('pushSubscription', JSON.stringify(subscription)); } catch {}
        setNotifEnabled(true);
        localStorage.setItem('tazkorato_lastNotificationDate', getTodayStr());
        setLastNotifDate(getTodayStr());
        await swReg.showNotification('תזכורתו - ההתראות הופעלו! 📲', {
          body: `מעולה! תקבל התראה כל יום ב-${notifHour}. גם כשהאתר סגור.`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200, 100, 200],
          tag: 'tazkorto-activated',
          requireInteraction: true,
          data: { url: '/' },
        } as any);
        setToast('התראות לטלפון הופעלו בהצלחה! 📱');
      } else {
        await swReg.showNotification('תזכורתו - התראות מקומיות פעילות 📲', {
          body: `הדפדפן מאפשר התראות. בשביל Push אמיתי ברקע צריך שרת. בינתיים תקבל התראה כשאתה באתר.`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: 'tazkorto-local',
          requireInteraction: true,
          data: { url: '/' },
        } as any);
        setNotifEnabled(true);
        setToast('הופעלו התראות מקומיות - צריך backend ל-Push אמיתי ברקע');
      }
    } catch (err: any) {
      console.error('subscribeToPush error', err);
      setToast('שגיאה בהפעלת Push: ' + (err?.message || ''));
    }
  };

  const sendTestPush = async () => {
    try {
      // דרישה: להשתמש ב-reg.showNotification ולא new Notification
      const reg = swReg || await navigator.serviceWorker.ready;
      await reg.showNotification('תזכורתו - בדיקת טלפון 📱', {
        body: 'זו התראה אמיתית מהטלפון! אם אתה רואה אותה מחוץ לאתר - זה עובד! 🎉',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'tazkorto-test',
        requireInteraction: true,
        data: { url: '/' },
      } as any);
      setToast('נשלחה התראת בדיקה לטלפון! 📲 בדוק בשורת ההתראות');
      localStorage.setItem('tazkorato_lastNotificationDate', getTodayStr());
      setLastNotifDate(getTodayStr());
    } catch (e: any) {
      console.error('test push failed', e);
      if (swError) {
        setToast('SW שגיאה: ' + swError + ' - התראות יעבדו רק כשהאתר פתוח');
      } else {
        setToast('שגיאה בשליחת התראת בדיקה: ' + (e?.message || ''));
      }
      // fallback old Notification API
      try {
        if (Notification.permission === 'granted') {
          new Notification('תזכורתו - בדיקת טלפון 📱', { body: 'זו התראה אמיתית מהטלפון!' } as any);
        }
      } catch {}
    }
  };

  const triggerDailyNotification = async (force = false) => {
    if (!swReg) {
      // fallback old way
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const today = getTodayStr();
      const last = (()=>{ try { return localStorage.getItem('tazkorato_lastNotificationDate')||'';} catch{ return ''; }})();
      if (!force && last === today) return;
      const urgent = items.filter(i=>daysUntil(i.expiryDate) <=7);
      if (urgent.length===0) return;
      const names = urgent.slice(0,3).map(i=>i.providerName).join(', ');
      const more = urgent.length>3 ? ` ועוד ${urgent.length-3}` : '';
      try {
        new Notification('תזכורתו - תזכורות דחופות', { body: `יש לך ${urgent.length} תזכורות: ${names}${more}`, tag: 'tazkorato-daily' } as any);
        localStorage.setItem('tazkorato_lastNotificationDate', today);
        setLastNotifDate(today);
      } catch {}
      return;
    }
    if (!notifEnabled && !force) return;
    const today = getTodayStr();
    const last = (()=>{ try { return localStorage.getItem('tazkorato_lastNotificationDate')||'';} catch{ return ''; }})();
    if (!force && last === today) return;
    const urgent = items.filter(i=>daysUntil(i.expiryDate) <=7);
    if (urgent.length===0 && !force) return;
    try {
      const names = urgent.slice(0,3).map(i=>i.providerName).join(', ');
      const more = urgent.length>3 ? ` ועוד ${urgent.length-3}` : '';
      const body = urgent.length>0 ? `יש לך ${urgent.length} תזכורות שדורשות טיפול: ${names}${more}` : 'הכל בתוקף - אין תזכורות דחופות היום';
      await swReg.showNotification('תזכורתו - סיכום יומי 📅', {
        body,
        icon: 'https://favicons.vercel.app/tazkorto.vercel.app',
        badge: 'https://favicons.vercel.app/tazkorto.vercel.app',
        vibrate: [200, 100, 200],
        tag: 'tazkorto-daily',
        requireInteraction: true,
        data: { url: '/' },
      } as any);
      localStorage.setItem('tazkorato_lastNotificationDate', today);
      setLastNotifDate(today);
    } catch (e) {
      console.log('daily push failed', e);
    }
  };

  const handleInstall = async () => {
    // אם יש prompt אמיתי של Chrome - השתמש בו
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setToast('האפליקציה הותקנה! 📲');
        } else {
          setToast('ההתקנה בוטלה - תוכל לנסות שוב מהתפריט');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
        return;
      } catch (e) {
        console.log('install prompt failed', e);
      }
    }
    // fallback - תמיד הצג מדריך ידני
    setShowManualInstall(true);
  };

  // check HTTPS on mount
  useEffect(()=>{
    try {
      setIsSecure(typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost'));
    } catch {}
  },[]);

  // check on mount and when items change (once per day) - uses real showNotification
  useEffect(()=>{
    if (!('Notification' in window)) return;
    setNotifPermission(Notification.permission);
    const today = getTodayStr();
    const last = (()=>{ try { return localStorage.getItem('tazkorato_lastNotificationDate')||'';} catch{ return ''; }})();
    if (last !== today && Notification.permission==='granted' && notifEnabled && swReg) {
      const urgent = items.filter(i=>daysUntil(i.expiryDate)<=7);
      if (urgent.length>0) {
        const t = setTimeout(()=>triggerDailyNotification(false), 2000);
        return ()=>clearTimeout(t);
      }
    }
  },[items, swReg]);

  // also poll once per hour while app open
  useEffect(()=>{
    if (!('Notification' in window)) return;
    const iv = setInterval(()=>{
      const today = getTodayStr();
      const last = (()=>{ try { return localStorage.getItem('tazkorato_lastNotificationDate')||'';} catch{ return ''; }})();
      if (last !== today && Notification.permission==='granted' && notifEnabled) {
        triggerDailyNotification(false);
      }
    }, 60*60*1000);
    return ()=>clearInterval(iv);
  },[items, notifEnabled, swReg]);

  // === export / import logic - minimal ===
  const exportPayload = useMemo(() => ({
    app: 'tazkorato',
    version: 1,
    exportedAt: new Date().toISOString(),
    items
  }), [items]);

  const exportStats = useMemo(() => {
    const filesCount = items.reduce((acc, it) => acc + getItemFiles(it).length, 0);
    return { items: items.length, files: filesCount };
  }, [items]);

  const getExportFileName = () => {
    const d = new Date().toISOString().slice(0,10);
    return `tazkorato-${d}.json`;
  };

  const triggerDownload = (dataStr: string, fileName: string) => {
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportDownload = () => {
    const json = JSON.stringify(exportPayload, null, 2);
    triggerDownload(json, getExportFileName());
    setToast(`הקובץ הורד - ${exportStats.items} תזכורות`);
    setShowExport(false);
  };

  // מחושב לגודל לתצוגת אזהרה במודל
  const exportJsonSize = useMemo(() => {
    try {
      return JSON.stringify(exportPayload).length;
    } catch {
      return 0;
    }
  }, [exportPayload]);

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${bytes}B`;
  };

  const handleExportShareFile = async () => {
    const jsonString = JSON.stringify(exportPayload, null, 2);
    const fileName = getExportFileName();
    const file = new File([jsonString], fileName, { type: 'text/plain' });

    try {
      // נסה ישירות בלי canShare - כי canShare לפעמים משקר
      await (navigator as any).share({
        files: [file],
        title: 'גיבוי תזכורתו',
        text: `גיבוי ${exportStats.items} תזכורות מתזכורתו`
      });
      setToast('הקובץ שותף בהצלחה ✅');
      setShowExport(false);
      return;
    } catch (err: any) {
      console.log('share failed', err?.name, err?.message);
      if (err?.name === 'AbortError') return;
      // אם נכשל עם text/plain, נסה עם application/json כ-fallback
      try {
        const file2 = new File([jsonString], fileName, { type: 'application/json' });
        await (navigator as any).share({ files: [file2], title: 'גיבוי תזכורתו' });
        setToast('הקובץ שותף בהצלחה ✅');
        setShowExport(false);
        return;
      } catch (e2: any) {
        if (e2?.name === 'AbortError') return;
      }
      // אם גם זה נכשל, נסה שיתוף טקסט בלבד (זה תמיד פותח תפריט אפליקציות)
      try {
        if ((navigator as any).share) {
          await (navigator as any).share({
            title: 'גיבוי תזכורתו',
            text: `גיבוי תזכורתו - ${exportStats.items} תזכורות - ${new Date().toLocaleDateString('he-IL')}\n\nהורד את קובץ ה-JSON מהאפליקציה`
          });
          // אחרי שיתוף טקסט, תוריד גם את הקובץ אוטומטית כדי שיהיה להם
          setTimeout(() => triggerDownload(jsonString, fileName), 500);
          setShowExport(false);
          return;
        }
      } catch {}
    }

    setToast('שיתוף קבצים לא נתמך, מוריד קובץ');
    handleExportDownload();
  };

  const parseImportJson = (text: string): TazItem[] | null => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        // direct array
        return parsed as TazItem[];
      }
      if (parsed && Array.isArray(parsed.items)) {
        return parsed.items as TazItem[];
      }
      if (parsed && parsed.data && Array.isArray(parsed.data)) {
        return parsed.data as TazItem[];
      }
      return null;
    } catch {
      return null;
    }
  };

  const parseImportCsv = (text: string): TazItem[] | null => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return null;
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
      const hasHeader = headers.some(h => ['providerName','provider','ספק','title'].includes(h) || h.includes('provider'));
      const startIdx = hasHeader ? 1 : 0;
      const result: TazItem[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g,''));
        // very basic mapping: assume order providerName, subType, expiryDate, cost, notes
        const providerName = cols[0] || `יבוא ${i}`;
        const subType = cols[1] || 'אחר';
        const expiryDate = cols[2] || new Date().toISOString().slice(0,10);
        const cost = cols[3] ? Number(cols[3]) : undefined;
        const notes = cols[4] || '';
        if (!providerName) continue;
        result.push({
          id: Math.random().toString(36).slice(2,9),
          category: 'insurance',
          reminderType: 'other',
          providerName,
          subType,
          expiryDate,
          cost,
          notes,
          files: []
        });
      }
      return result.length ? result : null;
    } catch {
      return null;
    }
  };

  const processFile = async (file: File) => {
    setImportError(null);
    setPendingFileName(file.name);
    try {
      const text = await file.text();
      let parsedItems: TazItem[] | null = null;
      if (file.name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        parsedItems = parseImportJson(text);
      }
      if (!parsedItems && (file.name.endsWith('.csv') || text.includes(','))) {
        parsedItems = parseImportCsv(text);
        if (!parsedItems) {
          // try json again if csv failed
          parsedItems = parseImportJson(text);
        }
      }
      if (!parsedItems) {
        setImportError('הקובץ אינו תקין. ודא שזהו קובץ גיבוי JSON של תזכורתו או CSV תקני.');
        return;
      }
      // sanitize
      const sanitized = parsedItems.filter(it => it && it.providerName && it.expiryDate).map((it: any) => {
        // ensure files migrated
        let files: TazFile[] = [];
        if (it.files && Array.isArray(it.files)) files = it.files;
        else if (it.fileData) files = [{ data: it.fileData, name: it.fileName || 'קובץ', type: it.fileType || 'image' }];
        return {
          ...it,
          id: it.id || Math.random().toString(36).slice(2,9),
          category: it.category || 'insurance',
          subType: it.subType || it.insuranceKind || 'אחר',
          files,
        } as TazItem;
      });
      if (sanitized.length === 0) {
        setImportError('לא נמצאו תזכורות תקינות בקובץ.');
        return;
      }
      setPendingImport(sanitized);
      setShowImportConfirm(true);
    } catch (e: any) {
      setImportError('שגיאה בקריאת הקובץ: ' + (e?.message || 'לא ידוע'));
    }
  };

  const handleImportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    if (e.target) e.target.value = '';
  };

  const handleImportMerge = () => {
    if (!pendingImport) return;
    const existingIds = new Set(items.map(i => i.id));
    const newOnes = pendingImport.filter(it => !existingIds.has(it.id));
    // if id clash but different content, generate new id to avoid loss
    const withNewIds = pendingImport.map(it => existingIds.has(it.id) ? { ...it, id: Math.random().toString(36).slice(2,9) } : it);
    // actually we want merge: add all that are not duplicate id; if duplicate, skip? spec says skip duplicates by id, but we generate new id to preserve both? We'll do skip to avoid dup.
    const merged = [...items, ...newOnes];
    // if all duplicate ids, we still add with new ids to not lose data - count difference
    const final = newOnes.length === 0 ? [...items, ...withNewIds.slice(0, pendingImport.length).filter((_, idx) => !newOnes.includes(pendingImport[idx]))] : merged;
    // Simpler: use newOnes if exists else add with new ids
    const toAdd = newOnes.length > 0 ? newOnes : pendingImport.map(it => ({ ...it, id: Math.random().toString(36).slice(2,9) }));
    setItems(prev => [...prev, ...toAdd]);
    setShowImportConfirm(false);
    setPendingImport(null);
    setToast(`מוזגו ${toAdd.length} תזכורות בהצלחה`);
  };

  const handleImportReplace = () => {
    if (!pendingImport) return;
    if (!confirm(`זה ימחק ${items.length} פריטים קיימים ויחליף אותם ב-${pendingImport.length} פריטים מהקובץ. להמשיך?`)) return;
    setItems(pendingImport);
    setShowImportConfirm(false);
    setPendingImport(null);
    setToast(`הוחלפו ${pendingImport.length} תזכורות בהצלחה`);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div
      dir="rtl"
      className="min-h-screen text-zinc-800 font-sans antialiased selection:bg-zinc-900 selection:text-white relative"
      style={{ backgroundColor: '#FFFBEB', backgroundImage: 'radial-gradient(at 20% 0%, rgba(251,191,36,0.15) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(245,158,11,0.12) 0px, transparent 40%), radial-gradient(at 50% 100%, rgba(253,224,71,0.10) 0px, transparent 50%)' }}
      onDragOver={(e)=>{ e.preventDefault(); setIsDragOverApp(true); }}
      onDragLeave={(e)=>{ if (e.currentTarget === e.target) setIsDragOverApp(false); }}
      onDrop={(e)=>{ e.preventDefault(); setIsDragOverApp(false); const f = e.dataTransfer.files?.[0]; if (f && (f.name.endsWith('.json') || f.name.endsWith('.csv') || f.type.includes('json'))) { processFile(f); } }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800&display=swap');*{font-family:'Heebo',system-ui,-apple-system,sans-serif;}
      @keyframes slideIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>

      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-amber-100">
        <div className="h-[48px] px-4 max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-amber-400 font-bold text-[13px] shadow-sm ring-1 ring-amber-200/50">ת</div>
            <span className="font-semibold text-[15px] tracking-tight text-zinc-900">תזכורתו</span>
          </div>
          <div className="flex items-center gap-2">
            {/* bell */}
            <button onClick={()=>setShowNotifModal(true)} className="relative h-7 w-7 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center hover:bg-amber-50 transition">
              <Bell className={`w-4 h-4 ${urgentItems.length>0 ? 'text-zinc-900' : 'text-zinc-600'}`} />
              {urgentItems.length>0 && (
                <>
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">{urgentItems.length > 9 ? '9+' : urgentItems.length}</span>
                </>
              )}
            </button>
            {/* כפתור התקנה שתמיד מוצג - אם אין prompt נפתח מדריך ידני */}
            {!isInstalled ? (
              <button onClick={handleInstall} className="h-7 px-2.5 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black shadow-sm ring-1 ring-amber-200/30 text-[11px] font-bold gap-1" title="התקן כאפליקציה">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">התקן</span>
                <span className="sm:hidden">📲</span>
              </button>
            ) : (
              <span className="h-7 px-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-sm text-[10px] font-bold gap-1" title="מותקן כאפליקציה">
                <Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">מותקן</span>
              </span>
            )}
            <span className="text-[12px] text-zinc-600 hidden sm:block">{items.length} פריטים</span>
            <input ref={importFileRef} type="file" accept=".json,.csv" className="hidden" onChange={handleImportInputChange} />
            <button onClick={()=>setShowExport(true)} className="h-7 px-2.5 rounded-full bg-white border border-amber-200 shadow-sm text-[11px] font-medium flex items-center gap-1 hover:bg-amber-50 transition text-zinc-700" title="ייצוא גיבוי">
              <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">ייצא</span><span className="sm:hidden">ייצוא</span>
            </button>
            <button onClick={()=>{ setToast('בחר קובץ JSON או CSV לייבוא'); setTimeout(()=>importFileRef.current?.click(), 100); }} className="h-7 px-2.5 rounded-full bg-white border border-amber-200 shadow-sm text-[11px] font-medium flex items-center gap-1 hover:bg-amber-50 transition text-zinc-700" title="ייבוא גיבוי">
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">ייבא</span><span className="sm:hidden">ייבוא</span>
            </button>
            <button onClick={openNew} className="h-7 px-3 rounded-full bg-zinc-900 text-white text-[12px] font-medium flex items-center gap-1 hover:bg-black transition shadow-sm ring-1 ring-amber-200/30"><Plus className="w-3.5 h-3.5" /> חדש</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 py-4 pb-24">
        {/* באנר התראות - אם יש דחופות ולא אושרו */}
        {urgentItems.length>0 && notifPermission !== 'granted' && (
          <div className="mb-4 rounded-2xl bg-zinc-900 text-white p-3.5 flex items-center gap-3 shadow-lg shadow-zinc-900/10 border border-zinc-800 animate-[slideIn_0.3s_ease]">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-900 flex items-center justify-center shrink-0"><BellRing className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px]">יש לך {urgentItems.length} תזכורות דחופות</div>
              <div className="text-[11px] text-zinc-300 mt-0.5">אפשר התראות כדי לקבל תזכורת יומית גם כשהאתר סגור</div>
            </div>
            <button onClick={requestNotificationPermission} className="h-9 px-4 rounded-full bg-amber-400 text-zinc-900 text-[12px] font-bold hover:bg-amber-500 transition shrink-0">אפשר התראות</button>
            <button onClick={()=>setNotifPermission('denied' as any)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>
        )}
        {/* search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="חיפוש תזכורות, ספק, הערות..."
              className="w-full h-[44px] pr-10 pl-10 rounded-xl bg-white border border-amber-200 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            />
            {search && (
              <button onClick={()=>{ setSearch(''); setDebouncedSearch(''); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-100 flex items-center justify-center text-zinc-600 transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {debouncedSearch && (
            <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
              {finalFiltered.length>0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">נמצאו <span className="font-bold text-slate-900">{finalFiltered.length}</span> תוצאות עבור <span className="font-bold text-slate-900">'{debouncedSearch}'</span></span>
                  <button onClick={()=>{ setSearch(''); setDebouncedSearch(''); }} className="h-6 px-2.5 rounded-full bg-slate-900 text-white text-[11px] font-medium hover:bg-black">נקה</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">לא נמצאו תוצאות עבור <span className="font-bold">'{debouncedSearch}'</span></span>
                  <button onClick={()=>{ setSearch(''); setDebouncedSearch(''); }} className="h-6 px-2.5 rounded-full bg-white border text-[11px]">נקה חיפוש</button>
                </div>
              )}
              <div className="text-[10px] text-slate-400 hidden sm:block">מחפש ב: ספק, סוג, הערות, פוליסה, רכב, מיקום, איש קשר, קבצים</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { key:'expired' as const, label:'פג תוקף', count: statsData.expired, base:'bg-white/80 backdrop-blur-sm border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white', active:'bg-zinc-900 border-zinc-900 text-white', iconBg:'bg-amber-400 text-zinc-900 shadow-sm', iconActive:'bg-white text-zinc-900' },
            { key:'week' as const, label:'השבוע', count: statsData.week, base:'bg-white/80 backdrop-blur-sm border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white', active:'bg-zinc-900 border-zinc-900 text-white', iconBg:'bg-amber-400 text-zinc-900 shadow-sm', iconActive:'bg-white text-zinc-900' },
            { key:'month' as const, label:'החודש', count: statsData.month, base:'bg-white/80 backdrop-blur-sm border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white', active:'bg-zinc-900 border-zinc-900 text-white', iconBg:'bg-amber-400 text-zinc-900 shadow-sm', iconActive:'bg-white text-zinc-900' },
          ].map(s=>{
            const isActive = expiryFilter === s.key;
            const Icon = s.key==='expired' ? AlertTriangle : s.key==='week' ? Clock : CalendarClock;
            return (
              <button key={s.key} onClick={()=>toggleExpiry(s.key)} className={`relative text-right rounded-xl border p-3 flex flex-col gap-1.5 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(251,191,36,0.12)] hover:-translate-y-[1px] active:scale-[0.98] shadow-sm ${isActive ? s.active : s.base}`}>
                <div className="flex items-center justify-between"><div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${isActive ? s.iconActive : s.iconBg}`}><Icon className="w-4 h-4" /></div>{isActive && <span className="w-5 h-5 rounded-full bg-white text-zinc-900 flex items-center justify-center"><X className="w-3 h-3" /></span>}</div>
                <div className={`text-[11px] font-medium ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.label}</div>
                <div className="flex items-baseline gap-1.5"><span className={`text-[20px] font-bold leading-none tracking-tight ${isActive ? 'text-white' : 'text-zinc-900'}`}>{s.count}</span><span className={`text-[10px] ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>פריטים</span></div>
              </button>
            )
          })}
        </div>
        {expiryFilter !== 'all' && (
          <div className="mb-3 flex items-center gap-2 text-[12px]">
            <span className="text-zinc-500">מסנן פעיל:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 text-white font-medium">
              {expiryFilter==='expired' ? 'פג תוקף' : expiryFilter==='week' ? 'השבוע' : 'החודש'}
              <button onClick={()=>setExpiryFilter('all')} className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"><X className="w-3 h-3" /></button>
            </span>
            <button onClick={()=>setExpiryFilter('all')} className="text-zinc-500 hover:text-zinc-700 underline underline-offset-2">נקה</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {finalFiltered.map(item=>{
            const days = daysUntil(item.expiryDate);
            const status = getStatus(days);
            const meta = CATEGORY_META[item.category];
            const Icon = meta.icon;
            const files = getItemFiles(item);
            return (
              <div key={item.id} className={`group bg-white/90 backdrop-blur-sm rounded-[16px] border border-amber-200/60 shadow-[0_4px_20px_rgba(251,191,36,0.10),0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)] hover:-translate-y-[1px] transition-all duration-200 flex flex-col`}>
                <div className="h-[4px] w-full bg-amber-400" />
                <div className="p-3.5 flex flex-col gap-2.5 bg-white/60">
                  {/* שורה 1: אייקון + כותרת גדולה + עלות */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2.5 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-zinc-900 flex items-center justify-center shrink-0 font-bold shadow-sm ring-1 ring-amber-300/50"><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0 leading-tight">
                        <div className="font-extrabold text-[19px] tracking-tight leading-[1.2] text-zinc-900 truncate flex items-center gap-1">
                          {item.category==='personal' && item.eventEmoji ? <span className="shrink-0">{item.eventEmoji}</span> : null}
                          <span className="truncate"><Highlight text={item.providerName} query={debouncedSearch} /></span>
                        </div>
                        <div className="text-[11px] text-zinc-600 font-medium mt-0.5 truncate"><Highlight text={item.subType} query={debouncedSearch} /></div>
                      </div>
                    </div>
                    {item.cost !== undefined && (
                      <div className="text-left shrink-0"><div className="text-[10px] text-zinc-500">עלות</div><div className="font-bold text-[13px] text-zinc-900">₪{item.cost}</div></div>
                    )}
                  </div>

                  {/* שורה 2: מטא מאוחד - וריאציה 7 */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold bg-amber-100 text-amber-800 border-amber-200">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
                    </span>
                    <span className="font-medium text-zinc-600">
                      {days<0 ? `${Math.abs(days)} ימים עברו` : `${days} ימים נותרו`}
                    </span>
                    <span className="text-amber-200">·</span>
                    <span className="flex items-center gap-1 text-zinc-600 font-medium"><CalendarClock className="w-3 h-3 text-amber-500" />{new Date(item.expiryDate).toLocaleDateString('he-IL')} {item.eventTime && `· ${item.eventTime}`}</span>
                    {item.location && (
                      <>
                        <span className="text-amber-200">·</span>
                        <span className="flex items-center gap-1 text-zinc-600 truncate max-w-[120px]"><MapPin className="w-3 h-3 text-amber-500" />{item.location}</span>
                      </>
                    )}
                  </div>

                  {/* שורה 3: הערה קטנה */}
                  {item.notes && (
                    <div className="text-[11px] text-zinc-700 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-1.5 line-clamp-1 font-medium" title={item.notes}>
                      {debouncedSearch && item.notes.toLowerCase().includes(debouncedSearch.toLowerCase()) ? <Highlight text={item.notes} query={debouncedSearch} /> : <>{item.notes.slice(0,70)}{item.notes.length>70?'…':''}</>}
                    </div>
                  )}

                  {/* שורה 4: פעולות - תחתית */}
                  <div className="flex items-center justify-between -mx-3.5 -mb-3.5 px-3.5 py-2.5 bg-amber-50/30 border-t border-amber-100/60 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>openView(item)} className="w-8 h-8 rounded-full bg-white border border-amber-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center text-zinc-600 transition shadow-sm" title="צפייה"><Eye className="w-4 h-4" /></button>
                      <button onClick={()=>openEdit(item)} className="w-8 h-8 rounded-full bg-white border border-amber-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center text-zinc-500 transition shadow-sm" title="עריכה"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={()=>handleDelete(item.id)} className="w-8 h-8 rounded-full bg-white border border-amber-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center text-zinc-500 transition shadow-sm" title="מחיקה"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    {item.ticketLink && (
                      <a href={item.ticketLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="h-7 px-3.5 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-black transition shadow-sm ring-1 ring-amber-200/20">
                        <ExternalLink className="w-3.5 h-3.5" /> כרטיסים
                      </a>
                    )}
                    {files.length>0 && !item.ticketLink && (
                      <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1 bg-white border border-amber-100 px-2 py-1 rounded-full shadow-sm"><FileImage className="w-3 h-3 text-amber-500" /> {files.length} קבצים</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {finalFiltered.length===0 && (
          items.length===0 ? (
            <div className="mt-8 sm:mt-14 text-center py-12 sm:py-16 px-6 bg-white/90 backdrop-blur-sm rounded-[24px] border border-amber-200/60 shadow-[0_4px_20px_rgba(251,191,36,0.10)]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CalendarClock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 tracking-tight">אין תזכורות עדיין</h3>
              <p className="text-[13px] sm:text-[14px] text-zinc-600 mt-2 leading-relaxed max-w-[28ch] mx-auto">התזכורות שלך יופיעו כאן. הוסף תזכורת ראשונה ותתחיל לעקוב אחרי כל מה שחשוב.</p>
              <button onPointerDown={openNew} onClick={openNew} className="mt-7 h-12 px-7 rounded-full bg-zinc-900 text-white text-[14px] font-semibold inline-flex items-center gap-2 hover:bg-black transition shadow-lg shadow-zinc-900/20 ring-1 ring-amber-200/30 active:scale-[0.98]">
                <Plus className="w-5 h-5" /> הוסף תזכורת ראשונה
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> נשמר אוטומטית בדפדפן שלך
              </div>
            </div>
          ) : (
            <div className="mt-10 text-center py-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-dashed border-amber-200">
              {debouncedSearch ? (
                <>
                  <Search className="w-8 h-8 mx-auto text-amber-300 mb-2" />
                  <div className="text-[14px] font-medium">לא נמצאו תוצאות עבור '{debouncedSearch}'</div>
                  <div className="text-[12px] text-zinc-600 mt-1">נסה לחפש מילה אחרת או לנקות סינון</div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={()=>{ setSearch(''); setDebouncedSearch(''); }} className="h-9 px-4 rounded-full bg-zinc-900 text-white text-[13px]">נקה חיפוש</button>
                    <button onClick={()=>{ setExpiryFilter('all'); setActiveTab('all'); }} className="h-9 px-4 rounded-full bg-amber-50 border border-amber-100 text-zinc-700 text-[13px]">נקה סינון</button>
                  </div>
                </>
              ) : (
                <>
                  <PartyPopper className="w-8 h-8 mx-auto text-amber-300 mb-2" />
                  <div className="text-[14px] font-medium">לא נמצאו פריטים במסנן הנוכחי</div>
                  <div className="text-[12px] text-zinc-600 mt-1">נסה לשנות קטגוריה או לנקות סינון</div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={()=>{ setExpiryFilter('all'); setActiveTab('all'); }} className="h-9 px-4 rounded-full bg-amber-50 border border-amber-100 text-zinc-700 text-[13px] font-medium hover:bg-amber-100">נקה סינון</button>
                    <button onClick={openNew} className="h-9 px-4 rounded-full bg-zinc-900 text-white text-[13px]">הוסף חדש</button>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-xl border-t border-amber-100 shadow-[0_-4px_20px_rgba(251,191,36,0.08)]">
        <div className="max-w-[520px] mx-auto h-[64px] flex items-center justify-around px-2">
          {[
            { key:'all', label:'הכל', icon: Sparkles },
            { key:'insurance', label:'ביטוח', icon: Shield },
            { key:'cellular', label:'תקשורת ו-TV', icon: Wifi },
            { key:'credit', label:'אשראי', icon: CreditCard },
            { key:'personal', label:'אישי', icon: Calendar },
          ].map(tab=>{
            const isActive = activeTab===tab.key;
            const Icon = tab.icon as any;
            return (<button key={tab.key} onClick={()=>{ setActiveTab(tab.key as any); }} className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition ${isActive ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-amber-50'}`}><Icon className="w-[18px] h-[18px]" /><span className="text-[9px] font-medium leading-tight text-center">{tab.label}</span></button>)
          })}
        </div>
      </nav>

      {showView && viewItem && (
        <div id="view-modal" role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm z-0" onClick={closeView} />
          <div className="relative z-10 w-full sm:max-w-[560px] bg-white sm:rounded-[24px] rounded-t-[24px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="relative z-10 bg-zinc-900 p-5 pb-6 text-white overflow-hidden">
              <button onClick={closeView} className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur z-20 pointer-events-auto cursor-pointer"><X className="w-4 h-4" /></button>
              <div className="flex gap-3.5 items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 shrink-0">
                  {(() => { const Meta = CATEGORY_META[viewItem.category]; const Ico = Meta.icon; return viewItem.category==='personal' && viewItem.eventEmoji ? <span className="text-[26px]">{viewItem.eventEmoji}</span> : <Ico className="w-7 h-7 text-white" />; })()}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="text-[11px] tracking-widest opacity-60 font-medium uppercase">{CATEGORY_META[viewItem.category].label}</div>
                  <h2 className="text-[22px] font-bold leading-tight mt-1 truncate">{viewItem.providerName}</h2>
                  <div className="text-[13px] opacity-70 mt-1">{viewItem.subType}</div>
                </div>
              </div>
              {(() => {
                const d = daysUntil(viewItem.expiryDate);
                const s = getStatus(d);
                return (
                  <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-white text-zinc-900 border border-white/10"><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[12px] font-medium backdrop-blur">{d<0 ? `פג לפני ${Math.abs(d)} ימים` : `נותרו ${d} ימים`}</span>
                    {viewItem.cost !== undefined && (<span className="px-3 py-1 rounded-full bg-white text-zinc-900 text-[12px] font-bold">₪{viewItem.cost}</span>)}
                  </div>
                )
              })()}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
              <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                <h3 className="text-[12px] font-semibold text-zinc-500 tracking-wide mb-3 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> פרטי הפריט</h3>
                <div className="grid grid-cols-2 gap-3">
                  {viewItem.category==='insurance' && (<>
                    <InfoCell icon={ShieldCheck} label="סוג ביטוח" value={viewItem.insuranceKind || viewItem.subType} />
                    <InfoCell icon={Smartphone} label="סוג רכב" value={viewItem.vehicleType || '-'} />
                    <InfoCell icon={Building2} label="ספק" value={viewItem.providerName} />
                    <InfoCell icon={Hash} label="מס פוליסה" value={viewItem.policyNumber || '-'} />
                    <InfoCell icon={Hash} label="מס רכב" value={viewItem.vehicleNumber || '-'} />
                    <InfoCell icon={CalendarClock} label="תאריך תפוגה" value={new Date(viewItem.expiryDate).toLocaleDateString('he-IL')} />
                    <InfoCell icon={Wallet} label="עלות" value={viewItem.cost ? `₪${viewItem.cost}` : '-'} />
                    <div className="col-span-2"><InfoCell icon={FileText} label="הערות" value={viewItem.notes || 'אין הערות'} full /></div>
                  </>)}
                  {(viewItem.category==='cellular' || viewItem.category==='credit') && (<>
                    <InfoCell icon={Building2} label="ספק" value={viewItem.providerName} />
                    <InfoCell icon={Wifi} label="סוג" value={viewItem.subType} />
                    <InfoCell icon={Hash} label="מס חשבון" value={viewItem.accountNumber || '-'} />
                    <InfoCell icon={CalendarClock} label="תוקף" value={new Date(viewItem.expiryDate).toLocaleDateString('he-IL')} />
                    <InfoCell icon={Wallet} label="עלות חודשית" value={viewItem.cost ? `₪${viewItem.cost}` : '-'} />
                    <div className="col-span-2"><InfoCell icon={FileText} label="הערות" value={viewItem.notes || 'אין הערות'} full /></div>
                  </>)}
                  {viewItem.category==='personal' && (<>
                    <InfoCell icon={PartyPopper} label="סוג אירוע" value={`${viewItem.eventEmoji || ''} ${viewItem.subType}`} />
                    <InfoCell icon={Calendar} label="כותרת" value={viewItem.providerName} />
                    <InfoCell icon={CalendarClock} label="תאריך" value={new Date(viewItem.expiryDate).toLocaleDateString('he-IL')} />
                    <InfoCell icon={Clock} label="שעה" value={viewItem.eventTime || '-'} />
                    <InfoCell icon={MapPin} label="מיקום" value={viewItem.location || '-'} />
                    <InfoCell icon={User} label="איש קשר" value={viewItem.contactPerson || '-'} />
                    <InfoCell icon={Armchair} label="מקומות ישיבה" value={viewItem.seats || '-'} />
                    <InfoCell icon={KeyRound} label="קוד כניסה" value={viewItem.entryCode || '-'} copyable />
                    <div className="col-span-2"><InfoCell icon={FileText} label="הערות" value={viewItem.notes || 'אין הערות'} full /></div>
                  </>)}
                </div>
              </div>
              {viewItem.ticketLink && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                  <h3 className="text-[12px] font-semibold text-zinc-600 tracking-wide mb-3 flex items-center gap-1.5"><ExternalLink className="w-4 h-4" /> לינק לכרטיסים</h3>
                  <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-zinc-500 font-medium">כרטיסים</div>
                        <div className="text-[11px] font-medium text-zinc-800 truncate ltr text-left" dir="ltr" title={viewItem.ticketLink}>{viewItem.ticketLink}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={async()=>{ try{ await navigator.clipboard.writeText(viewItem.ticketLink!); setToast('הלינק הועתק'); }catch{} }} className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50" title="העתק">
                          <Copy className="w-4 h-4 text-zinc-600" />
                        </button>
                        <a href={viewItem.ticketLink} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-black" title="פתח">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-2">
                      <a href={viewItem.ticketLink} target="_blank" rel="noopener noreferrer" className="w-full h-9 rounded-full bg-zinc-900 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-black transition">
                        <ExternalLink className="w-4 h-4" /> פתח כרטיסים ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {viewItem.offers && viewItem.offers.length>0 && (
                <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                  <h3 className="text-[12px] font-semibold text-zinc-500 tracking-wide mb-3 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> הצעות ביטוח</h3>
                  <div className="space-y-2">
                    {[...viewItem.offers].sort((a,b)=>a.amount-b.amount).map((off, idx)=>(
                      <div key={off.company+idx} className={`flex items-center justify-between p-2.5 rounded-xl border ${idx===0 ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-100'}`}>
                        <div className="flex items-center gap-2"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${idx===0 ? 'bg-white text-zinc-900' : 'bg-white border text-zinc-600'}`}>{idx===0 ? '✓' : idx+1}</div><span className={`text-[13px] font-medium ${idx===0 ? 'text-white' : 'text-zinc-800'}`}>{off.company}</span>{idx===0 && <span className="text-[10px] bg-white text-zinc-900 px-1.5 py-0.5 rounded-full">הכי זולה</span>}{off.coverage && <span className={`text-[10px] hidden sm:inline ${idx===0 ? 'text-zinc-300' : 'text-zinc-500'}`}>• {off.coverage}</span>}</div>
                        <span className={`text-[13px] font-bold ${idx===0 ? 'text-white' : 'text-zinc-700'}`}>₪{off.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-semibold text-zinc-500 tracking-wide flex items-center gap-1.5"><FileImage className="w-4 h-4" /> קבצים מצורפים {(() => { const f = getItemFiles(viewItem); return f.length>0 ? `(${f.length})` : ''; })()}</h3>
                  {(() => { const f = getItemFiles(viewItem); return f.length>1 ? (<button onClick={()=>downloadAllFiles(f)} className="h-7 px-2.5 rounded-full bg-zinc-900 text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black"><Download className="w-3 h-3" /> הורד הכל</button>) : null; })()}
                </div>
                {(() => {
                  const files = getItemFiles(viewItem);
                  if (files.length===0) {
                    return <div className="border border-dashed border-zinc-200 rounded-xl p-6 text-center bg-zinc-50/50"><FileText className="w-6 h-6 mx-auto text-zinc-300 mb-1" /><div className="text-[12px] text-zinc-500">אין קבצים מצורפים</div></div>;
                  }
                  return (
                    <div className="space-y-2.5">
                      {files.map((f, idx)=>(
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                          {f.type==='image' ? (
                            <button onClick={()=>setLightbox(f.data)} className="w-12 h-12 rounded-lg overflow-hidden border bg-white shrink-0 hover:ring-2 ring-zinc-200 transition"><img src={f.data} alt={f.name} className="w-full h-full object-cover" /></button>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 shrink-0"><FileText className="w-6 h-6" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium truncate">{f.name}</div>
                            <div className="text-[10px] text-zinc-500">{f.type==='image' ? 'תמונה • לחץ להגדלה' : 'PDF'}</div>
                          </div>
                          <div className="flex gap-1.5">
                            {f.type==='image' && <button onClick={()=>setLightbox(f.data)} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-zinc-50 text-zinc-600"><Eye className="w-4 h-4" /></button>}
                            <button onClick={()=>downloadSingle(f)} className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-black"><Download className="w-4 h-4" /></button>
                            <button onClick={()=>{ window.open(f.data, '_blank'); }} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-zinc-50"><ExternalLink className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-white flex gap-2">
              <button onClick={closeView} className="flex-1 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-[14px]">סגירה</button>
              <button onClick={()=>{ if(viewItem) openDeleteConfirm(viewItem); }} className="w-11 h-11 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition shrink-0"><Trash2 className="w-5 h-5" /></button>
              <button onClick={()=>openEdit(viewItem)} className="flex-1 h-11 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-[14px] flex items-center justify-center gap-1.5"><Pencil className="w-4 h-4" /> עריכה</button>
              {getItemFiles(viewItem).length>0 && (<button onClick={()=>downloadAllFiles(getItemFiles(viewItem))} className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium text-[14px] flex items-center justify-center gap-1.5"><Download className="w-4 h-4" /> {getItemFiles(viewItem).length>1 ? `הורד הכל (${getItemFiles(viewItem).length})` : 'הורד קובץ'}</button>)}
            </div>
          </div>
          {lightbox && (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setLightbox(null)}>
              <div className="relative max-w-[90vw] max-h-[90vh]">
                <img src={lightbox} alt="preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
                <button onClick={()=>setLightbox(null)} className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-lg hover:bg-zinc-100"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <OriginalPlusModal
          initial={editing}
          onClose={()=>setShowForm(false)}
          onSave={(it)=>{
            if (editing) setItems(prev=>prev.map(p=>p.id===it.id ? it : p));
            else setItems(prev=>[it, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {/* drag overlay */}
      {isDragOverApp && (
        <div className="fixed inset-0 z-[90] bg-zinc-900/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-[20px] shadow-2xl border-2 border-dashed border-zinc-300 p-8 flex flex-col items-center gap-3 animate-[slideIn_0.2s_ease]">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center"><FileJson className="w-7 h-7 text-zinc-700" /></div>
            <div className="text-[16px] font-bold">שחרר לייבוא גיבוי</div>
            <div className="text-[12px] text-zinc-500">גרור קובץ JSON לכאן</div>
          </div>
        </div>
      )}


      {/* export modal - minimal: only download */}
      {showExport && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={()=>setShowExport(false)} />
          <div className="relative w-full sm:max-w-[380px] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden animate-[slideIn_0.25s_ease]">
            {/* header minimal */}
            <div className="p-6 pb-4 text-center">
              <button onClick={()=>setShowExport(false)} className="absolute left-4 top-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition"><X className="w-4 h-4" /></button>
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white mx-auto shadow-lg shadow-zinc-900/20">
                <FileJson className="w-8 h-8" />
              </div>
             <h2 className="mt-4 text-[18px] font-bold tracking-tight">ייצוא גיבוי</h2>
              <p className="text-[12px] text-zinc-500 mt-1">קובץ JSON עם כל התזכורות</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[11px] font-medium">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">{exportStats.items}</span>
                  תזכורות
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-600">
                  {new Date().toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="mt-3 text-[10px] text-zinc-400 font-mono">{getExportFileName()}</div>
              <div className="mt-2 text-[11px] text-zinc-500">גודל: {formatSize(exportJsonSize)} {exportStats.files > 0 ? `• ${exportStats.files} קבצים מצורפים` : ''}</div>
              {exportJsonSize > 5 * 1024 * 1024 && (
                <div className="mt-3 mx-auto max-w-[300px] p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-right flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug">
                    <span className="font-bold text-amber-800">הקובץ גדול בגלל תמונות</span>
                    <span className="text-amber-700 block mt-0.5">הקובץ כולל תמונות ולכן גדול - ההורדה עשויה לקחת רגע</span>
                  </div>
                </div>
              )}
              {/* notification settings inside export modal */}
              <div className="mt-5 text-right border-t border-zinc-100 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center"><BellRing className="w-4 h-4 text-zinc-700" /></div>
                    <div>
                      <div className="text-[12px] font-bold">התראות יומיות</div>
                      <div className="text-[10px] text-zinc-500">תזכורת פעם ביום לתוקף קרוב</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifEnabled} onChange={e=>setNotifEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  {notifPermission !== 'granted' ? (
                    <button onClick={requestNotificationPermission} className="flex-1 h-8 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-zinc-100">
                      <Bell className="w-3.5 h-3.5" /> אפשר התראות
                    </button>
                  ) : (
                    <button onClick={()=>triggerDailyNotification(true)} className="flex-1 h-8 rounded-xl bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-black">
                      <BellRing className="w-3.5 h-3.5" /> בדוק עכשיו
                    </button>
                  )}
                  <button onClick={()=>{ setShowExport(false); setShowNotifModal(true); }} className="h-8 px-3 rounded-xl bg-white border text-[11px] font-bold">התראות ({urgentItems.length})</button>
                </div>
                {notifPermission === 'denied' && (
                  <div className="mt-2 text-[10px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 leading-snug">התראות נחסמו. לאפשר: לחץ על 🔒 בשורת הכתובת → הגדרות אתר → התראות → אפשר</div>
                )}
                {lastNotifDate && <div className="mt-2 text-[10px] text-slate-400">נשלחה לאחרונה: {lastNotifDate}</div>}
              </div>
            </div>

           {/* actions - single download button only */}
           <div className="p-4 pt-0 space-y-2.5">
             <button
               onClick={handleExportDownload}
               className="w-full h-[52px] rounded-2xl bg-slate-900 text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition shadow-lg shadow-slate-900/15"
             >
               <Download className="w-5 h-5" />
               הורד קובץ
             </button>
             <div className="text-[10px] text-slate-400 text-center pt-1 leading-snug">
               הקובץ יישמר כתזכורתו-תאריך.json
             </div>
           </div>

           <div className="h-2 bg-slate-50 border-t" />
         </div>
       </div>
     )}

     {/* import confirm modal */}
      {showImportConfirm && pendingImport && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={()=>{ setShowImportConfirm(false); setPendingImport(null); }} />
          <div className="relative w-full sm:max-w-[440px] bg-white rounded-t-[22px] sm:rounded-[22px] shadow-2xl overflow-hidden animate-[slideIn_0.25s_ease]">
            <div className="p-5">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Archive className="w-6 h-6" /></div>
                <div className="flex-1">
                  <div className="font-bold text-[16px]">נמצאו {pendingImport.length} תזכורות</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">בקובץ: {pendingFileName} • {pendingImport.reduce((a,it)=>a+getItemFiles(it).length,0)} קבצים</div>
                </div>
                <button onClick={()=>{ setShowImportConfirm(false); setPendingImport(null); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>

              <div className="mt-5 space-y-2.5">
                <button onClick={handleImportMerge} className="w-full text-right p-3.5 rounded-xl border-2 border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 mt-0.5"><Merge className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="font-bold text-[13px]">הוסף לגיבוי הקיים</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">מוסיף {pendingImport.length} תזכורות חדשות לרשימה הקיימת ({items.length}). מדלג על כפולים לפי מזהה. מומלץ.</div>
                  </div>
                </button>
                <button onClick={handleImportReplace} className="w-full text-right p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 transition flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-100 text-slate-600 group-hover:text-red-600 flex items-center justify-center shrink-0 mt-0.5"><RefreshCw className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="font-bold text-[13px]">החלף הכל</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">מוחק {items.length} פריטים קיימים ומחליף אותם ב-{pendingImport.length} מהקובץ. פעולה זו תדרוש אישור נוסף.</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border-t p-3 flex gap-2">
              <button onClick={()=>{ setShowImportConfirm(false); setPendingImport(null); }} className="flex-1 h-9 rounded-xl bg-white border text-[12px] font-bold">ביטול</button>
              <button onClick={handleImportMerge} className="flex-1 h-9 rounded-xl bg-slate-900 text-white text-[12px] font-bold">הוסף {pendingImport.length} פריטים</button>
            </div>
          </div>
        </div>
      )}

      {/* notifications modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={()=>setShowNotifModal(false)} />
          <div className="relative w-full sm:max-w-[460px] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-[slideIn_0.25s_ease] flex flex-col max-h-[92vh]">
            <div className="relative p-5 pb-6 bg-zinc-900 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{background: 'radial-gradient(at 20% 0%, rgba(251,191,36,0.4) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(245,158,11,0.3) 0px, transparent 50%)'}} />
              <button onClick={()=>setShowNotifModal(false)} className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur z-10"><X className="w-4 h-4" /></button>
              <div className="relative z-10 flex gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-900 flex items-center justify-center shadow-lg ring-1 ring-amber-300/50"><Smartphone className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h2 className="text-[18px] font-extrabold tracking-tight leading-tight">התראות לטלפון<br/>גם כשהאתר סגור 📲</h2>
                  <p className="text-[11px] text-zinc-300 mt-1.5 leading-relaxed">Web Push אמיתי - בשורת ההתראות גם בלי להיכנס לאתר</p>
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${pushSub ? 'bg-emerald-400 text-zinc-900 border-emerald-300' : notifPermission==='granted' ? 'bg-amber-400 text-zinc-900 border-amber-300' : 'bg-white/15 text-white border-white/20'}`}>
                      {pushSub ? '● מחובר ל-Push' : notifPermission==='granted' ? '● אושר - צריך Push' : '○ לא פעיל'}
                    </span>
                    {swReady && <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">SW מוכן</span>}
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/70">{urgentItems.length} דחופים</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-[#FFFBEB]/50">
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                <h3 className="text-[12px] font-extrabold tracking-wide mb-3 flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">1</span> 3 שלבים להפעלה</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notifPermission==='granted' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-amber-50 border border-amber-200 text-zinc-700'}`}>{notifPermission==='granted' ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}</div>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold">אשר התראות בדפדפן</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5 leading-snug">לחץ על אפשר בחלון שיקפוץ. בלי זה לא יגיעו התראות.</div>
                      {notifPermission!=='granted' && (
                        <button onClick={requestNotificationPermission} className="mt-2 h-8 px-3 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-black">
                          <Bell className="w-3.5 h-3.5" /> אשר התראות עכשיו
                        </button>
                      )}
                      {notifPermission==='denied' && (
                        <div className="mt-2 text-[10px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 leading-snug">
                          נחסם! לחץ על אייקון מנעול בשורת הכתובת ואז הגדרות אתר ואז התראות ואז אפשר, ואז רענן.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 text-zinc-700"><Smartphone className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold flex items-center gap-1.5">הוסף למסך הבית <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-900 font-bold">קריטי לאנדרואיד</span></div>
                      <div className="text-[11px] text-zinc-600 mt-0.5 leading-snug">
                        כדי לקבל Push גם כשהאתר סגור לגמרי, באנדרואיד חייבים: תפריט 3 נקודות בכרום ואז הוסף למסך הבית ואז פתח מהאייקון. באייפון: שיתוף ואז הוסף למסך הבית.
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center">⋮</span> ואז הוסף למסך הבית ואז פתח משם
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 text-zinc-700"><Clock className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold">בחר שעה יומית</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">מתי לשלוח לך סיכום כל בוקר</div>
                      <div className="mt-2 flex items-center gap-2">
                        <input type="time" value={notifHour} onChange={e=>setNotifHour(e.target.value)} className="h-8 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[12px] font-bold focus:outline-none focus:border-amber-400" />
                        <span className="text-[11px] text-zinc-600">כל יום ב-{notifHour}</span>
                      </div>
                      <div className="mt-2 text-[10px] px-2.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 inline-flex">
                        ההתראות יישלחו כל יום ב-{notifHour} - דורש הוספה למסך הבית
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4">
                {/* כפתור התקנה שתמיד מוצג - לפי דרישת המשימה */}
                <div className="mb-4">
                  <button
                    onClick={handleInstall}
                    className="w-full h-[48px] rounded-2xl bg-zinc-900 hover:bg-black text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20 active:scale-[0.98] transition ring-1 ring-amber-200/30"
                  >
                    <Smartphone className="w-5 h-5" />
                    {isInstalled ? 'האפליקציה מותקנת ✅' : 'התקן כאפליקציה 📲'}
                    {!deferredPrompt && !isInstalled && <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">ידני</span>}
                  </button>
                  <div className="mt-2 text-[10px] text-center text-zinc-500">
                    {deferredPrompt ? 'Chrome זיהה אפשרות התקנה - לחץ להתקנה אוטומטית' : isInstalled ? 'פתוח כאפליקציה standalone - מוכן ל-Push ברקע' : 'Chrome דורש manifest ו-sw אמיתיים - לחץ למדריך ידני'}
                  </div>
                </div>
                {!pushSub ? (
                  <>
                    <button
                      onClick={subscribeToPush}
                      disabled={!swReady && isPushSupported}
                      className="w-full h-[52px] rounded-2xl bg-zinc-900 hover:bg-black disabled:bg-zinc-300 text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20 active:scale-[0.98] transition"
                    >
                      <span className="w-7 h-7 rounded-full bg-amber-400 text-zinc-900 flex items-center justify-center"><BellRing className="w-4 h-4" /></span>
                      הפעל התראות לטלפון 📲
                    </button>
                    <div className="mt-2.5 text-[10px] text-center text-zinc-500 leading-snug">
                      {isPushSupported ? (swReady ? 'ישלח registration.showNotification אמיתית - תופיע מחוץ לאתר' : 'טוען Service Worker...') : 'הדפדפן לא תומך ב-Push - נסה כרום באנדרואיד'}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto"><Check className="w-6 h-6" /></div>
                    <div className="mt-2 font-bold text-[14px]">מחובר ל-Push! ✅</div>
                    <div className="text-[11px] text-zinc-600 mt-1">תקבל התראה כל יום ב-{notifHour}</div>
                    <div className="mt-3 p-2 rounded-xl bg-zinc-50 border text-[10px] font-mono text-zinc-500 break-all text-right" dir="ltr">
                      endpoint: {pushSub?.endpoint?.slice(0,80)}...
                    </div>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={sendTestPush} className="h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-900 text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm border border-amber-500/20">
                    <Smartphone className="w-4 h-4" /> בדיקה לטלפון עכשיו
                  </button>
                  <button onClick={()=>triggerDailyNotification(true)} className="h-10 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[12px] font-bold flex items-center justify-center gap-1.5">
                    <BellRing className="w-4 h-4" /> שלח סיכום דחופים
                  </button>
                </div>
                {lastNotifDate && <div className="mt-2.5 text-[10px] text-center text-zinc-400">נשלחה לאחרונה: {lastNotifDate} • הבאה מחר ב-{notifHour}</div>}
              </div>
              <div className="rounded-2xl bg-zinc-900 text-white p-4 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-bold flex items-center gap-1.5"><FileJson className="w-4 h-4 text-amber-400" /> איך זה עובד ברקע?</h4>
                  <button onClick={()=>setShowBackendCode(!showBackendCode)} className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10">{showBackendCode ? 'הסתר קוד' : 'הצג קוד backend'}</button>
                </div>
                <p className="text-[11px] text-zinc-300 mt-2 leading-relaxed">
                  כדי שההתראות יגיעו גם כשהאתר סגור לגמרי, צריך Vercel Cron וגם שרת שישלח Web Push. הקוד בצד לקוח מוכן (Service Worker + subscription). נשאר רק להוסיף קובץ api/push.js ב-Vercel עם web-push.
                </p>
                {showBackendCode && (
                  <div className="mt-3 rounded-xl bg-black/50 border border-white/10 p-3 overflow-x-auto">
                    <div className="text-[10px] leading-relaxed text-amber-100 whitespace-pre-wrap" dir="ltr">
                      api/push.js - Vercel Serverless plus Cron: setVapidDetails with mailto and keys, then webpush.sendNotification for each sub. vercel.json crons path /api/push schedule 0 6 * * *. env VAPID keys.
                    </div>
                    <div className="mt-2 text-[9px] text-zinc-400">הקוד המלא: התקן web-push, שמור subscriptions ב-KV, שלח payload עם title ו-body</div>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={()=>setShowVercelFiles(v=>!v)} className="text-[10px] px-3 py-1.5 rounded-full bg-amber-400 text-zinc-900 font-bold flex items-center gap-1 hover:bg-amber-500"><Code2 className="w-3.5 h-3.5" /> למפתח - קבצים להוספה ב-Vercel</button>
                </div>
                {showVercelFiles && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl bg-white/10 border border-white/10 p-3">
                      <div className="text-[11px] font-bold mb-1.5">public/manifest.json</div>
                      <pre className="text-[9px] bg-black/40 rounded-lg p-2.5 overflow-x-auto text-amber-100 leading-snug whitespace-pre-wrap" dir="ltr">{`{
  "name": "תזכורתו - ניהול תזכורות",
  "short_name": "תזכורתו",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFBEB",
  "theme_color": "#FBBF24",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`}</pre>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/10 p-3">
                      <div className="text-[11px] font-bold mb-1.5">public/sw.js (ב-root, לא blob!)</div>
                      <pre className="text-[9px] bg-black/40 rounded-lg p-2.5 overflow-x-auto text-amber-100 leading-snug whitespace-pre-wrap" dir="ltr">{`self.addEventListener('push', (e)=>{
  let data={title:'תזכורתו', body:'יש דחופות'};
  try{ data={...data, ...e.data.json()} }catch{}
  e.waitUntil(self.registration.showNotification(data.title,{
    body:data.body, icon:'/icon-192.png', badge:'/icon-192.png',
    vibrate:[200,100,200], tag:'tazkorto', requireInteraction:true,
    data:{url:'/'}
  }));
});
self.addEventListener('notificationclick',(e)=>{
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url||'/'));
});`}</pre>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[10px] text-amber-200/90 leading-relaxed">
                      <b className="text-amber-200">איפה לשים:</b><br/>
                      • שים <b>manifest.json</b> ו-<b>sw.js</b> בתיקיית <b>public/</b> ב-Vercel<br/>
                      • ב-index.html: &lt;link rel="manifest" href="/manifest.json"&gt;<br/>
                      • רישום: navigator.serviceWorker.register('/sw.js')<br/>
                      • חובה HTTPS (Vercel נותן אוטומטית)<br/>
                      • אחרי זה Chrome יציג beforeinstallprompt אמיתי
                    </div>
                  </div>
                )}
                <div className="mt-3 text-[10px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  כרגע ה-demo משתמש ב-blob SW - זה עובד להתראות אבל לא מספיק ל-install prompt אמיתי. צריך קבצים אמיתיים ב-public/.
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-4">
                <h4 className="text-[12px] font-bold mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> תזכורות דחופות ({urgentItems.length})
                  <span className="mr-auto text-[10px] font-normal text-zinc-500">נשלחות בהתראה היומית</span>
                </h4>
                {urgentItems.length===0 ? (
                  <div className="text-center py-8 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
                    <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center mx-auto mb-2 text-emerald-600"><Check className="w-5 h-5" /></div>
                    <div className="text-[12px] font-bold">הכל בתוקף 🎉</div>
                    <div className="text-[10px] text-zinc-500 mt-1">אין פריטים שפג תוקפם או מסתיימים השבוע</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {urgentItems.map(item=>{
                      const days = daysUntil(item.expiryDate);
                      const status = getStatus(days);
                      return (
                        <div key={item.id} className="bg-[#FFFBEB]/70 rounded-xl border border-amber-100 p-2.5 flex gap-2.5 items-start">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${status.bgLight} ${status.text} border ${status.border}`}><AlertTriangle className="w-3.5 h-3.5" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[12px]">{item.eventEmoji || ''} {item.providerName}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${status.bgLight} ${status.text} ${status.border}`}>{status.label}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{item.subType} • {new Date(item.expiryDate).toLocaleDateString('he-IL')} • {days<0 ? `פג לפני ${Math.abs(days)} ימים` : `${days} ימים`}</div>
                          </div>
                          <button onClick={()=>{ setShowNotifModal(false); setViewItem(item); setShowView(true); }} className="w-7 h-7 rounded-lg bg-white border border-amber-100 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 flex-wrap gap-1.5">
                  <span>Push API: {isPushSupported ? 'נתמך ✅' : 'לא נתמך ❌'}</span>
                  <span>SW: {swReady ? 'מוכן ✅' : 'טוען...'}</span>
                  <span>Permission: {notifPermission}</span>
                </div>
                {/* Debug info קטן ל-dev - לפי דרישת המשימה */}
                <div className="text-[10px] text-zinc-400 flex gap-2 flex-wrap bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2">
                  <span>HTTPS: {isSecure ? '✅' : '❌'}</span>
                  <span>SW: {swReady ? '✅' : '❌'}</span>
                  <span>Prompt: {deferredPrompt ? '✅ מוכן' : '⏳ מחכה/לא נתמך'}</span>
                  <span>Standalone: {isInstalled ? '✅ מותקן' : '❌ לא'}</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t bg-white flex gap-2 shrink-0">
              <button onClick={()=>setShowNotifModal(false)} className="flex-1 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[13px] font-bold">סגירה</button>
              <button onClick={()=>{ const today=getTodayStr(); localStorage.setItem('tazkorato_lastNotificationDate', today); setLastNotifDate(today); setShowNotifModal(false); setToast('סומן - לא נתריע שוב היום'); }} className="flex-1 h-11 rounded-xl bg-zinc-900 text-white text-[13px] font-bold hover:bg-black flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> הבנתי, טיפלתי היום
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual install modal - always accessible */}
      {showManualInstall && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={()=>setShowManualInstall(false)}>
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] w-full max-w-[420px] p-6 shadow-2xl animate-[slideIn_0.25s_ease]" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[18px] tracking-tight">איך להתקין כאפליקציה</h3>
              <button onClick={()=>setShowManualInstall(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 text-[13px] leading-relaxed">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div><b>אנדרואיד כרום:</b> לחץ על ⋮ למעלה &gt; "הוסף למסך הבית" &gt; "התקן"<br/><span className="text-zinc-500 text-[11px]">זה יהפוך לאייקון אפליקציה אמיתי - יופיע במגירת האפליקציות</span></div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <div><b>אייפון ספארי:</b> כפתור שיתוף <span className="inline-flex w-5 h-5 rounded bg-zinc-100 border items-center justify-center"><Share2 className="w-3 h-3" /></span> למטה &gt; "הוסף למסך הבית"</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-zinc-900 flex items-center justify-center font-bold shrink-0">3</div>
                <div><b>אחרי ההתקנה:</b> פתח מהמסך הבית, אשר התראות - ואז הן יקפצו גם כשהאפליקציה סגורה!</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-snug">
                💡 למה לא רואה כפתור אוטומטי? Chrome דורש <b>manifest.json</b> אמיתי ב-<b>public/</b> ו-<b>sw.js</b> אמיתי ב-root, לא blob. ב-Vercel הוסף אותם - אז beforeinstallprompt יעבוד. בינתיים השיטה הידנית עובדת 100%.
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex items-start gap-2.5">
                <MonitorSmartphone className="w-5 h-5 text-zinc-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-zinc-600 leading-snug">
                  <b className="text-zinc-900">בדיקה:</b> אחרי התקנה ידנית, האייקון יופיע במסך הבית עם שם "תזכורתו". פתיחה משם = standalone mode = התראות ברקע עובדות.
                </div>
              </div>
            </div>
            <button onClick={()=>setShowManualInstall(false)} className="mt-5 w-full h-12 rounded-full bg-zinc-900 text-white font-bold hover:bg-black active:scale-[0.98] transition">הבנתי</button>
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
              <span>HTTPS: {isSecure ? '✅' : '❌'}</span>
              <span>•</span>
              <span>SW: {swReady ? '✅' : '⏳'}</span>
              <span>•</span>
              <span>Prompt: {deferredPrompt ? '✅' : '⏳ ידני'}</span>
            </div>
          </div>
        </div>
      )}

      {/* import error */}
      {importError && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={()=>setImportError(null)} />
          <div className="relative bg-white rounded-[18px] shadow-2xl p-5 max-w-[360px] w-full text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3"><AlertTriangle className="w-5 h-5" /></div>
            <div className="font-bold text-[14px]">שגיאה בייבוא</div>
            <div className="text-[12px] text-slate-600 mt-2 leading-relaxed">{importError}</div>
            <button onClick={()=>setImportError(null)} className="mt-4 w-full h-9 rounded-xl bg-slate-900 text-white text-[12px] font-bold">הבנתי</button>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-[78px] left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-[12px] font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-[slideIn_0.25s_ease] max-w-[90vw]">
          <Check className="w-4 h-4 text-emerald-300" /> <span className="truncate">{toast}</span>
        </div>
      )}

      {/* delete confirm modal - z-[110] */}
      {showDeleteConfirm && deleteConfirmItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteConfirm} />
          <div className="relative w-full max-w-[360px] bg-white rounded-[20px] shadow-2xl overflow-hidden animate-[slideIn_0.25s_ease] border border-slate-100">
            <div className="p-5">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-[16px] font-bold text-slate-900">למחוק את התזכורת?</h3>
                <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">פעולה זו לא ניתנת לביטול</p>
                <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
                  <div className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5"><span>{deleteConfirmItem.eventEmoji || ''}</span> {deleteConfirmItem.providerName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{deleteConfirmItem.subType} • {new Date(deleteConfirmItem.expiryDate).toLocaleDateString('he-IL')}</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-3 flex gap-2">
              <button onClick={closeDeleteConfirm} className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition">ביטול</button>
              <button onClick={confirmDelete} className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" /> אישור מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ icon: Icon, label, value, full, copyable }: { icon:any; label:string; value:string; full?:boolean; copyable?:boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`${full ? '' : ''} bg-slate-50/80 border border-slate-100 rounded-xl p-2.5`}>
      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mb-1"><Icon className="w-3 h-3" /> {label}{copyable && value && value!=='-' && (<button onClick={async()=>{ try{ await navigator.clipboard.writeText(value); setCopied(true); setTimeout(()=>setCopied(false),1500);}catch{}}} className="mr-auto text-[10px] text-indigo-600 hover:underline">{copied ? 'הועתק!' : 'העתק'}</button>)}</div>
      <div className="text-[13px] font-medium text-slate-800 leading-snug break-words">{value}</div>
    </div>
  );
}

// ====== ORIGINAL + MODAL EXACT RESTORATION ======
function OriginalPlusModal({ initial, onClose, onSave }: { initial: TazItem | null; onClose: ()=>void; onSave: (it:TazItem)=>void }) {
  // determine initial reminder type
  const inferType = (it: TazItem | null): ReminderType => {
    if (!it) return 'car';
    if (it.reminderType) return it.reminderType;
    if (it.category==='personal') return 'personal';
    if (it.category==='credit') return 'credit';
    if (it.category==='cellular') {
      if (it.subType?.includes('אינטרנט') || it.providerName?.includes('HOT') || it.providerName?.toLowerCase().includes('fiber')) return 'tv';
      return 'cellular';
    }
    // insurance
    if (it.subType?.includes('דירה') || it.vehicleType===undefined && it.policyNumber) return 'home';
    return 'car';
  };

  const [reminderType, setReminderType] = useState<ReminderType>(()=>inferType(initial));
  const [provider, setProvider] = useState(initial?.providerName || '');
  const [subType, setSubType] = useState(initial?.subType || (reminderType==='personal' ? 'הופעה' : ''));
  const [insuranceKind, setInsuranceKind] = useState(initial?.insuranceKind || initial?.subType || '');
  const [vehicleType, setVehicleType] = useState(initial?.vehicleType || 'פרטי');
  const [vehicleNumber, setVehicleNumber] = useState(initial?.vehicleNumber || '');
  const [policyNumber, setPolicyNumber] = useState(initial?.policyNumber || initial?.accountNumber || '');
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate || new Date().toISOString().slice(0,10));
  const [cost, setCost] = useState<string>(initial?.cost !== undefined ? String(initial.cost) : '');
  const [period, setPeriod] = useState<'monthly'|'yearly'>(initial?.period || 'yearly');
  const [notes, setNotes] = useState(initial?.notes || '');
  // personal
  const [eventTime, setEventTime] = useState(initial?.eventTime || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson || '');
  const [seats, setSeats] = useState(initial?.seats || '');
  const [entryCode, setEntryCode] = useState(initial?.entryCode || '');
  const [ticketLink, setTicketLink] = useState(initial?.ticketLink || '');
  const getInitialLinks = (): string[] => {
    if (initial?.ticketLinks && initial.ticketLinks.length>0) return initial.ticketLinks;
    if (initial?.ticketLink) return [initial.ticketLink];
    return [''];
  };
  const [ticketLinksList, setTicketLinksList] = useState<string[]>(()=>getInitialLinks());
  // file - multi support
  const getInitialFiles = (): TazFile[] => {
    if (initial?.files && initial.files.length>0) return initial.files;
    if (initial?.fileData) return [{ data: initial.fileData, name: initial.fileName || 'קובץ', type: (initial.fileType as any) || 'image' }];
    return [];
  };
  const [fileList, setFileList] = useState<TazFile[]>(()=>getInitialFiles());
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const personalFileRef = useRef<HTMLInputElement>(null);
  // offers
  const [offers, setOffers] = useState<Offer[]>(initial?.offers || []);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState<{company:string; customCompany:string; amount:string; period:'monthly'|'yearly'; coverage:string; contact:string}>({
    company: COMPANIES_SH[0], customCompany:'', amount:'', period:'yearly', coverage:'', contact:''
  });
  // provider autocomplete
  const [showProviderList, setShowProviderList] = useState(false);
  const providerWrapRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const handler = (e: MouseEvent) => {
      if (providerWrapRef.current && !providerWrapRef.current.contains(e.target as Node)) setShowProviderList(false);
    };
    document.addEventListener('mousedown', handler);
    return ()=>document.removeEventListener('mousedown', handler);
  },[]);

  const filteredProviders = useMemo(()=>{
    if (!provider) return PROVIDERS_KH;
    return PROVIDERS_KH.filter(p=>p.includes(provider));
  },[provider]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>{
        const img = new Image();
        img.onload = ()=>{
          const canvas = document.createElement('canvas');
          const max = 800;
          let w = img.width, h = img.height;
          const scale = Math.min(1, max / Math.max(w,h));
          canvas.width = w*scale;
          canvas.height = h*scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject('no ctx'); return; }
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.6));
        };
        img.onerror = ()=>reject('img err');
        img.src = reader.result as string;
      };
      reader.onerror = ()=>reject('read err');
      reader.readAsDataURL(file);
    });
  };

  const addFiles = async (list: FileList | File[]) => {
    const arr = Array.from(list as any) as File[];
    const newFiles: TazFile[] = [];
    for (const file of arr) {
      if (file.size > 2*1024*1024) { alert(`${file.name} גדול מדי - עד 2MB`); continue; }
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPdf && !isImage) { alert(`${file.name}: רק תמונה או PDF`); continue; }
      try {
        let data = '';
        if (isImage) data = await compressImage(file);
        else {
          data = await new Promise<string>((res, rej)=>{
            const r = new FileReader();
            r.onload = ()=>res(r.result as string);
            r.onerror = ()=>rej('err');
            r.readAsDataURL(file);
          });
        }
        newFiles.push({ data, name: file.name, type: isPdf ? 'pdf' : 'image' });
      } catch { alert(`שגיאה בקריאת ${file.name}`); }
    }
    if (newFiles.length) setFileList(prev=>[...prev, ...newFiles]);
  };

  const handleSave = () => {
    if (!provider || !expiryDate) { alert('נא למלא שדות חובה'); return; }
    if (reminderType==='personal' && !subType) { alert('בחר סוג אירוע'); return; }
    if (reminderType!=='personal' && reminderType!=='other' && !provider) { alert('נא למלא ספק'); return; }

    // derive subType
    let finalSubType = subType;
    let finalInsuranceKind = insuranceKind;
    if (reminderType==='car') {
      finalSubType = insuranceKind || subType || 'מקיף';
      finalInsuranceKind = insuranceKind || finalSubType;
    } else if (reminderType==='credit') {
      finalSubType = insuranceKind || subType || 'כרטיס אשראי';
    } else if (reminderType!=='personal') {
      finalSubType = insuranceKind || subType || REMINDER_TYPES.find(r=>r.key===reminderType)?.label || 'אחר';
    }

    const category = reminderTypeToCategory(reminderType);
    const item: TazItem = {
      id: initial?.id || Math.random().toString(36).slice(2,9),
      category,
      reminderType,
      providerName: provider,
      subType: finalSubType,
      expiryDate,
      cost: cost ? Number(cost) : undefined,
      period,
      notes,
      vehicleType: reminderType==='car' ? vehicleType : undefined,
      vehicleNumber: reminderType==='car' ? vehicleNumber : undefined,
      policyNumber: reminderType!=='personal' ? policyNumber : undefined,
      insuranceKind: finalInsuranceKind,
      accountNumber: reminderType==='cellular' || reminderType==='tv' || reminderType==='credit' ? policyNumber : undefined,
      eventEmoji: reminderType==='personal' ? PERSONAL_EMOJI[subType] || '📅' : undefined,
      eventTime: reminderType==='personal' ? eventTime : undefined,
      location: reminderType==='personal' ? location : undefined,
      contactPerson: reminderType==='personal' ? contactPerson : undefined,
      seats: reminderType==='personal' ? seats : undefined,
      entryCode: reminderType==='personal' ? entryCode : undefined,
      ticketLink: (()=>{ const cleaned = ticketLinksList.map(s=>s.trim()).filter(Boolean); return cleaned[0] || undefined; })(),
      ticketLinks: (()=>{ const cleaned = ticketLinksList.map(s=>s.trim()).filter(Boolean); return cleaned.length>0 ? cleaned : undefined; })(),
      files: fileList,
      fileData: fileList[0]?.data,
      fileName: fileList[0]?.name,
      fileType: fileList[0]?.type,
      offers,
    };
    onSave(item);
  };

  const personalPlaceholderName = subType==='הופעה' ? 'עומר אדם - פארק הירקון' : subType==='תור לרופא' ? 'ד״ר לוי - אורתופד' : 'חתונה של מאיה וגל';
  const personalPlaceholderNotes = subType==='תור לרופא' ? 'להביא צילום רנטגן + הפניה...' : subType==='חתונה' ? 'מתנה 400₪, חליפה כהה...' : 'פרטים נוספים...';
  const badgeStyle = PERSONAL_BADGE[subType] || PERSONAL_BADGE['אחר'];

  const isPersonal = reminderType==='personal';
  const isCar = reminderType==='car';
  const isCredit = reminderType==='credit';

  return (
    <div id="plus-modal" role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-[500px] max-h-[92vh] bg-white rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header exact */}
        <div className="px-3 py-2.5 border-b flex items-center justify-between h-11 shrink-0 bg-white">
          <div className="font-bold text-[13px]">{initial ? 'עריכת תזכורת' : 'תזכורת חדשה'}</div>
          <button onClick={onClose} className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Body exact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white" onClick={()=>setShowProviderList(false)}>
          {/* סוג תזכורת */}
          <div>
            <label className="text-[11px] font-bold mb-1.5 block">סוג תזכורת</label>
            <div className="grid grid-cols-4 gap-1.5">
              {REMINDER_TYPES.map(rt=>{
                const isSelected = reminderType===rt.key;
                const Icon = rt.icon;
                return (
                  <button key={rt.key} onClick={(e)=>{ e.stopPropagation(); setReminderType(rt.key); if (rt.key==='personal' && !PERSONAL_TYPES.includes(subType)) setSubType('הופעה'); }}
                    className={`h-[52px] rounded-xl border flex flex-col items-center justify-center gap-1 transition ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-white text-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium leading-tight text-center px-1">{rt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PERSONAL */}
          {isPersonal ? (
            <>
              <div>
                <label className="text-[11px] font-bold mb-1 block">סוג אירוע *</label>
                <select value={subType} onChange={e=>setSubType(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300">
                  {PERSONAL_TYPES.map(t=><option key={t} value={t}>{PERSONAL_EMOJI[t] || ''} {t}</option>)}
                </select>
                {subType && (
                  <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold ${badgeStyle.bg} ${badgeStyle.color} ${badgeStyle.border}`}>
                    <span>{PERSONAL_EMOJI[subType] || '📅'}</span><span>{subType}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold mb-1 block">שם האירוע / כותרת *</label>
                <input value={provider} onChange={e=>setProvider(e.target.value)} placeholder={personalPlaceholderName} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[12px] focus:outline-none focus:bg-white focus:border-slate-300" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold mb-1 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> תאריך האירוע *</label>
                  <input type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> שעה</label>
                  <input type="time" value={eventTime} onChange={e=>setEventTime(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold mb-1 block">מיקום</label>
                <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="אולמי הנסיכה, פארק הירקון, קופ״ח כללית" className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
              </div>
              <div>
                <label className="text-[11px] font-bold mb-1 block">איש קשר / מארגן / מלווה</label>
                <input value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="מאיה 050-8881234, אורית + דני" className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
              </div>
              <div>
                <label className="text-[11px] font-bold mb-1 block">הערות / מה להביא</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder={personalPlaceholderNotes} className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border text-[12px] resize-none" />
              </div>

              {/* אם הופעה: קופסה כהה */}
              {subType==='הופעה' ? (
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 space-y-2.5">
                  <div><div className="text-[11px] font-bold text-white">פרטי הופעה וכרטיסים</div><div className="text-[10px] text-zinc-400">שמירת מקומות וקוד כניסה</div></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 mb-1 block">מקומות ישיבה</label>
                      <input value={seats} onChange={e=>setSeats(e.target.value)} placeholder="שורה 12, כסאות 8-9" className="w-full h-8 px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[12px] placeholder:text-zinc-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 mb-1 block">קוד כניסה / QR</label>
                      <input value={entryCode} onChange={e=>setEntryCode(e.target.value)} placeholder="QR-8842-19" className="w-full h-8 px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[12px] placeholder:text-zinc-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 mb-1 block flex items-center gap-1"><ExternalLink className="w-3 h-3" /> לינק לכרטיסים</label>
                    <input value={ticketLink} onChange={e=>setTicketLink(e.target.value)} placeholder="https://tickets.example.com/..." className="w-full h-8 px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[12px] placeholder:text-zinc-500 ltr" dir="ltr" />
                    {ticketLink && (
                      <div className="mt-1.5 flex gap-1.5">
                        <button onClick={()=>{ if(ticketLink.startsWith('http')) window.open(ticketLink, '_blank'); }} className="text-[10px] px-2 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-500">בדוק לינק ↗</button>
                        <button onClick={()=>setTicketLink('')} className="text-[10px] px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">נקה</button>
                      </div>
                    )}
                  </div>
                  {/* file upload dark - multi */}
                  <div>
                    <input ref={personalFileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={e=>{ if(e.target.files) addFiles(e.target.files); if(fileRef.current) fileRef.current.value=''; }} />
                    {fileList.length>0 && (
                      <div className="space-y-1.5 mb-2">
                        {fileList.map((f,i)=>(
                          <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 flex items-center gap-2">
                            {f.type==='image' ? <img src={f.data} className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 rounded-md bg-zinc-700 flex items-center justify-center"><FileText className="w-5 h-5 text-zinc-300" /></div>}
                            <div className="flex-1 min-w-0"><div className="text-[11px] text-white truncate">{f.name}</div><div className="text-[10px] text-zinc-400">{f.type==='image' ? 'תמונה' : 'PDF'}</div></div>
                            <button onClick={()=>setFileList(prev=>prev.filter((_,idx)=>idx!==i))} className="w-6 h-6 rounded-lg bg-zinc-700 text-zinc-300 flex items-center justify-center"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div
                        onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                        onDragLeave={()=>setDragOver(false)}
                        onDrop={e=>{ e.preventDefault(); setDragOver(false); if(e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
                        onClick={()=>personalFileRef.current?.click()}
                        className={`flex-1 border border-dashed rounded-lg p-3 text-center cursor-pointer transition ${dragOver ? 'border-indigo-400 bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'}`}
                      >
                        <Upload className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                        <div className="text-[11px] text-white font-medium">העלאת כרטיסים ({fileList.length})</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">גרור כמה קבצים או לחץ • עד 2MB כל אחד</div>
                      </div>
                      {fileList.length>0 && (
                        <button onClick={()=>personalFileRef.current?.click()} className="w-12 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex flex-col items-center justify-center hover:bg-zinc-700"><Plus className="w-4 h-4" /><span className="text-[9px] mt-0.5">הוסף</span></button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // generic file upload for other personal types (light) - multi
                <div className="rounded-xl border bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[11px] font-bold">קבצים מצורפים {fileList.length>0 ? `(${fileList.length})` : ''}</div>
                    {fileList.length>0 && <button onClick={()=>fileRef.current?.click()} className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full">+ הוסף עוד</button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={e=>{ if(e.target.files) addFiles(e.target.files); e.currentTarget.value=''; }} />
                  {fileList.length>0 && (
                    <div className="space-y-1.5 mb-2">
                      {fileList.map((f,i)=>(
                        <div key={i} className="rounded-lg border bg-white p-2 flex items-center gap-2">
                          {f.type==='image' ? <img src={f.data} className="w-8 h-8 rounded-md object-cover" /> : <div className="w-8 h-8 rounded-md bg-red-50 border flex items-center justify-center"><FileText className="w-4 h-4 text-red-500" /></div>}
                          <div className="flex-1 min-w-0 text-[11px] truncate">{f.name}</div>
                          <button onClick={()=>setFileList(prev=>prev.filter((_,idx)=>idx!==i))} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div onDragOver={e=>{ e.preventDefault(); setDragOver(true); }} onDragLeave={()=>setDragOver(false)} onDrop={e=>{ e.preventDefault(); setDragOver(false); if(e.dataTransfer.files) addFiles(e.dataTransfer.files); }} className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer ${dragOver ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`} onClick={()=>fileRef.current?.click()}>
                    <div className="text-[11px] font-medium">העלאת קבצים</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">JPG / PDF • אפשר לבחור כמה ביחד • עד 2MB</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {(isCar || isCredit) && (
                <div>
                  <label className="text-[11px] font-bold mb-1 block">{isCar ? 'סוג ביטוח' : 'סוג כרטיס'}</label>
                  <select value={insuranceKind} onChange={e=>setInsuranceKind(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]">
                    <option value="">בחר...</option>
                    {(NA_MAP[reminderType] || []).map(opt=><option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}
              {isCar && (
                <div>
                  <label className="text-[11px] font-bold mb-1 block">סוג רכב</label>
                  <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]">
                    {EH_VEHICLE.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              )}

              <div ref={providerWrapRef} className="relative">
                <label className="text-[11px] font-bold mb-1 block">ספק / חברה *</label>
                <input value={provider} onChange={e=>{ setProvider(e.target.value); setShowProviderList(true); }} onFocus={()=>setShowProviderList(true)} placeholder="הראל, פרטנר, ישראכרט..." className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px] focus:outline-none focus:bg-white focus:border-slate-300" />
                {showProviderList && filteredProviders.length>0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-[160px] overflow-y-auto">
                    {filteredProviders.map(p=>(
                      <button key={p} onClick={(e)=>{ e.stopPropagation(); setProvider(p); setShowProviderList(false); }} className="w-full text-right px-3 py-2 text-[12px] hover:bg-slate-50 border-b last:border-0 border-slate-100">{p}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold mb-1 block">תוקף *</label>
                  <input type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold mb-1 block">מס׳ פוליסה / חשבון</label>
                  <input value={policyNumber} onChange={e=>setPolicyNumber(e.target.value)} placeholder="אופציונלי" className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
              </div>

              {isCar && (
                <div>
                  <label className="text-[11px] font-bold mb-1 block">מס׳ רכב</label>
                  <input value={vehicleNumber} onChange={e=>setVehicleNumber(e.target.value)} placeholder="12-345-67" className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold mb-1 block">סכום לתשלום</label>
                  <input type="number" value={cost} onChange={e=>setCost(e.target.value)} placeholder="₪" className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border text-[12px]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold mb-1 block">תקופה</label>
                  <select value={period} onChange={e=>setPeriod(e.target.value as any)} className="w-full h-9 px-2 rounded-lg bg-slate-50 border text-[12px]">
                    <option value="monthly">חודשי</option>
                    <option value="yearly">שנתי</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold mb-1 block">הערות</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="הערות, תזכורת..." className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border text-[12px] resize-none" />
              </div>

              {/* העלאת קבצים - multi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-bold">קבצים מצורפים {fileList.length>0 ? `(${fileList.length})` : ''}</div>
                  {fileList.length>0 && <button onClick={()=>fileRef.current?.click()} className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full">+ הוסף עוד</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={e=>{ if(e.target.files) addFiles(e.target.files); e.currentTarget.value=''; }} />
                {fileList.length>0 && (
                  <div className="space-y-1.5 mb-2">
                    {fileList.map((f,i)=>(
                      <div key={i} className="rounded-lg border bg-slate-50 p-2 flex items-center gap-2">
                        {f.type==='image' ? <img src={f.data} className="w-8 h-8 rounded-md object-cover border" /> : <div className="w-8 h-8 rounded-md bg-red-50 border flex items-center justify-center"><FileText className="w-4 h-4 text-red-500" /></div>}
                        <div className="flex-1 min-w-0"><div className="text-[11px] font-medium truncate">{f.name}</div><div className="text-[10px] text-slate-500">{f.type==='image' ? 'JPG דחוס' : 'PDF'}</div></div>
                        <button onClick={()=>setFileList(prev=>prev.filter((_,idx)=>idx!==i))} className="w-6 h-6 rounded-lg bg-white border flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div onDragOver={e=>{ e.preventDefault(); setDragOver(true); }} onDragLeave={()=>setDragOver(false)} onDrop={e=>{ e.preventDefault(); setDragOver(false); if(e.dataTransfer.files) addFiles(e.dataTransfer.files); }} onClick={()=>fileRef.current?.click()} className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition ${dragOver ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                  <FileImage className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <div className="text-[11px] font-bold">העלאת תמונות / מסמכים</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">JPG / PDF • אפשר כמה קבצים • עד 2MB כל אחד</div>
                </div>
              </div>

              {/* השוואת הצעות */}
              <div className="border-t pt-3 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-bold">השוואת הצעות ({offers.length})</div>
                  <button onClick={()=>setShowAddOffer(v=>!v)} className="h-6 px-2 rounded-lg bg-slate-900 text-white text-[10px] font-medium">{showAddOffer ? 'סגור' : 'הוסף הצעה'}</button>
                </div>

                {offers.length>0 && (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto mb-2">
                    {[...offers].sort((a,b)=>a.amount-b.amount).map((off, idx)=>{
                      const sorted = [...offers].sort((a,b)=>a.amount-b.amount);
                      const isCheapest = sorted[0]?.company===off.company && sorted[0]?.amount===off.amount;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border text-[11px] ${isCheapest ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{off.company}</span>
                            {off.coverage && <span className="text-[10px] text-slate-500">• {off.coverage}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">₪{off.amount}</span>
                            <button onClick={()=>setOffers(o=>o.filter((_,i)=>i!==idx))} className="w-5 h-5 rounded-md bg-white border flex items-center justify-center hover:bg-red-50"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showAddOffer && (
                  <div className="rounded-lg bg-slate-50 border p-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold mb-1 block">חברה</label>
                        <select value={newOffer.company} onChange={e=>setNewOffer({...newOffer, company:e.target.value})} className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]">
                          {COMPANIES_SH.map(c=><option key={c} value={c}>{c}</option>)}
                          <option value="__custom__">אחר ✏️</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-1 block">סכום ₪</label>
                        <input type="number" value={newOffer.amount} onChange={e=>setNewOffer({...newOffer, amount:e.target.value})} placeholder="₪" className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]" />
                      </div>
                    </div>
                    {newOffer.company==='__custom__' && (
                      <div><label className="text-[10px] font-bold mb-1 block">שם חברה חופשי</label><input value={newOffer.customCompany} onChange={e=>setNewOffer({...newOffer, customCompany:e.target.value})} placeholder="שם חברה..." className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]" /></div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold mb-1 block">תקופה</label>
                        <select value={newOffer.period} onChange={e=>setNewOffer({...newOffer, period:e.target.value as any})} className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]"><option value="monthly">חודשי</option><option value="yearly">שנתי</option></select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-1 block">מה כלול</label>
                        <input value={newOffer.coverage} onChange={e=>setNewOffer({...newOffer, coverage:e.target.value})} placeholder="מקיף + חובה..." className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold mb-1 block">איש קשר</label>
                      <input value={newOffer.contact} onChange={e=>setNewOffer({...newOffer, contact:e.target.value})} placeholder="שם + טלפון" className="w-full h-8 px-2 rounded-lg bg-white border text-[11px]" />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={()=>setShowAddOffer(false)} className="flex-1 h-8 rounded-lg bg-white border text-[11px] font-bold">ביטול</button>
                      <button onClick={()=>{
                        const comp = newOffer.company==='__custom__' ? newOffer.customCompany : newOffer.company;
                        if (!comp || !newOffer.amount) { alert('נא למלא חברה וסכום'); return; }
                        setOffers(prev=>[...prev, { company: comp, amount: Number(newOffer.amount), coverage: newOffer.coverage, period: newOffer.period, contact: newOffer.contact }]);
                        setNewOffer({ company: COMPANIES_SH[0], customCompany:'', amount:'', period:'yearly', coverage:'', contact:'' });
                        setShowAddOffer(false);
                      }} className="flex-[1.5] h-8 rounded-lg bg-slate-900 text-white text-[11px] font-bold">הוסף</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer exact */}
        <div className="p-2.5 border-t flex gap-1.5 bg-slate-50/50 shrink-0">
          <button onClick={onClose} className="flex-1 h-8 rounded-lg bg-white border text-[12px] font-bold">ביטול</button>
          <button onClick={handleSave} className="flex-[1.5] h-8 rounded-lg bg-slate-900 text-white text-[12px] font-bold flex items-center justify-center gap-1 hover:bg-black"><Check className="w-3.5 h-3.5" /> שמירה</button>
        </div>
      </div>
    </div>
  );
}
