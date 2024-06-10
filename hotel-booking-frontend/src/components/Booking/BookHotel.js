import React, { useState } from 'react';
import api from '../../api';

function BookHotel() {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [dates, setDates] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/book', { roomId, userId, dates });
      alert('Hotel booked successfully');
    } catch (error) {
      console.error('Error booking hotel', error);
      alert('Error booking hotel');
    }
  };

  return (
    <div>
      <h1>Book Hotel</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room ID</label>
          <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        </div>
        <div>
          <label>User ID</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div>
          <label>Dates</label>
          <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default BookHotel;
