import { useEffect, useMemo, useState } from 'react'

type PageName = 'Dashboard' | 'Form Layouts' | 'Datepicker' | 'Toastr' | 'Tooltip' | 'Smart Table'

const groups = [
  { name: 'Forms', items: ['Form Layouts', 'Datepicker'] as PageName[] },
  { name: 'Modal & Overlays', items: ['Toastr', 'Tooltip'] as PageName[] },
  { name: 'Tables & Data', items: ['Smart Table'] as PageName[] },
]

function Header() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('Light')
  const themes = ['Light', 'Dark', 'Cosmic', 'Corporate']

  return (
    <ngx-header className="header">
      <div className="brand"><span className="brand-mark">PW</span> Practice App</div>
      <div className="theme-control">
        <span>Theme</span>
        <nb-select role="button" tabIndex={0} aria-label="Theme selector" onClick={() => setOpen(!open)}>
          {theme}<span aria-hidden="true">⌄</span>
        </nb-select>
        {open && (
          <div role="list" className="option-list">
            {themes.map(option => (
              <nb-option
                key={option}
                role="listitem"
                tabIndex={0}
                onClick={() => { setTheme(option); setOpen(false) }}
              >
                {option}
              </nb-option>
            ))}
          </div>
        )}
      </div>
    </ngx-header>
  )
}

function Sidebar({ navigate }: { navigate: (page: PageName) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="dashboard-link" title="IoT Dashboard" onClick={() => navigate('Dashboard')}>IoT Dashboard</button>
      {groups.map(group => (
        <section className="nav-group" key={group.name}>
          <button
            className="nav-group-button"
            title={group.name}
            aria-expanded={Boolean(expanded[group.name])}
            onClick={() => setExpanded(current => ({ ...current, [group.name]: !current[group.name] }))}
          >
            {group.name}<span aria-hidden="true">›</span>
          </button>
          {expanded[group.name] && (
            <div className="nav-items">
              {group.items.map(item => (
                <button key={item} title={item} onClick={() => navigate(item)}>{item}</button>
              ))}
            </div>
          )}
        </section>
      ))}
    </aside>
  )
}

function UsingGridForm() {
  return (
    <nb-card>
      <h2>Using the Grid</h2>
      <label htmlFor="inputEmail1">Email</label>
      <input id="inputEmail1" {...({ nbinput: '' } as object)} className="input-full-width size-medium status-basic shape-rectangle nb-transition" type="email" aria-label="Email" placeholder="Email" />
      <label htmlFor="grid-password">Password</label>
      <input id="grid-password" type="password" aria-label="Password" placeholder="Password" />
      <div className="radios">
        <nb-radio><label><input type="radio" name="grid-option" value="1" /> Option 1</label></nb-radio>
        <nb-radio><label><input type="radio" name="grid-option" value="2" /> Option 2</label></nb-radio>
      </div>
      <button type="button">SIGN IN</button>
    </nb-card>
  )
}

function BasicForm() {
  return (
    <nb-card>
      <h2>Basic Form</h2>
      <label>Email<input type="email" aria-label="Email" placeholder="Email" /></label>
      <label>Password<input type="password" aria-label="Password" placeholder="Password" /></label>
      <span className="status-danger">Required fields</span>
      <button type="button">Submit</button>
    </nb-card>
  )
}

function HorizontalForm() {
  return (
    <nb-card>
      <h2>Horizontal Form</h2>
      <label>Name<input aria-label="Name" placeholder="Jane Doe" /></label>
      <button type="button" data-testid="SignIn">Sign In</button>
      <button type="button" className="bg-success">Success</button>
    </nb-card>
  )
}

function FormLayouts() {
  return <div className="card-grid"><UsingGridForm /><BasicForm /><HorizontalForm /></div>
}

function Datepicker() {
  return (
    <nb-card>
      <h2>Common Datepicker</h2>
      <label>Pick a date<input type="date" aria-label="Pick a date" /></label>
    </nb-card>
  )
}

function Toastr() {
  const options = ['Hide on click', 'Prevent arising of duplicate toast', 'Show toast with icon']
  return (
    <nb-card>
      <h2>Toastr configuration</h2>
      {options.map((option, index) => (
        <label className="checkbox" key={option}>
          <input type="checkbox" defaultChecked={index !== 1} /> {option}
        </label>
      ))}
    </nb-card>
  )
}

function Tooltip() {
  const [visible, setVisible] = useState(false)
  return (
    <nb-card>
      <h2>Tooltip Placements</h2>
      <button onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>Top</button>
      <button>Right</button><button>Bottom</button><button>Left</button>
      {visible && <nb-tooltip role="tooltip">This is a tooltip</nb-tooltip>}
    </nb-card>
  )
}

type Person = { id: number; first: string; last: string; username: string; email: string; age: string }
const people: Person[] = [
  { id: 1, first: 'Mark', last: 'Otto', username: '@mdo', email: 'mdo@gmail.com', age: '28' },
  { id: 2, first: 'Jacob', last: 'Thornton', username: '@fat', email: 'twitter@outlook.com', age: '45' },
  { id: 3, first: 'Larry', last: 'Bird', username: '@twitter', email: 'larry@gmail.com', age: '20' },
  { id: 4, first: 'John', last: 'Snow', username: '@snow', email: 'john@gmail.com', age: '30' },
  { id: 5, first: 'Jack', last: 'Sparrow', username: '@pirate', email: 'jack@gmail.com', age: '40' },
  { id: 6, first: 'Ann', last: 'Smith', username: '@ann', email: 'ann@gmail.com', age: '48' },
  { id: 11, first: 'Ada', last: 'Lovelace', username: '@ada', email: 'ada@example.com', age: '36' },
]

function SmartTable() {
  const [rows, setRows] = useState(people)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState<Person | null>(null)
  const [ageFilter, setAgeFilter] = useState('')
  const visibleRows = useMemo(() => ageFilter ? rows.filter(row => row.age === ageFilter) : rows, [rows, ageFilter])

  const beginEdit = (person: Person) => { setEditing(person.id); setDraft({ ...person }) }
  const save = () => {
    if (draft) setRows(current => current.map(row => row.id === draft.id ? draft : row))
    setEditing(null)
  }
  const remove = (id: number) => {
    if (window.confirm('Are you sure you want to delete?')) setRows(current => current.filter(row => row.id !== id))
  }

  return (
    <nb-card>
      <h2>Smart Table</h2>
      <table>
        <thead>
          <tr><th>Actions</th><th>ID</th><th>First Name</th><th>Last Name</th><th>Username</th><th>E-mail</th><th>
            <input-filter><input aria-label="Age filter" placeholder="Age" value={ageFilter} onChange={event => setAgeFilter(event.target.value)} /></input-filter>
          </th></tr>
        </thead>
        <tbody>
          {visibleRows.map(person => {
            const isEditing = editing === person.id && draft
            return (
              <tr key={person.id}>
                <td>
                  {isEditing ? <button className="nb-checkmark" aria-label="Save" onClick={save}>✓</button> : <button className="nb-edit" aria-label="Edit" onClick={() => beginEdit(person)}>✎</button>}
                  <button className="nb-trash" aria-label="Delete" onClick={() => remove(person.id)}>⌫</button>
                </td>
                <td>{person.id}</td><td>{person.first}</td><td>{person.last}</td><td>{person.username}</td>
                <td>{isEditing ? <input-editor><input placeholder="E-mail" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></input-editor> : person.email}</td>
                <td>{isEditing ? <input-editor><input placeholder="Age" value={draft.age} onChange={event => setDraft({ ...draft, age: event.target.value })} /></input-editor> : person.age}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <nav className="ng2-smart-pagination-nav" aria-label="Pagination"><button>1</button><button>2</button></nav>
    </nb-card>
  )
}

function Dashboard() {
  const [temperature, setTemperature] = useState(30)
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="dashboard-grid">
      <nb-card tabtitle="Temperature">
        <h2>Temperature</h2>
        <ngx-temperature-dragger
          className="temperature-dragger"
          onMouseDown={() => setTemperature(30)}
          onClick={() => setTemperature(30)}
        >
          <svg viewBox="0 0 300 300" aria-label="Temperature gauge">
            <circle cx="150" cy="150" r="120" className="gauge-track" />
            <circle cx="232.630" cy="232.630" r="18" className="gauge-knob" />
          </svg>
          <strong>{temperature}°</strong>
        </ngx-temperature-dragger>
      </nb-card>
      <nb-card>
        <h2>Rooms</h2><p>Living Room</p><p>Kitchen</p><p>Bedroom</p>
        <button onClick={() => window.setTimeout(() => setLoaded(true), 500)}>Load delayed result</button>
        {loaded && <p className="bg-success result-message">Data loaded successfully</p>}
      </nb-card>
    </div>
  )
}

function App() {
  const [page, setPage] = useState<PageName>('Dashboard')
  const [apiStatus, setApiStatus] = useState('connecting')
  useEffect(() => {
    fetch('/api/health').then(response => response.ok ? response.json() : Promise.reject())
      .then(() => setApiStatus('connected')).catch(() => setApiStatus('offline'))
  }, [])

  const content = {
    Dashboard: <Dashboard />, 'Form Layouts': <FormLayouts />, Datepicker: <Datepicker />,
    Toastr: <Toastr />, Tooltip: <Tooltip />, 'Smart Table': <SmartTable />,
  }[page]

  return (
    <div className="app-shell">
      <Header />
      <Sidebar navigate={setPage} />
      <main><div className="page-title"><h1>{page}</h1><span className={`api-status ${apiStatus}`}>API {apiStatus}</span></div>{content}</main>
    </div>
  )
}

export default App
