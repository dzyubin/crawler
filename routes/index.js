var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
// const url = "https://www.iban.com/exchange-rates";
// const url = 'https://jobs.dou.ua/vacancies/?category=Front%20End';
const url = 'https://djinni.co/jobs/keyword-javascript/';

/* GET home page. */
router.get('/', function(req, routerRes, next) {
  createPromises().then(promises => {
    Promise.all(promises).then(res => {
      const processedVacancies = res.map((v, i) => {
        // if (i > 0) return
        const result = processDjinniVacancy(v)

        if (result && result.length) return {
          url: v.config.url,
          match: result
        }
      })

      const filteredVacancies = processedVacancies.filter(v => v !== undefined)

      const vacancies = filteredVacancies.map(v => {
        return {
          ...v,
          matchesDisplayString: v.match.join(' | ')
        }
      })
      
      // console.log(vacancies);
      routerRes.render('index', { title: 'Express', vacancies });
    })
  })
  
  // fetchData(url).then(response => {
  //   const promises = processDjinniResponse(response.data)
  // })
});

const createPromises = () => {
  const urls = [
    'https://djinni.co/jobs/keyword-javascript/' 
  ]

  const pages = 36

  // for (let i = 2; i++; i < 100) {
    console.log(urls);
  for (let i = 2; i < pages; i++) {
    // console.log('sdf');
    urls.push(urls[0] + `?page=${i}`)
  } 

  console.log(urls);
  const promises = []

  return new Promise(resolve => {
    urls.forEach(url => {
      fetchData(url).then(response => {
        promises.push(...processDjinniResponse(response.data))
        if (promises.length > (pages * 10 + 10)) {
          resolve(promises)
        }
      })
    })
  })
}

const processResponse = res => {
  const $ = cheerio.load(res);
  const vacancies = $('#vacancyListId ul li');
  const promises = []
  console.log(vacancies.length);
  vacancies.each((i, el) => {
    const href = $(el).find('.title a.vt')[0].attribs.href;
    promises.push(fetchData(href))
  });

  return Promise.all(promises).then(res => {
    return res.map((v, i) => {
      // if (i > 0) return
      const result = processVacancy(v)

      if (result && result.length) return {
        url: v.config.url,
        match: result
      }
    })
  })
}

const processDjinniResponse = res => {
  const $ = cheerio.load(res);
  const vacancies = $('.list-jobs li');
  const promises = []
  vacancies.each((i, el) => {
    // if (i > 0) return
    const href = $(el).find('a.profile')[0].attribs.href;
    promises.push(fetchData('https://djinni.co' + href))
  });

  return promises

  // return Promise.all(promises).then(res => {
  //   return res.map((v, i) => {
  //     // if (i > 0) return
  //     const result = processDjinniVacancy(v)

  //     if (result && result.length) return {
  //       url: v.config.url,
  //       match: result
  //     }
  //   })
  // })
}

async function fetchData(url){
  console.log("Crawling data...")
  // make http call to url
  // console.log(url);
  let response = await axios(url).catch((err) => console.log(err));
  // console.log(response);
  if(response.status !== 200){
    console.log("Error occurred while fetching data");
    return
  }

  return response
}

function processVacancy(v) {
  let text = ''
  let vacancy = cheerio.load(v.data)
  const info = vacancy('.info .l-t').html()
  // console.log(info);
  text += info
  const header = vacancy('.l-vacancy h1').text()
  text += header
  const vacancySection = vacancy('.l-vacancy .vacancy-section')
  text += ' '
  text += vacancySection.html()
  const matches = text.match(/\bai\b|machine learning|\bml\b/gi)
  return matches
}

function processDjinniVacancy(v) {
  const $ = cheerio.load(v.data)
  const jobPostPage = vacancy = $('.job-post-page')
  let text = jobPostPage.html()
  // let text = html
  // const header = $('.page-header h1').text().trim()
  // console.log(title);
  // text += header
  // const vacancySection = $('.row')
  // console.log(vacancySection.data());
  // console.log(vacancySection[1].children.forEach(el => console.log(el)));
  // console.log(vacancySection[0].children.forEach(ch => console.log(ch.data)));
  // console.log(vacancySection[1].children.forEach(ch => console.log(ch.data)));
  // console.log(vacancySection[2].children.forEach(ch => console.log(ch.data)));
  // console.log(vacancySection[3].children.forEach(ch => console.log(ch.data)));
  // vacancySection.forEach(el => console.log(el))
  // text += ' '
  // text += vacancySection.html()
  // console.log(text);
  const matches = text.match(/\bai\b|machine learning|\bml\b/gi)
  return matches
}

module.exports = router;
