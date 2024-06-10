import React, { useState } from 'react';
import api from '../../api';

function AddRoom() {
  const [roomId, setRoomId] = useState('');
  const [roomDetails, setRoomDetails] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/add-room', { roomId, roomDetails });
      alert('Room added/updated successfully');
    } catch (error) {
      console.error('Error adding/updating room', error);
      alert('Error adding/updating room');
    }
  };

  return (
    <div>
      <h1>Add/Update Room</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room ID</label>
          <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        </div>
        <div>
          <label>Room Details</label>
          <textarea value={roomDetails} onChange={(e) => setRoomDetails(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddRoom;
