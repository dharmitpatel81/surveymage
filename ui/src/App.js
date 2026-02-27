import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import SurveyDesigner from './components/SurveyDesigner';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <NavBar />
        <SurveyDesigner />
      </div>
    </AuthProvider>
  );
}

export default App;