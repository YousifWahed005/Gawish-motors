"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import defaults from "@/data/content.json";
import { validateContent } from "@/lib/validation";
type Value = string | Value[] | { [key: string]: Value };
type Locale = "en" | "ar";
const EditorLocale = createContext<Locale>("en");
const arabicLabels: Record<string, string> = {
  brand: "الهوية والشعار",
  contact: "بيانات التواصل",
  hero: "الواجهة الرئيسية",
  modelsHeading: "عنوان السيارات",
  models: "السيارات والعلامات التجارية",
  offers: "العروض",
  why: "لماذا نحن؟",
  testDrive: "زيارة المعرض وتجربة القيادة",
  testimonials: "آراء عملائنا",
  app: "التطبيق",
  faq: "الأسئلة الشائعة",
  footer: "تذييل الصفحة",
  about: "من نحن",
  story: "قصتنا",
  principles: "الرؤية والرسالة والأهداف والقيم",
  services: "خدماتنا",
  ownership: "الجودة والتمويل وخدمة ما بعد البيع",
  partners: "شركاؤنا",
  contactHeading: "قسم تواصل معنا",
  seo: "بيانات محركات البحث",
  ui: "نصوص الأزرار والتنقل",
  name: "الاسم",
  tagline: "الشعار النصي",
  logo: "الشعار",
  phone: "أرقام الهاتف (رقم في كل سطر)",
  email: "البريد الإلكتروني",
  address: "العنوان",
  mapUrl: "رابط الموقع على الخرائط",
  hours: "مواعيد العمل",
  instagram: "رابط إنستجرام",
  whatsapp: "رابط واتساب",
  eyebrow: "العنوان التمهيدي",
  title: "العنوان",
  accent: "العنوان المميز",
  description: "الوصف",
  image: "الصورة",
  imageAlt: "وصف الصورة لإمكانية الوصول",
  caption: "التعليق",
  cta: "نص الزر",
  category: "النوع",
  items: "العناصر",
  label: "التسمية",
  detail: "التفاصيل",
  quote: "نص التقييم",
  status: "الحالة",
  iosUrl: "رابط تطبيق آيفون",
  androidUrl: "رابط تطبيق أندرويد",
  question: "السؤال",
  answer: "الإجابة",
  text: "النص",
  copyright: "حقوق النشر",
  year: "سنة التأسيس",
  since: "تسمية سنة التأسيس",
};
const label = (key: string, locale: Locale = "en") =>
  locale === "ar" && arabicLabels[key]
    ? arabicLabels[key]
    : key === "phone"
      ? "Phone numbers (one per line)"
      : key.replace(/([A-Z])/g, " $1").replace(/^./, (v) => v.toUpperCase());
function Editor({
  value,
  path,
  onChange,
  template,
  onStatus,
}: {
  value: Value;
  path: string;
  onChange: (v: Value) => void;
  template: Value;
  onStatus: (s: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const locale = useContext(EditorLocale);
  if (typeof value === "string") {
    const key = path.split(".").pop()!;
    const image = key === "image" || key === "logo";
    return (
      <div>
        <label htmlFor={path}>
          {label(key, locale)}
          {value.length > 100 ||
          ["description", "quote", "answer", "title", "phone"].includes(key) ? (
            <textarea
              id={path}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : (
            <input
              id={path}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </label>
        {image && (
          <>
            <Image
              className="admin-preview"
              src={value || "/images/logo.svg"}
              alt={`${label(key, locale)} preview`}
              width={260}
              height={140}
              unoptimized
            />
            <label htmlFor={`${path}-upload`}>
              {uploading
                ? locale === "ar"
                  ? "جارٍ الرفع…"
                  : "Uploading…"
                : locale === "ar"
                  ? "رفع صورة بديلة (PNG أو JPEG أو WebP · حتى ٥ ميجابايت)"
                  : "Upload replacement (PNG, JPEG, WebP · max 5 MB)"}
              <input
                id={`${path}-upload`}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const f = new FormData();
                    f.append("file", file);
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: f,
                    });
                    const d = await res.json();
                    if (!res.ok) throw new Error(d.error);
                    onChange(d.url);
                    onStatus(
                      locale === "ar"
                        ? "تم رفع الصورة. احفظ التغييرات لإضافتها إلى المحتوى."
                        : "Image uploaded. Save changes to keep it in your content.",
                    );
                  } catch (err) {
                    onStatus(
                      err instanceof Error ? err.message : "Upload failed.",
                    );
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </>
        )}
      </div>
    );
  }
  if (Array.isArray(value)) {
    const sample = Array.isArray(template) ? template[0] : value[0];
    return (
      <div>
        {value.map((v, i) => (
          <fieldset className="admin-sub" key={i}>
            <legend>
              {locale === "ar" ? "العنصر" : "Entry"} {i + 1}
            </legend>
            <Editor
              value={v}
              path={`${path}.${i}`}
              template={sample}
              onStatus={onStatus}
              onChange={(next) =>
                onChange(value.map((old, j) => (i === j ? next : old)))
              }
            />
            <Button
              type="button"
              className="secondary"
              disabled={value.length <= 1}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              {locale === "ar" ? "حذف العنصر" : "Remove entry"} {i + 1}
            </Button>
          </fieldset>
        ))}
        <Button
          type="button"
          disabled={value.length >= 30}
          onClick={() => onChange([...value, structuredClone(sample)])}
        >
          {locale === "ar" ? "إضافة عنصر" : "Add entry"}
        </Button>
      </div>
    );
  }
  return (
    <>
      {Object.entries(value).map(([key, v]) => (
        <div key={key}>
          {typeof v !== "string" && <h3>{label(key, locale)}</h3>}
          <Editor
            value={v}
            path={`${path}.${key}`}
            template={(template as Record<string, Value>)[key]}
            onStatus={onStatus}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        </div>
      ))}
    </>
  );
}
export default function Admin() {
  const [auth, setAuth] = useState(false),
    [loading, setLoading] = useState(true),
    [password, setPassword] = useState(""),
    [content, setContent] = useState<Record<string, Value>>(defaults),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [locale, setLocale] = useState<Locale>("en");
  async function load() {
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setContent(data);
    setAuth(true);
    setDirty(false);
  }
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then(async (d) => {
        if (d.authenticated) await load();
        else if (!d.configured)
          setStatus(
            "Setup required: configure ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env.local, then restart the server.",
          );
      })
      .catch(() => setStatus("Cannot connect to the admin server."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return (
    <main id="main" className="admin">
      <a className="text-link" href="/">
        ← View website
      </a>
      <h1>Showroom studio.</h1>
      <p>
        Manage every homepage section in English and Arabic, including photos,
        logo, contact details, and company information.
      </p>
      {loading ? (
        <p role="status">Loading…</p>
      ) : !auth ? (
        <form
          className="admin-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const res = await fetch("/api/admin/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setPassword("");
              await load();
              setStatus("");
            } catch (err) {
              setStatus(err instanceof Error ? err.message : "Sign-in failed.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Admin sign in</h2>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      ) : (
        <>
          <div className="admin-panel">
            <h2>Your content, in one place.</h2>
            <p>
              Saving updates the server content file. The public homepage is
              static: rebuild and restart the site to publish. Uploads are
              stored on this server. Keep a backup before editing.
            </p>
            <div className="admin-toolbar">
              <Button
                disabled={busy || !dirty}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await fetch("/api/admin/content", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(content),
                    });
                    const d = await r.json();
                    if (!r.ok) throw new Error(d.error);
                    setDirty(false);
                    setStatus(d.message);
                  } catch (err) {
                    setStatus(
                      err instanceof Error ? err.message : "Save failed.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy
                  ? "Saving…"
                  : dirty
                    ? "Save changes"
                    : "All changes saved"}
              </Button>
              <Button
                className="secondary"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(content, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "gawish-content.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export backup
              </Button>
              <Button
                className="secondary"
                onClick={async () => {
                  await fetch("/api/admin/session", { method: "DELETE" });
                  setAuth(false);
                  setStatus("Signed out.");
                }}
              >
                Sign out
              </Button>
            </div>
            <label htmlFor="import">
              Restore a content backup
              <input
                type="file"
                id="import"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const d = JSON.parse(await file.text());
                    if (!validateContent(d)) throw new Error();
                    setContent(d);
                    setDirty(true);
                    setStatus(
                      "Backup loaded into the editor. Review it, then save.",
                    );
                  } catch {
                    setStatus("Invalid backup file.");
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div
            className="admin-locales"
            role="group"
            aria-label="Content language"
          >
            <Button
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              English
            </Button>
            <Button
              aria-pressed={locale === "ar"}
              onClick={() => setLocale("ar")}
              lang="ar"
            >
              العربية
            </Button>
          </div>
          <EditorLocale.Provider value={locale}>
            <div
              className="admin-editor"
              dir={locale === "ar" ? "rtl" : "ltr"}
              lang={locale}
            >
              <nav
                className="admin-section-links"
                aria-label={
                  locale === "ar" ? "أقسام المحتوى" : "Content sections"
                }
              >
                {Object.keys(content[locale] as Record<string, Value>).map(
                  (key) => (
                    <a key={key} href={`#edit-${key}`}>
                      {label(key, locale)}
                    </a>
                  ),
                )}
              </nav>
              {Object.entries(content[locale] as Record<string, Value>).map(
                ([key, v]) => (
                  <section
                    className="admin-panel"
                    key={`${locale}-${key}`}
                    id={`edit-${key}`}
                  >
                    <h2>{label(key, locale)}</h2>
                    <Editor
                      value={v}
                      path={`${locale}.${key}`}
                      template={
                        (defaults[locale] as Record<string, Value>)[key]
                      }
                      onStatus={setStatus}
                      onChange={(next) => {
                        setContent((old) => ({
                          ...old,
                          [locale]: {
                            ...(old[locale] as Record<string, Value>),
                            [key]: next,
                          },
                        }));
                        setDirty(true);
                      }}
                    />
                  </section>
                ),
              )}
            </div>
          </EditorLocale.Provider>
        </>
      )}
      {status && (
        <div className="admin-status" role="status" aria-live="polite">
          {status}
        </div>
      )}
    </main>
  );
}
