export default function Home() {
  return (
    <main style={{padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <h1>FinTrack</h1>
      <p>Welcome! Backend is already running in Kubernetes.</p>
      <ul>
        <li><a href="/api/actuator/health" target="_blank">API Gateway Health</a></li>
        <li><a href="/users/actuator/health" target="_blank">Users Service</a></li>
        <li><a href="/transactions/actuator/health" target="_blank">Transactions Service</a></li>
        <li><a href="/alerts/actuator/health" target="_blank">Alerts Service</a></li>
        <li><a href="/reports/actuator/health" target="_blank">Reports Service</a></li>
      </ul>
      <p style={{marginTop:16,opacity:.7}}>
        Note: these links work once an Ingress routes <code>/api</code>, <code>/users</code>, etc.
      </p>
    </main>
  );
}
