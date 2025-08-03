import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../components/AuthContext';
import '../../styles/concert.css';

export default function ConcertDetails() {
  const { userId, admin } = useAuth();
  const { showId } = useParams();

  const [concert, setConcert] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // for preview uploaded image
  const today = new Date();
const availabilityOptions = [
  { label: "Yes", value: "YES" },
  { label: "Maybe", value: "MAYBE" },
  { label: "No", value: "NO" },
  { label: "I don't know", value: "IDK" },
];

const availabilityLabels = {
  NO: "No",
  MAYBE: "Maybe",
  YES: "Yes",
  IDK: "I don't know"
};
  useEffect(() => {
    axios.get(`/api/concerts/${showId}`)
      .then(res => {
        setConcert(res.data);
        setFormData(res.data);
        setImagePreview(null); // clear preview when concert loads
        console.log("concert.IMAGE_URL:", res.data.IMAGE_URL)
      })
      .catch(err => console.error("Error fetching concert:", err));
  }, [showId]);

  useEffect(() => {
    if (userId > 0 && concert && new Date(concert.SHOW_DATE) >= today) {
      setLoadingMembers(true);
      axios.get(`/api/shows/${showId}/members`)
        .then(res => setMembers(res.data))
        .catch(err => console.error("Error fetching members:", err))
        .finally(() => setLoadingMembers(false));
    }
  }, [userId, concert, showId]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Handle file input change for image upload
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG and PNG files are allowed.");
      e.target.value = null;
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, IMAGE_FILE: file }));
    };
    reader.readAsDataURL(file);
  }

  async function saveChanges() {
    try {
      const data = new FormData();

      // Append all form data except IMAGE_URL
      for (const [key, value] of Object.entries(formData)) {
        if (key === "IMAGE_FILE") continue; // skip image file for now
        data.append(key, value);
      }

      // Append image file if new one selected
      if (formData.IMAGE_FILE) {
        data.append("image", formData.IMAGE_FILE);
      }

      const res = await axios.put(`/api/concerts/${showId}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setConcert(res.data);
      setFormData(res.data);
      setImagePreview(null);
      setEditMode(false);
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    }
  }

  function handleSetAvailability(value) {
    setSelectedAvailability(value); // Only update front-end state
  }

  const handleConfirmAvailability = async () => {
    try {
      await axios.post(`/api/concerts/${showId}/availability`, {
        USER_ID: userId,
        MEMBER_AVAILABILITY: selectedAvailability,
      });
      alert("Availability confirmed!");
      window.location.reload()
    } catch (error) {
      console.error("Error confirming availability:", error);
      alert("Failed to confirm. Please try again.");
    }
  };


  function BackLink({ showDate }) {
    const concertDate = new Date(showDate);
    const path = concertDate >= today ? "/upcoming_concerts" : "/past_concerts";
    return <Link to={path}>← Back to all concerts</Link>;
  }

  if (!concert) return <p>Loading...</p>;

  const isFutureOrToday = new Date(concert.SHOW_DATE) >= today;

  return (
    <div>
      {admin && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "1rem" }}>
          {editMode && (
            <button onClick={() => setEditMode(false)} style={{ backgroundColor: "#ccc" }}>
              Cancel
            </button>
          )}
          <button onClick={() => (editMode ? saveChanges() : setEditMode(true))}>
            {editMode ? "Save" : "Edit"}
          </button>
        </div>
      )}
      <div>
      {editMode && <h2>Title:</h2>}
      <h1 className="concert-name">
        {editMode ? (
          <input
            type="text"
            name="SHOW_NAME"
            value={formData.SHOW_NAME || ""}
            onChange={handleInputChange}
            required
          />
        ) : (
          concert.SHOW_NAME
        )}
      </h1>

      {editMode && <h2>Description:</h2>}
      {editMode ? (
        <textarea
          name="SHOW_DESCRIPTION"
          value={formData.SHOW_DESCRIPTION || ""}
          onChange={handleInputChange}
          className="concert-info"
          rows={4}
        />
      ) : (
        concert.SHOW_DESCRIPTION && <p className="concert-info">{concert.SHOW_DESCRIPTION}</p>
      )}

      {editMode && <h2>Time:</h2>}
      <p className="concert-time">
        {editMode ? (
          <input
            type="time"
            name="SHOW_TIME"
            value={formData.SHOW_TIME || ""}
            onChange={handleInputChange}
          />
        ) : (
          concert.SHOW_TIME &&
          new Date(`1970-01-01T${concert.SHOW_TIME}`).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        )}
      </p>

      {editMode && <h2>Date:</h2>}
      <p className="concert-date">
        {editMode ? (
          <input
            type="date"
            name="SHOW_DATE"
            value={formData.SHOW_DATE ? formData.SHOW_DATE.split("T")[0] : ""}
            onChange={handleInputChange}
            required
          />
        ) : (
          new Date(concert.SHOW_DATE).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        )}
      </p>

      {editMode && <h2>Location:</h2>}
      <p className="concert-location">
        {editMode ? (
          <input
            type="text"
            name="SHOW_LOCATION"
            value={formData.SHOW_LOCATION || ""}
            onChange={handleInputChange}
          />
        ) : (
          concert.SHOW_LOCATION
        )}
      </p>

      {editMode && <h2>Image:</h2>}
      {editMode ? (
        <>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div style={{ marginTop: 10 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 300 }}
              />
            </div>
          )}
        </>
      ) : (
        concert.IMAGE_URL && (
          <a href={concert.YOUTUBE_LINK || "#"} target="_blank" rel="noopener noreferrer">
            <img
              src={concert.IMAGE_URL}
              alt={concert.SHOW_NAME}
              style={{ maxWidth: "100%", cursor: concert.YOUTUBE_LINK ? "pointer" : "default" }}
              title={concert.YOUTUBE_LINK ? "Watch on YouTube" : ""}
            />
          </a>
        )
      )}


      {editMode && <h2>YouTube Link:</h2>}
      {editMode ? (
        <input
          type="url"
          name="YOUTUBE_LINK"
          value={formData.YOUTUBE_LINK || ""}
          onChange={handleInputChange}
          placeholder="YouTube URL"
        />
      ) : (
        concert.YOUTUBE_LINK && (
          <p>
            <a href={concert.YOUTUBE_LINK} target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </a>
          </p>
        )
      )}
    </div>
      {isFutureOrToday && (
        userId > 0 ? (
          <div className="availability-section" style={{ marginTop: "2rem" }}>
            <h3>Set your availability for this event:</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="availability-buttons" style={{ display: "flex", gap: "0.5rem" }}>
                {availabilityOptions.map(({ label, value }) => (
                  <button
                    key={label} // use enum value as key
                    className={`availability-button ${selectedAvailability === value ? "selected" : ""}`}
                    onClick={() => handleSetAvailability(value)} // pass enum value internally
                    style={{ height: "36px" }}
                  >
                    {label} {/* display label */}
                  </button>
                ))}
              </div>
              
              <button
                className="confirm-button"
                onClick={handleConfirmAvailability}
                style={{ height: "36px" }} // Match availability buttons height
              >
                Confirm
              </button>
            </div>

            {loadingMembers && <p>Loading members...</p>}
            {!loadingMembers && members.length === 0 && <p>No members found.</p>}

            {!loadingMembers && members.length > 0 && (
            <table className="availability-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.USER_ID}>
                    <td>{member.MEMBER_NAME}</td>
                    <td>
                      <span className={`availability-status ${member.MEMBER_AVAILABILITY?.toLowerCase() || "unavailable"}`}>
                        {availabilityLabels[member.MEMBER_AVAILABILITY] || "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <Link to="/login">
              <button className="login-button">Log in to set availability</button>
            </Link>
          </div>
        )
      )}

      <BackLink showDate={concert.SHOW_DATE} />
    </div>
  );
}