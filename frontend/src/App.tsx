import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AgentsPage } from './pages/AgentsPage';
import { LogsPage } from './pages/LogsPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="deployments" element={<DeploymentsPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
