import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes
import userRouter from './routes/user.route.js';
import videoRouter from './routes/video.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import playlistRouter from './routes/playlist.route.js';

// routes declration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlist", playlistRouter)

// https://localhost:8000/api/v1/users

export { app }