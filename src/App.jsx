import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  Gift,
  Globe2,
  PackageCheck,
  Send,
  Shirt,
  X,
} from "lucide-react";

const ASSETS = {
  hero: "/assets/steamone-hotel-hero-products.png",
  intro: "/assets/manon-intro-photo.png",
  guestRooms: "/products/guest-room-steamers.jpg",
  housekeeping: "/products/housekeeping-steamers.png",
  sampleTesting: "/products/sample-testing-steamers.jpg",
  map: "/assets/global-hotel-map.png",
};

const productCards = [
  {
    title: "Guest Rooms",
    text: "Offer your guests a premium experience with perfectly steamed garments.",
    image: ASSETS.guestRooms,
    imageAlt: "SteamOne handheld steamers for hotel guest rooms",
    imageClassName: "solution-image-guest-rooms",
    Icon: BedDouble,
  },
  {
    title: "Housekeeping",
    text: "Save time and improve efficiency with professional tools designed for daily use.",
    image: ASSETS.housekeeping,
    imageAlt: "SteamOne standing steamers for hotel housekeeping teams",
    imageClassName: "solution-image-housekeeping",
    cardClassName: "solution-card-housekeeping",
    Icon: Shirt,
  },
  {
    title: "Sample Testing",
    text: "Test our solution directly in your hotel with a complimentary sample.",
    image: ASSETS.sampleTesting,
    imageAlt: "SteamOne sample testing steamers for hotel guests",
    imageClassName: "solution-image-sample-testing",
    Icon: Gift,
    action: "sample",
  },
];

// Place the official product specification images in /public/products/
// with exactly these filenames: pro400.jpg and pro500.jpg.
const sampleProducts = [
  {
    name: "PRO400",
    image: "/products/pro400.jpg",
    description: "Compact, powerful and ideal for efficient daily garment care.",
    specs: [
      "2000 W",
      "33 g/min steam output",
      "400 ml tank",
      "Ready in 30 seconds",
      "Vertical and horizontal use",
      "Ceramic soleplate",
      "3 m cable",
    ],
  },
  {
    name: "PRO500",
    image: "/products/pro500.jpg",
    description: "Elegant, reliable and designed for professional garment care needs.",
    specs: [
      "2000 W",
      "35 g/min steam output",
      "200 ml tank",
      "Ready in 60 seconds",
      "Vertical and horizontal use",
      "Ceramic soleplate",
      "3 m cable",
      "Insulating mat",
    ],
  },
];

// Use only officially approved SteamOne partner/client logo files here.
const hotelLogos = [
  {
    name: "Relais & Châteaux",
    src: "/logos/hotels/relais-chateaux-transparent.png",
    className: "hotel-logo-relais",
  },
  {
    name: "Accor",
    src: "/logos/hotels/accor-transparent.png",
    className: "hotel-logo-accor",
  },
  {
    name: "Marriott",
    src: "/logos/hotels/marriott-transparent.png",
    className: "hotel-logo-marriott",
  },
  {
    name: "Four Seasons",
    src: "/logos/hotels/four-seasons.jpeg",
    className: "hotel-logo-four-seasons",
  },
  {
    name: "Hyatt Regency",
    src: "/logos/hotels/hyatt-regency.jpeg",
    className: "hotel-logo-hyatt",
  },
  {
    name: "Mandarin Oriental",
    src: "/logos/hotels/mandarin-oriental.jpeg",
    className: "hotel-logo-mandarin",
  },
];

const formConfigs = {
  meeting: {
    endpoint: "/api/book-meeting",
    title: "Book a 10-minute call",
    description: "Send a preferred time and I will come back to you shortly.",
    submitLabel: "Send meeting request",
    success: "Thank you. I'll get back to you shortly to confirm a time.",
    fields: [
      ["firstName", "First name", "text", true],
      ["lastName", "Last name", "text", true],
      ["hotelName", "Hotel name", "text", true],
      ["email", "Email", "email", true],
      ["preferredDateTime", "Preferred date/time", "datetime-local", true],
      ["message", "Message", "textarea", false],
    ],
  },
  sample: {
    endpoint: "/api/request-sample",
    title: "Request a sample",
    description: "Tell me where the sample should be discussed or delivered.",
    note:
      "I may contact you after your request. This allows me to discuss your interest in SteamOne products and see how our solutions could fit your hotel!",
    submitLabel: "Send sample request",
    success: "Thank you. I'll get back to you shortly about the sample.",
    fields: [
      ["selectedProduct", "Selected product", "text", true, true],
      ["firstName", "First name", "text", true],
      ["lastName", "Last name", "text", true],
      ["hotelName", "Hotel name", "text", true],
      ["email", "Email", "email", true],
      ["deliveryCountry", "Delivery country", "text", true],
      ["message", "Message", "textarea", false],
    ],
  },
};

function track(eventName, detail = {}) {
  // Analytics hook: replace this console log with your tracking tool later.
  console.log(`[analytics] ${eventName}`, detail);
}

function getInitialForm(fields) {
  return fields.reduce((values, [name]) => ({ ...values, [name]: "" }), {});
}

function SteamOneLogo() {
  return (
    <a className="logo" href="/hotels-steamone" aria-label="SteamOne Professional home">
      <span className="logo-main">SteamOne</span>
      <span className="logo-sub">Professional</span>
    </a>
  );
}

function ActionButton({ variant = "light", children, onClick, icon: Icon }) {
  return (
    <button className={`action-button ${variant}`} type="button" onClick={onClick}>
      {Icon ? <Icon aria-hidden="true" size={20} strokeWidth={1.8} /> : null}
      <span>{children}</span>
    </button>
  );
}

function HotelLogo({ name, src, className }) {
  const [status, setStatus] = useState("loading");

  return (
    <div className={`hotel-logo ${className || ""}`} aria-label={`${name} logo`}>
      <img
        className={status === "loaded" ? "is-loaded" : status === "missing" ? "is-missing" : ""}
        src={src}
        alt={`${name} logo`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("missing")}
      />
      {status === "missing" ? (
        // Replace this fallback with the official logo file.
        <span>{name}</span>
      ) : null}
    </div>
  );
}

function FormModal({ type, onClose, initialValues = {}, onBack }) {
  const config = formConfigs[type];
  const [values, setValues] = useState(() => ({
    ...getInitialForm(config.fields),
    ...initialValues,
  }));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("loading");
    track("form_submit_attempt", { type });

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "The request could not be sent.");
      }

      setStatus("success");
      track("form_submit_success", { type });
    } catch (submitError) {
      setStatus("idle");
      setError(submitError.message);
      track("form_submit_error", { type, message: submitError.message });
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${type}-modal-title`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close form">
          <X aria-hidden="true" size={20} />
        </button>

        {isSuccess ? (
          <div className="success-state">
            <CheckCircle2 aria-hidden="true" size={42} />
            <h2 id={`${type}-modal-title`}>{config.success}</h2>
            <button className="action-button dark modal-action" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            {onBack ? (
              <button className="modal-back" type="button" onClick={onBack}>
                <ArrowLeft aria-hidden="true" size={17} />
                <span>Back to products</span>
              </button>
            ) : null}
            <p className="eyebrow">SteamOne Professional</p>
            <h2 id={`${type}-modal-title`}>{config.title}</h2>
            <p className="modal-description">{config.description}</p>
            {config.note ? <p className="modal-note">{config.note}</p> : null}

            <form className="lead-form" onSubmit={handleSubmit}>
              {config.fields.map(([name, label, fieldType, required, readOnly]) => (
                <label
                  className={`${fieldType === "textarea" ? "field full" : "field"} ${
                    readOnly ? "selected-product-field full" : ""
                  }`}
                  key={name}
                >
                  <span>{label}</span>
                  {fieldType === "textarea" ? (
                    <textarea
                      name={name}
                      value={values[name]}
                      onChange={(event) => updateValue(name, event.target.value)}
                      required={required}
                      rows={4}
                    />
                  ) : (
                    <input
                      name={name}
                      type={fieldType}
                      value={values[name]}
                      onChange={(event) => updateValue(name, event.target.value)}
                      required={required}
                      readOnly={readOnly}
                    />
                  )}
                </label>
              ))}

              {error ? <p className="form-error" role="alert">{error}</p> : null}

              <button className="action-button dark form-submit" type="submit" disabled={isLoading}>
                <Send aria-hidden="true" size={18} />
                <span>{isLoading ? "Sending..." : config.submitLabel}</span>
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function SampleSelectionModal({ onClose, onSelect }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal sample-selection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sample-selection-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close product selection">
          <X aria-hidden="true" size={20} />
        </button>

        <p className="eyebrow">Complimentary sample testing</p>
        <h2 id="sample-selection-title">Choose a product to test</h2>
        <p className="modal-description sample-selection-description">
          Select the SteamOne model that best fits your property's garment care needs.
        </p>

        <div className="sample-product-grid">
          {sampleProducts.map((product) => (
            <article className="sample-product-card" key={product.name}>
              <div className="sample-product-image">
                <img src={product.image} alt={`${product.name} product specification`} />
              </div>
              <div className="sample-product-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <ul>
                  {product.specs.map((spec) => (
                    <li key={spec}>
                      <Check aria-hidden="true" size={15} strokeWidth={2} />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="action-button dark sample-product-action"
                  type="button"
                  onClick={() => onSelect(product.name)}
                >
                  Request this sample
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [modalType, setModalType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  function openMeetingModal() {
    track("cta_click", { type: "meeting" });
    setModalType("meeting");
  }

  function openSampleSelection() {
    track("cta_click", { type: "sample-selection" });
    setSelectedProduct("");
    setModalType("sample-selection");
  }

  function selectSampleProduct(productName) {
    track("sample_product_selected", { product: productName });
    setSelectedProduct(productName);
    setModalType("sample");
  }

  function closeModal() {
    setModalType(null);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <SteamOneLogo />
        <nav className="nav-actions" aria-label="Primary actions">
          <ActionButton icon={CalendarDays} onClick={openMeetingModal}>
            Book a 10-minute call
          </ActionButton>
          <ActionButton variant="dark" icon={PackageCheck} onClick={openSampleSelection}>
            Request a sample
          </ActionButton>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src={ASSETS.hero}
          alt="SteamOne travel steamer case and upright steamer in a premium hotel room"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Hotel garment steamers</p>
          <h1 id="hero-title">
            What if 10 minutes could <span>elevate</span> your guest experience?
          </h1>
          <div className="short-rule" />
          <p className="hero-copy">
            SteamOne helps hotels deliver impeccable garment care for guests and optimize
            housekeeping efficiency.
          </p>
          <div className="hero-actions">
            <ActionButton icon={CalendarDays} onClick={openMeetingModal}>
              Book a 10-minute call
            </ActionButton>
            <ActionButton variant="dark" icon={PackageCheck} onClick={openSampleSelection}>
              Request a sample
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="intro-grid" aria-labelledby="intro-title">
        <div className="intro-copy">
          <p className="eyebrow">Hi, I'm Manon</p>
          <div className="short-rule" />
          <h2 id="intro-title">Just to present myself</h2>
          <p>
            I'm a Junior Business Developer at SteamOne, a family-owned company that has been
            specializing in steamers for nearly 15 years. Excellence, innovation, and perseverance
            are the core values that guide our company.
          </p>
          <p>
            I felt it was important to add this short introduction so you could get to know, even
            briefly, the person behind the message.
          </p>
        </div>

        <div className="video-card">
          <img src={ASSETS.intro} alt="Portrait of Manon" />
        </div>

        <div className="solution-cards" aria-label="SteamOne hotel solutions">
          {productCards.map(
            ({ title, text, image, imageAlt, imageClassName, cardClassName, Icon, action }) => {
              const CardElement = action ? "button" : "article";

              return (
                <CardElement
                  className={`solution-card ${cardClassName || ""} ${
                    action ? "solution-card-action" : ""
                  }`}
                  key={title}
                  {...(action
                    ? {
                        type: "button",
                        onClick: openSampleSelection,
                        "aria-label": "View products available for sample testing",
                      }
                    : {})}
                >
                  <img className={imageClassName || ""} src={image} alt={imageAlt} />
                  <div className="solution-body">
                    <Icon aria-hidden="true" size={32} strokeWidth={1.55} />
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </CardElement>
              );
            },
          )}
        </div>
      </section>

      <section className="trust-card" aria-labelledby="trust-title">
        <div className="trust-copy">
          <p className="eyebrow">They trust us</p>
          <h2 id="trust-title">Over 700 hotels worldwide already trust SteamOne.</h2>
        </div>
        <div className="trust-map">
          <img src={ASSETS.map} alt="Subtle global presence map illustration" />
        </div>
        <div className="partner-row" aria-label="Hotel client logo placeholders">
          {hotelLogos.map((logo) => (
            <HotelLogo key={logo.src} {...logo} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>
          <Globe2 aria-hidden="true" size={15} />
          Trusted by hotels worldwide
        </span>
        <small>SteamOne Professional - {currentYear}</small>
      </footer>

      {modalType === "meeting" ? <FormModal type="meeting" onClose={closeModal} /> : null}
      {modalType === "sample-selection" ? (
        <SampleSelectionModal onClose={closeModal} onSelect={selectSampleProduct} />
      ) : null}
      {modalType === "sample" ? (
        <FormModal
          type="sample"
          onClose={closeModal}
          onBack={() => setModalType("sample-selection")}
          initialValues={{ selectedProduct }}
        />
      ) : null}
    </main>
  );
}
