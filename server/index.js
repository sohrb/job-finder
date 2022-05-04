import express from "express"
import cors from "cors"
import "dotenv/config"
import { getJobs } from "./job-finder.js"

const app = express()
const port = 5000 || process.env.PORT

app.use(cors())
app.use(express.json())

app.post("/", async (req, res) => {
  res.json(await getJobs(req.body.url))
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}/`))
