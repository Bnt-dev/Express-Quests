const database = require("./database");

const getUsers = (req, res) => {
  let sqlInitial = "SELECT firstname, lastname, city FROM users";
  let userValues = [];

  if (req.query.language != null) {
    // user += " WHERE language = ?";
    userValues.push({
      column: "language",
      value: req.query.language,
      operator: "=",
    });
  }

  if (req.query.city != null) {
    userValues.push({
      column: "city",
      value: req.query.city,
      operator: "=",
    });
  }

  database
    .query(
      userValues.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? "WHERE" : "AND"} ${column} ${operator} ?`,
        sqlInitial
      ),
      userValues.map(({ value }) => value)
    )
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const getUsersById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("select firstname, lastname, city from users where id = ?", [id])
    .then(([users]) => {
      if (users.length) {
        res.json(users[0]);
      } else {
        res.status(404).send("Not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  database
    .query(
      "INSERT INTO users (firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([results]) => {
      res.location(`/api/users/${results.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving users");
    });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  database
    .query(
      "UPDATE users SET firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? WHERE id = ?",
      [firstname, lastname, email, city, language, hashedPassword, id]
    )
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status.send("Not found");
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error editing the user");
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("DELETE FROM users WHERE id = ?", [id])
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status(404).send("Not found");
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(204).send("Error in editing user");
    });
};

module.exports = {
  getUsers,
  getUsersById,
  postUser,
  updateUser,
  deleteUser,
};
