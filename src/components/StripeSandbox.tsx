import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, CreditCard, ArrowLeft, Loader2, Sparkles, Mail, MapPin, Gift } from "lucide-react";

export default function StripeSandbox() {
  const [params, setParams] = useState<Record<string, string>>({});
  
  // Demographics and Delivery fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Germany");
  const [birthday, setBirthday] = useState("");
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [
    "Germany", "Austria", "Switzerland", "France", "Netherlands", "Belgium", 
    "Italy", "United Kingdom", "United States", "Spain", "Denmark", "Sweden"
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    urlParams.forEach((val, key) => {
      data[key] = val;
    });
    setParams(data);
  }, []);

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const matches = clean.match(/.{1,4}/g);
    return matches ? matches.join(" ").slice(0, 19) : clean.slice(0, 19);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate Sandbox Demographic Fields
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!streetAddress.trim()) newErrors.streetAddress = "Street address is required.";
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!birthday.trim() || !/^\d{2}\.\d{2}\.\d{4}$/.test(birthday.trim())) {
      newErrors.birthday = "Birthdate is required in DD.MM.YYYY format.";
    }

    // Validate Sandbox Payment Fields
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.card = "Please enter a valid 16-digit card number.";
    }
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Enter a valid MM/YY expiry date.";
    }
    if (!cvc || cvc.length < 3) {
      newErrors.cvc = "Enter valid CVV.";
    }
    if (!nameOnCard.trim()) {
      newErrors.nameOnCard = "Enter cardholder name.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to error if possible
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setErrors({});

    const subId = params.subscriberId;
    const subscriberData = {
      firstName,
      lastName,
      email,
      streetAddress,
      postalCode,
      city,
      country,
      birthday
    };

    // Store in localStorage for immediate frontend rendering
    localStorage.setItem("nwr_member", JSON.stringify(subscriberData));

    if (subId) {
      try {
        await fetch("/api/simulate-payment-success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ subscriberId: subId })
        });
      } catch (error) {
        console.error("Failed to execute simulated payment webhook:", error);
      }
    }

    // Construct Redirect parameters
    const redirectParams = new URLSearchParams({
      success: "true",
      subscriber_id: subId || `sub_${Date.now()}`,
      firstName,
      lastName,
      email,
      streetAddress,
      postalCode,
      city,
      country,
      birthday
    });

    const targetUrl = params.successUrl 
      ? params.successUrl.split("?")[0] + "?" + redirectParams.toString() 
      : `/?${redirectParams.toString()}`;

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1500);
  };

  const handleCancel = () => {
    if (params.cancelUrl) {
      window.location.href = params.cancelUrl;
    } else {
      window.location.href = "/";
    }
  };

  // Pre-fill card name when First/Last name changes
  useEffect(() => {
    if (!nameOnCard && (firstName || lastName)) {
      setNameOnCard(`${firstName} ${lastName}`.trim());
    }
  }, [firstName, lastName]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1C2024] antialiased flex flex-col md:flex-row font-sans">
      
      {/* LEFT COLUMN: Summary */}
      <div className="w-full md:w-[40%] bg-white p-6 md:p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E3E8EE] flex-shrink-0">
        <div className="space-y-8">
          <div 
            className="flex items-center gap-2 cursor-pointer text-[#4F5B66] text-xs font-semibold uppercase tracking-wider hover:text-[#1C2024] transition-colors" 
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4" /> Zurück zur Gilde / Cancel
          </div>

          <div className="space-y-3">
            <span className="text-[#635BFF] uppercase tracking-widest text-[9px] font-extrabold bg-[#635BFF]/10 px-2 py-0.5 rounded">
              Stripe Test-Modus Sandbox
            </span>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="font-serif italic text-lg text-amber-900">Snail Mail Guild</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-mono font-medium text-gray-500">Nights Worth Remembering</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1F36] pt-1">
              $11.00 <span className="text-sm font-normal text-[#4F566B]">pro Monat</span>
            </h1>
          </div>

          <div className="border-t border-[#E3E8EE] pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-[#3C4257]">Abonnement-Flatrate</span>
              <span className="font-semibold text-[#1A1F36]">$11.00 / Monat</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#697386]">
              <span>Weltweiter Premium-Versand</span>
              <span>Kostenlos</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#697386]">
              <span>Interaktiver Absprung-Portal</span>
              <span>Inbegriffen</span>
            </div>
            
            <div className="border-t border-[#E3E8EE] pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-[#3C4257]">Heute fällig</span>
              <span className="text-lg font-bold text-[#1A1F36]">$11.00</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#697386] space-y-2 pt-12 md:pt-0">
          <div className="flex items-center gap-1 text-[#635BFF] font-semibold">
            <ShieldCheck className="w-4 h-4" /> Powered by Stripe Developer Platform
          </div>
          <p>
            Da Ihr Stripe-API-Schlüssel lokal noch unkonfiguriert ist, simuliert diese Sandbox die Datensammlung direkt für die Stripe-Kundendatenbank. Es wird keine echte Buchung vorgenommen.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Stripe Checkout form (Demographics + Shipping + Cards) */}
      <div className="flex-grow p-6 md:p-12 lg:p-16 overflow-y-auto max-h-screen bg-[#F8F9FA]">
        <div className="w-full max-w-xl bg-white p-6 md:p-8 lg:p-10 rounded-lg shadow-sm border border-[#E3E8EE] mx-auto">
          <form onSubmit={handlePay} className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1A1F36] flex items-center gap-1.5 border-b border-[#E3E8EE] pb-3">
                <Lock className="w-4 h-4 text-[#635BFF]" /> Stripe Checkout
              </h2>
            </div>

            {/* Demographics Information Block */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#697386] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> 1. Kontakt- und Kundendetails
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4257] mb-1">Vorname</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Arthur"
                    className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                  />
                  {errors.firstName && <p className="text-rose-500 text-[11px] mt-0.5">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4257] mb-1">Nachname</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Pendleton"
                    className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                  />
                  {errors.lastName && <p className="text-rose-500 text-[11px] mt-0.5">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4257] mb-1">E-Mail-Adresse</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arthur.pendleton@mail.de"
                  className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                />
                {errors.email && <p className="text-rose-500 text-[11px] mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4257] mb-1 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" /> Geburtsdatum
                </label>
                <input
                  type="text"
                  required
                  value={birthday}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d.]/g, "");
                    setBirthday(clean);
                  }}
                  maxLength={10}
                  placeholder="TT.MM.JJJJ (z.B. 14.11.1994)"
                  className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition font-mono"
                />
                {errors.birthday && <p className="text-rose-500 text-[11px] mt-0.5">{errors.birthday}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">Wird für die Geburtstagsüberraschung in Ihrem Geburtsmonat benötigt.</p>
              </div>
            </div>

            {/* Shipping Address block */}
            <div className="space-y-4 pt-4 border-t border-[#E3E8EE]">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#697386] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> 2. Versandadresse / Shipping Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#3C4257] mb-1">Straße & Hausnummer</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Kaiserstraße 12"
                  className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                />
                {errors.streetAddress && <p className="text-rose-500 text-[11px] mt-0.5">{errors.streetAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4257] mb-1">Postleitzahl (PLZ)</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10115"
                    className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition font-mono"
                  />
                  {errors.postalCode && <p className="text-rose-500 text-[11px] mt-0.5">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4257] mb-1">Stadt / Ort</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                    className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                  />
                  {errors.city && <p className="text-rose-500 text-[11px] mt-0.5">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4257] mb-1">Land</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Credit Card Details Info block */}
            <div className="space-y-4 pt-4 border-t border-[#E3E8EE]">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#697386] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> 3. Zahlungsmethode / Settle Payment
              </h3>

              {/* Demo Stripe Instructions */}
              <div className="p-3 bg-[#F4F6F8] rounded border border-[#E3E8EE] text-[11px] text-[#4F566B] space-y-1">
                <span className="font-bold text-[#635BFF] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse duration-1000" /> Simulierter Kreditkartentest
                </span>
                <p>Verwenden Sie für den Test eine beliebige Testkarte (z.B. 4242 4242 4242 4242), ein zukünftiges Ablaufdatum (z.B. 12/28) und einen beliebigen CVC (z.B. 242).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4257] mb-1">Name auf der Karte</label>
                <input
                  type="text"
                  required
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="Arthur Pendleton"
                  className="w-full px-3 py-2 bg-white border border-[#D9E1EC] rounded-md text-sm text-[#1C2024] focus:border-[#635BFF] focus:outline-none focus:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition"
                />
                {errors.nameOnCard && <p className="text-rose-500 text-xs mt-1">{errors.nameOnCard}</p>}
              </div>

              {/* Credit Card inputs */}
              <div className="border border-[#D9E1EC] rounded-md overflow-hidden divide-y divide-[#D9E1EC] focus-within:border-[#635BFF] focus-within:shadow-[0_0_0_2px_rgba(99,91,255,0.15)] transition">
                <div className="relative flex items-center bg-white px-3 py-2">
                  <CreditCard className="w-4 h-4 text-[#A3ACBA] mr-2.5" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="flex-grow bg-transparent text-sm text-[#1C2024] focus:outline-none placeholder-[#A3ACBA] font-mono text-xs"
                  />
                </div>

                <div className="flex divide-x divide-[#D9E1EC] bg-white">
                  <div className="w-1/2 px-3 py-2">
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setExpiry(val.length >= 2 ? `${val.slice(0, 2)}/${val.slice(2, 4)}` : val);
                      }}
                      maxLength={5}
                      placeholder="MM/YY"
                      className="w-full bg-transparent text-sm text-[#1C2024] focus:outline-none placeholder-[#A3ACBA] font-mono text-center text-xs"
                    />
                  </div>
                  <div className="w-1/2 px-3 py-2">
                    <input
                      type="password"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      placeholder="CVC"
                      className="w-full bg-transparent text-sm text-[#1C2024] focus:outline-none placeholder-[#A3ACBA] font-mono text-center text-xs"
                    />
                  </div>
                </div>
              </div>

              {(errors.card || errors.expiry || errors.cvc) && (
                <div className="text-rose-500 text-[11px] space-y-0.5">
                  {errors.card && <p>{errors.card}</p>}
                  {errors.expiry && <p>{errors.expiry}</p>}
                  {errors.cvc && <p>{errors.cvc}</p>}
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#635BFF] hover:bg-[#5649E6] text-white font-medium py-3 px-4 rounded-md shadow-sm transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-85"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Zahlung wird verarbeitet / Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sicher bezahlen & abonnieren / Pay & Subscribe</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-[#697386]">
              Durch das Absenden stimmen Sie den Zahlungsmodalitäten von Stripe Sandbox zu. Cancel anytime.
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}
