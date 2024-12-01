const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.73pqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("userDB").collection("user");

    app.post("/coffees", async (req, res) => {
      const newCoffees = req.body;
      console.log(newCoffees);
      const result = await coffeeCollection.insertOne(newCoffees);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUsers = req.body;
      const result = await userCollection.insertOne(newUsers);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCoffee = req.body;
      const coffee = {
        $set: {
          name: updateCoffee.name,
          chef: updateCoffee.chef,
          supplier: updateCoffee.supplier,
          taste: updateCoffee.taste,
          category: updateCoffee.category,
          details: updateCoffee.details,
          photo: updateCoffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(cursor, coffee, options);
      res.send(result);
    });

    // User update

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedUser = {
        $set: {
          lastLoginTime: req.body.lastLoginTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result)
    });

    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);

      app.get("/coffees/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.findOne(query);
        res.send(result);
      });
    });

    // Users get
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Users delete
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee making server is running");
});

app.listen(port, () => {
  console.log(`coffee server is running on port ${port}`);
});
