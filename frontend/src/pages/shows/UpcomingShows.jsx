import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../../styles/concert.css';

export default function UpcomingShows({ userId }) {
  const [concerts, setConcerts] = useState([]);
 

  useEffect(() => {
    axios.get("/api/upcoming_concerts")  
      .then(res => setConcerts(res.data))
      .catch(err => console.error("Error fetching upcoming concerts:", err));
  }, []);

  if (concerts.length === 0) return <p>No upcoming concerts found.</p>;

  return (
    <div>
      <h2>Upcoming Performances</h2>
      <div className="concert-list">
        {concerts.map((concert) => (
          <Link to={`/concerts/${concert.SHOW_ID}`} key={concert.SHOW_ID} className="concert-item">
            {concert.IMAGE_URL && (
              <img
                src={concert.IMAGE_URL}
                alt={concert.SHOW_NAME || "Concert image"}
                className="concert-image"
              />
            )}
            <h3>{concert.SHOW_NAME || "Unnamed"}</h3>
            <p>{concert.SHOW_LOCATION || "Unknown location"}</p>
            <p>{new Date(concert.SHOW_DATE).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}