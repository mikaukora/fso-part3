const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const newName = process.argv.length === 5 ? process.argv[3] : null;
const newNumber = process.argv.length === 5 ? process.argv[4] : null;

const url = `mongodb+srv://fullstack:${password}@cluster0.jgush.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", noteSchema);

if (process.argv.length === 3) {
  console.log("phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (newName && newNumber) {
  const person = new Person({
    name: newName,
    number: newNumber,
  });

  person.save().then((result) => {
    console.log(`added ${newName} number ${newNumber} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log("Parameters missing");
  mongoose.connection.close();
}
