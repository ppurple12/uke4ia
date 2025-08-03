import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PastConcerts from "./pages/shows/PastConcerts"
import UpcomingShows from "./pages/shows/UpcomingShows"
import Show from "./pages/shows/Show"
import MemberView from "./pages/MemberView"
import CreatePost from "./pages/CreatePost"
import Post from "./pages/Post"
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./components/AuthContext"; // or correct path

function App() {
  const { userId } = useAuth();

  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home userId={userId} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/past_concerts" element={<PastConcerts userId={userId} />}/>
            <Route path="/upcoming_concerts" element={<UpcomingShows userId={userId} />}/>
            <Route path="/view_members" element={<MemberView userId={userId} />}/>
            <Route path="/concerts/:showId" element={<Show userId={userId} />}/>
            <Route path="/add_post" element={<CreatePost userId={userId} />}/>
            <Route path="/posts/:postId" element={<Post userId={userId} />}/>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;