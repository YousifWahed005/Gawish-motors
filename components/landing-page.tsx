import Image from "next/image";
import { ArrowUpRight, Phone, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { MotionObserver, ThemeToggle } from "@/components/site-controls";
import { getContent, siteUrl, type Locale } from "@/lib/content";
export function LandingPage({ locale }: { locale: Locale }) {
  const c = getContent(locale),
    u = c.ui,
    arabic = locale === "ar";
  const phoneNumbers = c.contact.phone
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter((value) => value.replace(/[^+\d]/g, "").length > 0);
  const number = (phoneNumbers[0] || "").replace(/[^+\d]/g, "");
  const tel = number ? `tel:${number}` : "#contact";
  const inquiry = (message: string) => {
    if (c.contact.whatsapp) {
      const url = new URL(c.contact.whatsapp);
      url.searchParams.set("text", message);
      return url.toString();
    }
    return tel;
  };
  const json = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: c.brand.name,
    url: siteUrl + (arabic ? "/ar" : ""),
    logo: siteUrl + c.brand.logo,
    ...(number ? { telephone: phoneNumbers[0] } : {}),
    ...(c.contact.email ? { email: c.contact.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.contact.address,
      addressLocality: arabic ? "الزقازيق" : "Zagazig",
      addressCountry: "EG",
    },
    foundingDate: c.about.year.replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    ),
    image: siteUrl + c.hero.image,
  };
  const format = (n: number) => new Intl.NumberFormat(locale).format(n);
  return (
    <>
      <MotionObserver />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(json).replace(/</g, "\\u003c"),
        }}
      />
      <header className="nav wrap">
        <a
          href={arabic ? "/ar" : "/"}
          className="brand"
          aria-label={`${c.brand.name} — ${u.homeLabel}`}
        >
          <Image src={c.brand.logo} width={42} height={42} alt="" />
          <span>
            {c.brand.name}
            <small>{u.brandCaption}</small>
          </span>
        </a>
        <nav aria-label={u.navLabel}>
          <a href="#models">{u.navModels}</a>
          <a href="#about">{u.navAbout}</a>
          <a href="#services">{u.navServices}</a>
          <a href="#contact">{u.talk}</a>
        </nav>
        <div className="nav-tools">
          <a
            className="language-switch"
            href={arabic ? "/" : "/ar"}
            lang={arabic ? "en" : "ar"}
            hrefLang={arabic ? "en" : "ar"}
            aria-label={`${u.languageLabel}: ${arabic ? "English" : "العربية"}`}
          >
            {arabic ? "EN" : "عربي"}
          </a>
          <ThemeToggle lightLabel={u.switchLight} darkLabel={u.switchDark} />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="eyebrow">
            <span className="red-dot" />
            {c.hero.eyebrow}
          </div>
          <h1 id="hero-title">
            {c.hero.title}
            <br />
            <span>{c.hero.accent}</span>
          </h1>
          <div className="hero-bottom">
            <div className="hero-copy">
              <p>{c.hero.description}</p>
              <a className="button" href="#models">
                {c.hero.cta}
                <ArrowUpRight size={20} />
              </a>
              <div className="hero-note">
                <span>{format(1)} /</span>
                {u.heroNote}
              </div>
            </div>
            <figure className="hero-car">
              <div className="car-word" aria-hidden="true">
                {u.heroWord}
              </div>
              <div className="hero-photo">
                <Image
                  src={c.hero.image}
                  alt={c.hero.imageAlt}
                  width={1600}
                  height={1067}
                  sizes="(max-width: 760px) 100vw, 70vw"
                  priority
                />
              </div>
              <figcaption>
                <span>{c.hero.caption}</span>
                <span>{u.collectionCaption}</span>
              </figcaption>
            </figure>
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <span>{u.tickerFirst}</span>
          <span className="ticker-star">✳</span>
          <span>{u.tickerSecond}</span>
          <span className="ticker-star">✳</span>
          <span>{u.tickerThird}</span>
          <span className="ticker-star">✳</span>
        </div>
        <section id="models" className="section wrap" data-reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {format(1)} — {u.collectionEyebrow}
              </p>
              <h2>{c.modelsHeading}</h2>
            </div>
            <a className="text-link" href="#contact">
              {u.match}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="models">
            {c.models.map((m, i) => (
              <article key={i} className="model" data-reveal>
                <div className="model-picture">
                  <Badge>{m.category}</Badge>
                  <Image
                    src={m.image}
                    alt={m.imageAlt}
                    width={1000}
                    height={667}
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                  <span className="model-number">{format(i + 1)}</span>
                </div>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <a
                  href={inquiry(`${u.inquiry} ${m.category}`)}
                  className="text-link"
                >
                  {u.explore}
                  <ArrowUpRight size={18} />
                </a>
              </article>
            ))}
          </div>
          <p className="photo-note">{u.photoNote}</p>
        </section>
        <section id="about" className="section wrap company-about" data-reveal>
          <div>
            <p className="eyebrow">
              {format(2)} — {c.about.eyebrow}
            </p>
            <h2>{c.about.title}</h2>
            <p>{c.about.description}</p>
            <div className="since-stamp">
              <strong>{c.about.year}</strong>
              <span>
                {c.about.since}
                <br />
                {u.sinceLabel}
              </span>
            </div>
          </div>
          <figure className="about-photo">
            <Image
              src={c.about.image}
              alt={c.about.imageAlt}
              width={1000}
              height={667}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </figure>
          <div className="story">
            <h3>{c.story.title}</h3>
            <p>{c.story.description}</p>
          </div>
        </section>
        <section id="purpose" className="purpose-section">
          <div className="section wrap" data-reveal>
            <div className="section-head">
              <div>
                <p className="eyebrow">{c.principles.eyebrow}</p>
                <h2>{c.principles.title}</h2>
              </div>
            </div>
            <div className="principles">
              {c.principles.items.map((v, i) => (
                <article key={i} className="principle" data-reveal>
                  <span className="row-number">{format(i + 1)}</span>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="offers" className="offers dark">
          <div className="wrap offer-grid" data-reveal>
            <div>
              <p className="eyebrow">
                {format(3)} — {c.offers.eyebrow}
              </p>
              <h2>{c.offers.title}</h2>
              <p>{c.offers.description}</p>
              <a href={inquiry(u.inquiry)} className="button light-button">
                {c.offers.cta}
                <ArrowUpRight size={20} />
              </a>
              <small>{c.offers.detail}</small>
            </div>
            <div className="offer-art">
              <Badge>{c.offers.label}</Badge>
              <span className="offer-type" aria-hidden="true">
                {u.offerWord}
              </span>
              <Image
                src={c.offers.image}
                width={1000}
                height={667}
                sizes="(max-width: 760px) 100vw, 50vw"
                alt={c.offers.imageAlt}
              />
            </div>
          </div>
        </section>
        <section id="why" className="section wrap why" data-reveal>
          <div>
            <p className="eyebrow">
              {format(4)} — {c.why.eyebrow}
            </p>
            <h2>{c.why.title}</h2>
            <p>{c.why.description}</p>
          </div>
          <div>
            {c.why.items.map((v, i) => (
              <article className="reason" key={i} data-reveal>
                <span>{format(i + 1)}</span>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="services" className="services-section">
          <div className="section wrap" data-reveal>
            <div className="section-head">
              <div>
                <p className="eyebrow">
                  {format(5)} — {c.services.eyebrow}
                </p>
                <h2>{c.services.title}</h2>
              </div>
              <p className="section-description">{c.services.description}</p>
            </div>
            <div className="service-list">
              {c.services.items.map((v, i) => (
                <article key={i} className="service-row" data-reveal>
                  <span className="row-number">{format(i + 1)}</span>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                  <ArrowUpRight aria-hidden="true" size={26} />
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="ownership" className="section wrap ownership" data-reveal>
          <div>
            <p className="eyebrow">{c.ownership.eyebrow}</p>
            <h2>{c.ownership.title}</h2>
          </div>
          <div className="ownership-list">
            {c.ownership.items.map((v, i) => (
              <article key={i} data-reveal>
                <span className="row-number">{format(i + 1)}</span>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="partners" className="partners dark">
          <div className="wrap partners-inner" data-reveal>
            <div>
              <p className="eyebrow">{c.partners.eyebrow}</p>
              <h2>{c.partners.title}</h2>
            </div>
            <div>
              <Badge>{c.partners.label}</Badge>
              <p>{c.partners.description}</p>
              <small>{c.partners.detail}</small>
              <a className="text-link" href="#contact">
                {u.talk}
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section id="test-drive" className="test-drive">
          <div className="wrap" data-reveal>
            <p className="eyebrow">{c.testDrive.eyebrow}</p>
            <h2>{c.testDrive.title}</h2>
            <div>
              <p>{c.testDrive.description}</p>
              <a className="button" href={inquiry(u.visitInquiry)}>
                {c.testDrive.cta}
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
        </section>
        <section id="reviews" className="section wrap testimonials" data-reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {format(6)} — {c.testimonials.eyebrow}
              </p>
              <h2>{c.testimonials.title}</h2>
            </div>
            <span className="tiny">{u.reviewsNote}</span>
          </div>
          <p className="reviews-description">{c.testimonials.description}</p>
          <div className="quotes">
            {c.testimonials.items.map((v, i) => (
              <figure key={i} data-reveal>
                <span className="quote-mark" aria-hidden="true">
                  “
                </span>
                <blockquote>{v.quote}</blockquote>
                <figcaption>
                  <strong>{v.name}</strong>
                  <span>{v.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section id="app" className="app-section wrap" data-reveal>
          <div className="app-picture">
            <Image
              src={c.app.image}
              alt={c.app.imageAlt}
              width={400}
              height={480}
              sizes="260px"
            />
          </div>
          <div>
            <Badge>{c.app.status}</Badge>
            <h2>{c.app.title}</h2>
            <p>{c.app.description}</p>
            <div className="app-links">
              {c.app.iosUrl ? (
                <a className="button" href={c.app.iosUrl}>
                  {u.iosDownload}
                  <ArrowUpRight size={18} />
                </a>
              ) : (
                <span className="store-placeholder">{u.iosSoon}</span>
              )}
              {c.app.androidUrl ? (
                <a className="button" href={c.app.androidUrl}>
                  {u.androidDownload}
                  <ArrowUpRight size={18} />
                </a>
              ) : (
                <span className="store-placeholder">{u.androidSoon}</span>
              )}
            </div>
          </div>
        </section>
        <section id="faq" className="section wrap faq" data-reveal>
          <div>
            <p className="eyebrow">
              {format(7)} — {c.faq.eyebrow}
            </p>
            <h2>{c.faq.title}</h2>
            <a className="text-link" href="#contact">
              {u.moreQuestions}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <Accordion>
            {c.faq.items.map((v, i) => (
              <AccordionItem title={v.question} key={i}>
                <p>{v.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section id="contact" className="contact-section">
          <div className="section wrap contact-grid" data-reveal>
            <div>
              <p className="eyebrow">
                {format(8)} — {c.contactHeading.eyebrow}
              </p>
              <h2>{c.contactHeading.title}</h2>
              <p>{c.contactHeading.description}</p>
              <a className="button" href={c.contact.mapUrl}>
                {c.contactHeading.cta}
                <ArrowUpRight size={20} />
              </a>
            </div>
            <div className="contact-details">
              <div>
                <MapPin size={22} aria-hidden="true" />
                <div>
                  <h3>{c.contactHeading.locationLabel}</h3>
                  <p>{c.contact.address}</p>
                </div>
              </div>
              <div>
                <Clock size={22} aria-hidden="true" />
                <div>
                  <h3>{c.contactHeading.hoursLabel}</h3>
                  <p>{c.contact.hours}</p>
                </div>
              </div>
              {number && (
                <div>
                  <Phone size={22} aria-hidden="true" />
                  <div>
                    <h3>{c.contactHeading.phoneLabel}</h3>
                    {phoneNumbers.map((phone, i) => (
                      <a
                        className="phone-line"
                        key={i}
                        href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                      >
                        <bdi>{phone}</bdi>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {c.contact.email && (
                <div>
                  <div>
                    <h3>{c.contactHeading.emailLabel}</h3>
                    <a href={`mailto:${c.contact.email}`}>
                      <bdi>{c.contact.email}</bdi>
                    </a>
                  </div>
                </div>
              )}
              <div className="contact-social">
                {c.contact.whatsapp && (
                  <a className="text-link" href={c.contact.whatsapp}>
                    {u.whatsappLabel}
                    <ArrowUpRight size={18} />
                  </a>
                )}
                {c.contact.instagram && (
                  <a className="text-link" href={c.contact.instagram}>
                    {u.socialLabel}
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="dark">
        <div className="wrap footer-top">
          <div>
            <a href={arabic ? "/ar" : "/"} className="brand">
              <Image src={c.brand.logo} alt="" width={44} height={44} />
              <span>{c.brand.name}</span>
            </a>
            <p>{c.footer.text}</p>
            <span className="tiny">{c.brand.tagline}</span>
          </div>
          <div>
            <h2>{u.footerVisit}</h2>
            <a href={c.contact.mapUrl}>
              <MapPin size={18} />
              {c.contact.address}
            </a>
            <p>{c.contact.hours}</p>
          </div>
          <div>
            <h2>{u.footerTalk}</h2>
            {phoneNumbers.map((phone, i) => (
              <a key={i} href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
                <Phone size={18} />
                <bdi>{phone}</bdi>
              </a>
            ))}
            {c.contact.email && (
              <a href={`mailto:${c.contact.email}`}>
                <bdi>{c.contact.email}</bdi>
              </a>
            )}
            {c.contact.whatsapp && (
              <a href={c.contact.whatsapp}>
                {u.whatsappLabel}
                <ArrowUpRight size={16} />
              </a>
            )}
            {c.contact.instagram && (
              <a href={c.contact.instagram}>
                {u.socialLabel}
                <ArrowUpRight size={16} />
              </a>
            )}
            <a href="#contact">
              {u.talk}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <small>
            © {format(new Date().getFullYear())} {c.footer.copyright}
          </small>
          <a href="#main">{u.backTop}</a>
          <a href="/admin">{u.admin}</a>
        </div>
      </footer>
    </>
  );
}
