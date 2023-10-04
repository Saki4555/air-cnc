const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const nodemailer = require("nodemailer");

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.phgiqsm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization.split(" ")[1];

  console.log(authorization);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthorized acces" });
    }
    req.decoded = decoded;
    next();
  });
};

const sendMail = (emailData, emailAddress) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: emailAddress,
    subject: emailData.subject,
    html: `<p>${emailData.message}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      // do something useful
    }
  });
};

async function run() {
  try {
    const usersCollection = client.db("aircncDb").collection("users");
    const roomsCollection = client.db("aircncDb").collection("rooms");
    const bookingsCollection = client.db("aircncDb").collection("bookings");

    app.post("/create-payment-intent", verifyJwt, async (req, res) => {
      const { price } = req.body;
      if (!price) return;
      const amount = parseFloat(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      // console.log(token);
      // console.log(email);
      res.send({ token });
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updatedDoc = { $set: user };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      //   console.log(result);
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    app.get("/rooms/:email", verifyJwt, async (req, res) => {
      const email = req.params.email;

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "Forbidden access" });
      }

      const query = { "host.email": email };
      const result = await roomsCollection.find(query).toArray();

      // console.log(result);
      res.send(result);
    });

    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      //   console.log(result);
      res.send(result);
    });
    app.delete("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/rooms", async (req, res) => {
      const room = req.body;
      console.log(room);
      const result = await roomsCollection.insertOne(room);
      res.send(result);
    });

    app.patch("/rooms/status/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          booked: status,
        },
      };

      const result = await roomsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.put('/rooms/:id', verifyJwt, async (req, res) => {
      const room = req.body
      console.log(room)

      const filter = { _id: new ObjectId(req.params.id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: room,
      }
      const result = await roomsCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { "guest.email": email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/bookings/host", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { host: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);

      if (result.insertedId) {
        sendMail(
          {
            subject: "Booking Successful!",
            message: `Booking Id: ${result?.insertedId}, TransactionId: ${booking.transactionId}`,
          },
          booking?.guest?.email
        );
        sendMail(
          {
            subject: "Your room got booked!",
            message: `Booking Id: ${result?.insertedId}, TransactionId: ${booking.transactionId}. Check dashboard for more info`,
          },
          booking?.host
        );
      }

      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bookings");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
