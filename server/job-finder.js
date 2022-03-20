import request from "request"
import cheerio from "cheerio"

export async function getJobs(url) {
  let jobs = []
  let html

  if (url.includes("?")) {
    html = await getPageHTML(url.concat("&page=1"))
  } else {
    html = await getPageHTML(url.concat("?page=1"))
  }

  let $ = cheerio.load(html)
  let j = 1
  const jobSectionSelector =
    "#__next > div.chakra-container.css-bux6p2 > main > section > div.chakra-stack.css-1536cui "
  let jobSection = $(jobSectionSelector)

  while (jobSection.length > 0) {
    let numberOfJobs = jobSection[0].children.length

    for (let i = 1; i <= numberOfJobs; i++) {
      let job = $(jobSectionSelector.concat(`> article:nth-child(${i})`))

      const description = job.find(".chakra-heading.css-1d6x238").text()

      const requirements = job
        .find(".chakra-stack.css-whlc5b.e1pk5grm2")[0]
        .children.filter((node) => {
          if (node.type == "tag") return node
        })
        .map((node) => node.children[0].children[0].data)

      const details = job
        .find(".chakra-stack.css-l6bi3f")[0]
        .children.filter((node) => {
          if (node.name == "span" || node.name == "p") return node
        })
        .map((node) => node.children[0].data)

      const company = job.find(".chakra-text.css-1m52y4d").text()

      const city = job.find(".chakra-stack.css-5ngv18").text()

      const posted = job.find(".chakra-stack.css-nm8t2j").find("span").text()

      const link = job.find(".chakra-link.css-f4h6uy").attr("href")

      jobs.push({
        description: description,
        requirements: requirements,
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
    jobSection = $(jobSectionSelector)
  }

  return jobs
}

async function getPageHTML(url) {
  return new Promise((resolve, reject) => {
    request(url, { jar: true }, (err, res, body) => {
      if (err) reject(err)
      resolve(body)
    })
  })
}
