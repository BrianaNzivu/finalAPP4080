//this allows you to redirect to home.hbs
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3002;

app.set("views", "views");
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (request, response) {
  response.render("home");
});

/* The `app.post("/rate", function (request, response) { ... })` function is a route handler for the
POST request to the "/rate" endpoint. */
app.post("/rate", function (request, response) {
  const { firstName, lastName, rating, comment } = request.body;
  console.log("fname: ", firstName);
  console.log("lname: ", lastName);
  console.log("rating: ", rating);
  console.log("comment: ", comment);

  const lecturerData = {
    firstName,
    lastName,
    rating: parseInt(rating),
    comment,
  };

  // Load existing ratings from ratings.json
  let ratings = [];
  try {
    const ratingsFile = fs.readFileSync(
      path.join(__dirname, "ratings.json"),
      "utf8"
    );

    // check if the json file is empty
    if (ratingsFile.trim() !== "") {
      ratings = JSON.parse(ratingsFile);
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  // Add new rating to the existing ratings array
  ratings.push(lecturerData);

  // Save updated ratings back to ratings.json
  fs.writeFileSync(
    path.join(__dirname, "ratings.json"),
    JSON.stringify(ratings, null, 2)
  );

  response.redirect("/reports");
});

/* The `app.get("/reports", function (request, response) { ... })` function is a route handler for the
GET request to the "/reports" endpoint. */
app.get("/reports", function (request, response) {
  let ratings = [];
  try {
    const ratingsFile = fs.readFileSync(
      path.join(__dirname, "ratings.json"),
      "utf8"
    );
    ratings = JSON.parse(ratingsFile);
  } catch (error) {
    console.log("Error: ", error);
  }

  // Calculate the average rating for each lecturer
  const lecturerData = ratings.reduce(
    (result, { firstName, lastName, rating, comment }) => {
      const fullName = firstName + " " + lastName;
      if (!result[fullName]) {
        result[fullName] = {
          firstName,
          lastName,
          totalRating: 0,
          averageRating: 0,
          comments: [],
          ratingsCount: 0,
        };
      }
      result[fullName].totalRating += rating;
      result[fullName].averageRating =
        result[fullName].totalRating /
        ratings.filter((r) => r.firstName + " " + r.lastName === fullName)
          .length;
      result[fullName].comments.push(comment);
      result[fullName].ratingsCount = ratings.filter(
        (r) => r.firstName + " " + r.lastName === fullName
      ).length;
      return result;
    },
    {}
  );

  // Convert the lecturerData object to an array of objects
  const lecturers = Object.values(lecturerData);

  response.render("reports", { lecturers });
});

app.listen(port);
console.log("Heyyy Node server started on port", port);
