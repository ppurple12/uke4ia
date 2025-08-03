
import { Mail, Facebook} from 'lucide-react';
import '../styles/app.css';

export default function Footer() {
  return (
    <footer className="footer-section">
   
        <div className="social-links">
          <a href="mailto:EMAIL-HERE?subject=Message from uke4ia webpage" target="_blank" rel="noopener noreferrer">
            <Mail size={45} color="white" className = "social-link" />
          </a>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Facebook  color= "white" alt="facebook link will be here" size={24} className = "social-link" />
          </a>
        </div>
           <div>
          <p className="footer-note">From North Bay, Ontario, Canada</p>
          <p className="footer-note">© 2025 All Rights Reserved</p>
        </div>

    </footer>
  );
}