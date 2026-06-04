import React, { useState, useEffect } from "react";
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "../lib/firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  onSnapshot
} from "firebase/firestore";
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Search, 
  UserCheck, 
  Mail, 
  MapPin, 
  Cake, 
  Calendar, 
  Trash2, 
  ChevronRight, 
  RefreshCw, 
  Database,
  ArrowLeft,
  Eye,
  Heart,
  X
} from "lucide-react";
import { SubscriberData } from "../types";

interface ExtendedSubscriber extends SubscriberData {
  id: string;
  createdAt: any;
  status: string;
}

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [subscribers, setSubscribers] = useState<ExtendedSubscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<ExtendedSubscriber | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser && currentUser.email === "dalilajaafar@gmx.de") {
        setAuthError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Subscriber Registrations when authenticated as the Admin
  useEffect(() => {
    if (!user || user.email !== "dalilajaafar@gmx.de") {
      setSubscribers([]);
      return;
    }

    setLoadingData(true);
    setDbError(null);
    const pathRef = "subscribers";

    try {
      // Use onSnapshot for a real-time reactive admin feed
      const q = query(collection(db, pathRef), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded: ExtendedSubscriber[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            streetAddress: data.streetAddress || "",
            postalCode: data.postalCode || "",
            city: data.city || "",
            country: data.country || "",
            birthday: data.birthday || "",
            createdAt: data.createdAt,
            status: data.status || "active",
          });
        });
        setSubscribers(loaded);
        setLoadingData(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, pathRef);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error(err);
      setDbError("Zugriffsfehler bei den Server-Einträgen. Überprüfen Sie Ihre Rechte.");
      setLoadingData(false);
    }
  }, [user]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== "dalilajaafar@gmx.de") {
        setAuthError("Zugriff verweigert. Dieses Portal ist exklusiv für den Kurator.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Anmeldung fehlgeschlagen.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError(null);
      setSelectedSub(null);
    } catch (err: any) {
      console.error("Logout error", err);
    }
  };

  const handleUpdateStatus = async (subId: string, newStatus: string) => {
    const path = `subscribers/${subId}`;
    try {
      const docRef = doc(db, "subscribers", subId);
      await updateDoc(docRef, { status: newStatus });
      if (selectedSub && selectedSub.id === subId) {
        setSelectedSub(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch (processedErr: any) {
        setDbError("Aktion fehlgeschlagen: Berechtigung verweigert.");
      }
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    if (!window.confirm("Sind Sie sicher, dass Sie diese Registrierung dauerhaft löschen möchten?")) {
      return;
    }
    const path = `subscribers/${subId}`;
    try {
      await deleteDoc(doc(db, "subscribers", subId));
      if (selectedSub && selectedSub.id === subId) {
        setSelectedSub(null);
      }
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch (processedErr: any) {
        setDbError("Löschen fehlgeschlagen: Keine ausreichende Berechtigung.");
      }
    }
  };

  // Filter subscribers based on Search query
  const filteredSubscribers = subscribers.filter(sub => {
    const fullSearch = `${sub.firstName} ${sub.lastName} ${sub.email} ${sub.city} ${sub.country}`.toLowerCase();
    return fullSearch.includes(searchQuery.toLowerCase());
  });

  const getFormattedDate = (createdAtField: any) => {
    if (!createdAtField) return "-";
    if (createdAtField.seconds) {
      return new Date(createdAtField.seconds * 1000).toLocaleString("de-DE");
    }
    if (createdAtField.toDate) {
      return createdAtField.toDate().toLocaleString("de-DE");
    }
    return new Date(createdAtField).toLocaleString("de-DE");
  };

  return (
    <div className="w-full bg-brand-black min-h-screen text-brand-ivory font-sans pb-16">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-50 bg-brand-charcoal/95 backdrop-blur-md border-b border-brand-seal/15 py-4 px-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center space-x-2 text-xs font-mono tracking-widest text-brand-gray hover:text-brand-ivory uppercase transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-seal" />
          <span>Zurück zum Club</span>
        </button>

        <div className="flex items-center space-x-2 select-none">
          <Heart className="w-4 h-4 fill-brand-seal text-brand-seal animate-pulse" />
          <span className="font-serif text-sm tracking-[0.2em] font-bold text-brand-ivory uppercase">
            Curator Ledger
          </span>
        </div>

        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-xs font-mono text-brand-seal hover:text-brand-seal-hover uppercase transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="max-w-7xl mx-auto px-6 pt-12 md:px-12">
        {loadingAuth ? (
          <div className="flex flex-col items-center justify-center py-24 select-none">
            <RefreshCw className="w-8 h-8 text-brand-seal animate-spin mb-4" />
            <p className="font-mono text-xs text-brand-gray tracking-widest uppercase">Prüfe Berechtigungen...</p>
          </div>
        ) : !user ? (
          /* Login Dialog */
          <div className="max-w-md mx-auto bg-brand-charcoal/60 border border-brand-seal/15 rounded-md p-8 md:p-10 shadow-2xl text-center select-none">
            <div className="w-16 h-16 rounded-full bg-brand-seal/10 border border-brand-seal/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-7 h-7 text-brand-seal" />
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-brand-ivory mb-2">Kurator-Portal</h2>
            <p className="text-xs text-brand-gray leading-relaxed mb-8">
              Geben Sie Ihre Zugangsdaten ein, um die vertrauliche Bezugsliste und die Bestellungen der Abonnenten zu verwalten.
            </p>

            {authError && (
              <div className="mb-6 p-3 bg-red-950/40 border border-red-800/40 rounded text-xs text-red-300 font-sans leading-normal">
                {authError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-brand-seal hover:bg-brand-seal-hover text-brand-black font-sans text-xs uppercase tracking-[0.2em] font-bold py-3.5 px-6 rounded transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>Mit Google anmelden</span>
            </button>
          </div>
        ) : user.email !== "dalilajaafar@gmx.de" ? (
          /* Logged-in unauthorized user */
          <div className="max-w-md mx-auto bg-brand-charcoal/60 border border-brand-seal/15 rounded-md p-8 text-center shadow-2xl select-none">
            <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-800/30 flex items-center justify-center mx-auto mb-6">
              <X className="w-7 h-7 text-red-500" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-red-400 mb-2">Zugriff verweigert</h2>
            <p className="text-xs text-brand-gray leading-relaxed mb-6">
              Sie sind als <span className="text-brand-ivory">{user.email}</span> angemeldet. Dieses Register ist ausschließlich für den Hauptkurator <span className="text-brand-seal italic font-semibold">dalilajaafar@gmx.de</span> geschützt.
            </p>

            <button
              onClick={handleLogout}
              className="w-full bg-brand-charcoal border border-brand-seal/30 hover:border-brand-seal text-brand-ivory py-2.5 px-6 rounded text-xs uppercase tracking-widest font-mono transition-colors"
            >
              Umloggen / Abmelden
            </button>
          </div>
        ) : (
          /* Actual Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Ledger Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dashboard header statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-brand-charcoal/40 border border-brand-seal/10 p-4 rounded text-center">
                  <span className="text-[10px] font-mono tracking-wider text-brand-gray/60 uppercase block">Mitglieder</span>
                  <span className="text-2xl font-serif font-bold text-brand-ivory">{subscribers.length}</span>
                </div>
                <div className="bg-brand-charcoal/40 border border-brand-seal/10 p-4 rounded text-center">
                  <span className="text-[10px] font-mono tracking-wider text-brand-gray/60 uppercase block">Aktiv</span>
                  <span className="text-2xl font-serif font-bold text-emerald-400">
                    {subscribers.filter(s => s.status === "active").length}
                  </span>
                </div>
                <div className="bg-brand-charcoal/40 border border-brand-seal/10 p-4 rounded text-center">
                  <span className="text-[10px] font-mono tracking-wider text-brand-gray/60 uppercase block">Wartend</span>
                  <span className="text-2xl font-serif font-bold text-amber-400">
                    {subscribers.filter(s => s.status === "pending").length}
                  </span>
                </div>
              </div>

              {/* Search & Controller Card */}
              <div className="bg-brand-charcoal/30 border border-brand-seal/15 p-4 rounded flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50" />
                  <input
                    type="text"
                    placeholder="Mitglieder suchen (Name, Ort, Email...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-charcoal/60 border border-brand-seal/20 rounded pl-10 pr-4 py-2 text-xs md:text-sm text-brand-ivory focus:border-brand-seal focus:outline-none placeholder:text-brand-gray/40 transition-colors"
                  />
                </div>
              </div>

              {dbError && (
                <div className="p-3.5 bg-red-950/40 border border-red-800/40 rounded text-xs text-red-300 leading-normal">
                  {dbError}
                </div>
              )}

              {/* Members ListView Container */}
              <div className="bg-brand-charcoal/20 border border-brand-seal/10 rounded overflow-hidden">
                <div className="px-6 py-4 bg-brand-charcoal/40 border-b border-brand-seal/10 flex items-center justify-between">
                  <h3 className="font-serif text-sm font-semibold text-brand-ivory flex items-center gap-2">
                    <Database className="w-4 h-4 text-brand-seal" />
                    <span>Aktuelle Bezugsliste</span>
                  </h3>
                  <span className="text-[10px] font-mono text-brand-gray bg-white/5 px-2 py-0.5 rounded">
                    Echtzeit-Synchronisiert
                  </span>
                </div>

                {loadingData ? (
                  <div className="py-16 text-center select-none">
                    <RefreshCw className="w-6 h-6 text-brand-seal animate-spin mx-auto mb-2" />
                    <p className="text-xs font-mono text-brand-gray tracking-wider uppercase">Lade Registrierungen...</p>
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="py-16 text-center select-none">
                    <p className="text-xs font-mono text-brand-gray uppercase">Keine passenden Einträge gefunden.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-brand-seal/10">
                    {filteredSubscribers.map((sub) => (
                      <div 
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className={`px-6 py-4.5 flex items-center justify-between hover:bg-brand-charcoal/30 transition-colors cursor-pointer ${selectedSub?.id === sub.id ? "bg-brand-charcoal/50 border-l-2 border-brand-seal" : ""}`}
                      >
                        <div className="min-w-0 pr-4">
                          <h4 className="font-serif font-bold text-brand-ivory text-sm sm:text-base flex items-center gap-2">
                            <span>{sub.firstName} {sub.lastName}</span>
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              sub.status === "active" ? "bg-emerald-400" :
                              sub.status === "pending" ? "bg-amber-400" : "bg-zinc-500"
                            }`} />
                          </h4>
                          <p className="text-xs text-brand-gray/80 font-mono truncate mt-0.5 flex items-center gap-1.5 label text-left">
                            <Mail className="w-3 h-3 text-brand-seal flex-shrink-0" />
                            <span>{sub.email}</span>
                          </p>
                          <p className="text-[10px] text-brand-gray/50 font-mono tracking-normal leading-relaxed mt-1 text-left">
                            Eintrag am: {getFormattedDate(sub.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span className={`text-[9px] font-mono tracking-widest uppercase py-0.5 px-2 rounded-sm border ${
                            sub.status === "active" ? "bg-emerald-950/20 text-emerald-400 border-emerald-800/30" :
                            sub.status === "pending" ? "bg-amber-950/20 text-amber-400 border-amber-800/30" :
                            "bg-zinc-950/20 text-zinc-400 border-zinc-800/30"
                          }`}>
                            {sub.status}
                          </span>
                          <ChevronRight className="w-4 h-4 text-brand-gray/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Details Column Divider */}
            <div className="lg:col-span-1">
              {selectedSub ? (
                /* Selected subscriber detailed profile viewsheet */
                <div className="bg-brand-charcoal/40 border border-brand-seal/15 rounded p-6 md:p-8 space-y-6 sticky top-24">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-brand-seal tracking-widest uppercase block mb-1">Empfängerkartei</span>
                      <h3 className="font-serif text-xl font-bold text-brand-ivory">{selectedSub.firstName} {selectedSub.lastName}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedSub(null)}
                      className="text-brand-gray/40 hover:text-brand-ivory cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-brand-seal/10">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono tracking-widest text-brand-gray/50 uppercase block text-left">E-Mail</span>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
                        <Mail className="w-4 h-4 text-brand-seal flex-shrink-0" />
                        <span className="break-all">{selectedSub.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono tracking-widest text-brand-gray/50 uppercase block text-left">Lieferadresse</span>
                      <div className="flex items-start space-x-2 text-xs sm:text-sm text-left">
                        <MapPin className="w-4 h-4 text-brand-seal flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-brand-gray-dark font-sans leading-relaxed">
                          <p>{selectedSub.streetAddress}</p>
                          <p>{selectedSub.postalCode} {selectedSub.city}</p>
                          <p className="uppercase tracking-wider font-semibold text-[11px] text-brand-gray/80 mt-1">{selectedSub.country}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono tracking-widest text-brand-gray/50 uppercase block text-left">Geburtsdatum</span>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-left">
                        <Cake className="w-4 h-4 text-brand-seal flex-shrink-0" />
                        <span className="text-brand-gray-dark">{selectedSub.birthday}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono tracking-widest text-brand-gray/50 uppercase block text-left">Eingetragen am</span>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-left">
                        <Calendar className="w-4 h-4 text-brand-seal flex-shrink-0" />
                        <span className="text-brand-gray-dark font-mono">{getFormattedDate(selectedSub.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings Card */}
                  <div className="space-y-4 pt-6 border-t border-brand-seal/10">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-brand-gray/50 uppercase block mb-2 text-left">Abonnement-Status</span>
                      <div className="grid grid-cols-3 gap-2">
                        {["active", "pending", "cancelled"].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedSub.id, st)}
                            className={`py-1.5 text-[10px] font-mono tracking-wider uppercase font-bold rounded transition-all border ${
                              selectedSub.status === st 
                                ? st === "active" 
                                  ? "bg-emerald-950/45 text-emerald-400 border-emerald-600/50" 
                                  : st === "pending"
                                    ? "bg-amber-950/45 text-amber-400 border-amber-600/50"
                                    : "bg-zinc-950/45 text-zinc-400 border-zinc-600/50"
                                : "bg-brand-charcoal/30 text-brand-gray border-brand-seal/10 hover:border-brand-seal/30 cursor-pointer"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleDeleteSubscriber(selectedSub.id)}
                        className="w-full bg-red-950/15 hover:bg-red-950/30 border border-red-900/30 hover:border-red-800 text-red-400 py-2.5 rounded text-xs uppercase tracking-widest font-mono font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Mitglied löschen</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unselected placeholder */
                <div className="border border-dashed border-brand-seal/10 rounded-lg p-12 text-center select-none text-brand-gray/40">
                  <UserCheck className="w-8 h-8 mx-auto mb-3 text-brand-seal/20" />
                  <p className="text-xs uppercase tracking-wider font-mono">Wählen Sie ein Mitglied</p>
                  <p className="text-[10px] leading-relaxed mt-2 text-brand-gray/30">Klicken Sie auf eine Zeile links, um die vollständigen Lieferdaten und Statusoptionen des Teilhabers zu verwalten.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
