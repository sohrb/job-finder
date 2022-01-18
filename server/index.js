const request = require("request")
const cheerio = require("cheerio")
const fs = require("fs")
const { performance } = require("perf_hooks")

async function getPageHTML(url) {
  return new Promise((resolve, reject) => {
    request(url, { jar: true }, (err, res, body) => {
      if (err) reject(err)
      resolve(body)
    })
  })
}

async function getJobs(url) {
  let jobs = []
  let html

  if (url.includes("?")) {
    html = await getPageHTML(url.concat("&page=1"))
  } else {
    html = await getPageHTML(url.concat("?page=1"))
  }

  const jobSectionSelector =
    "#__next > div.chakra-container.css-bux6p2 > main > section > div.chakra-stack.css-1536cui"

  let $ = cheerio.load(html)
  let j = 1

  while ($(jobSectionSelector).length > 0) {
    let numberOfJobs = $(jobSectionSelector)[0].children.length

    for (let i = 1; i <= numberOfJobs; i++) {
      const description = $(
        jobSectionSelector.concat(`> article:nth-child(${i})`)
      )
        .find("h2")
        .text()

      const tech = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(".css-q64f56.e1pk5grm2")[0]
        .children.map((div) => div.children[0].data)

      const details = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(".chakra-stack.css-l6bi3f")[0]
        .children.filter((node) => {
          if (node.name == "span" || node.name == "p") return node
        })
        .map((node) => node.children[0].data)

      const company = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(".chakra-stack.css-6lg29b")
        .find(`p`)
        .text()

      const city = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(".chakra-stack.css-5ngv18")
        .find(`span`)
        .text()

      const posted = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(`.chakra-stack.css-nm8t2j`)
        .find(`span`)
        .attr(`title`)

      const link = $(jobSectionSelector.concat(`> article:nth-child(${i})`))
        .find(`.css-1yp4ln`)
        .find(`h2 > a`)
        .attr("href")

      jobs.push({
        description: description,
        tech: tech,
        details: details,
        company: company,
        city: city,
        posted: posted,
        link: "https://quera.ir".concat(link),
      })
    }

    if (url.includes("?")) {
      html = await getPageHTML(url.concat(`&page=${++j}`))
    } else {
      html = await getPageHTML(url.concat(`?page=${++j}`))
    }

    $ = cheerio.load(html)
  }

  fs.writeFile("./jobs.json", JSON.stringify(jobs, null, 2), (err) => {
    if (err) console.error(err)
  })
}

;(async () => {
  let startTime = performance.now()

  await getJobs("https://quera.ir/magnet/jobs")

  let endTime = performance.now()

  console.log(
    `It took ${Math.round(
      (endTime - startTime) / 1000
    )} seconds for jobs to be fetched`
  )
})()
