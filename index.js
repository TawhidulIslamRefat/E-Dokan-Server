const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

/* middleWare */
app.use(cors());
app.use(express.json());

// E_Dokan_Admin
// b7aNLLZyjvr4e6Ad
const uri =
  "mongodb+srv://E_Dokan_Admin:b7aNLLZyjvr4e6Ad@cluster0.fcwgrle.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("eDokan");
    const productCollection = db.collection("products");

    // products API
    app.get("/products", async (req, res) => {
      const search = req.query.search;
      const sort = req.query.sort;
      const email = req.query.email;

      let query = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (email) {
        query["postedBy.email"] = email;
      }

      let sortOption = {};
      if (sort === "price-asc") sortOption.price = 1;
      if (sort === "price-desc") sortOption.price = -1;
      if (sort === "date-desc") sortOption.postedDate = -1;
      if (sort === "date-asc") sortOption.postedDate = 1;
      const result = await productCollection
        .find(query)
        .sort(sortOption)
        .toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      let result = null;

      if (ObjectId.isValid(id)) {
        result = await productCollection.findOne({ _id: new ObjectId(id) });
      }

      if (!result) {
        result = await productCollection.findOne({ _id: id });
      }
      if (!result) {
        return res.status(404).send({ message: "Property Not Found" });
      }
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

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

/* server API */
app.get("/", (req, res) => {
  res.send("E-Dokan server is running");
});

app.listen(port, () => {
  console.log(`E-Dokan server is running on port :${port}`);
});
