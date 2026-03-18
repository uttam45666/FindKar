const ErrorPage = ({
  title = 'Something went wrong',
  message = 'An unexpected issue occurred. Please try again in a moment.',
  requestId,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-card p-8 md:p-10 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center font-bold text-lg mb-5">!</div>
        <h1 className="font-heading text-2xl md:text-3xl text-dark font-bold">{title}</h1>
        <p className="mt-3 text-muted leading-relaxed">{message}</p>

        {requestId ? (
          <p className="mt-4 text-xs text-muted/80">
            Reference ID: <span className="font-mono text-dark/80">{requestId}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onRetry || (() => window.location.reload())} className="btn-primary">Try again</button>
          <button onClick={() => (window.location.href = '/login')} className="btn-secondary">Go to login</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
