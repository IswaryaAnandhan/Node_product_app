const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
require("dotenv").config();
const URL = process.env.LINK;
const DB = process.env.DB;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.jwt_secret;
const nodemailer = require("nodemailer");
const FROM = process.env.FROM;
const PASSWORD = process.env.PASSWORD;

app.use(express.json());
app.use(
  cors({
     origin: "https://wonderful-pasca-1dd86e.netlify.app"
    // origin: "http://localhost:3000",
  })
);

let authorize = (req, res, next) => {
  //middleware
  try {
    //check if authorization token present
    console.log(req.headers);
    if (req.headers.authorization) {
      let decodedToken = jwt.verify(req.headers.authorization, jwt_secret);
      if (decodedToken) {
        next();
      } else {
        res.status(401).json({ message: "unauthorized" });
      }
    } else {
      res.status(401).json({ message: "unauthorized" });
    }
    //check if the token is valid
    //if valid say next()
    //if not valid say unauthorized
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "unauthorized" });
  }
};

app.get("/", function (req, res) {
  res.send("<h1>Full stack Project...</h1>");
});

app.post("/user/register", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

    //hash the password
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;

    // Select Collection
    // Do operation (CRUD)
    await db.collection("users").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({ message: "User created Sucessfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

    // Select Collection
    // Do operation (CRUD)
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    console.log(jwt_secret);
    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        //issue token
        const token = jwt.sign({ _id: user._id }, jwt_secret, {
          expiresIn: "3m",
        });

        res.json({ message: "Success", token });
      } else {
        res.json({ message: "Incorrect email/password" });
      }
    } else {
      res.status(404).json({ message: "Incorrect email/password" });
    }

    // Close the connection
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/Reset", async function (req, res) {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db(DB);
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    let email = req.body.email;

    if (!user) {
      res.status(404).json({ message: "User Not Exists" });
    }
    let token = jwt.sign({ _id: user._id }, jwt_secret, { expiresIn: "10m" });
    // const link = `http://localhost:3000/Reset/${user._id}/${token}`;
    const link = `https://wonderful-pasca-1dd86e.netlify.app/Reset/${user._id}/${token}`;
    console.log(link);

    //Send a link Via mail;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        code: "EAUTH",
        responseCode: 534,
        user: FROM,
        pass: PASSWORD,
      },
    });

    var mailOptions = {
      from: FROM,
      to: email,
      subject: "Password Reset",
      text: "Click this Link Reset Your Password",
      html: `<Link to=${link} target="_blank">${link}</Link>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent:" + info.response);
      }
    });
    res.send(link);
  } catch (error) {
    res.status(500).json({ Message: "Something Went Wrong" });
    console.log(error);
  }
});

//Update New Password;
app.post("/Reset/:id/:token", async function (req, res) {
  const id = req.params.id;
  const token = req.params.token;
  try {
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt);
    const connection = await mongoclient.connect(URL);
    const db = connection.db(DB);
    let compare = jwt.verify(token, jwt_secret);
    console.log(compare);

    if (compare) {
      // Select Collection
      // Do operation (CRUD)
      let Person = await db
        .collection("users")
        .findOne({ _id: mongodb.ObjectId(`${id}`) });
      if (!Person) {
        return res.json({ Message: "User Exists!!" });
      }
      await db
        .collection("users")
        .updateOne(
          { _id: mongodb.ObjectId(`${id}`) },
          { $set: { password: hash } }
        );

      // Close the connection
      await connection.close();
      res.json({ Message: "Password Updated" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ Message: "Something Went Wrong" });
    console.log(error);
  }
});

// Create
app.post("/product", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

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
app.get("/products", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

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
app.put("/product/:productId", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

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

app.get("/product/:productId", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

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

app.delete(`/product/:productId`, authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db(DB);

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
