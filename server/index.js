const express = require("express");
const cors = require("cors");
const userRoute = require("./routes/userRoute.js");
const cookieParser = require("cookie-parser");
const messageRoute = require("./routes/messageRoute.js");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
//local
const authRouter = require("./routes/auth");
const dbConnection = require("./db.config.js");
const port = require("./config");
const passport = require("passport");
const controlLogin = require("./controller/auth/login.js");
const projectsRoute = require("./routes/projects.js");
const notificationsRoute = require("./routes/notifications.js");
const postsRoute = require("./routes/posts.js");
const gradesRoute = require("./routes/grades.js");
require("dotenv").config();

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URI, // Main client URI
  'https://womenbandari1-git-sheilamahind-9b2b3e-sheilas-projects-6fbe7294.vercel.app' // Branch deployment URI
];

app.use(express.static("public"));

// Updated CORS configuration to handle multiple origins
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`Origin ${origin} not allowed by CORS`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["POST", "GET", "DELETE", "UPDATE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
      uri: process.env.MONGO_URI,
    }),
    cookie: {
      // secure: true,
      httpOnly: true,
      maxAge: 3600000, //1hr
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

app.use("/auth", authRouter);
app.use("/auth", controlLogin);
app.use("/api", gradesRoute);
app.use("/api", projectsRoute);
app.use("/api", notificationsRoute);
app.use("/api", postsRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

dbConnection(() => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});
