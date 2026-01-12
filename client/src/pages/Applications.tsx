/**
 * Applications Page
 * Track job applications
 */

export default function Applications() {
  return (
    <div>
      <h1>Applications</h1>
      <p className="text-muted">Track your job applications</p>

      <div className="mt-4">
        <div className="card">
          <h3>No Applications Yet</h3>
          <p className="text-muted mt-2">
            Start applying to jobs to track them here.
          </p>
        </div>
      </div>
    </div>
  );
}
