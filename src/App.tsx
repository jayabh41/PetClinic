import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Activity, CalendarDays, Check, ChevronRight, CircleHelp, Edit3, Heart, LoaderCircle, Menu, PawPrint, Plus, Search, ShieldCheck, Stethoscope, UserRound, Users, X } from 'lucide-react';
import { api } from './api/client';
import type { Owner, OwnerInput, Pet, PetInput, PetType, VisitInput } from './types/petclinic';

type Modal = 'owner' | 'pet' | 'visit' | null;
const emptyOwner: OwnerInput = { firstName: '', lastName: '', address: '', city: '', telephone: '' };
const today = new Date().toISOString().slice(0, 10);
const dateLabel = (value?: string) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not recorded';
const petTypeName = (pet: Pet) => typeof pet.type === 'string' ? pet.type : pet.type?.name || 'Pet';

function App() {
  const [query, setQuery] = useState('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selected, setSelected] = useState<Owner | null>(null);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ownerForm, setOwnerForm] = useState<OwnerInput>(emptyOwner);
  const [petForm, setPetForm] = useState<PetInput>({ name: '', birthDate: '', typeId: 1, typeName: '' });
  const [visitForm, setVisitForm] = useState<VisitInput>({ date: today, description: '' });
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadOwners = async (term = query) => {
    setLoading(true); setError('');
    try { const result = await api.searchOwners(term); setOwners(result); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load owners.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
  void api.getPetTypes()
    .then(setPetTypes)
    .catch(() => setPetTypes([]));
}, []);

useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadOwners(query);
  }, 350);

  return () => window.clearTimeout(timer);
}, [query]);
  const totalPets = useMemo(() => owners.reduce((count, owner) => count + (owner.pets?.length || 0), 0), [owners]);
  const openOwner = async (owner: Owner) => {
    setSelected(owner); setActivePet(null); setError('');
    try { const fresh = await api.getOwner(owner.id); setSelected(fresh); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load owner details.'); }
  };
  const startOwner = (owner?: Owner) => { setEditing(Boolean(owner)); setOwnerForm(owner ? { firstName: owner.firstName, lastName: owner.lastName, address: owner.address, city: owner.city, telephone: owner.telephone } : emptyOwner); setModal('owner'); };
  const startPet = (pet?: Pet) => {
  setEditing(Boolean(pet));

  const typeId = pet
    ? typeof pet.type === 'object'
      ? pet.type.id
      : petTypes.find(t => t.name === pet.type)?.id || 1
    : petTypes[0]?.id || 1;

  const typeName = pet
    ? typeof pet.type === 'object'
      ? pet.type.name
      : pet.type || petTypes.find(t => t.id === typeId)?.name || ''
    : petTypes.find(t => t.id === typeId)?.name || '';

  setPetForm({
    name: pet?.name || '',
    birthDate: pet?.birthDate || '',
    typeId,
    typeName
  });

  setModal('pet');
};
  const saveOwner = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { const saved = editing && selected ? await api.updateOwner(selected.id, ownerForm) : await api.createOwner(ownerForm); setSelected(saved); setActivePet(null); setModal(null); setNotice(editing ? 'Owner details updated.' : 'New owner added successfully.'); await loadOwners(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save owner.'); } finally { setBusy(false); } };
  const savePet = async (event: FormEvent) => {
  event.preventDefault();
  if (!selected) return;

  setBusy(true);
  setError('');

  try {
    const selectedType = petTypes.find(
      type => type.id === petForm.typeId
    );

    if (!selectedType) {
      throw new Error('Please select a valid pet type.');
    }

    const petData: PetInput = {
      ...petForm,
      typeName: selectedType.name
    };

    if (editing && activePet) {
      await api.updatePet(selected.id, activePet.id, petData);
    } else {
      await api.createPet(selected.id, petData);
    }

    const fresh = await api.getOwner(selected.id);
    setSelected(fresh);
    setActivePet(null);
    setModal(null);
    setNotice(editing ? 'Pet details updated.' : 'Pet added successfully.');
    await loadOwners();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Unable to save pet.');
  } finally {
    setBusy(false);
  }
};
  const saveVisit = async (event: FormEvent) => { event.preventDefault(); if (!selected || !activePet) return; setBusy(true); setError(''); try { await api.addVisit(selected.id, activePet.id, visitForm); const fresh = await api.getOwner(selected.id); setSelected(fresh); setActivePet(fresh.pets.find(p => p.id === activePet.id) || null); setModal(null); setNotice('Visit registered successfully.'); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to register visit.'); } finally { setBusy(false); } };
  const dismissNotice = () => setNotice('');

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><PawPrint size={21}/></div><div><strong>goodpaw</strong><span>VETERINARY CARE</span></div><button className="mobile-close icon-btn" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X/></button></div>
      <div className="clinic-switch"><div className="clinic-avatar">GP</div><div><b>GoodPaw Clinic</b><small>Reception workspace</small></div><ChevronRight size={15}/></div>
      <div className="nav-label">WORKSPACE</div><button className="nav-item active"><Users size={18}/> Owners <span className="nav-count">{owners.length}</span></button><button className="nav-item" onClick={() => { setQuery(''); setSelected(null); setActivePet(null); }}><CalendarDays size={18}/> Front desk</button>
      <div className="nav-label nav-label-spaced">MANAGE</div><button className="nav-item" onClick={() => selected && startOwner(selected)}><UserRound size={18}/> Owner details</button><button className="nav-item" onClick={() => selected && startPet()}><PawPrint size={18}/> Add a pet</button>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Need a hand?</b><p>Keep every visit personal. We’re here to help.</p><span>Reception guide <ChevronRight size={13}/></span></div><div className="profile"><div className="profile-avatar">JD</div><div><b>Jamie Davis</b><small>Receptionist</small></div><button className="icon-btn" aria-label="Profile options">···</button></div></div>
    </aside>
    {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>Owners</b></div><div className="topbar-right"><span className="open-status"><i/> Clinic open</span><span className="top-date"><CalendarDays size={15}/> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><div className="top-avatar">JD</div></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span/> RECEPTION DESK</div><h1>Good morning, Jamie <span>✳</span></h1><p className="subheading">A little care goes a long way. Let's make every visit count.</p></div><button className="button button-primary" onClick={() => startOwner()}><Plus size={17}/> Add new owner</button></section>
        <section className="stats-grid"><div className="stat-card"><div className="stat-icon lilac"><Users size={19}/></div><div><span>Registered owners</span><strong>{owners.length}</strong><small><span className="stat-dot green-dot"/> In your directory</small></div></div><div className="stat-card"><div className="stat-icon peach"><PawPrint size={19}/></div><div><span>Pets in care</span><strong>{totalPets}</strong><small>Across listed owners</small></div></div><div className="stat-card"><div className="stat-icon mint"><Heart size={19}/></div><div><span>Care first</span><strong>100%</strong><small>Every pet matters</small></div></div><div className="stat-card stat-note"><div className="stat-icon yellow"><ShieldCheck size={19}/></div><div><span>Today's reminder</span><strong className="note-title">Every detail matters</strong><small>Keep owner & pet records up to date</small></div></div></section>
        {notice && <div className="notice"><Check size={16}/>{notice}<button onClick={dismissNotice} aria-label="Dismiss"><X size={15}/></button></div>}
        {error && !modal && <div className="alert"><Activity size={16}/><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={15}/></button></div>}
        <section className="workspace-grid">
          <div className="panel owner-panel"><div className="panel-heading"><div><div className="section-kicker">CLIENT DIRECTORY</div><h2>Find an owner</h2><p>Search by last name to get started.</p></div><span className="result-count">{owners.length} records</span></div>
            <div className="search-wrap"><Search size={18}/><input aria-label="Search owners by last name" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try a last name, e.g. Davis"/></div>
            <div className="owner-list-head"><span>OWNER</span><span>PETS</span><span>CONTACT</span></div>
            <div className="owner-list">{loading ? <div className="empty-state"><LoaderCircle className="spin"/>Loading owners…</div> : owners.length ? owners.map(owner => <button key={owner.id} className={`owner-row ${selected?.id === owner.id ? 'selected' : ''}`} onClick={() => void openOwner(owner)}><div className="owner-identity"><div className={`owner-avatar avatar-${owner.id % 5}`}>{owner.firstName?.[0]}{owner.lastName?.[0]}</div><div><b>{owner.firstName} {owner.lastName}</b><small>{owner.city || 'Location not set'}</small></div></div><span className="pet-count"><PawPrint size={14}/>{owner.pets?.length || 0}</span><span className="owner-phone">{owner.telephone}</span><ChevronRight className="row-chevron" size={16}/></button>) : <div className="empty-state"><Users size={25}/><b>No owners found</b><span>Try another last name or add a new owner.</span><button className="text-button" onClick={() => startOwner()}>Create an owner <Plus size={14}/></button></div>}</div>
            <div className="directory-footer"><span>Showing {owners.length} owner{owners.length === 1 ? '' : 's'}</span><button onClick={() => void loadOwners()}>Refresh list ↻</button></div>
          </div>
          <div className="panel detail-panel">{selected ? <><div className="detail-top"><div><div className="section-kicker">OWNER PROFILE</div><h2>{selected.firstName} {selected.lastName}</h2><span className="owner-id">CLIENT ID · #{selected.id.toString().padStart(4, '0')}</span></div><button className="button button-light button-small" onClick={() => startOwner(selected)}><Edit3 size={14}/> Edit</button></div><div className="contact-grid"><div><span>PHONE NUMBER</span><b>{selected.telephone}</b></div><div><span>ADDRESS</span><b>{selected.address}, {selected.city}</b></div></div><div className="divider"/><div className="subsection-heading"><div><h3>Pets & companions <span className="count-pill">{selected.pets?.length || 0}</span></h3><p>All the little ones under this care.</p></div><button className="button button-primary button-small" onClick={() => startPet()}><Plus size={15}/> Add pet</button></div><div className="pet-list">{selected.pets?.length ? selected.pets.map(pet => <button key={pet.id} className={`pet-card ${activePet?.id === pet.id ? 'pet-active' : ''}`} onClick={() => setActivePet(pet)}><div className="pet-emoji">{petTypeName(pet).toLowerCase().includes('cat') ? '🐱' : petTypeName(pet).toLowerCase().includes('dog') ? '🐶' : '🐾'}</div><div className="pet-info"><b>{pet.name}</b><span>{petTypeName(pet)} · Born {dateLabel(pet.birthDate)}</span></div><span className="visit-mini">{pet.visits?.length || 0} visits</span><ChevronRight size={16}/></button>) : <div className="inline-empty">No pets added yet. Add a pet to start their care history.</div>}</div>{activePet && <div className="pet-detail"><div className="pet-detail-heading"><div><div className="section-kicker">PET RECORD</div><h3>{activePet.name}'s visits</h3></div><div className="action-group"><button className="button button-light button-small" onClick={() => startPet(activePet)}><Edit3 size={13}/> Edit pet</button><button className="button button-primary button-small" onClick={() => { setVisitForm({ date: today, description: '' }); setModal('visit'); }}><Plus size={14}/> New visit</button></div></div><div className="visit-history">{activePet.visits?.length ? [...activePet.visits].sort((a,b) => b.date.localeCompare(a.date)).map(visit => <div className="visit-row" key={visit.id}><div className="visit-icon"><Stethoscope size={15}/></div><div><b>{visit.description}</b><span>{dateLabel(visit.date)}</span></div><span className="visit-tag">Completed</span></div>) : <div className="inline-empty">No previous visits recorded for {activePet.name}.</div>}</div></div>}</> : <div className="detail-placeholder"><div className="placeholder-art"><div className="art-circle"><PawPrint size={37}/></div><span className="spark spark-one">✳</span><span className="spark spark-two">✦</span></div><div className="section-kicker">YOUR CARE WORKSPACE</div><h2>Every pet has a story.</h2><p>Select an owner from the directory to see their details, meet their pets, and continue their care journey.</p><div className="placeholder-steps"><div><span>01</span> Find an owner</div><ChevronRight size={14}/><div><span>02</span> Choose a pet</div><ChevronRight size={14}/><div><span>03</span> Add a visit</div></div><button className="text-button" onClick={() => startOwner()}>New to GoodPaw? Add an owner <Plus size={14}/></button></div>}</div>
        </section>
        <footer className="page-footer"><span>© 2026 GoodPaw Veterinary Care</span><span><i/> All changes sync with PetClinic</span><span>Made with <Heart size={12} fill="currentColor"/> for the ones who can't say thank you.</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) { setModal(null); setError(''); } }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><div className="section-kicker">{modal === 'owner' ? 'CLIENT INFORMATION' : modal === 'pet' ? 'PET INFORMATION' : 'CARE RECORD'}</div><h2 id="modal-title">{modal === 'owner' ? editing ? 'Edit owner details' : 'Add a new owner' : modal === 'pet' ? editing ? 'Edit pet details' : 'Add a new pet' : 'Register a visit'}</h2><p>{modal === 'owner' ? 'A few details to keep in touch.' : modal === 'pet' ? `Adding to ${selected?.firstName} ${selected?.lastName}'s family.` : `Record a visit for ${activePet?.name}.`}</p></div><button className="icon-btn" onClick={() => { setModal(null); setError(''); }} aria-label="Close dialog"><X/></button></div>{error && <div className="alert modal-alert">{error}</div>}{modal === 'owner' && <form onSubmit={saveOwner}><div className="form-grid"><label>First name<input required value={ownerForm.firstName} onChange={e => setOwnerForm({...ownerForm, firstName:e.target.value})} placeholder="e.g. Alex"/></label><label>Last name<input required value={ownerForm.lastName} onChange={e => setOwnerForm({...ownerForm, lastName:e.target.value})} placeholder="e.g. Morgan"/></label><label className="full-field">Street address<input required value={ownerForm.address} onChange={e => setOwnerForm({...ownerForm, address:e.target.value})} placeholder="House number and street"/></label><label>City<input required value={ownerForm.city} onChange={e => setOwnerForm({...ownerForm, city:e.target.value})} placeholder="City"/></label><label>Phone number<input required type="tel" value={ownerForm.telephone} onChange={e => setOwnerForm({...ownerForm, telephone:e.target.value})} placeholder="Phone number"/></label></div><ModalActions busy={busy} onCancel={() => setModal(null)} label={editing ? 'Save changes' : 'Create owner'}/></form>}{modal === 'pet' && <form onSubmit={savePet}><div className="form-grid"><label className="full-field">Pet name<input required value={petForm.name} onChange={e => setPetForm({...petForm, name:e.target.value})} placeholder="What do they go by?"/></label><label>Pet type<select required value={petForm.typeId} onChange={e => setPetForm({...petForm, typeId:Number(e.target.value)})}>{petTypes.length ? petTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>) : <option value={1}>Dog</option>}</select></label><label>Date of birth<input required type="date" max={today} value={petForm.birthDate} onChange={e => setPetForm({...petForm, birthDate:e.target.value})}/></label></div><ModalActions busy={busy} onCancel={() => setModal(null)} label={editing ? 'Save changes' : 'Add pet'}/></form>}{modal === 'visit' && <form onSubmit={saveVisit}><div className="form-grid"><label>Date of visit<input required type="date" max={today} value={visitForm.date} onChange={e => setVisitForm({...visitForm, date:e.target.value})}/></label><label className="full-field">Visit notes<textarea required minLength={3} rows={4} value={visitForm.description} onChange={e => setVisitForm({...visitForm, description:e.target.value})} placeholder="Reason for visit, observations, treatment…"/></label></div><ModalActions busy={busy} onCancel={() => setModal(null)} label="Register visit"/></form>}</section></div>}
  </div>;
}
function ModalActions({ busy, onCancel, label }: { busy: boolean; onCancel: () => void; label: string }) { return <div className="modal-actions"><button type="button" className="button button-light" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy && <LoaderCircle size={15} className="spin"/>}{label}</button></div>; }
export default App;
