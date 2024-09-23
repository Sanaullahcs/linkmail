
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailPage from '../page/emailPage/EmailPage';
import MainPage from '../page/MainPage/MainPage';
import EmailHistory from '../page/emailHistory/EmailHistory';

export default function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/email" element={<EmailPage />} />
        <Route path='/emailHistory' element={<EmailHistory/>}/>
      </Routes>
    </Router> 
  );
}