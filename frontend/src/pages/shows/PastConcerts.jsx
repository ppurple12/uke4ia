import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../../styles/concert_list.css';


const PastConcertsPage = () => {
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    axios.get("/api/past_concerts")
      .then(res => setConcerts(res.data || []))
      .catch(err => {
        console.error("Failed to fetch past concerts:", err);
        setConcerts([]);
      });
  }, []);

return (
  <div>
    <h2>Past Performances</h2>
    {concerts.length === 0 && <p>No past concerts found.</p>}
    <div className="concert-list two-per-row">
      {concerts.map((concert) => (
        <div key={concert.SHOW_ID}>
          <Link className="concert-item" to={`/concerts/${concert.SHOW_ID}`}>
            {concert.SHOW_NAME || "Unnamed"} - {new Date(concert.SHOW_DATE).toLocaleDateString()}
            {concert.SHOW_LOCATION ? ` - ${concert.SHOW_LOCATION}` : ""}
          </Link>
        </div>
      ))}
    </div>
  </div>
);
};

export default PastConcertsPage;