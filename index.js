const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const URL = "mongodb+srv://Iswarya:Geetha71@cluster0.stxvr2g.mongodb.net/?retryWrites=true&w=majority";

app.use(
  cors({
    origin: "https://wonderful-pasca-1dd86e.netlify.app",
  })
);

app.use(express.json());

let products = [];

// Create
app.post("/product", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("mongoapp");

    // Select Collection
    // Do operation (CRUD)
    const product = await db.collection("products").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({ message: "Product created", id: product.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // req.body.id = products.length + 1;
  // products.push(req.body);
  // res.json({ message: "Product added",id : products.length });
});

// Read
app.get("/products", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("mongoapp");

    // Select Collection
    // Do operation (CRUD)
    const product = await db.collection("products").find({}).toArray();

    // Close the connection
    await connection.close();

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// URL Parameter // 3
app.put("/product/:productId", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("mongoapp");

    const productData = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productData) {
      // Select Collection
      // Do operation (CRUD)
      delete req.body._id;
      const product = await db
        .collection("products")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.productId) },
          { $set: req.body }
        );

      // Close the connection
      await connection.close();

      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // const productId = req.params.productId;

  // const productIndex = products.findIndex((prod) => prod.id == productId);

  // if (productIndex != -1) {
  //   const keys = Object.keys(req.body); // [ 'price', 'name', 'instock' ]

  //   keys.forEach((key) => {
  //     products[productIndex][key] = req.body[key];
  //   });

  //   res.json({ message: "Done" });
  // } else {
  //   res.status(404).json({ message: "Product not found" });
  // }
});

app.get("/product/:productId", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("mongoapp");

    // Select Collection
    // Do operation (CRUD)
    const product = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    // Close the connection
    await connection.close();

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // const productId = req.params.productId;
  // const productIndex = products.findIndex((prod) => prod.id == productId);
  // res.json(products[productIndex]);
});

app.delete(`/product/:productId`, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("mongoapp");

    const productData = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productData) {
      // Select Collection
      // Do operation (CRUD)
      const product = await db
        .collection("products")
        .deleteOne({ _id: mongodb.ObjectId(req.params.productId) });

      // Close the connection
      await connection.close();

      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // const productId = req.params.productId;
  // const productIndex = products.findIndex((prod) => prod.id == productId);
  // products.splice(productIndex, 1);
  // res.json({ message: "Deleted" });
});

app.listen(process.env.PORT || 3008);
