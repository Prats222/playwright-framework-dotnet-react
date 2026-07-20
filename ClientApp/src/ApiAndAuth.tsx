import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Code2, LogOut, Play, ShieldCheck, UserRound } from 'lucide-react'

export type SessionUser = { id: string; name: string; email: string }
export type AuthScreen = 'Login' | 'Register' | 'Request Password' | 'Reset Password'

type Navigate = (page: 'IoT Dashboard' | 'Login' | 'Register' | 'Request Password' | 'Reset Password' | 'Account') => void

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

export function AuthPage({ type, onAuthenticated, navigate }: {
  type: AuthScreen
  onAuthenticated: (user: SessionUser) => void
  navigate: Navigate
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState(type === 'Login' ? 'prateek@automation.pm' : '')
  const [password, setPassword] = useState(type === 'Login' ? 'Playwright@2026' : '')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (type === 'Register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const route = type === 'Login' ? 'login' : type === 'Register' ? 'register' : type === 'Request Password' ? 'request-password' : 'reset-password'
      const body = type === 'Register' ? { name, email, password } : type === 'Reset Password' ? { email, newPassword: password } : { email, password }
      const response = await fetch(`/api/auth/${route}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await readJson(response)
      if (!response.ok) throw new Error(data?.message ?? data?.title ?? 'The request could not be completed.')
      if (type === 'Login' || type === 'Register') {
        onAuthenticated(data as SessionUser)
        navigate('Account')
      } else {
        setMessage(data?.message ?? 'Request completed successfully.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unexpected error.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="auth-page"><nb-card className="auth-card">
    <div className="auth-icon"><ShieldCheck /></div>
    <h1>{type}</h1>
    <p>{type === 'Login' ? 'Sign in to access the protected account area.' : 'Enter your details below.'}</p>
    {type === 'Login' && <div className="demo-credentials"><strong>Demo account</strong><span>prateek@automation.pm</span><span>Playwright@2026</span></div>}
    <form onSubmit={submit}>
      {type === 'Register' && <label className="field"><span>Full name</span><input aria-label="Full name" value={name} onChange={event => setName(event.target.value)} required /></label>}
      <label className="field"><span>Email address</span><input type="email" aria-label="Email address" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      {type !== 'Request Password' && <label className="field"><span>{type === 'Reset Password' ? 'New password' : 'Password'}</span><input type="password" aria-label={type === 'Reset Password' ? 'New password' : 'Password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} required /></label>}
      {type === 'Register' && <label className="field"><span>Confirm password</span><input type="password" aria-label="Confirm password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required /></label>}
      {error && <div role="alert" className="auth-message error">{error}</div>}
      {message && <div role="status" className="auth-message success">{message}</div>}
      <button type="submit" disabled={submitting}>{submitting ? 'PLEASE WAIT...' : type.toUpperCase()}</button>
    </form>
    <div className="auth-links">
      {type !== 'Login' && <button onClick={() => navigate('Login')}>Back to login</button>}
      {type === 'Login' && <><button onClick={() => navigate('Register')}>Create account</button><button onClick={() => navigate('Request Password')}>Forgot password?</button></>}
    </div>
  </nb-card></div>
}

export function AccountPage({ user, onLogout, navigate }: { user: SessionUser | null; onLogout: () => void; navigate: Navigate }) {
  if (!user) return <div className="auth-page"><nb-card className="auth-card protected-card"><ShieldCheck /><h1>Protected account</h1><p>You must sign in before this content is available.</p><button onClick={() => navigate('Login')}>GO TO LOGIN</button></nb-card></div>

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    onLogout()
    navigate('Login')
  }
  return <div className="account-page"><nb-card>
    <div className="account-banner"><UserRound /><div><small>AUTHENTICATED SESSION</small><h1>Welcome, {user.name}</h1><p>{user.email}</p></div></div>
    <div className="session-details"><div><CheckCircle2 /><span><strong>HttpOnly cookie</strong>Browser-managed session</span></div><div><ShieldCheck /><span><strong>Protected API</strong>/api/auth/me verified</span></div></div>
    <button className="logout-button" onClick={logout}><LogOut /> LOG OUT</button>
  </nb-card></div>
}

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type ApiRequest = { label: string; method: ApiMethod; path: string; body?: string; saveJwt?: boolean; useJwt?: boolean }

const requests: ApiRequest[] = [
  { label: 'Health check', method: 'GET', path: '/api/health' },
  { label: 'Generate JWT', method: 'POST', path: '/api/auth/token', saveJwt: true, body: '{\n  "email": "prateek@automation.pm",\n  "password": "Playwright@2026"\n}' },
  { label: 'JWT protected profile', method: 'GET', path: '/api/auth/jwt-profile', useJwt: true },
  { label: 'Missing JWT (401)', method: 'GET', path: '/api/auth/jwt-profile' },
  { label: 'List products', method: 'GET', path: '/api/products' },
  { label: 'Find smart products', method: 'GET', path: '/api/products?search=smart' },
  { label: 'Missing product (404)', method: 'GET', path: '/api/products/99999' },
  { label: 'Create product', method: 'POST', path: '/api/products', body: '{\n  "name": "Jaipur Smart Plug",\n  "category": "Home Automation",\n  "price": 1799,\n  "inStock": true\n}' },
  { label: 'Replace product', method: 'PUT', path: '/api/products/1', body: '{\n  "name": "Smart Bulb Pro",\n  "category": "Home Automation",\n  "price": 1599,\n  "inStock": true\n}' },
  { label: 'Update stock only', method: 'PATCH', path: '/api/products/2', body: '{\n  "inStock": false\n}' },
  { label: 'Delete product', method: 'DELETE', path: '/api/products/3' },
]

export function ApiTestingPage() {
  const [selected, setSelected] = useState(1)
  const [status, setStatus] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [body, setBody] = useState('Click SEND REQUEST to call the ASP.NET Core API.')
  const [requestBody, setRequestBody] = useState(requests[1].body ?? '')
  const [jwtToken, setJwtToken] = useState('')
  const [contentType, setContentType] = useState('--')
  const [loading, setLoading] = useState(false)
  const request = requests[selected]

  const send = async () => {
    setLoading(true)
    const started = performance.now()
    try {
      let parsedBody: unknown
      if (requestBody.trim()) {
        try { parsedBody = JSON.parse(requestBody) }
        catch { throw new Error('Request body is not valid JSON.') }
      }
      const headers: Record<string, string> = {}
      if (parsedBody) headers['Content-Type'] = 'application/json'
      if (request.useJwt && jwtToken) headers.Authorization = `Bearer ${jwtToken}`
      const response = await fetch(request.path, {
        method: request.method,
        credentials: 'include',
        headers,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined,
      })
      setStatus(response.status)
      setContentType(response.headers.get('content-type')?.split(';')[0] ?? '(none)')
      const data = await readJson(response)
      if (response.ok && request.saveJwt && data?.accessToken) setJwtToken(data.accessToken)
      setBody(data === null ? '(empty response)' : JSON.stringify(data, null, 2))
    } catch (reason) {
      setStatus(0)
      setBody(reason instanceof Error ? reason.message : 'Network error')
    } finally {
      setDuration(Math.round(performance.now() - started))
      setLoading(false)
    }
  }

  useEffect(() => {
    setStatus(null)
    setDuration(null)
    setContentType('--')
    setRequestBody(request.body ?? '')
    setBody('Click SEND REQUEST to call the ASP.NET Core API.')
  }, [selected, request])

  return <div className="api-page">
    <div className="page-title"><div><Code2 /><span><h1>API Testing Playground</h1><p>Send real requests to the ASP.NET Core backend and inspect status, timing, headers, and JSON.</p></span></div></div>
    <div className="api-layout"><nb-card className="request-library"><h3>Request library</h3>{requests.map((item, index) => <button key={item.label} className={selected === index ? 'active' : ''} onClick={() => setSelected(index)}><span className={`method-badge method-${item.method.toLowerCase()}`}>{item.method}</span><span>{item.label}<small>{item.path}</small></span></button>)}</nb-card>
      <nb-card className="api-console"><div className="request-bar"><span className={`method-badge method-${request.method.toLowerCase()}`}>{request.method}</span><code>{request.path}</code><button onClick={send} disabled={loading}><Play />{loading ? 'SENDING...' : 'SEND REQUEST'}</button></div>
        {request.body !== undefined && <div className="request-body"><div><h3>Request body</h3><span>application/json</span></div><textarea aria-label="JSON request body" spellCheck={false} value={requestBody} onChange={event => setRequestBody(event.target.value)} /></div>}
        {(request.saveJwt || request.useJwt) && <div className="jwt-editor"><div><h3>Bearer token</h3><span>{jwtToken ? 'Captured - editable for negative testing' : 'Generate a JWT first'}</span></div><textarea aria-label="JWT Bearer token" spellCheck={false} placeholder="The generated access token will appear here" value={jwtToken} onChange={event => setJwtToken(event.target.value)} /></div>}
        <div className="response-meta"><span>Status <strong className={status && status < 400 ? 'ok' : 'bad'}>{status ?? '--'}</strong></span><span>Time <strong>{duration === null ? '--' : `${duration} ms`}</strong></span><span>Content <strong>{contentType}</strong></span></div>
        <div className="response-heading"><h3>Response body</h3><span>ASP.NET Core Minimal API</span></div><pre aria-label="API response">{body}</pre>
      </nb-card></div>
  </div>
}
