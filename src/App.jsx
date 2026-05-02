import { useState, useEffect } from 'react';

// ─── Persistente Daten (localStorage) ────────────────────────────────────────

const DEFAULT_DRINKS = [
  { id: 1, name: 'Aiinger Bier', emoji: '🍺', unit: 'Kasten (20×0,5l)' },
  { id: 2, name: 'Bier 1', emoji: '🍺', unit: 'Kasten (20×0,5l)' },
  { id: 3, name: 'Bier 2', emoji: '🍺', unit: 'Kasten (20×0,5l)' },
  { id: 4, name: 'Cola', emoji: '🥤', unit: 'Kasten (12×1,0l)' },
  { id: 5, name: 'Fanta', emoji: '🍊', unit: 'Kasten (12×1,0l)' },
  { id: 6, name: 'Salvus naturell', emoji: '💧', unit: 'Kasten (12×1,0l)' },
  { id: 7, name: 'Salvus medium', emoji: '💧', unit: 'Kasten (12×1,0l)' },
  { id: 8, name: 'Salvus classik', emoji: '💧', unit: 'Kasten (12×1,0l)' },
];

const DEFAULT_PERSONS = [
  { id: 1, name: 'Martin', email: 'martin@example.de' },
  { id: 2, name: 'Familie Müller', email: 'mueller@example.de' },
  { id: 3, name: 'Familie Schmidt', email: 'schmidt@example.de' },
];

const DEALER_EMAIL = 'haendler@getraenke.de';
const SEND_PASSWORD = 'bestellen';
const ADMIN_PIN = '1234';

function ls(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ─── Datum-Hilfsfunktionen ────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}
function deadlineDate(deliveryStr) {
  if (!deliveryStr) return null;
  const d = new Date(deliveryStr);
  d.setDate(d.getDate() - 3);
  return d;
}
function formatDeadline(deliveryStr) {
  const d = deadlineDate(deliveryStr);
  if (!d) return '–';
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
function isDeadlinePassed(deliveryStr) {
  const d = deadlineDate(deliveryStr);
  return d ? new Date() > d : false;
}

// ─── Admin Modal ──────────────────────────────────────────────────────────────

function AdminModal({
  drinks,
  persons,
  dealerEmail,
  deliveryDate,
  sendPassword,
  onSave,
  onClose,
}) {
  const [localDrinks, setLocalDrinks] = useState(drinks.map((d) => ({ ...d })));
  const [localPersons, setLocalPersons] = useState(
    persons.map((p) => ({ ...p }))
  );
  const [localDealer, setLocalDealer] = useState(dealerEmail);
  const [localDelivery, setLocalDelivery] = useState(deliveryDate || '');
  const [localSendPw, setLocalSendPw] = useState(sendPassword || SEND_PASSWORD);
  const [tab, setTab] = useState('drinks');
  const [newDrink, setNewDrink] = useState({
    name: '',
    emoji: '🍺',
    unit: 'Kasten',
  });
  const [newPerson, setNewPerson] = useState({ name: '', email: '' });

  const addDrink = () => {
    if (!newDrink.name.trim()) return;
    setLocalDrinks((prev) => [...prev, { ...newDrink, id: Date.now() }]);
    setNewDrink({ name: '', emoji: '🍺', unit: 'Kasten' });
  };
  const removeDrink = (id) =>
    setLocalDrinks((prev) => prev.filter((d) => d.id !== id));
  const addPerson = () => {
    if (!newPerson.name.trim() || !newPerson.email.trim()) return;
    setLocalPersons((prev) => [...prev, { ...newPerson, id: Date.now() }]);
    setNewPerson({ name: '', email: '' });
  };
  const removePerson = (id) =>
    setLocalPersons((prev) => prev.filter((p) => p.id !== id));
  const save = () => {
    onSave({
      drinks: localDrinks,
      persons: localPersons,
      dealerEmail: localDealer,
      deliveryDate: localDelivery,
      sendPassword: localSendPw,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 560,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            background: '#1a3a2a',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: '#c8e6c9',
              fontFamily: 'Georgia, serif',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ⚙️ Administration
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#c8e6c9',
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e8f5e9',
            flexWrap: 'wrap',
          }}
        >
          {[
            ['drinks', '🍺 Getränke'],
            ['persons', '👥 Personen'],
            ['dealer', '📧 Händler'],
            ['delivery', '📅 Lieferung'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 12,
                fontWeight: tab === key ? 700 : 400,
                color: tab === key ? '#1a3a2a' : '#777',
                borderBottom:
                  tab === key ? '3px solid #2d7a4f' : '3px solid transparent',
                marginBottom: -2,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {tab === 'drinks' && (
            <div>
              {localDrinks.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{d.emoji}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {d.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#888' }}>{d.unit}</span>
                  <button
                    onClick={() => removeDrink(d.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  value={newDrink.emoji}
                  onChange={(e) =>
                    setNewDrink((p) => ({ ...p, emoji: e.target.value }))
                  }
                  style={{
                    width: 48,
                    padding: '8px',
                    border: '1px solid #d1fae5',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                />
                <input
                  placeholder="Name"
                  value={newDrink.name}
                  onChange={(e) =>
                    setNewDrink((p) => ({ ...p, name: e.target.value }))
                  }
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '8px 12px',
                    border: '1px solid #d1fae5',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <input
                  placeholder="Einheit"
                  value={newDrink.unit}
                  onChange={(e) =>
                    setNewDrink((p) => ({ ...p, unit: e.target.value }))
                  }
                  style={{
                    width: 100,
                    padding: '8px 12px',
                    border: '1px solid #d1fae5',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <button
                  onClick={addDrink}
                  style={{
                    background: '#2d7a4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  + Hinzufügen
                </button>
              </div>
            </div>
          )}
          {tab === 'persons' && (
            <div>
              {localPersons.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>👤</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontFamily: 'Georgia, serif',
                        fontWeight: 600,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>{p.email}</div>
                  </div>
                  <button
                    onClick={() => removePerson(p.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  placeholder="Name"
                  value={newPerson.name}
                  onChange={(e) =>
                    setNewPerson((p) => ({ ...p, name: e.target.value }))
                  }
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '8px 12px',
                    border: '1px solid #d1fae5',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <input
                  placeholder="E-Mail"
                  value={newPerson.email}
                  onChange={(e) =>
                    setNewPerson((p) => ({ ...p, email: e.target.value }))
                  }
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: '8px 12px',
                    border: '1px solid #d1fae5',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <button
                  onClick={addPerson}
                  style={{
                    background: '#2d7a4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  + Hinzufügen
                </button>
              </div>
            </div>
          )}
          {tab === 'dealer' && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  color: '#444',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Händler E-Mail:
              </label>
              <input
                value={localDealer}
                onChange={(e) => setLocalDealer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1fae5',
                  borderRadius: 10,
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: '#888',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Beim Absenden geht die Bestellung an diese Adresse + alle
                Teilnehmer als Kopie.
              </p>
            </div>
          )}
          {tab === 'delivery' && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  color: '#444',
                  fontFamily: 'Georgia, serif',
                }}
              >
                📅 Nächster Liefertermin:
              </label>
              <input
                type="date"
                value={localDelivery}
                onChange={(e) => setLocalDelivery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1fae5',
                  borderRadius: 10,
                  fontSize: 15,
                  boxSizing: 'border-box',
                  marginBottom: 20,
                }}
              />
              {localDelivery && (
                <div
                  style={{
                    background: '#f0fdf4',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: '#1a3a2a',
                    marginBottom: 20,
                  }}
                >
                  📦 Lieferung: <strong>{formatDate(localDelivery)}</strong>
                  <br />⏰ Bestellschluss:{' '}
                  <strong>{formatDeadline(localDelivery)}</strong> (3 Tage
                  vorher)
                </div>
              )}
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  color: '#444',
                  fontFamily: 'Georgia, serif',
                }}
              >
                🔐 Passwort für „Bestellung absenden":
              </label>
              <input
                type="text"
                value={localSendPw}
                onChange={(e) => setLocalSendPw(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1fae5',
                  borderRadius: 10,
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '2px solid #e8f5e9',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ccc',
              borderRadius: 8,
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={save}
            style={{
              padding: '10px 24px',
              background: '#1a3a2a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            💾 Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Erfolgs-Modal ────────────────────────────────────────────────────────────

function SuccessModal({ summary, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a3a2a, #2d7a4f)',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <div
            style={{
              color: '#fff',
              fontSize: 22,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
            }}
          >
            Bestellung abgesendet!
          </div>
          <div style={{ color: '#c8e6c9', fontSize: 13, marginTop: 6 }}>
            Sammelbestellung wurde per E-Mail verschickt
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div
            style={{
              background: '#f0fdf4',
              borderRadius: 10,
              padding: 16,
              fontSize: 13,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              color: '#1a3a2a',
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {summary}
          </div>
          <button
            onClick={onClose}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '14px',
              background: '#1a3a2a',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            ✓ Neue Bestellrunde starten
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function App() {
  const [drinks, setDrinks] = useState(() => ls('nb-drinks', DEFAULT_DRINKS));
  const [persons, setPersons] = useState(() =>
    ls('nb-persons', DEFAULT_PERSONS)
  );
  const [dealerEmail, setDealerEmail] = useState(() =>
    ls('nb-dealer', DEALER_EMAIL)
  );
  const [deliveryDate, setDeliveryDate] = useState(() => ls('nb-delivery', ''));
  const [sendPassword, setSendPassword] = useState(() =>
    ls('nb-sendpw', SEND_PASSWORD)
  );
  const [orders, setOrders] = useState(() => ls('nb-orders', {}));
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSendPw, setShowSendPw] = useState(false);
  const [sendPwInput, setSendPwInput] = useState('');
  const [sendPwError, setSendPwError] = useState(false);

  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    lsSet('nb-orders', newOrders);
  };

  const handleQtyChange = (drinkId, qty) => {
    if (!selectedPerson) return;
    const parsed = Math.max(0, parseInt(qty) || 0);
    const updated = {
      ...orders,
      [drinkId]: { ...(orders[drinkId] || {}), [selectedPerson]: parsed },
    };
    saveOrders(updated);
  };

  const getQty = (drinkId) => {
    if (!selectedPerson) return '';
    return orders[drinkId]?.[selectedPerson] || '';
  };

  const getTotalForDrink = (drinkId) =>
    Object.values(orders[drinkId] || {}).reduce(
      (s, v) => s + (parseInt(v) || 0),
      0
    );
  const grandTotal = drinks.reduce((s, d) => s + getTotalForDrink(d.id), 0);

  const buildSummary = () => {
    const dateStr = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    let lines = [`🛒 GETRÄNKE-SAMMELBESTELLUNG – ${dateStr}\n`];
    if (deliveryDate) {
      lines.push(`📦 Nächste Lieferung am: ${formatDate(deliveryDate)}`);
      lines.push(`⏰ Bestellschluss: ${formatDeadline(deliveryDate)}`);
    }
    lines.push('═'.repeat(40));
    lines.push('\n📦 GESAMT (an Händler):\n');
    drinks.forEach((d) => {
      const t = getTotalForDrink(d.id);
      if (t > 0) lines.push(`  ${d.emoji} ${d.name}: ${t} Kasten`);
    });
    lines.push('\n\n👥 PRO PERSON:\n');
    persons.forEach((p) => {
      const po = drinks
        .filter((d) => (orders[d.id]?.[p.id] || 0) > 0)
        .map((d) => `  ${d.emoji} ${d.name}: ${orders[d.id][p.id]} Kasten`);
      if (po.length > 0) {
        lines.push(`👤 ${p.name}:`);
        lines.push(...po);
        lines.push('');
      }
    });
    lines.push('═'.repeat(40));
    lines.push(`\nGesamt: ${grandTotal} Kästen`);
    return lines.join('\n');
  };

  const handleSubmit = () => {
    if (grandTotal === 0) return;
    setSendPwInput('');
    setSendPwError(false);
    setShowSendPw(true);
  };

  const confirmSend = () => {
    if (sendPwInput !== sendPassword) {
      setSendPwError(true);
      setSendPwInput('');
      return;
    }
    setShowSendPw(false);
    const summary = buildSummary();
    const allEmails = [dealerEmail, ...persons.map((p) => p.email)].join(',');
    const subject = encodeURIComponent(
      `Getränke-Sammelbestellung ${new Date().toLocaleDateString('de-DE')}`
    );
    window.open(
      `mailto:${allEmails}?subject=${subject}&body=${encodeURIComponent(
        summary
      )}`
    );
    setSuccessSummary(summary);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    saveOrders({});
    setShowSuccess(false);
    setSelectedPerson(null);
  };

  const handleAdminSave = ({
    drinks: d,
    persons: p,
    dealerEmail: de,
    deliveryDate: dd,
    sendPassword: sp,
  }) => {
    setDrinks(d);
    lsSet('nb-drinks', d);
    setPersons(p);
    lsSet('nb-persons', p);
    setDealerEmail(de);
    lsSet('nb-dealer', de);
    setDeliveryDate(dd || '');
    lsSet('nb-delivery', dd || '');
    setSendPassword(sp || SEND_PASSWORD);
    lsSet('nb-sendpw', sp || SEND_PASSWORD);
  };

  const tryAdmin = () => {
    if (adminCode === ADMIN_PIN) {
      setShowAdminLogin(false);
      setAdminCode('');
      setShowAdmin(true);
    } else setAdminCode('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(160deg, #0d2b1a 0%, #1a3a2a 40%, #0f3320 100%)',
        fontFamily: "'Georgia', serif",
        padding: '0 0 60px',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(200,230,200,0.15)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              color: '#c8e6c9',
              fontSize: 11,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Nachbarschaft
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
            🍺 Getränke-Sammelbestellung
          </div>
        </div>
        <button
          onClick={() => setShowAdminLogin(true)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#c8e6c9',
            padding: '8px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ⚙️ Admin
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {/* Lieferdatum Banner */}
        {deliveryDate && (
          <div
            style={{
              background: isDeadlinePassed(deliveryDate)
                ? 'rgba(220,38,38,0.15)'
                : 'rgba(234,179,8,0.12)',
              border: '1px solid',
              borderColor: isDeadlinePassed(deliveryDate)
                ? 'rgba(220,38,38,0.35)'
                : 'rgba(234,179,8,0.35)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  color: '#fef9c3',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                📦 Nächste Lieferung
              </div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
                {formatDate(deliveryDate)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  color: '#fef9c3',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                ⏰ Bestellungen bis
              </div>
              <div
                style={{
                  color: isDeadlinePassed(deliveryDate) ? '#fca5a5' : '#fde68a',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {formatDeadline(deliveryDate)}
              </div>
              {isDeadlinePassed(deliveryDate) && (
                <div style={{ color: '#fca5a5', fontSize: 11, marginTop: 2 }}>
                  ⚠ Bestellschluss abgelaufen
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personenauswahl */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(200,230,200,0.15)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color: '#a5d6a7',
              fontSize: 12,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            👤 Wer bestellt?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {persons.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPerson(p.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 50,
                  border: '2px solid',
                  borderColor:
                    selectedPerson === p.id
                      ? '#4ade80'
                      : 'rgba(255,255,255,0.2)',
                  background:
                    selectedPerson === p.id
                      ? 'rgba(74,222,128,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  color: selectedPerson === p.id ? '#4ade80' : '#d1fae5',
                  fontFamily: 'Georgia, serif',
                  fontSize: 14,
                  fontWeight: selectedPerson === p.id ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {selectedPerson === p.id ? '✓ ' : ''}
                {p.name}
              </button>
            ))}
          </div>
          {!selectedPerson && (
            <div style={{ color: '#f59e0b', fontSize: 12, marginTop: 12 }}>
              ↑ Bitte zuerst eine Person auswählen
            </div>
          )}
        </div>

        {/* Getränkeliste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drinks.map((drink) => {
            const qty = getQty(drink.id);
            const total = getTotalForDrink(drink.id);
            const hasOrder = total > 0;
            return (
              <div
                key={drink.id}
                style={{
                  background: hasOrder
                    ? 'rgba(74,222,128,0.08)'
                    : 'rgba(255,255,255,0.04)',
                  border: '1px solid',
                  borderColor: hasOrder
                    ? 'rgba(74,222,128,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 28, flexShrink: 0 }}>{drink.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ color: '#f0fdf4', fontSize: 16, fontWeight: 600 }}
                  >
                    {drink.name}
                  </div>
                  <div style={{ color: '#6ee7b7', fontSize: 11, marginTop: 2 }}>
                    {drink.unit}
                  </div>
                </div>
                {hasOrder && (
                  <div
                    style={{
                      background: 'rgba(74,222,128,0.2)',
                      color: '#4ade80',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    ∑ {total}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() =>
                      handleQtyChange(
                        drink.id,
                        Math.max(0, (parseInt(qty) || 0) - 1)
                      )
                    }
                    disabled={!selectedPerson}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: 18,
                      cursor: selectedPerson ? 'pointer' : 'not-allowed',
                      opacity: selectedPerson ? 1 : 0.4,
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => handleQtyChange(drink.id, e.target.value)}
                    disabled={!selectedPerson}
                    placeholder="0"
                    style={{
                      width: 52,
                      textAlign: 'center',
                      padding: '8px 4px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 16,
                      opacity: selectedPerson ? 1 : 0.4,
                    }}
                  />
                  <button
                    onClick={() =>
                      handleQtyChange(drink.id, (parseInt(qty) || 0) + 1)
                    }
                    disabled={!selectedPerson}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: '1px solid rgba(74,222,128,0.4)',
                      background: 'rgba(74,222,128,0.12)',
                      color: '#4ade80',
                      fontSize: 18,
                      cursor: selectedPerson ? 'pointer' : 'not-allowed',
                      opacity: selectedPerson ? 1 : 0.4,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sammelbestellung & Absenden */}
        <div
          style={{
            marginTop: 32,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(200,230,200,0.2)',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  color: '#a5d6a7',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Georgia, serif',
                  marginBottom: 4,
                }}
              >
                📋 Aktuelle Sammelbestellung
                {deliveryDate
                  ? ` für die Lieferung am ${formatDate(deliveryDate)}`
                  : ''}
              </div>
              {deliveryDate && (
                <div style={{ color: '#fde68a', fontSize: 12 }}>
                  ⏰ Bestellschluss am:{' '}
                  <strong>{formatDeadline(deliveryDate)}</strong>
                </div>
              )}
            </div>
            {grandTotal === 0 ? (
              <div style={{ color: '#6ee7b7', fontSize: 14, opacity: 0.7 }}>
                Noch keine Bestellungen eingegangen.
              </div>
            ) : (
              <>
                {persons.map((p) => {
                  const personDrinks = drinks.filter(
                    (d) => (orders[d.id]?.[p.id] || 0) > 0
                  );
                  if (personDrinks.length === 0) return null;
                  const personTotal = personDrinks.reduce(
                    (s, d) => s + (parseInt(orders[d.id]?.[p.id]) || 0),
                    0
                  );
                  return (
                    <div key={p.id} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          color: '#f0fdf4',
                          fontSize: 14,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        👤 {p.name}{' '}
                        <span
                          style={{
                            color: '#4ade80',
                            fontWeight: 400,
                            fontSize: 12,
                          }}
                        >
                          ({personTotal} Kasten)
                        </span>
                      </div>
                      {personDrinks.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            color: '#6ee7b7',
                            fontSize: 13,
                            paddingLeft: 20,
                            lineHeight: 1.7,
                          }}
                        >
                          {d.emoji} {d.name}:{' '}
                          <strong style={{ color: '#a7f3d0' }}>
                            {orders[d.id][p.id]} Kasten
                          </strong>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 12,
                    marginTop: 4,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Gesamt:{' '}
                  <span style={{ color: '#4ade80' }}>{grandTotal} Kästen</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={grandTotal === 0}
            style={{
              width: '100%',
              padding: '18px',
              border: 'none',
              background:
                grandTotal === 0
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: grandTotal === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              cursor: grandTotal === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {grandTotal === 0
              ? 'Noch keine Bestellung'
              : `📧 Bestellung absenden (${grandTotal} Kästen)`}
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'rgba(255,255,255,0.3)',
            fontSize: 11,
          }}
        >
          Bestellung geht an: {dealerEmail} + alle {persons.length} Teilnehmer
          als Kopie
        </div>
      </div>

      {/* Passwort-Modal Absenden */}
      {showSendPw && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              width: '100%',
              maxWidth: 320,
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔐</div>
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 6,
                color: '#1a3a2a',
              }}
            >
              Bestellung absenden
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              Bitte Passwort eingeben um die Sammelbestellung abzusenden.
            </div>
            <input
              type="password"
              value={sendPwInput}
              onChange={(e) => {
                setSendPwInput(e.target.value);
                setSendPwError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && confirmSend()}
              placeholder="Passwort"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                border: sendPwError ? '2px solid #dc2626' : '2px solid #d1fae5',
                borderRadius: 10,
                fontSize: 18,
                textAlign: 'center',
                boxSizing: 'border-box',
                marginBottom: 8,
              }}
            />
            {sendPwError && (
              <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>
                ⚠ Falsches Passwort
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setShowSendPw(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  border: '1px solid #ccc',
                  borderRadius: 10,
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmSend}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                📧 Absenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login */}
      {showAdminLogin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: 280,
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 16,
                color: '#1a3a2a',
              }}
            >
              Admin-PIN
            </div>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryAdmin()}
              placeholder="PIN eingeben"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #d1fae5',
                borderRadius: 10,
                fontSize: 18,
                textAlign: 'center',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminCode('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={tryAdmin}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1a3a2a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                OK
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>
              Standard-PIN: {ADMIN_PIN}
            </div>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminModal
          drinks={drinks}
          persons={persons}
          dealerEmail={dealerEmail}
          deliveryDate={deliveryDate}
          sendPassword={sendPassword}
          onSave={handleAdminSave}
          onClose={() => setShowAdmin(false)}
        />
      )}
      {showSuccess && (
        <SuccessModal summary={successSummary} onClose={handleSuccessClose} />
      )}
    </div>
  );
}
