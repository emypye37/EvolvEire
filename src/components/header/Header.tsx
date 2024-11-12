import React, { useState } from "react";
import "./Header.css";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className='header'>
      <h1>EvolvEire</h1>
      <h4>Irish Rail Through Time...</h4>
      <button className='hamburger' onClick={toggleSidebar}>
        &#9776;
      </button>
      {isSidebarOpen && (
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <h2>
            Welcome to EvolvEire, an interactive exploration of Ireland's rail
            network through history
          </h2>
          <h3>How it Works</h3>
          <p>
            - Use the sliding timeline to explore routes in various years, from
            1846 to current day
          </p>
          <p>
            - Search for a location to see what routes were close to you and
            perhaps should be again!
          </p>
          <p>
            - Hover over the features to find out the name of the route and
            years of operation
          </p>
        </div>
      )}
    </div>
  );
};

export default Header;
