import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SurveyDesigner from './components/SurveyDesigner';
import SurveyList from './components/SurveyList';
import SurveyViewer from './components/SurveyViewer';
import DashboardDesigner from './components/DashboardDesigner';
import NotFound from './components/NotFound';
import Privacy from './components/Privacy';
import Terms from './components/Terms';

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <NavBar />
              <div className="App flex-1 flex flex-col page-bg-teal">
                <Routes>
                  <Route path="/" element={<SurveyList />} />
                  <Route path="/survey/:id/analytics" element={<DashboardDesigner />} />
                  <Route path="/survey/:id" element={<SurveyDesigner />} />
                  <Route path="/s/:survey_id" element={<SurveyViewer />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;