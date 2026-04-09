import { useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import LoanForm from './components/LoanForm';
import DecisionResult from './components/DecisionResult';
import { submitApplication, requestDecision } from './services/api';

export default function App() {
  const [view, setView] = useState('form'); // 'form' | 'result'
  const [isLoading, setIsLoading] = useState(false);
  const [decision, setDecision] = useState(null);

  const pendingAppId = useRef(null);

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      let applicationId = pendingAppId.current;

      if (!applicationId) {
        const appRes = await submitApplication(formData);
        applicationId = appRes.data.applicationId;
        pendingAppId.current = applicationId;
      }

      const decRes = await requestDecision(applicationId);
      pendingAppId.current = null;
      setDecision(decRes.data);
      setView('result');
    } catch (err) {
      const details = err.response?.data?.error?.details;
      const message =
        (Array.isArray(details) && details.length > 0 && details[0].message) ||
        err.response?.data?.error?.message ||
        'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    pendingAppId.current = null;
    setDecision(null);
    setView('form');
  }

  return (
    <div className="min-h-screen bg-surface">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#404969',
            border: '1px solid rgba(29, 53, 87, 0.12)',
            boxShadow: '0 10px 40px rgba(29, 53, 87, 0.08)',
          },
          error: {
            iconTheme: { primary: '#EC224E', secondary: '#FFFFFF' },
          },
        }}
      />

      <header className="bg-primary text-white border-b border-primary-dark/30">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-accent"
              aria-hidden
            >
              C
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Credit Scorecard</h1>
              <p className="text-sm text-white/75 mt-0.5">
                MSME Lending Decision System
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {view === 'form' && (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-xl font-semibold text-primary">
                Loan Application
              </h2>
              <p className="text-ink/80 mt-1.5 max-w-md mx-auto">
                Fill in your business details and loan requirements below.
              </p>
            </div>
            <LoanForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        )}

        {view === 'result' && decision && (
          <DecisionResult decision={decision} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
