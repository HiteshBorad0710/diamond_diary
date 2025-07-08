import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faDiamond } from '@fortawesome/free-solid-svg-icons';

const Header = ({ activeMenu, handleMenuClick, onLogout, userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileScreen(window.innerWidth <= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-header">
      <div className="header-content">
        <style>
          {`
            .app-title {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: 20px;
            }
            .logo {
              width: 80px;
              height: 50px;
              margin: 0;
              vertical-align: middle;
            }
            .user-email {
              font-size: 14px;
              color: #fff;
              font-weight: 500;
              margin: 0;
              display: block;
            }
          `}
        </style>
        <div className="header-left">
          <div className="app-title">
            <div className="logo-email-container">
              <FontAwesomeIcon icon={faDiamond} className="diamond-icon" />
              <img src="/images/clipart-diamond-rock-6.png" alt="Logo" className="logo" />
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          {isMobileScreen && (
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
        </div>
        <nav className={`header-nav ${isMobileMenuOpen ? 'menu-visible' : ''}`} style={{ display: isMobileScreen ? (isMobileMenuOpen ? 'block' : 'none') : 'block' }}>
          <ul className="nav-list">
            <li 
              className={activeMenu === 'add' ? 'active' : ''}
              onClick={() => handleMenuClick('add')}
            >
              Add Diamond
            </li>
            <li 
              className={activeMenu === 'diamonds' ? 'active' : ''}
              onClick={() => handleMenuClick('diamonds')}
            >
              View Diamond
            </li>
            <li 
              className={activeMenu === 'totals' ? 'active' : ''}
              onClick={() => handleMenuClick('totals')}
            >
              Monthly Totals
            </li>
            <button 
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
