import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Coffee, Edit3,
  Grid2X2, Home, Lightbulb, Lock, Mail, Menu, MessageCircle, Music2, Pause,
  PieChart, Play, Power, Search, Settings, SkipBack, SkipForward, Sliders,
  Snowflake, Speaker, Sun, Trash2, Volume2, Waves, Wind, X,
} from 'lucide-react'

type ThemeName = 'Light' | 'Dark' | 'Cosmic' | 'Corporate'
type PageName =
  | 'IoT Dashboard' | 'Form Layouts' | 'Datepicker' | 'Dialog' | 'Window'
  | 'Popover' | 'Toastr' | 'Tooltip' | 'Calendar' | 'Echarts'
  | 'Smart Table' | 'Tree Grid' | 'Login' | 'Register'
  | 'Request Password' | 'Reset Password'

const pagePaths: Record<PageName, string> = {
  'IoT Dashboard': '/pages/iot-dashboard',
  'Form Layouts': '/pages/forms/layouts',
  Datepicker: '/pages/forms/datepicker',
  Dialog: '/pages/modal-overlays/dialog',
  Window: '/pages/modal-overlays/window',
  Popover: '/pages/modal-overlays/popover',
  Toastr: '/pages/modal-overlays/toastr',
  Tooltip: '/pages/modal-overlays/tooltip',
  Calendar: '/pages/extra-components/calendar',
  Echarts: '/pages/charts/echarts',
  'Smart Table': '/pages/tables/smart-table',
  'Tree Grid': '/pages/tables/tree-grid',
  Login: '/auth/login', Register: '/auth/register',
  'Request Password': '/auth/request-password', 'Reset Password': '/auth/reset-password',
}

const pathPages = Object.fromEntries(Object.entries(pagePaths).map(([page, path]) => [path, page])) as Record<string, PageName>

const menuGroups = [
  { name: 'Forms', icon: Edit3, items: ['Form Layouts', 'Datepicker'] as PageName[] },
  { name: 'Modal & Overlays', icon: Grid2X2, items: ['Dialog', 'Window', 'Popover', 'Toastr', 'Tooltip'] as PageName[] },
  { name: 'Extra Components', icon: MessageCircle, items: ['Calendar'] as PageName[] },
  { name: 'Charts', icon: PieChart, items: ['Echarts'] as PageName[] },
  { name: 'Tables & Data', icon: Grid2X2, items: ['Smart Table', 'Tree Grid'] as PageName[] },
  { name: 'Auth', icon: Lock, items: ['Login', 'Register', 'Request Password', 'Reset Password'] as PageName[] },
]

const themes: ThemeName[] = ['Light', 'Dark', 'Cosmic', 'Corporate']

function Header({ theme, setTheme, toggleSidebar }: { theme: ThemeName; setTheme: (theme: ThemeName) => void; toggleSidebar: () => void }) {
  const [themeOpen, setThemeOpen] = useState(false)
  return (
    <ngx-header className="app-header">
      <div className="header-left">
        <button className="icon-button menu-toggle" aria-label="Toggle navigation" onClick={toggleSidebar}><Menu /></button>
        <button className="logo" onClick={() => window.scrollTo({ top: 0 })}>PW-<strong>test</strong></button>
        <div className="theme-picker">
          <nb-select role="button" tabIndex={0} aria-label="Theme selector" onClick={() => setThemeOpen(open => !open)}>
            <span>{theme}</span><ChevronDown size={18} />
          </nb-select>
          {themeOpen && <div role="list" className="theme-options">
            {themes.map(option => <nb-option role="listitem" tabIndex={0} key={option} onClick={() => { setTheme(option); setThemeOpen(false) }}>{option}</nb-option>)}
          </div>}
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search"><Search /></button>
        <button className="icon-button" aria-label="Messages"><Mail /></button>
        <button className="icon-button" aria-label="Notifications"><Bell /></button>
        <div className="user"><img src="/assets/nick.png" alt="Prateek Mishra" /><span>Prateek Mishra</span></div>
      </div>
    </ngx-header>
  )
}

function Sidebar({ active, navigate, collapsed }: { active: PageName; navigate: (page: PageName) => void; collapsed: boolean }) {
  const activeGroup = menuGroups.find(group => group.items.includes(active))?.name
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => activeGroup ? { [activeGroup]: true } : {})

  useEffect(() => {
    if (activeGroup) setExpanded(current => ({ ...current, [activeGroup]: true }))
  }, [activeGroup])

  return <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
    <button className={`nav-row dashboard-nav ${active === 'IoT Dashboard' ? 'active' : ''}`} title="IoT Dashboard" onClick={() => navigate('IoT Dashboard')}>
      <Home /><span>IoT Dashboard</span>
    </button>
    <div className="menu-group-label">FEATURES</div>
    {menuGroups.map(group => {
      const Icon = group.icon
      const open = Boolean(expanded[group.name])
      return <section className="menu-section" key={group.name}>
        <button className={`nav-row ${activeGroup === group.name ? 'active-parent' : ''}`} title={group.name} aria-expanded={open} onClick={() => setExpanded(current => ({ ...current, [group.name]: !open }))}>
          <Icon /><span>{group.name}</span><ChevronLeft className={`chevron ${open ? 'open' : ''}`} />
        </button>
        {open && <div className="submenu">
          {group.items.map(item => <button key={item} title={item} className={active === item ? 'active' : ''} onClick={() => navigate(item)}>{item}</button>)}
        </div>}
      </section>
    })}
  </aside>
}

function StatusCard({ title, color, icon: Icon }: { title: string; color: string; icon: typeof Lightbulb }) {
  const [enabled, setEnabled] = useState(true)
  return <button className={`status-card ${enabled ? '' : 'off'}`} onClick={() => setEnabled(value => !value)}>
    <span className={`status-icon ${color}`}><Icon /></span>
    <span><strong>{title}</strong><small>{enabled ? 'ON' : 'OFF'}</small></span>
  </button>
}

function CircularControl({ value, setValue, min, max, label, unit, powered, setPowered }: {
  value: number; setValue: (value: number) => void; min: number; max: number; label?: string; unit: string; powered: boolean; setPowered: (powered: boolean) => void
}) {
  const [dragging, setDragging] = useState(false)
  const rootRef = useRef<HTMLElement | null>(null)
  const center = 150, radius = 108, circumference = Math.PI * 2 * radius
  const progress = (value - min) / (max - min)
  const angle = 120 + progress * 300
  const radians = angle * Math.PI / 180
  const thumbX = center + radius * Math.cos(radians)
  const thumbY = center + radius * Math.sin(radians)
  const dash = circumference * (300 / 360) * progress

  const updateFromPointer = (clientX: number, clientY: number) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (clientX - rect.left) / rect.width * 300
    const y = (clientY - rect.top) / rect.height * 300
    let pointerAngle = Math.atan2(y - center, x - center) * 180 / Math.PI
    if (pointerAngle < 0) pointerAngle += 360
    if (pointerAngle < 120) pointerAngle += 360
    pointerAngle = Math.max(120, Math.min(420, pointerAngle))
    setValue(Math.round(min + (pointerAngle - 120) / 300 * (max - min)))
  }

  return <ngx-temperature-dragger
    ref={rootRef}
    role="slider"
    aria-label={label ?? 'Temperature'}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={powered ? value : undefined}
    tabIndex={0}
    className={`circular-control ${dragging ? 'dragging' : ''}`}
    onPointerDown={event => { setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event.clientX, event.clientY) }}
    onPointerMove={event => { if (dragging) updateFromPointer(event.clientX, event.clientY) }}
    onPointerUp={event => { setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId) }}
    onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setValue(Math.min(max, value + 1))
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setValue(Math.max(min, value - 1))
    }}
  >
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <defs><linearGradient id="temperature-gradient"><stop offset="0" stopColor="#42a5f5" /><stop offset="1" stopColor="#3366ff" /></linearGradient></defs>
      <circle className="temperature-track" cx={center} cy={center} r={radius} />
      {powered && <circle className="temperature-progress" cx={center} cy={center} r={radius} transform={`rotate(120 ${center} ${center})`} strokeDasharray={`${dash} ${circumference}`} />}
      {powered && <circle className="temp-thumb" cx={thumbX} cy={thumbY} r="13" />}
    </svg>
    <div className={`temperature-value ${powered ? '' : 'off'}`}><strong>{powered ? value : '--'}{powered && unit}</strong>{label && <span>{label}</span>}</div>
    <button className={`power-button ${powered ? 'on' : ''}`} aria-label={`Turn ${label ?? 'temperature'} ${powered ? 'off' : 'on'}`} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); setPowered(!powered) }}><Power /></button>
  </ngx-temperature-dragger>
}

function TemperatureCard() {
  const [tab, setTab] = useState<'Temperature' | 'Humidity'>('Temperature')
  const [temperature, setTemperature] = useState(24)
  const [humidity, setHumidity] = useState(87)
  const [tempPower, setTempPower] = useState(true)
  const [humidityPower, setHumidityPower] = useState(true)
  const [mode, setMode] = useState('cool')
  const modes = [{ id: 'cool', icon: Snowflake }, { id: 'warm', icon: Sun }, { id: 'heat', icon: Waves }, { id: 'fan', icon: Wind }]
  return <nb-card className="temperature-card" tabtitle="Temperature">
    <div className="tab-bar">
      {(['Temperature', 'Humidity'] as const).map(name => <button className={tab === name ? 'active' : ''} key={name} onClick={() => setTab(name)}>{name}</button>)}
    </div>
    <div className="temperature-content">
      {tab === 'Temperature'
        ? <CircularControl value={temperature} setValue={setTemperature} min={10} max={30} label="Celsius" unit="°" powered={tempPower} setPowered={setTempPower} />
        : <CircularControl value={humidity} setValue={setHumidity} min={0} max={100} unit="%" powered={humidityPower} setPowered={setHumidityPower} />}
    </div>
    <div className="mode-buttons">
      {modes.map(({ id, icon: Icon }) => <label className={mode === id ? 'active' : ''} key={id}><input type="radio" name="temperature-mode" value={id} checked={mode === id} onChange={() => setMode(id)} /><Icon /></label>)}
    </div>
  </nb-card>
}

function ElectricityCard() {
  return <nb-card className="electricity-card">
    <div className="electricity-head"><div><span>Consumed</span><strong>816 <small>kWh</small></strong></div><div><span>Spent</span><strong>291 <small>USD</small></strong></div><select aria-label="Electricity period"><option>week</option><option>month</option><option>year</option></select></div>
    <svg viewBox="0 0 700 270" preserveAspectRatio="none" aria-label="Electricity consumption chart">
      <defs><linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3366ff" stopOpacity=".28" /><stop offset="1" stopColor="#3366ff" stopOpacity="0" /></linearGradient></defs>
      {[50,100,150,200,250].map(y => <line key={y} x1="0" x2="700" y1={y} y2={y} className="chart-grid" />)}
      <path d="M0 220 C55 210 80 85 145 105 S235 235 290 180 S380 25 450 95 S520 250 585 185 S650 80 700 105 L700 270 L0 270Z" fill="url(#area-blue)" />
      <path d="M0 220 C55 210 80 85 145 105 S235 235 290 180 S380 25 450 95 S520 250 585 185 S650 80 700 105" className="chart-line" />
    </svg>
    <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
  </nb-card>
}

const playlistTracks = [
  { title: 'Monsoon Drive', artist: 'Prateek Mishra', notes: [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 329.63] },
  { title: 'Mumbai Lights', artist: 'Prateek Mishra', notes: [293.66, 369.99, 440, 493.88, 440, 369.99, 329.63, 369.99] },
  { title: 'Himalayan Dawn', artist: 'Prateek Mishra', notes: [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 246.94] },
]

function PlaylistPlayer() {
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const audioContext = useRef<AudioContext | null>(null)
  const noteIndex = useRef(0)
  const track = playlistTracks[trackIndex]

  useEffect(() => {
    if (!playing) return
    audioContext.current ??= new AudioContext()
    const context = audioContext.current
    void context.resume()
    const playNote = () => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = track.notes[noteIndex.current % track.notes.length]
      gain.gain.setValueAtTime(Math.max(0.0001, volume / 600), context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.33)
      noteIndex.current = (noteIndex.current + 1) % track.notes.length
      setProgress(noteIndex.current / track.notes.length * 100)
    }
    playNote()
    const timer = window.setInterval(playNote, 350)
    return () => window.clearInterval(timer)
  }, [playing, track, volume])

  useEffect(() => () => { void audioContext.current?.close() }, [])

  const changeTrack = (offset: number) => {
    setTrackIndex(current => (current + offset + playlistTracks.length) % playlistTracks.length)
    noteIndex.current = 0
    setProgress(0)
  }

  const seek = (value: number) => {
    noteIndex.current = Math.floor(value / 100 * track.notes.length) % track.notes.length
    setProgress(value)
  }

  return <div className="player"><h3>My Playlist</h3><div className={`album-art ${playing ? 'playing' : ''}`}><Music2 /></div><h4>{track.title}</h4><p>{track.artist}</p><input aria-label="Track progress" type="range" value={progress} onChange={event => seek(Number(event.target.value))} /><div className="player-controls"><button aria-label="Previous track" onClick={() => changeTrack(-1)}><SkipBack /></button><button className="play" aria-label={playing ? 'Pause music' : 'Play music'} onClick={() => setPlaying(value => !value)}>{playing ? <Pause /> : <Play />}</button><button aria-label="Next track" onClick={() => changeTrack(1)}><SkipForward /></button></div><div className="volume"><Volume2 /><input aria-label="Volume" type="range" value={volume} onChange={event => setVolume(Number(event.target.value))} /></div></div>
}

function RoomsCard() {
  const [room, setRoom] = useState('Living Room')
  const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom']
  return <nb-card className="rooms-card">
    <div className="room-selector"><h3>Room Management</h3><div className="room-grid">
      {rooms.map((name, index) => <button className={room === name ? 'active' : ''} key={name} onClick={() => setRoom(name)}><span>{['⌂','☕','☾','◉'][index]}</span>{name}</button>)}
    </div></div>
    <PlaylistPlayer />
  </nb-card>
}

const contacts = [
  ['Aarav Sharma', 'mobile', 'nick.png'], ['Ananya Verma', 'home', 'eva.png'], ['Rohan Gupta', 'mobile', 'jack.png'],
  ['Priya Singh', 'mobile', 'lee.png'], ['Vikram Patel', 'home', 'alan.png'], ['Neha Joshi', 'work', 'kate.png'],
]

function ContactsCard() {
  return <nb-card className="contacts-card"><div className="tab-bar compact"><button className="active">Contacts</button><button>Recent</button></div><div className="contact-list">
    {contacts.map(([name, type, image]) => <div className="contact" key={name}><img src={`/assets/${image}`} alt="" /><div><strong>{name}</strong><span>{type}</span></div><button aria-label={`Call ${name}`}>⌕</button></div>)}
  </div></nb-card>
}

function SolarCard() {
  return <nb-card className="solar-card"><span>Solar Energy Consumption</span><strong>6.421 <small>kWh</small></strong><div className="solar-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" /><circle className="filled" cx="60" cy="60" r="48" /></svg><Sun /></div><small>out of 8.421 kWh</small></nb-card>
}

function KittenCard({ theme }: { theme: ThemeName }) {
  const image = `/assets/kitten-${theme.toLowerCase()}.png`
  return <nb-card className="kitten-card"><img src={image} alt="UI Kitten" /><div><h3>UI Kitten</h3><p>A framework of beautifully styled UI components with themes that change on the fly.</p><a href="https://akveo.github.io/react-native-ui-kitten" target="_blank" rel="noreferrer">LEARN MORE</a></div></nb-card>
}

function TrafficCard() {
  return <nb-card className="traffic-card"><div className="widget-head"><h3>Traffic Consumption</h3><select aria-label="Traffic period"><option>month</option><option>week</option></select></div><strong>42,839</strong><span>+12% from last month</span><svg viewBox="0 0 300 90" preserveAspectRatio="none"><path d="M0 72 C35 60 45 80 76 45 S120 72 150 36 S195 60 225 25 S265 45 300 12" /></svg></nb-card>
}

function WeatherCard() {
  return <nb-card className="weather-card"><div className="weather-main"><div><span>Mumbai</span><small>Mon 29 May</small></div><strong>20°</strong></div><div className="weather-details"><span>max <b>23°</b></span><span>min <b>19°</b></span><span>wind <b>4 km/h</b></span><span>hum <b>87%</b></span></div><div className="forecast">{[['Sun','☀','17°'],['Mon','☁','19°'],['Tue','☂','22°'],['Wed','☀','21°']].map(day => <div key={day[0]}><span>{day[0]}</span><b>{day[1]}</b><strong>{day[2]}</strong></div>)}</div></nb-card>
}

function CamerasCard() {
  const [camera, setCamera] = useState(1)
  const [playing, setPlaying] = useState(true)
  return <nb-card className="cameras-card"><div className="widget-head"><h3>Security Cameras</h3><button aria-label={playing ? 'Pause cameras' : 'Play cameras'} onClick={() => setPlaying(value => !value)}>{playing ? <Pause /> : <Play />}</button></div><div className="camera-view"><img src={`/assets/camera${camera}.jpg`} alt={`Camera ${camera}`} className={playing ? '' : 'paused'} /><span>Camera #{camera}</span></div><div className="camera-thumbs">{[1,2,3,4].map(number => <button className={camera === number ? 'active' : ''} key={number} onClick={() => setCamera(number)}><img src={`/assets/camera${number}.jpg`} alt={`Select camera ${number}`} /></button>)}</div></nb-card>
}

function Dashboard({ theme }: { theme: ThemeName }) {
  return <div className="dashboard-page">
    <div className="status-grid"><StatusCard title="Light" color="primary" icon={Lightbulb} /><StatusCard title="Roller Shades" color="success" icon={Sliders} /><StatusCard title="Wireless Audio" color="info" icon={Speaker} /><StatusCard title="Coffee Maker" color="warning" icon={Coffee} /></div>
    <div className="dashboard-row primary-widgets"><TemperatureCard /><ElectricityCard /></div>
    <RoomsCard />
    <div className="dashboard-bottom"><ContactsCard /><div><SolarCard /><KittenCard theme={theme} /></div><div><TrafficCard /><WeatherCard /></div><CamerasCard /></div>
  </div>
}

function Field({ label, type = 'text', placeholder, id, ariaLabel }: { label?: string; type?: string; placeholder?: string; id?: string; ariaLabel?: string }) {
  return <label className="field">{label && <span>{label}</span>}<input id={id} type={type} placeholder={placeholder} aria-label={ariaLabel ?? label} /></label>
}

function FormLayouts() {
  return <div className="forms-layout">
    <nb-card className="inline-form"><h3>Inline form</h3><div><input placeholder="Prateek Mishra" aria-label="Name" /><input placeholder="Email" aria-label="Email" /><label className="check"><input type="checkbox" /> Remember me</label><button>Submit</button></div></nb-card>
    <div className="two-column-cards">
      <nb-card><h3>Using the Grid</h3><div className="grid-form"><label htmlFor="inputEmail1">Email</label><input id="inputEmail1" {...({ nbinput: '' } as object)} className="input-full-width size-medium status-basic shape-rectangle nb-transition" aria-label="Email" placeholder="Email" /><label htmlFor="grid-password">Password</label><input id="grid-password" aria-label="Password" placeholder="Password" /><span>Radios</span><div className="radio-stack"><nb-radio><label><input type="radio" name="grid-option" /> Option 1</label></nb-radio><nb-radio><label><input type="radio" name="grid-option" /> Option 2</label></nb-radio><nb-radio><label className="disabled"><input type="radio" name="grid-option" disabled defaultChecked /> Disabled Option</label></nb-radio></div><i /><button>SIGN IN</button></div></nb-card>
      <nb-card><h3>Basic Form</h3><Field label="Email address" type="email" placeholder="Email" ariaLabel="Email" /><Field label="Password" placeholder="Password" /><label className="check"><input type="checkbox" /> Check me out</label><button className="status-danger">Submit</button></nb-card>
      <nb-card><h3>Form without labels</h3><Field placeholder="Recipients" ariaLabel="Recipients" /><Field placeholder="Subject" ariaLabel="Subject" /><label className="field"><textarea placeholder="Message" aria-label="Message" /></label><button>SEND</button></nb-card>
      <nb-card><h3>Block form</h3><div className="block-fields"><Field label="First Name" placeholder="First Name" /><Field label="Last Name" placeholder="Last Name" /><Field label="Email" placeholder="Email" /><Field label="Website" placeholder="Website" /></div><button>SUBMIT</button></nb-card>
      <nb-card className="horizontal-form"><h3>Horizontal form</h3><div className="grid-form"><label>Email</label><input aria-label="Email" placeholder="Email" /><label>Password</label><input aria-label="Password" placeholder="Password" /><i /><label className="check"><input type="checkbox" /> Remember me</label><i /><button data-testid="SignIn">SIGN IN</button></div></nb-card>
    </div>
  </div>
}

function DatepickerPage() {
  return <div className="two-column-cards"><nb-card><h3>Common Datepicker</h3><Field label="Pick a date" type="date" /></nb-card><nb-card><h3>Datepicker With Range</h3><Field label="Select a date range" placeholder="Range" /></nb-card><nb-card><h3>Datepicker With Disabled Min Max Values</h3><Field label="Pick a valid date" type="date" /></nb-card></div>
}

function ToastrPage() {
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (random = false) => window.setTimeout(() => setToast(random ? 'Random toast says hello!' : "I'm cool toaster!"), 350)
  return <><nb-card className="toastr-card"><h3>Toaster configuration</h3><div className="toastr-grid"><div><Field label="Position:" placeholder="top-right" /><Field label="Title:" placeholder="HI there!" /><Field label="Content:" placeholder="I'm cool toaster!" /><Field label="Time to hide toast, ms. 0 to persistent toast:" type="number" placeholder="2000" /></div><div><Field label="Toast type:" placeholder="primary" /><label className="check"><input type="checkbox" defaultChecked /> Hide on click</label><label className="check"><input type="checkbox" /> Prevent arising of duplicate toast</label><label className="check"><input type="checkbox" defaultChecked /> Show toast with icon</label></div></div><footer><button className="basic-button" onClick={() => showToast(false)}>SHOW TOAST</button><button className="success-button" onClick={() => showToast(true)}>RANDOM TOAST</button></footer></nb-card>{toast && <button className="toast" onClick={() => setToast(null)}><strong>HI there!</strong><span>{toast}</span></button>}</>
}

function TooltipPage() {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const buttons = ['Top', 'Right', 'Bottom', 'Left']
  return <div className="two-column-cards"><nb-card><h3>Tooltip Placements</h3><div className="button-row">{buttons.map(name => <button key={name} onMouseEnter={() => setTooltip(name)} onMouseLeave={() => setTooltip(null)}>{name}</button>)}</div>{tooltip && <nb-tooltip role="tooltip">This is a tooltip</nb-tooltip>}</nb-card><nb-card><h3>Colored Tooltips</h3><div className="button-row"><button>Primary</button><button className="success-button">Success</button><button className="danger-button">Danger</button></div></nb-card></div>
}

type Person = { id: number; first: string; last: string; username: string; email: string; age: string }
const initialPeople: Person[] = [
  { id: 1, first: 'Prateek', last: 'Mishra', username: '@prateek', email: 'prateek@example.com', age: '28' },
  { id: 2, first: 'Aarav', last: 'Sharma', username: '@aarav', email: 'aarav@example.com', age: '45' },
  { id: 3, first: 'Ananya', last: 'Verma', username: '@ananya', email: 'ananya@example.com', age: '18' },
  { id: 4, first: 'Rohan', last: 'Gupta', username: '@rohan', email: 'rohan@example.com', age: '20' },
  { id: 5, first: 'Priya', last: 'Singh', username: '@priya', email: 'priya@example.com', age: '30' },
  { id: 6, first: 'Vikram', last: 'Patel', username: '@vikram', email: 'vikram@example.com', age: '21' },
  { id: 7, first: 'Neha', last: 'Joshi', username: '@neha', email: 'neha@example.com', age: '43' },
  { id: 8, first: 'Aditya', last: 'Rao', username: '@aditya', email: 'aditya@example.com', age: '13' },
  { id: 9, first: 'Ishita', last: 'Nair', username: '@ishita', email: 'ishita@example.com', age: '22' },
  { id: 10, first: 'Karan', last: 'Mehta', username: '@karan', email: 'karan@example.com', age: '33' },
  { id: 11, first: 'Meera', last: 'Iyer', username: '@meera', email: 'meera@example.com', age: '36' },
  { id: 12, first: 'Arjun', last: 'Kapoor', username: '@arjun', email: 'arjun@example.com', age: '48' },
  { id: 13, first: 'Kavya', last: 'Desai', username: '@kavya', email: 'kavya@example.com', age: '40' },
]

function SmartTable() {
  const [rows, setRows] = useState(initialPeople)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState<Person | null>(null)
  const [ageFilter, setAgeFilter] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => ageFilter ? rows.filter(row => row.age === ageFilter) : rows, [rows, ageFilter])
  const visibleRows = ageFilter ? filtered : filtered.slice((page - 1) * 10, page * 10)
  const beginEdit = (person: Person) => { setEditing(person.id); setDraft({ ...person }) }
  const save = () => { if (draft) setRows(current => current.map(row => row.id === draft.id ? draft : row)); setEditing(null) }
  const remove = (id: number) => { if (window.confirm('Are you sure you want to delete?')) setRows(current => current.filter(row => row.id !== id)) }
  return <nb-card className="smart-table-card"><h3>Smart Table</h3><div className="table-scroll"><table><thead><tr><th>Actions</th><th>ID</th><th>First Name</th><th>Last Name</th><th>Username</th><th>E-mail</th><th>Age</th></tr><tr className="filters"><th><button className="add-row">＋</button></th>{['ID','First Name','Last Name','Username','E-mail'].map(name => <th key={name}><input placeholder={name} aria-label={`${name} filter`} /></th>)}<th><input-filter><input placeholder="Age" aria-label="Age filter" value={ageFilter} onChange={event => setAgeFilter(event.target.value)} /></input-filter></th></tr></thead><tbody>{visibleRows.map(person => {
    const isEditing = editing === person.id && draft
    return <tr key={person.id}><td>{isEditing ? <button className="nb-checkmark" aria-label="Save" onClick={save}>✓</button> : <button className="nb-edit" aria-label="Edit" onClick={() => beginEdit(person)}><Edit3 /></button>}<button className="nb-trash" aria-label="Delete" onClick={() => remove(person.id)}><Trash2 /></button></td><td>{person.id}</td><td>{person.first}</td><td>{person.last}</td><td>{person.username}</td><td>{isEditing ? <input-editor><input placeholder="E-mail" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></input-editor> : person.email}</td><td>{isEditing ? <input-editor><input placeholder="Age" value={draft.age} onChange={event => setDraft({ ...draft, age: event.target.value })} /></input-editor> : person.age}</td></tr>
  })}</tbody></table></div><nav className="ng2-smart-pagination-nav" aria-label="Pagination"><button onClick={() => setPage(1)}>«</button><button onClick={() => setPage(Math.max(1, page - 1))}>‹</button>{[1,2].map(number => <button className={page === number ? 'active' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button onClick={() => setPage(Math.min(2, page + 1))}>›</button><button onClick={() => setPage(2)}>»</button></nav></nb-card>
}

function OverlayDemo({ type }: { type: 'Dialog' | 'Window' | 'Popover' }) {
  const [open, setOpen] = useState(false)
  return <><div className="two-column-cards"><nb-card><h3>{type}</h3><p>Open an interactive {type.toLowerCase()} example.</p><button onClick={() => setOpen(true)}>OPEN {type.toUpperCase()}</button></nb-card><nb-card><h3>{type} with template</h3><p>Nebular-style overlay content and controls.</p><button className="basic-button" onClick={() => setOpen(true)}>OPEN TEMPLATE</button></nb-card></div>{open && <div className="modal-backdrop" onClick={() => setOpen(false)}><div className={`modal ${type.toLowerCase()}`} onClick={event => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => setOpen(false)}><X /></button><h2>{type} title</h2><p>This is a working {type.toLowerCase()} recreated in React.</p><Field label="Name" placeholder="Your name" /><button onClick={() => setOpen(false)}>SUBMIT</button></div></div>}</>
}

function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, index) => index < 3 ? '' : String(index - 2 <= 31 ? index - 2 : ''))
  return <nb-card className="calendar-card"><div className="calendar-head"><button><ChevronLeft /></button><h3>July 2026</h3><button><ChevronRight /></button></div><div className="calendar-week">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <b key={day}>{day}</b>)}</div><div className="calendar-days">{days.map((day, index) => <button key={index} className={day === '19' ? 'selected' : ''}>{day}</button>)}</div></nb-card>
}

function EchartsPage() {
  return <div className="two-column-cards"><nb-card className="demo-chart"><h3>Line Chart</h3><svg viewBox="0 0 500 240"><path d="M20 190 L90 130 L160 165 L230 75 L300 110 L370 45 L480 90" /></svg></nb-card><nb-card className="demo-chart bars"><h3>Bar Chart</h3><div>{[48,70,38,88,58,75,44].map((height,index) => <i key={index} style={{height:`${height}%`}} />)}</div></nb-card></div>
}

function TreeGridPage() {
  return <nb-card><h3>Tree Grid</h3><div className="tree-grid"><div><b>Project</b><b>Kind</b><b>Size</b></div>{[['▾ ngx-admin','Folder','4.2 MB'],['  ├ Dashboard','Page','1.3 MB'],['  ├ Forms','Page','920 KB'],['  └ Tables','Page','860 KB']].map(row => <div key={row[0]}><span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span></div>)}</div></nb-card>
}

function AuthPage({ type }: { type: PageName }) {
  return <div className="auth-page"><nb-card><h1>{type}</h1><p>{type === 'Login' ? 'Hello! Log in with your email.' : 'Enter your details below.'}</p><Field label="Email address" placeholder="Email address" />{type !== 'Request Password' && <Field label="Password" type="password" placeholder="Password" />}{type === 'Register' && <Field label="Confirm password" type="password" placeholder="Confirm password" />}<button>{type.toUpperCase()}</button></nb-card></div>
}

function PageContent({ page, theme }: { page: PageName; theme: ThemeName }) {
  if (page === 'IoT Dashboard') return <Dashboard theme={theme} />
  if (page === 'Form Layouts') return <FormLayouts />
  if (page === 'Datepicker') return <DatepickerPage />
  if (page === 'Toastr') return <ToastrPage />
  if (page === 'Tooltip') return <TooltipPage />
  if (page === 'Smart Table') return <SmartTable />
  if (page === 'Dialog' || page === 'Window' || page === 'Popover') return <OverlayDemo type={page} />
  if (page === 'Calendar') return <CalendarPage />
  if (page === 'Echarts') return <EchartsPage />
  if (page === 'Tree Grid') return <TreeGridPage />
  return <AuthPage type={page} />
}

function App() {
  const [page, setPage] = useState<PageName>(() => pathPages[window.location.pathname] ?? 'IoT Dashboard')
  const [theme, setTheme] = useState<ThemeName>('Light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigate = (nextPage: PageName) => {
    setPage(nextPage)
    window.history.pushState({}, '', pagePaths[nextPage])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handlePopState = () => setPage(pathPages[window.location.pathname] ?? 'IoT Dashboard')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return <div className="app-shell" data-theme={theme.toLowerCase()}>
    <Header theme={theme} setTheme={setTheme} toggleSidebar={() => setSidebarCollapsed(value => !value)} />
    <Sidebar active={page} navigate={navigate} collapsed={sidebarCollapsed} />
    <main className={sidebarCollapsed ? 'wide' : ''}><PageContent page={page} theme={theme} /><footer className="app-footer"><span>Created by <strong>Prateek Mishra</strong> 2026</span><span>◉ ◌ ◈ ◍</span></footer></main>
  </div>
}

export default App
