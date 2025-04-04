import express from "express"
import dotenv from "dotenv"
import connectDB from "./database/db.js"
import userRoute from "./routes/user.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import courseRoute from "./routes/course.route.js"


dotenv.config({})
// call daatabase connection 
connectDB()

const app= express()
const PORT= process.env.PORT || 8080
//default middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:8080", // frontend url is origin
    credentials: true

}))
//apis
app.use("/api/v1/user",userRoute )
// http://localhost:8080/api/v1/user/register
app.use("/api/v1/course",courseRoute )

app.listen(PORT,()=>{
    console.log(`server listen at port ${PORT}`)
})
