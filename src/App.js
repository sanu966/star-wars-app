import React, { useState } from "react";
import axios from "axios";
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

function App() {
  const [planet, setPlanet] = useState("");
  const [people, setPeople] = useState([]);
  const [nextPage, setNextPage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setPlanet(event.target.value);
  };

  const handleSearch = () => {
    if (planet) {
      // Reset the state
      setPeople([]);
      setNextPage("");
      setError("");

      // Fetch planet data from the API
      axios
        .get(`https://swapi.dev/api/planets/?search=${planet}`)
        .then((response) => {
          const planetData = response.data.results[0];
          if (planetData) {
            if (planetData.residents.length > 0) {
              const residentURLs = planetData.residents.slice(0, 10);
              // Fetch resident data for the first 10 residents
              Promise.all(residentURLs.map((url) => axios.get(url)))
                .then((residentResponses) => {
                  const residents = residentResponses.map((res) => res.data);
                  setPeople(residents);
                  setNextPage(
                    planetData.residents.length > 10
                      ? planetData.residents[10]
                      : ""
                  );
                })
                .catch((error) => {
                  setError("Error retrieving resident data.");
                  console.error(error);
                });
            } else {
              setError("No residents found for this planet.");
            }
          } else {
            setError("Planet not found.");
          }
        })
        .catch((error) => {
          setError("Error retrieving planet data.");
          console.error(error);
        });
    }
  };

  const handleLoadMore = () => {
    if (nextPage) {
      // Fetch the next page of residents
      axios
        .get(nextPage)
        .then((response) => {
          const residentURLs = response.data.residents.slice(0, 10);
          // Fetch resident data for the next page
          Promise.all(residentURLs.map((url) => axios.get(url)))
            .then((residentResponses) => {
              const residents = residentResponses.map((res) => res.data);
              // Append the new residents to the existing list
              setPeople((prevPeople) => [...prevPeople, ...residents]);
              setNextPage(
                response.data.residents.length > 10
                  ? response.data.residents[10]
                  : ""
              );
            })
            .catch((error) => {
              setError("Error retrieving resident data.");
              console.error(error);
            });
        })
        .catch((error) => {
          setError("Error retrieving next page data.");
          console.error(error);
        });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Star Wars Planet Search
      </Typography>
      {/* Input field for entering the planet name */}
      <TextField
        label="Enter a planet name"
        variant="outlined"
        value={planet}
        onChange={handleChange}
        style={{ marginBottom: "20px" }}
      />
      {/* Button to trigger the search */}
      <Button
        variant="contained"
        onClick={handleSearch}
        style={{ marginBottom: "20px" }}
      >
        Search
      </Button>

      {/* Error message display */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Display list of people from the searched planet */}
      {people.length > 0 && (
        <>
          {/* Title for the list */}
          <Typography variant="h5" component="h2" gutterBottom>
            People from {planet}
          </Typography>
          {/* List component */}
          <List>
            {people.map((person, index) => (
              <ListItem key={index}>
                {/* Displaying person's name and birth year */}
                <ListItemText
                  primary={person.name}
                  secondary={`Birth Year: ${person.birth_year}`}
                />
              </ListItem>
            ))}
          </List>

          {/* Button to load more residents */}
          {nextPage && (
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              style={{ marginTop: "20px" }}
            >
              Load More
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default App;
