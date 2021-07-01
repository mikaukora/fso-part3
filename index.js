require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(express.json());

morgan.token("personData", function (req, res) {
  return req.method === "POST" ? JSON.stringify(req.body) : null;
});

app.use(
  morgan(
    ":method :url :status :res[content-length] :response-time ms :personData"
  )
);

app.get("/", (request, response) => {
  response.send(
    '<h1>Hello World!</h1>Check <a href="/api/persons">persons</a>'
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const timeStamp = Date();

  Person.find({}).then((persons) => {
    const personCount = persons.length;
    response.send(
      `<p>Phonebook has info for ${personCount} people</p><p>${timeStamp}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((res) => {
      response.json(res);
    })
    .catch((error) => {
      console.log(`id ${request.params.id} not found`);
      response.status(404).end();
    });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  Person.find({ name: body.name })
    .then((res) => {
      if (res.length) {
        return response.status(400).json({
          error: "name must be unique",
          data: res,
        });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save().then((result) => {
        console.log(`added ${person}`);
        response.json(person);
      });
    })
    .catch((err) => console.log(err));
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  Person.findByIdAndUpdate(
    request.params.id,
    { number: body.number },
    { new: true }
  )
    .then((res) => {
      response.json(res);
    })
    .catch((err) => response.status(400).json(err));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
