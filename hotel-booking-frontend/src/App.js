import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddRoom from './components/Admin/AddRoom';
import BookHotel from './components/Booking/BookHotel';
import SearchHotels from './components/Search/SearchHotels';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/admin/add-room" element={<AddRoom />} />
        <Route path="/book" element={<BookHotel />} />
        <Route path="/search" element={<SearchHotels />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<SearchHotels />} />
      </Routes>
    </div>
  );
}

export default App;

