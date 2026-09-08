import { useMemo, useState } from 'react'
import './App.css'
import { blankDraft, dayOptions, initialIdeas } from './data'
import type { AppTab, DateIdea, DateKind, IdeaDraft } from './types'

const navItems: { id: AppTab; label: string; icon: string }[] = [
  { id: 'discover', label: 'Discover', icon: '✦' },
  { id: 'plan', label: 'Our plan', icon: '♡' },
  { id: 'manage', label: 'Manage', icon: '＋' },
  { id: 'profile', label: 'You', icon: '◉' },
]

const filters: { id: 'all' | DateKind; label: string }[] = [
  { id: 'all', label: 'For you' },
  { id: 'event', label: 'Events' },
  { id: 'food', label: 'Food' },
  { id: 'activity', label: 'Play' },
  { id: 'outdoors', label: 'Outside' },
]

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('discover')
  const [filter, setFilter] = useState<'all' | DateKind>('all')
  const [ideas, setIdeas] = useState(initialIdeas)
  const [selectedIds, setSelectedIds] = useState(['moonlight-mini-golf', 'sunset-lookout'])
  const [selectedDay, setSelectedDay] = useState('fri')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<IdeaDraft>(blankDraft)
  const [showEditor, setShowEditor] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  const activeIdeas = useMemo(
    () => ideas.filter((idea) => idea.active && (filter === 'all' || idea.kind === filter)),
    [ideas, filter],
  )
  const selectedIdeas = ideas.filter((idea) => selectedIds.includes(idea.id))
  const detail = ideas.find((idea) => idea.id === detailId)

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-3),
    )
  }

  function openCreate() {
    setEditingId(null)
    setDraft(blankDraft)
    setShowEditor(true)
  }

  function openEdit(idea: DateIdea) {
    setEditingId(idea.id)
    setDraft({
      title: idea.title,
      description: idea.description,
      kind: idea.kind,
      location: idea.location,
      area: idea.area,
      price: idea.price,
      duration: idea.duration,
      eventDate: idea.eventDate ?? '',
    })
    setShowEditor(true)
  }

  function saveDraft(event: React.FormEvent) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.location.trim()) return

    if (editingId) {
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === editingId ? { ...idea, ...draft, eyebrow: idea.eyebrow } : idea,
        ),
      )
    } else {
      const created: DateIdea = {
        ...draft,
        id: 'local-' + Date.now(),
        eyebrow: draft.kind === 'event' ? 'New local event' : 'New date idea',
        image: '/images/date-hero.png',
        tags: ['Just added', draft.kind === 'event' ? 'Local event' : 'Date idea'],
        active: true,
      }
      setIdeas((current) => [created, ...current])
    }
    setShowEditor(false)
  }

  function goTo(tab: AppTab) {
    setDetailId(null)
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className="desktop-rail">
        <button className="brand" onClick={() => goTo('discover')} aria-label="Datebook home">
          <span className="brand-mark">D</span>
          <span>Datebook</span>
        </button>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'rail-link active' : 'rail-link'}
              onClick={() => goTo(item.id)}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="rail-note">
          <span className="avatar small">M</span>
          <div><strong>Private space</strong><span>You + one guest</span></div>
        </div>
      </aside>

      <main className="main-content">
        {detail ? (
          <DetailView
            idea={detail}
            selected={selectedIds.includes(detail.id)}
            onBack={() => setDetailId(null)}
            onToggle={() => toggleSelected(detail.id)}
            onPlan={() => goTo('plan')}
          />
        ) : activeTab === 'discover' ? (
          <DiscoverView
            ideas={activeIdeas}
            filter={filter}
            selectedIds={selectedIds}
            onFilter={setFilter}
            onDetail={setDetailId}
            onToggle={toggleSelected}
            onPlan={() => goTo('plan')}
          />
        ) : activeTab === 'plan' ? (
          <PlanView
            ideas={selectedIdeas}
            selectedDay={selectedDay}
            sent={inviteSent}
            onDay={setSelectedDay}
            onRemove={toggleSelected}
            onDiscover={() => goTo('discover')}
            onSend={() => setInviteSent(true)}
            onReset={() => setInviteSent(false)}
          />
        ) : activeTab === 'manage' ? (
          <ManageView
            ideas={ideas}
            showEditor={showEditor}
            draft={draft}
            editing={Boolean(editingId)}
            onCreate={openCreate}
            onEdit={openEdit}
            onDraft={setDraft}
            onSave={saveDraft}
            onCancel={() => setShowEditor(false)}
            onToggleActive={(id) =>
              setIdeas((current) =>
                current.map((idea) => idea.id === id ? { ...idea, active: !idea.active } : idea),
              )
            }
          />
        ) : (
          <ProfileView signedIn={signedIn} onSignIn={() => setSignedIn((value) => !value)} />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => goTo(item.id)}
          >
            <span>{item.icon}</span>{item.label}
            {item.id === 'plan' && selectedIds.length > 0 && <b>{selectedIds.length}</b>}
          </button>
        ))}
      </nav>
    </div>
  )
}

function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
      {action}
    </header>
  )
}

function DiscoverView({
  ideas,
  filter,
  selectedIds,
  onFilter,
  onDetail,
  onToggle,
  onPlan,
}: {
  ideas: DateIdea[]
  filter: 'all' | DateKind
  selectedIds: string[]
  onFilter: (filter: 'all' | DateKind) => void
  onDetail: (id: string) => void
  onToggle: (id: string) => void
  onPlan: () => void
}) {
  const featured = ideas[0] ?? initialIdeas[0]
  return (
    <div className="screen discover-screen">
      <PageHeader
        eyebrow="Tuesday, September 8"
        title="What should we do next?"
        action={<button className="avatar" aria-label="Open profile">M</button>}
      />

      <section className="hero-card" style={{ backgroundImage: 'url(' + featured.image + ')' }}>
        <div className="hero-overlay">
          <span className="pill light">Curated for the two of you</span>
          <h2>A little adventure is overdue.</h2>
          <p>Pick two or three ideas. Your guest chooses the winner and the day.</p>
          <button className="button coral" onClick={onPlan}>Build this week’s invite <span>→</span></button>
        </div>
      </section>

      <div className="filter-row" role="group" aria-label="Filter date ideas">
        {filters.map((item) => (
          <button
            key={item.id}
            className={filter === item.id ? 'chip active' : 'chip'}
            onClick={() => onFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">Fresh possibilities</span><h2>Made for your shortlist</h2></div><span>{ideas.length} ideas</span></div>
        <div className="idea-grid">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              selected={selectedIds.includes(idea.id)}
              onDetail={() => onDetail(idea.id)}
              onToggle={() => onToggle(idea.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function IdeaCard({ idea, selected, onDetail, onToggle }: { idea: DateIdea; selected: boolean; onDetail: () => void; onToggle: () => void }) {
  return (
    <article className="idea-card">
      <button className="card-photo" onClick={onDetail} style={{ backgroundImage: 'url(' + idea.image + ')' }} aria-label={'View ' + idea.title}>
        {idea.eventDate && <span className="date-badge">{idea.eventDate}</span>}
        <span className="price-badge">{idea.price}</span>
      </button>
      <div className="card-copy">
        <span className="eyebrow">{idea.eyebrow}</span>
        <button className="title-link" onClick={onDetail}>{idea.title}</button>
        <p>{idea.location} · {idea.area}</p>
        <div className="card-footer"><span>{idea.duration}</span><button className={selected ? 'select-button selected' : 'select-button'} onClick={onToggle}>{selected ? '✓ Added' : '+ Add'}</button></div>
      </div>
    </article>
  )
}

function DetailView({ idea, selected, onBack, onToggle, onPlan }: { idea: DateIdea; selected: boolean; onBack: () => void; onToggle: () => void; onPlan: () => void }) {
  return (
    <div className="detail-view">
      <div className="detail-photo" style={{ backgroundImage: 'url(' + idea.image + ')' }}>
        <button className="round-button back" onClick={onBack}>←</button>
        <span className="detail-kind">{idea.kind}</span>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{idea.eyebrow}</span>
        <h1>{idea.title}</h1>
        <p className="large-copy">{idea.description}</p>
        <div className="fact-grid">
          <div><span>Where</span><strong>{idea.location}</strong><small>{idea.area}</small></div>
          <div><span>Time</span><strong>{idea.duration}</strong><small>{idea.eventDate || 'Flexible date'}</small></div>
          <div><span>Budget</span><strong>{idea.price}</strong><small>Estimate for two</small></div>
        </div>
        <div className="tag-row">{idea.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="sticky-actions">
          <button className="button secondary" onClick={onToggle}>{selected ? 'Remove from invite' : 'Add to invite'}</button>
          <button className="button dark" onClick={onPlan}>Review invite <span>→</span></button>
        </div>
      </div>
    </div>
  )
}

function PlanView({ ideas, selectedDay, sent, onDay, onRemove, onDiscover, onSend, onReset }: { ideas: DateIdea[]; selectedDay: string; sent: boolean; onDay: (day: string) => void; onRemove: (id: string) => void; onDiscover: () => void; onSend: () => void; onReset: () => void }) {
  if (sent) {
    const day = dayOptions.find((item) => item.id === selectedDay)
    return (
      <div className="screen success-screen">
        <div className="success-mark">✓</div>
        <span className="eyebrow">Invitation ready</span>
        <h1>Now the fun part.</h1>
        <p>Your private invitation has been mocked for Julie. She can choose from {ideas.length} ideas and confirm {day?.day}, {day?.date}.</p>
        <div className="share-card"><span>Private preview link</span><strong>datebook.local/invite/d8f2</strong><button onClick={() => navigator.clipboard?.writeText('https://datebook.local/invite/d8f2')}>Copy</button></div>
        <button className="button dark wide" onClick={onReset}>Back to invitation</button>
      </div>
    )
  }

  return (
    <div className="screen plan-screen">
      <PageHeader eyebrow="Private invitation" title="Plan our next date" />
      <div className="step-label"><span>1</span><div><strong>Give them good choices</strong><p>Choose up to three possibilities.</p></div></div>
      <div className="plan-list">
        {ideas.map((idea) => (
          <article key={idea.id}>
            <img src={idea.image} alt="" />
            <div><strong>{idea.title}</strong><span>{idea.location} · {idea.price}</span></div>
            <button onClick={() => onRemove(idea.id)} aria-label={'Remove ' + idea.title}>×</button>
          </article>
        ))}
        {ideas.length < 3 && <button className="add-option" onClick={onDiscover}>＋ Add another possibility</button>}
      </div>
      <div className="step-label"><span>2</span><div><strong>Suggest a day</strong><p>Your guest can still ask for another.</p></div></div>
      <div className="day-grid">
        {dayOptions.map((day) => (
          <button key={day.id} className={selectedDay === day.id ? 'day-option active' : 'day-option'} onClick={() => onDay(day.id)}>
            <span>{day.day}</span><strong>{day.date}</strong><small>{day.time}</small>
          </button>
        ))}
      </div>
      <label className="field"><span>Personal note</span><textarea defaultValue="I picked a few things that made me think of us. Choose your favourite?" /></label>
      <aside className="privacy-note"><span>⌁</span><div><strong>Only your invited person can respond</strong><p>Public accounts and community sharing are intentionally outside this prototype.</p></div></aside>
      <button className="button coral wide" disabled={ideas.length === 0} onClick={onSend}>Preview private invitation <span>→</span></button>
    </div>
  )
}

function ManageView({ ideas, showEditor, draft, editing, onCreate, onEdit, onDraft, onSave, onCancel, onToggleActive }: { ideas: DateIdea[]; showEditor: boolean; draft: IdeaDraft; editing: boolean; onCreate: () => void; onEdit: (idea: DateIdea) => void; onDraft: (draft: IdeaDraft) => void; onSave: (event: React.FormEvent) => void; onCancel: () => void; onToggleActive: (id: string) => void }) {
  if (showEditor) {
    return (
      <div className="screen editor-screen">
        <button className="text-button" onClick={onCancel}>← Cancel</button>
        <PageHeader eyebrow={editing ? 'Edit listing' : 'Curate something new'} title={editing ? 'Update this idea' : 'Add a date possibility'} />
        <form className="editor-form" onSubmit={onSave}>
          <div className="two-fields">
            <label className="field"><span>Type</span><select value={draft.kind} onChange={(event) => onDraft({ ...draft, kind: event.target.value as DateKind })}><option value="event">Local event</option><option value="food">Food & drink</option><option value="activity">Activity</option><option value="outdoors">Outdoors</option></select></label>
            <label className="field"><span>Budget</span><select value={draft.price} onChange={(event) => onDraft({ ...draft, price: event.target.value })}><option>$</option><option>$$</option><option>$$$</option></select></label>
          </div>
          <label className="field"><span>Title</span><input required value={draft.title} placeholder="Night market wander" onChange={(event) => onDraft({ ...draft, title: event.target.value })} /></label>
          <label className="field"><span>Why it would make a good date</span><textarea required value={draft.description} placeholder="Describe the mood, not just the venue..." onChange={(event) => onDraft({ ...draft, description: event.target.value })} /></label>
          <div className="two-fields">
            <label className="field"><span>Location</span><input required value={draft.location} placeholder="Venue or trail" onChange={(event) => onDraft({ ...draft, location: event.target.value })} /></label>
            <label className="field"><span>Area</span><input value={draft.area} placeholder="Neighbourhood" onChange={(event) => onDraft({ ...draft, area: event.target.value })} /></label>
          </div>
          <div className="two-fields">
            <label className="field"><span>Duration</span><input value={draft.duration} onChange={(event) => onDraft({ ...draft, duration: event.target.value })} /></label>
            <label className="field"><span>Event date (optional)</span><input value={draft.eventDate} placeholder="Saturday · 6:00 PM" onChange={(event) => onDraft({ ...draft, eventDate: event.target.value })} /></label>
          </div>
          <aside className="prototype-callout"><strong>Prototype shortcut</strong><p>The saved item uses a placeholder image and remains in memory until the page reloads. The production editor will add uploads, source links, precise dates, and validation.</p></aside>
          <button className="button dark wide" type="submit">{editing ? 'Save changes' : 'Add to Datebook'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="screen manage-screen">
      <PageHeader eyebrow="Private curator tools" title="Manage Datebook" action={<button className="button coral compact" onClick={onCreate}>＋ Add new</button>} />
      <div className="stats-row"><div><strong>{ideas.filter((idea) => idea.active).length}</strong><span>Live ideas</span></div><div><strong>{ideas.filter((idea) => idea.kind === 'event').length}</strong><span>Local events</span></div><div><strong>{ideas.filter((idea) => !idea.active).length}</strong><span>Drafts</span></div></div>
      <div className="management-list">
        {ideas.map((idea) => (
          <article key={idea.id}>
            <img src={idea.image} alt="" />
            <div className="management-copy"><span className={idea.active ? 'status live' : 'status'}>{idea.active ? 'Live' : 'Draft'}</span><strong>{idea.title}</strong><small>{idea.kind} · {idea.location}</small></div>
            <div className="management-actions"><button onClick={() => onEdit(idea)}>Edit</button><button onClick={() => onToggleActive(idea.id)}>{idea.active ? 'Archive' : 'Publish'}</button></div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProfileView({ signedIn, onSignIn }: { signedIn: boolean; onSignIn: () => void }) {
  return (
    <div className="screen profile-screen">
      <PageHeader eyebrow="Your private corner" title="The two of us" />
      <div className="couple-card">
        <div className="avatar-stack"><span>M</span><span>J</span></div>
        <h2>Manfred & Julie</h2>
        <p>A small shared space for plans worth looking forward to.</p>
        <span className="member-pill">Private · 2 members</span>
      </div>
      <section className="settings-card">
        <div className="google-mark">G</div>
        <div><strong>{signedIn ? 'Connected as Manfred' : 'Connect your Google account'}</strong><p>{signedIn ? 'manfred@example.com · Prototype identity' : 'Save plans across devices and identify the curator.'}</p></div>
        <button onClick={onSignIn}>{signedIn ? 'Disconnect' : 'Continue'}</button>
      </section>
      <section className="settings-list"><button><span>♡</span><div><strong>Invite member</strong><small>Private invitation links</small></div><b>›</b></button><button><span>▣</span><div><strong>Calendar preferences</strong><small>Not connected in this prototype</small></div><b>›</b></button><button><span>⌁</span><div><strong>Privacy</strong><small>Only members see your plans</small></div><b>›</b></button></section>
      <p className="prototype-caption">Google sign-in is intentionally simulated. No account data leaves this browser.</p>
    </div>
  )
}

export default App
