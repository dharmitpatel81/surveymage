import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SurveyDesigner from './components/SurveyDesigner';
import SurveyList from './components/SurveyList';
import SurveyViewer from './components/SurveyViewer';
import DashboardDesigner from './components/DashboardDesigner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <div className="App flex-1 flex flex-col page-bg-teal">
            <Routes>
              <Route path="/" element={<SurveyList />} />
              <Route path="/survey/new" element={<SurveyDesigner />} />
              <Route path="/survey/:id/analytics" element={<DashboardDesigner />} />
              <Route path="/survey/:id" element={<SurveyDesigner />} />
              <Route path="/s/:survey_id" element={<SurveyViewer />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;