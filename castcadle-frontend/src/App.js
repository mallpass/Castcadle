import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

window.process = { env: { NODE_ENV: 'development' } };

function App() {
  // State declarations
  const [userId, setUserId] = useState(null);
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [gameStatus, setGameStatus] = useState("INCOMPLETE"); // "INCOMPLETE", "PASS", or "FAIL"
  const [userGameData, setUserGameData] = useState(null);
  const [correctPerson, setCorrectPerson] = useState(null); // For the flipping image
  const inputRef = useRef(null);

  const categories = ["gender", "collegeGrad", "brainRot", "birthYear", "height", "domainExpansion"];
  const displayLabels = ["Gender", "Degree", "Brairot", "Birthyear", "Height", "Domain Expansion"];

  const imageMap = {
    "Matthew": "/images/Matt.jpg",
    "Ben": "/images/Ben.jpg",
    "Gabe": "/images/Gabe.jpg",
    "Jack": "/images/Jack.jpg",
    "Mac": "/images/Mac.jpg",
    "Max": "/images/Max.jpg",
    "Scarlet": "/images/Scarlet.jpg",
    "Suzuki": "/images/Suzuki.jpg",
    "Thor": "/images/Thor.jpg",
    "Turner": "/images/Turner.jpg"
  };

  // 1. Set or generate userId
  useEffect(() => {
    let storedUserId = localStorage.getItem('castcadleUserId');
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('castcadleUserId', storedUserId);
    }
    setUserId(storedUserId);
    console.log('User ID:', storedUserId);
  }, []);

  // 2. Fetch list of people from backend
  useEffect(() => {
    axios.get('http://localhost:8080/api/people')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPeople(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setPeople([]);
        }
      })
      .catch((error) => console.error('Error fetching people:', error));
  }, []);

  // 3. Fetch user game data for calendar display and game state whenever userId changes
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8080/api/user-data?userId=${userId}`)
        .then(response => {
          setUserGameData(response.data);
        })
        .catch(error => console.error("Error fetching user game data:", error));
    }
  }, [userId]);

  // 4. When userGameData is loaded, update gameStatus and pre-populate today's feedback if available
  useEffect(() => {
    if (userGameData) {
      const today = new Date();
      const todayResult = userGameData.gameHistory.find(entry => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === today.getFullYear() &&
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getDate() === today.getDate()
        );
      });
      if (todayResult) {
        setGameStatus(todayResult.status);
        // Pre-populate feedbackRows with stored guesses (all marked as flipped)
        if (todayResult.guesses && todayResult.guesses.length > 0) {
          const preFeedbackRows = todayResult.guesses.map(guess => ({
            name: guess.name,
            feedback: guess.feedback,
            flipped: true
          }));
          setFeedbackRows(preFeedbackRows);
        }
      } else if (userGameData.guessesLeft === 0) {
        setGameStatus("FAIL");
      }
    }
  }, [userGameData]);

  // 5. Fetch correct person data if game is over
  useEffect(() => {
    if (gameStatus !== "INCOMPLETE") {
      axios.get('http://localhost:8080/api/correct-person')
        .then(response => {
          setCorrectPerson(response.data);
        })
        .catch(error => console.error("Error fetching correct person:", error));
    }
  }, [gameStatus]);

  // 6. Filter the people list based on search term
  useEffect(() => {
    setFilteredPeople(
      people.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, people]);

  // 7. Hide dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (name) => {
    setSelectedPerson(name);
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!selectedPerson) {
      alert('Please select a person to guess!');
      return;
    }
    if (gameStatus !== "INCOMPLETE") {
      alert("The game is already over!");
      return;
    }
    const currentUserId = userId || localStorage.getItem('castcadleUserId');
    if (!currentUserId) {
      alert("User ID is not ready yet, please try again later.");
      return;
    }
    console.log("Submitting guess with userId:", currentUserId);

    axios.post('http://localhost:8080/api/guess', { userId: currentUserId, name: selectedPerson })
      .then((response) => {
        // Append this new guess to feedbackRows (flip animation will occur)
        setFeedbackRows((prevRows) => [
          ...prevRows,
          { name: selectedPerson, feedback: response.data, flipped: false }
        ]);
        if (response.data.gameStatus) {
          setGameStatus(response.data.gameStatus);
        }
        setTimeout(() => {
          setFeedbackRows((prevRows) =>
            prevRows.map((row, idx) =>
              idx === prevRows.length - 1 ? { ...row, flipped: true } : row
            )
          );
        }, 500);
        setSelectedPerson('');
        setSearchTerm('');
        axios.get(`http://localhost:8080/api/user-data?userId=${currentUserId}`)
          .then(response => {
            setUserGameData(response.data);
          })
          .catch(error => console.error("Error fetching user game data:", error));
      })
      .catch((error) => console.error('Error submitting guess:', error));
  };

  return (
    <div style={styles.container}>
      {/* Header and Pulsing Text */}
      <h1 style={styles.h1}>Castcadle</h1>
      <p className="pulsing-text" style={styles.p}>
        A daily guessing game featuring Castcade Ct. key holders!
      </p>

      {/* Mystery Person Flip Container */}
      <div className="flip-container" style={styles.flipContainer}>
        <div className={`flipper ${gameStatus !== "INCOMPLETE" ? "flipped" : ""}`} style={styles.flipper}>
          <div className="front" style={styles.front}>
            <img src="/images/Question.jpg" alt="Mystery Person" style={styles.mysteryImage} />
          </div>
          <div className="back" style={styles.back}>
            {correctPerson ? (
              <img src={correctPerson.imageUrl} alt={correctPerson.name} style={styles.mysteryImage} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Display Game Status Message */}
      {gameStatus === "PASS" && <h2 style={{ color: 'lightgreen' }}>Congratulations! You Won!</h2>}
      {gameStatus === "FAIL" && <h2 style={{ color: 'red' }}>Game Over! You've used all your guesses.</h2>}

      {/* Guesses Remaining */}
      {userGameData && (
        <div style={styles.guessesRemaining}>
          Guesses remaining: {userGameData.guessesLeft}
        </div>
      )}

      {/* Search Bar and Dropdown */}
      <div ref={inputRef} style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for a person"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(e.target.value !== '');
          }}
          onFocus={() => setShowDropdown(searchTerm !== '')}
          style={styles.searchBar}
          disabled={gameStatus !== "INCOMPLETE"}
        />
        {showDropdown && (
          <ul style={styles.dropdown}>
            {filteredPeople.length > 0 ? (
              filteredPeople.map((name) => (
                <li
                  key={name}
                  onClick={() => handleSelect(name)}
                  style={styles.dropdownItem}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  {imageMap[name] && (
                    <img src={imageMap[name]} alt={name} style={styles.dropdownImage} />
                  )}
                  <span style={styles.name}>{name}</span>
                </li>
              ))
            ) : (
              <li style={styles.noMatch}>No matches found</li>
            )}
          </ul>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!userId || gameStatus !== "INCOMPLETE"}
        style={styles.submitButton}
      >
        Submit Guess
      </button>

      {/* Category Labels */}
      {feedbackRows.length > 0 && (
        <div style={styles.categoryLabels}>
          {displayLabels.map((label, index) => (
            <div key={index} style={styles.label}>
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Rows */}
      <div>
        {feedbackRows.map((row, index) => (
          <div key={index} style={styles.feedbackContainer}>
            <img src={imageMap[row.name]} alt={row.name} style={styles.guessImage} />
            {categories.map((category, idx) => (
              <div
                key={idx}
                className={`feedback-square ${row.flipped ? 'flipped' : ''}`}
                style={{
                  ...styles.feedbackSquare,
                  backgroundColor: row.flipped
                    ? (row.feedback[category] === "Green" ? "green" : "red")
                    : "gray"
                }}
              >
                {/* Test: For gender, always display an up arrow */}
                
                {row.flipped && (category === "birthYear" || category === "height") && (
                  row.feedback[category] === "Red↑" ? (
                    <span style={styles.arrow}>&uarr;</span>
                  ) : row.feedback[category] === "Red↓" ? (
                    <span style={styles.arrow}>&darr;</span>
                  ) : null
                )}
                {row.flipped && category === "brainRot" && row.feedback[category] && row.feedback[category].startsWith("Red:") && (
                  <span style={styles.brainRotText}>
                    {row.feedback[category].substring(4)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Calendar Component */}
      {userGameData && <Calendar gameHistory={userGameData.gameHistory} />}

      {/* Inline CSS for Flip Animation and other classes */}
      <style>
        {`
          .flip-container {
            perspective: 1000px;
            margin-bottom: 20px;
          }
          .flipper {
            position: relative;
            width: 150px;
            height: 150px;
            transition: 0.6s;
            transform-style: preserve-3d;
          }
          .flipper.flipped {
            transform: rotateY(180deg);
          }
          .front, .back {
            position: absolute;
            width: 150px;
            height: 150px;
            backface-visibility: hidden;
          }
          .back {
            transform: rotateY(180deg);
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.09); }
            100% { transform: scale(1); }
          }
          .pulsing-text {
            animation: pulse 2s infinite ease-in-out;
            display: inline-block;
          }
          .dropdown {
            position: absolute;
            top: 40px;
            left: 0;
            width: 100%;
            border: 1px solid #ccc;
            background-color: white;
            list-style-type: none;
            padding: 0;
            margin: 0;
            z-index: 1000;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          }
          .feedback-square {
            width: 50px;
            height: 50px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
            position: relative;
          }
          .feedback-square.flipped {
            transform: rotateY(180deg);
          }
          .feedback-square::before,
          .feedback-square::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 5px;
          }
          
        `}
      </style>
    </div>
  );
}

// Calendar Component
function Calendar({ gameHistory }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();

  const days = [];
  const startDayOfWeek = firstDay.getDay(); // Sunday as 0
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= numDays; d++) {
    days.push(new Date(year, month, d));
  }

  const getGameStatusForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const result = gameHistory.find(entry => entry.date && entry.date.startsWith(dateStr));
    return result ? result.status : null;
  };

  return (
    <div style={calendarStyles.container}>
      <h2 style={calendarStyles.header}>
        {now.toLocaleString('default', { month: 'long' })} {year}
      </h2>
      <div style={calendarStyles.grid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
          <div key={idx} style={calendarStyles.dayName}>{dayName}</div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={index} style={calendarStyles.dayCell}></div>;
          const status = getGameStatusForDay(day);
          let dotColor = null;
          if (status === "PASS") {
            dotColor = "rgba(0,255,0,0.5)";
          } else if (status === "FAIL") {
            dotColor = "rgba(255,0,0,0.5)";
          }
          return (
            <div key={index} style={calendarStyles.dayCell}>
              <div style={calendarStyles.dayNumber}>{day.getDate()}</div>
              {dotColor && (
                <div style={{ ...calendarStyles.dot, backgroundColor: dotColor }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const calendarStyles = {
  container: {
    marginTop: "30px",
    padding: "10px 20px",
    backgroundColor: "transparent",
    width: "90%",
    maxWidth: "600px",
    color: "white",
    textAlign: "center"
  },
  header: {
    marginBottom: "5px",
    fontSize: "18px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "2px"
  },
  dayName: {
    fontWeight: "bold",
    fontSize: "12px"
  },
  dayCell: {
    minHeight: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  dayNumber: {
    fontSize: "14px",
    position: "relative",
    zIndex: 1
  },
  dot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "24px",
    height: "24px",
    borderRadius: "50%"
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '150vh',
    width: '100vw',
    backgroundColor: '#1e1e1e',
    color: 'white',
    textAlign: 'center',
    overflow: 'auto',
    paddingBottom: '20px'
  },
  h1: {
    fontSize: '50px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  p: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '50px'
  },
  flipContainer: {
    marginBottom: '20px'
  },
  flipper: {
    width: '150px',
    height: '150px',
    transition: '0.6s',
    transformStyle: 'preserve-3d'
  },
  front: {},
  back: {},
  mysteryImage: {
    width: '150px',
    height: '150px',
    borderRadius: '10px',
    border: '2px solid white'
  },
  guessesRemaining: {
    marginBottom: '10px',
    fontSize: '18px'
  },
  searchContainer: {
    position: 'relative',
    width: '250px',
    marginBottom: '10px'
  },
  searchBar: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  dropdown: {
    border: '1px solid #ccc',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
  },
  dropdownItem: {
    cursor: 'pointer',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    color: 'black',
    gap: '10px'
  },
  noMatch: {
    padding: '8px 12px',
    color: '#888'
  },
  dropdownImage: {
    width: '70px',
    height: '70px',
    borderRadius: '50%'
  },
  name: {
    marginLeft: '10px'
  },
  submitButton: {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  categoryLabels: {
    display: 'flex',
    gap: '70px',
    marginTop: '20px',
    marginLeft: '110px'
  },
  label: {
    width: '50px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  feedbackContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '55px',
    marginTop: '10px'
  },
  guessImage: {
    width: '100px',
    height: '100px',
    borderRadius: '10px'
  },
  feedbackSquare: {
    width: '70px',
    height: '70px',
    borderRadius: '5px',
    fontSize: '20px',
    
  },
  arrow: {
    fontSize: '24px',
    color: 'white'
  },
  brainRotText: {
    fontSize: '16px',
    color: 'white',
    transform: 'scaleX(-1)'
  }
  
};

export default App;
