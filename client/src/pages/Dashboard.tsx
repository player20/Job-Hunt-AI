/**
 * Dashboard Page
 * Main overview page with statistics and quick actions
 */

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p className="text-muted">Welcome to Job Hunt AI</p>

      <div className="mt-4">
        <div className="card">
          <h2>Quick Stats</h2>
          <p className="text-muted mt-2">
            Upload a resume and start searching for jobs to see your application statistics here.
          </p>
        </div>
      </div>
    </div>
  );
}
