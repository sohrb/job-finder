const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const fs = require("fs")

async function getPageHTML(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url)
  const pageHTML = await page.evaluate(
    "new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML"
  )

  await browser.close()

  return pageHTML
}

;(async (url) => {
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

      const tech = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div:nth-child(4) > div:nth-child(1) > div`
        )
      )[0].children.map((div) => div.children[0].data)

      const company = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.chakra-stack.css-hrpgsx > div > *:nth-child(2)`
        )
      ).text()

      const city = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.chakra-stack.css-hrpgsx > div:nth-child(2) > *:nth-child(2)`
        )
      ).text()

      const posted = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.css-1yp4ln > div.chakra-stack.css-nm8t2j > span`
        )
      ).attr("title")

      const level = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.chakra-stack.css-l6bi3f > span:nth-child(1)`
        )
      ).text()

      const time = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.chakra-stack.css-l6bi3f > span:nth-child(3)`
        )
      ).text()

      const link = $(
        jobSectionSelector.concat(
          `> article:nth-child(${i}) > div > div > div > div.chakra-stack.css-1lojokz > div.css-1yp4ln > h2 > a`
        )
      ).attr("href")

      jobs.push({
        description: description,
        tech: tech,
        company: company,
        city: city,
        posted: posted,
        level: level,
        time: time,
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
})("https://quera.ir/magnet/jobs")
