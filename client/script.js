const submitBtn = document.querySelector("#submit-btn")
const results = document.querySelector(".results")
const loading = document.querySelector("#loading")
const BACKEND_URL = "http://localhost:3000/"

loading.style.display = "none"

submitBtn.addEventListener("click", (e) => {
  e.preventDefault()
  const checkedBoxes = document.querySelectorAll(".tech > input:checked")

  if (checkedBoxes.length == 0) {
    alert("You need to select at least one technology")
  } else {
    let url = "https://quera.org/magnet/jobs?"

    checkedBoxes.forEach((checkbox) => {
      url += `technologies=${checkbox.id}&`
      checkbox.checked = false
    })

    results.innerHTML = ""
    loading.style.display = ""

    fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((jobs) => {
        loading.style.display = "none"
        showJobs(jobs)
      })
  }
})

function showJobs(jobs) {
  let i = 1

  for (let job of jobs) {
    const jobDiv = document.createElement("div")
    jobDiv.setAttribute("class", "job")
    jobDiv.setAttribute("id", i++)

    jobDiv.innerHTML += `<h1 class="description"><a href="${job.link}" target="_blank">${job.description}</a></h1>`

    jobDiv.innerHTML += `<h3 class="posted">${job.posted}</h3>`

    const companyDiv = document.createElement("div")
    companyDiv.setAttribute("class", "company-info")
    companyDiv.innerHTML += `<h3 class="company">${job.company}</h3>`
    if (job.city) {
      companyDiv.innerHTML += `<h3 class="city">${job.city}</h3>`
    }

    const jobDetails = document.createElement("div")
    jobDetails.setAttribute("class", "job-details")
    if (job.details) {
      for (let detail of job.details) {
        jobDetails.innerHTML += `<h3 class="detail">${detail}</h3>`
      }
    }

    const techStack = document.createElement("div")
    techStack.setAttribute("class", "tech-stack")
    if (job.requirements) {
      for (let tech of job.requirements) {
        techStack.innerHTML += `<h3 class="requirements">${tech}</h3>`
      }
    }

    jobDiv.appendChild(companyDiv)
    jobDiv.appendChild(jobDetails)
    jobDiv.appendChild(techStack)
    results.appendChild(jobDiv)
  }
}
