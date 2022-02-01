import express from "express"
import cors from "cors"
import "dotenv/config"
import { getJobs } from "./job-finder.js"

const app = express()

app.use(cors())
app.use(express.json())

app.post("/", async (req, res) => {
  res.json(await getJobs(req.body.url))
})

app.listen(process.env.PORT, () =>
  console.log(`Listening at http://localhost:${process.env.PORT}/`)
)
