import React, { useState } from 'react';
import api from '../../api';

function SearchHotels() {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [people, setPeople] = useState('');
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('/search', { params: { destination, dates, people } });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching hotels', error);
      alert('Error searching hotels');
    }
  };

  return (
    <div>
      <h1>Search Hotels</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Destination</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <div>
          <label>Dates</label>
          <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} />
        </div>
        <div>
          <label>People</label>
          <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} />
        </div>
        <button type="submit">Search</button>
      </form>
      <div>
        <h2>Results</h2>
        <ul>
          {results.map((hotel) => (
            <li key={hotel.id}>{hotel.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchHotels;
