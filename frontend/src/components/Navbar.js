import React, { useContext, useEffect, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function Navbar() {
  let location = useLocation();
  // let navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { isLoggedIn, userId, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    // window.location.reload();
    toast.success("Logged out successfully! See you soon.", {
      onClose: () => {
        window.location.href = "/";
      },
    });
    // navigate("/login");
  };

  const fetchCurrentUser = useCallback(
    async (currentUserId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/getuser/${currentUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch current user data");
        }

        const resp = await response.json();
        setCurrentUser(resp);
      } catch (error) {
        console.error("Failed to fetch creator data", error);
      }
    },
    []
  );

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchCurrentUser(userId);
    }
  }, [isLoggedIn, userId, fetchCurrentUser]);

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#0C0C0C", padding: "20px" }}
      >
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            RSVP
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/about" ? "active" : ""
                  }`}
                  to="/about"
                >
                  About
                </Link>
              </li>
            </ul>
            {
              !isLoggedIn ? (
                <form className="d-flex" role="search">
                  <Link
                    className="btn btn-light mx-2"
                    to="/login"
                    role="button"
                  >
                    Login
                  </Link>
                  <Link
                    className="btn btn-outline-light mx-2"
                    to="/signup"
                    role="button"
                  >
                    SignUp
                  </Link>
                </form>
              ) : (
                <div className="dropdown">
                  {currentUser && currentUser.displayPicture ? (
                    <img
                      src={currentUser.displayPicture}
                      alt="Display Picture"
                      className="user-display-picture dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    />
                  ) : (
                    // You can add a placeholder image or loading spinner here
                    <div
                      className="placeholder-image dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {/* Add placeholder content */}
                    </div>
                  )}
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li className="dropdown-item-top">
                      <img
                        src={currentUser?.displayPicture}
                        alt="User"
                        className="dropdown-user-picture"
                      />
                      <div className="dropdown-user-info">
                        <strong>{currentUser?.name || "User"}</strong>
                        <span>{currentUser?.email || "—"}</span>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/createEvent"
                      >
                        <img className="dropdown-icon" src="/images/create.png" alt="create-event" />
                        Create a new event
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to={userId ? `/profile/${userId}` : '#'}
                      >
                        <img className="dropdown-icon" src="/images/user.png" alt="user-profile" />
                        View profile
                      </Link>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleLogout}
                      >
                        <img className="dropdown-icon" src="/images/logout.png" alt="log-out" />
                        Log out
                      </a>
                    </li>
                  </ul>
                </div>
              )
            }
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
