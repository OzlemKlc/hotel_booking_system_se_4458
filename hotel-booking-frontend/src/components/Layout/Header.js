import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/search">Search Hotels</Link></li>
          <li><Link to="/admin/add-room">Add Room</Link></li>
          <li><Link to="/book">Book Hotel</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
