var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
// const url = "https://www.iban.com/exchange-rates";
// const url = 'https://jobs.dou.ua/vacancies/?category=Front%20End';
// const url = 'https://djinni.co/jobs/keyword-javascript/';

/* GET home page. */
router.get('/', function(req, routerRes, next) {
  createPromises().then(promises => {
    console.log(promises.length)
    Promise.all(promises).then(res => {
      console.log(res)
      const processedVacancies = res.map((v, i) => {
        // if (i > 0) return
        const result = processDjinniVacancy(v)
        // const result = processDouVacancy(v)

        // console.log(result)
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
      
      routerRes.render('index', { title: 'Express', vacancies });
    })
  })
  
  // fetchData(url).then(response => {
  //   const promises = processDjinniResponse(response.data)
  // })
});

const createPromises = () => {
  const urls = [
    'https://djinni.co/jobs/?primary_keyword=JavaScript' 
  ]

  const pages = 16

  // for (let i = 2; i++; i < 100) {

  for (let i = 1; i < pages; i++) {
    urls.push(urls[0] + `&page=${i}`)
  }

  // console.log(urls);

  const promises = []

  return new Promise(resolve => {
    // promises.push(...processDouResponse(douVacanciesHTML))
    // resolve(promises)
    urls.forEach((url, i) => {
      fetchData(url).then(response => {
        if (response && response.data) {
          promises.push(...processDjinniResponse(response.data))
          console.log(promises.length)
          if (promises.length > (pages * 10)) {
            resolve(promises)
          }
        } else {
          console.log("eeeeeerrrrrr");
        }
      }).catch(err => {
        console.log(err);
      })
      // if (i > (urls.length - 2)) resolve(promises)
    })
  })
}

const processDjinniResponse = res => {
  console.log(typeof res)
  const $ = cheerio.load(res);
  const vacancies = $('.list-jobs li');
  const promises = []
  vacancies.each((i, el) => {
    console.log($(el).find('a.profile'));
    // if (i > 3) return
    const href = $(el).find('a.job-list-item__link')[0].attribs.href;
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

function processDouResponse(res) {
  console.log(typeof res)
  const $ = cheerio.load(res);
  const vacancies = $('.lt li');
  // console.log(vacancies[0])
  const promises = []
  vacancies.each((i, el) => {
    // if (i > 0) return
    const href = $(el).find('a.vt')[0].attribs.href;
    console.log(href)
    promises.push(fetchData(href))
  });

  return promises
}

async function fetchData(url){
  // console.log("Crawling data...")
  // make http call to url
  let response = await axios(url).catch((err) => {
    console.log(err)
  });

  if (response && response.status !== 200){
    console.log("Error occurred while fetching data");
    return
  }

  return response
}

function processDjinniVacancy(v) {
  if (!v) return
  const $ = cheerio.load(v.data)
  // const jobPostPage = $('.job-post-page')
  const jobPostPage = $('.wrapper')
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
  // const matches = text.match(/\bai\b|machine learning|\bml\b|python|react/gi)
  const matches = text.match(/\bai\b|machine learning|\bml\b|python/gi)

  return matches
}

function processDouVacancy(v) {
  if (!v) return
  const $ = cheerio.load(v.data)
  const jobPostPage = $('.b-vacancy')
  let text = jobPostPage.html()
  console.log(text)
  const matches = text.match(/\bai\b|machine learning|\bml\b|python/gi)

  return matches
}

const douVacanciesHTML = `
<ul class="lt">
          
    <li class="l-vacancy __hot">
      <div class="vacancy" _id="227260">
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/brainstack/vacancies/227260/?from=list_hot">Front-end Engineer (Billing Dev. team)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/brainstack/vacancies/?from=list_hot"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_wwacKUj.png" srcset="https://s.dou.ua/img/static/favicons/32_wQr2YlB.png 1.1x">&nbsp;Brainstack_</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Brainstack_ - українська мультипродуктова IT-компанія, яка розробляє кросплатформенні додатки та&nbsp;сервіси.

Ми&nbsp;— команда однодумців, яких об’єднує спільна мета та&nbsp;цінності.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy __hot">
      <div class="vacancy" _id="228715">
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/sonerim/vacancies/228715/?from=list_hot">Full-Stack Developer (Angular+.Net/C#)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/sonerim/vacancies/?from=list_hot"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_auuucPh.png" srcset="https://s.dou.ua/img/static/favicons/32_uPzfg9w.png 1.1x">&nbsp;Sonerim</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;Full-Stack Developer (Angular+.Net/C#).   Our customer:  The major manufacturer of&nbsp;electronic components.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy __hot">
      <div class="vacancy" _id="229468">
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/delasport/vacancies/229468/?from=list_hot">Middle Frontend Developer (Vue.js)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/delasport/vacancies/?from=list_hot"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_WViR1Tt.png" srcset="https://s.dou.ua/img/static/favicons/32_2k7BPFa.png 1.1x">&nbsp;Delasport</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          Delasport is&nbsp;an&nbsp;iGaming Software company providing Sports Betting &amp;&nbsp;Online Casino software, and turnkey B2B solutions.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230949">
          <div class="date">8 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/litslink/vacancies/230949/">Frontend Developer (Vue.js)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/litslink/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_HapkzVW.png" srcset="https://s.dou.ua/img/static/favicons/32_m2Xc5jy.png 1.1x">&nbsp;LITSLINK</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Welcome to&nbsp;LITSLINK&nbsp;— a&nbsp;top software development company from the&nbsp;US established by&nbsp;motivated doers and tech entrepreneurs with a&nbsp;great mission in&nbsp;mind&nbsp;— help up-and-coming companies and SME businesses turn their dreams into profitable ventures.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="216764">
          <div class="date">8 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/dnipro-m/vacancies/216764/">Front-end розробник Vue (Middle-Senior)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/dnipro-m/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_MO3ckgY.png" srcset="https://s.dou.ua/img/static/favicons/32_f6UjCky.png 1.1x">&nbsp;DNIPRO M</a></strong>
            <span class="salary">$2000–3000</span>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Dnipro-M&nbsp;— інструмент з&nbsp;українською душею.

Наша філософія&nbsp;— допомагати людям покращувати світ навколо себе.

Наша місія&nbsp;— давати людям доступний, надійний і&nbsp;зручний інструмент, яким ми&nbsp;готові користуватися самі.

Шукаємо людину, що&nbsp;прагне приєднатися до&nbsp;нашої драйвової команди.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230920">
          <div class="date">8 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/kultprosvet/vacancies/230920/">Middle React Native developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/kultprosvet/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_vgxSxe5.png" srcset="https://s.dou.ua/img/static/favicons/32_CuYzEEw.png 1.1x">&nbsp;Kultprosvet</a></strong>
            <span class="salary">до&nbsp;$3500</span>

            <span class="cities">Дніпро, віддалено</span>
        </div>

        <div class="sh-info">
          Hey! We&nbsp;are Kultprosvet&nbsp;— the team of&nbsp;web and mobile software developers that cares.  Now we’re expanding and welcome talented React Native developer to&nbsp;join our team.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230858">
          <div class="date">7 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/precoro/vacancies/230858/">Front End Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/precoro/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_Lyzlkfq.png" srcset="https://s.dou.ua/img/static/favicons/32_NX6lLiA.png 1.1x">&nbsp;Precoro</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          We’re looking for a&nbsp;motivated Web Developer who will act as&nbsp;a&nbsp;technical owner for our marketing tech stack: website (currently Symfony), blog (Ghost CMS), landing pages (Hubspot), emails (Hubspot, Gainsight), HTML ads (RollWorks, Google Ads, etc.) and more.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="189821">
          <div class="date">7 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/neogames/vacancies/189821/">JavaScript/Game Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/neogames/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_RcayvQu.png" srcset="https://s.dou.ua/img/static/favicons/32_BPjow86.png 1.1x">&nbsp;NeoGames</a></strong>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          NeoGames&nbsp;— a&nbsp;leading international online iLottery company is&nbsp;seeking a&nbsp;Games Developer.  Responsibilities will include:  Developing mobile and web games on&nbsp;HTML&nbsp;platforms, web applications, and infrastructures in&nbsp;JavaScript programming language.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230792">
          <div class="date">7 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/binariks/vacancies/230792/">Middle Vue.js Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/binariks/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_c0Qh5OD.png" srcset="https://s.dou.ua/img/static/favicons/32_NvbrChc.png 1.1x">&nbsp;Binariks</a></strong>

            <span class="cities">Львів</span>
        </div>

        <div class="sh-info">
          Binariks is&nbsp;looking for a&nbsp;highly motivated and skilled Middle Vue.js Developer

The client’s company develops high-powered and original educational software for primary schools for over 14&nbsp;years. During this time they have won over 40&nbsp;industry awards.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230760">
          <div class="date">7 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/inventorsoft/vacancies/230760/">Middle Strong Angular Developer (B2B, USA)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/inventorsoft/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_vSmNRl0.png" srcset="https://s.dou.ua/img/static/favicons/s32_xXqpAdl.png 1.1x">&nbsp;InventorSoft</a></strong>

            <span class="cities">Львів, Чернівці, віддалено</span>
        </div>

        <div class="sh-info">
          Шукаємо Middle Strong Angular Developer  із&nbsp;комерційним досвідом роботи від 3-х років з&nbsp;Angular на&nbsp;проект в&nbsp;сфері B2B. Клієнт з&nbsp;США. Англійська мова: Upper-Intermediate (та&nbsp;вище). Технічний стек: Angular, NGXS, Angular Material. Бекенд написаний на&nbsp;С#.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="228405">
          <div class="date">6 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/interlogic/vacancies/228405/">Middle Frontend (Vue.js) Developer №&nbsp;440</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/interlogic/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/il16.png" srcset="https://s.dou.ua/img/static/favicons/il32.png 1.1x">&nbsp;InterLogic</a></strong>

            <span class="cities">Львів, Хмельницький</span>
        </div>

        <div class="sh-info">
          OVERVIEW

Our client is&nbsp;one of&nbsp;the biggest iGaming companies in&nbsp;Europe. The main goal of&nbsp;the company&nbsp;— is&nbsp;to&nbsp;deliver relevant and simplified content in&nbsp;our expert field and help connect consumers to&nbsp;the best services to&nbsp;meet their needs.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="214403">
          <div class="date">3 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/brain-agency/vacancies/214403/">Front-end Software Engineer (React, TypeScript)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/brain-agency/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_NlpKReJ.png" srcset="https://s.dou.ua/img/static/favicons/32_919vgZy.png 1.1x">&nbsp;WeAreBrain</a></strong>

            <span class="cities">Амстердам (Нідерланди)</span>
        </div>

        <div class="sh-info">
          WeAreBrain is&nbsp;searching for a&nbsp;Front-end Software Engineer to&nbsp;join our team into a&nbsp;new project, which is&nbsp;a&nbsp;management system for various sports labels, the ability to&nbsp;customize them and run them.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230554">
          <div class="date">3 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/socialtech/vacancies/230554/">Frontend Engineer (External Investment)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/socialtech/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_B7Zc2Bu.png" srcset="https://s.dou.ua/img/static/favicons/32_ZBwSkfl.png 1.1x">&nbsp;SocialTech</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          We&nbsp;are a&nbsp;global technology company focused on&nbsp;connecting people through social discovery. Our product is&nbsp;a&nbsp;communication and dating platform where people will be&nbsp;able to&nbsp;satisfy their needs for interaction and attention from other people.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230546">
          <div class="date">3 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/ciklum/vacancies/230546/">Senior Full Stack JavaScript Engineer (2300024I)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/ciklum/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_3R6tmbV.png" srcset="https://s.dou.ua/img/static/favicons/32_NNimfkW.png 1.1x">&nbsp;Ciklum</a></strong>

            <span class="cities">Дніпро</span>
        </div>

        <div class="sh-info">
          Ciklum is&nbsp;looking for a&nbsp;Senior Full Stack JavaScript Engineer to&nbsp;join our team full-time in&nbsp;Ukraine.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="224186">
          <div class="date">3 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/gamingtec/vacancies/224186/">Middle+ Front-end Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/gamingtec/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_glbyma2.png" srcset="https://s.dou.ua/img/static/favicons/32_X8evD65.png 1.1x">&nbsp;Gamingtec</a></strong>

            <span class="cities">Київ, Лімасол (Кіпр), Лондон (Велика Британія), Тбілісі (Грузія), віддалено</span>
        </div>

        <div class="sh-info">
          Position Overview: We&nbsp;are looking for an&nbsp;experienced JavaScript developer with a&nbsp;deep understanding of&nbsp;React. The main candidate’s responsibilities will be&nbsp;the development of&nbsp;user interface components. Our projects are stable, and long-term and constantly adopt new technologies.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230486">
          <div class="date">2 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/intellectsoft/vacancies/230486/">Senior WordPress Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/intellectsoft/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/is_16.png" srcset="https://s.dou.ua/img/static/favicons/is_32_YmTjyKr.png 1.1x">&nbsp;Intellectsoft</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          About Intellectsoft: We&nbsp;are a&nbsp;digital transformation consultancy and engineering company that delivers cutting-edge solutions for global organizations and technology startups.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="114775">
          <div class="date">2 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/chi-software/vacancies/114775/">Strong Middle Angular 2+&nbsp;Developer (Outside of&nbsp;Ukraine)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/chi-software/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/chi.png" srcset="https://s.dou.ua/img/static/favicons/c32_TxYtB9m.png 1.1x">&nbsp;CHI Software</a></strong>

            <span class="cities">Польща, Львів, Дніпро, віддалено</span>
        </div>

        <div class="sh-info">
          This is&nbsp;a&nbsp;web app. The product itself is&nbsp;a&nbsp;project management system. Client was working with hardware engineers and&nbsp;OS developers. So&nbsp;from his point of&nbsp;view, web app is&nbsp;a&nbsp;pretty simple application with clear logic and algorithms.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="71973">
          <div class="date">2 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/swivl/vacancies/71973/">Middle Strong/Senior Front-end developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/swivl/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_6eBlMnU.png" srcset="https://s.dou.ua/img/static/favicons/32_AuUZGpi.png 1.1x">&nbsp;Swivl</a></strong>

            <span class="cities">Варшава (Польща)</span>
        </div>

        <div class="sh-info">
          Swivl is&nbsp;a&nbsp;US product company with offices in&nbsp;Menlo Park CA, US, and Ukraine, with about 120&nbsp;employees.
We&nbsp;are growing several products currently.
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230425">
          <div class="date">2 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/agriteam-canada-consulting-ltd/vacancies/230425/">Senior front-end developer (with PHP)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/agriteam-canada-consulting-ltd/vacancies/">Agriteam Canada Consulting LTD</a></strong>
            <span class="salary">$2500–3500</span>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          Reform initiative and position summary:

SURGe provides technical assistance to&nbsp;multiple Ministries to:



increase their capacity in&nbsp;the development of&nbsp;policies/reforms, strategic planning, monitoring and evaluation using RBM&nbsp;IT Tool (ProjectUA) in&nbsp;accordance to&nbsp;Results-Based...
        </div>
      </div>
    </li>

          
    <li class="l-vacancy">
      <div class="vacancy" _id="230418">
          <div class="date">2 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/cygnati/vacancies/230418/">Front-end Developer (React or&nbsp;Next.js )</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/cygnati/vacancies/">Cygnati Group</a></strong>
            <span class="salary">$2500–5000</span>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          About project:

You have the opportunity to&nbsp;become a&nbsp;member of&nbsp;a&nbsp;fast-growing e-commerce company. We&nbsp;identify, activate and nurture communities and are always finding new ways to&nbsp;create value for our partners.
        </div>
      </div>
    </li>

      
               
    <li class="l-vacancy">
      <div class="vacancy" _id="173300">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/raiffeisen/vacancies/173300/">Senior/Lead Fullstack Developer(Angular)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/raiffeisen/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/aval.png" srcset="https://s.dou.ua/img/static/favicons/a32_WoPJi1m.png 1.1x">&nbsp;Raiffeisen Bank</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are Aval&nbsp;— Raiffeisen Bank Aval&nbsp;— Raiffeisen Bank Ukraine. We&nbsp;are a&nbsp;Ukrainian bank. For 30&nbsp;years, since the first steps of&nbsp;Independence, we&nbsp;have been creating and building the banking system of&nbsp;our country #Together_with_Ukraine.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230360">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/rubygarage/vacancies/230360/">HTML/CSS Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/rubygarage/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_ooKZcH2.png" srcset="https://s.dou.ua/img/static/favicons/32_qSLOHBt.png 1.1x">&nbsp;RubyGarage</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;HTML/CSS Developer who will set high development standards and be&nbsp;responsible for web application layouts maintenance, conduct refactoring using programming patterns and best practices.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230345">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/memoryos/vacancies/230345/">Frontend JavaScript Developer [Part-time]</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/memoryos/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/unnamed_ZfcNw1x.png" srcset="https://s.dou.ua/img/static/favicons/unnamed2.png 1.1x">&nbsp;memoryOS</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          This position is&nbsp;not looking for candidates for memoryOS, but for our partner’s product Adquizition&nbsp;— which is&nbsp;a&nbsp;revolutionary U.S.-based media and advertising platform that gamifies brand content using trivia games to&nbsp;create ~100% engagement as&nbsp;well as&nbsp;a&nbsp;fun and rewarding...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230331">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/intetics-co/vacancies/230331/">Front-end Developer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/intetics-co/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/intetics.png" srcset="https://s.dou.ua/img/static/favicons/i32_8DGlYKJ.png 1.1x">&nbsp;Intetics</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          Intetics, a&nbsp;leading global technology company providing custom software application development, distributed professional teams, software product quality assessment, and “all-things-digital” solutions, is&nbsp;looking for a&nbsp;Front-end Developer (React+Go) to&nbsp;enrich its team with...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="227944">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/idenon/vacancies/227944/">JavaScript Developer (Pixi)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/idenon/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_Gijc27R.png" srcset="https://s.dou.ua/img/static/favicons/32_lFPXQOW.png 1.1x">&nbsp;Idenon</a></strong>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          IDENON welcomes talented professionals to&nbsp;join our dynamic company as&nbsp;a&nbsp;JavaScript Developer. We&nbsp;are seeking a&nbsp;driven and motivated individual to&nbsp;join our team.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="226128">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/lemberg-solutions/vacancies/226128/">Drupal Front-end Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/lemberg-solutions/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_96eK4pc.png" srcset="https://s.dou.ua/img/static/favicons/32_d5wfNhy.png 1.1x">&nbsp;Lemberg Solutions</a></strong>

            <span class="cities">Львів, Луцьк, Рівне</span>
        </div>

        <div class="sh-info">
          Lemberg Solutions&nbsp;is, above all, a&nbsp;group of&nbsp;passionate professionals led by&nbsp;a&nbsp;core team that have been meticulously selected over the last 15&nbsp;years. We&nbsp;are based in&nbsp;Lviv, Rivne, and Lutsk, and have a&nbsp;business representative in&nbsp;Hamburg, Germany.

At&nbsp;LS, people come first.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="220899">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/semantic-sales/vacancies/220899/">CTO&nbsp;— startup</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/semantic-sales/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/s16_Ms6aJhM.png" srcset="https://s.dou.ua/img/static/favicons/s32_m54k9vR.png 1.1x">&nbsp;A1V Lab - A Venture Builder (#AI + #Security)</a></strong>
            <span class="salary">$4000–7000</span>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          Привіт! 

Основний інвестор A1V Lab створив та&nbsp;нещодавно продав компанію в&nbsp;сфері автономноі навігаціі&nbsp;— https://forbes.ua/news/amerikanskiy-gigant-qualcomm-kupil-startap-augmented-pixels-ukraintsa-vitaliya-goncharuka-14012022-3235 

Зараз шукаємо в&nbsp;Venture Builder(cтворюємо...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="225979">
          <div class="date">1 березня 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/semantic-sales/vacancies/225979/">Full stack Engineer (start-up)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/semantic-sales/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/s16_Ms6aJhM.png" srcset="https://s.dou.ua/img/static/favicons/s32_m54k9vR.png 1.1x">&nbsp;A1V Lab - A Venture Builder (#AI + #Security)</a></strong>
            <span class="salary">$4000–7000</span>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          Привіт! 

Основний інвестор A1V Lab створив та&nbsp;нещодавно продав компанію в&nbsp;сфері автономноі навігаціі&nbsp;— https://forbes.ua/news/amerikanskiy-gigant-qualcomm-kupil-startap-augmented-pixels-ukraintsa-vitaliya-goncharuka-14012022-3235 

Зараз шукаємо Full stack Engineer.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230252">
          <div class="date">28 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/form-com/vacancies/230252/">Middle Vanilla JavaScript Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/form-com/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_6VRKt0D.png" srcset="https://s.dou.ua/img/static/favicons/32_BGyhUj5.png 1.1x">&nbsp;Form.com</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;smart and proactive middle JavaScript developer who is&nbsp;eager to&nbsp;learn, grow and share experience with the teammates. You will have the opportunity to&nbsp;become a&nbsp;part of&nbsp;large projects that helps great companies run better.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="134801">
          <div class="date">28 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/brightlocal/vacancies/134801/">Middle/Senior Front End Developer (Poland)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/brightlocal/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_fmKH6Is.png" srcset="https://s.dou.ua/img/static/favicons/32_qIlOAiH.png 1.1x">&nbsp;BrightLocal</a></strong>

            <span class="cities">за кордоном</span>
        </div>

        <div class="sh-info">
          At&nbsp;BrightLocal our mission is&nbsp;to&nbsp;help every marketer become brilliant at&nbsp;local SEO.


We&nbsp;do&nbsp;this through a&nbsp;unique combination of&nbsp;powerful software, done-for-you services, and extensive knowledge sharing and training resources, including our very own BrightLocal Academy.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="225388">
          <div class="date">28 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/genesis-technology-partners/vacancies/225388/">Lead Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/genesis-technology-partners/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_PfY0Yhb.png" srcset="https://s.dou.ua/img/static/favicons/32_VVVfGGc.png 1.1x">&nbsp;Genesis</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Genesis&nbsp;— міжнародна продуктова ІТ-компанія повного циклу. Понад 1500 осіб в&nbsp;п’яти країнах створюють продукти для більш ніж 200 мільйонів унікальних користувачів щомісяця. Один із&nbsp;найбільших партнерів Facebook, Google, Snapchat та&nbsp;Apple в&nbsp;Східній Європі.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="227831">
          <div class="date">27 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/brainstack/vacancies/227831/">Front End Developer (Product Development Team)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/brainstack/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_wwacKUj.png" srcset="https://s.dou.ua/img/static/favicons/32_wQr2YlB.png 1.1x">&nbsp;Brainstack_</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Brainstack_ - українська мультипродуктова IT-компанія, яка розробляє кросплатформенні додатки та&nbsp;сервіси.

Ми&nbsp;— команда однодумців, яких об’єднує спільна мета та&nbsp;цінності.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230138">
          <div class="date">27 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/delphi-llc/vacancies/230138/">Middle Front End Angular developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/delphi-llc/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/del.png" srcset="https://s.dou.ua/img/static/favicons/d32_MqHZczf.png 1.1x">&nbsp;Delphi Software</a></strong>

            <span class="cities">Вінниця, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;Middle Front End Angular developer. Our customer is&nbsp;leading pharmaceutical sales and distribution company. You will be&nbsp;part of&nbsp;multi-national distributed team responsible for development platform with contemporary full stack technologies.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230131">
          <div class="date">27 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/playtika-ua/vacancies/230131/">Senior JavaScript Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/playtika-ua/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_hkMCCcT.png" srcset="https://s.dou.ua/img/static/favicons/32_a5qqctP.png 1.1x">&nbsp;Playtika</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;JavaScript Developer to&nbsp;join our team on&nbsp;a&nbsp;full-time basis.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="221160">
          <div class="date">27 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/eldorado/vacancies/221160/">Senior front-end developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/eldorado/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/e16_va4ud61.png" srcset="https://s.dou.ua/img/static/favicons/el32.png 1.1x">&nbsp;Eldorado</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Eldorado в&nbsp;пошуках свого Senior front-end developer!

Чим будеш займатися?
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230037">
          <div class="date">24 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/ffflabel/vacancies/230037/">Senior React.js Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/ffflabel/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/l16_ffhHZPC.png" srcset="https://s.dou.ua/img/static/favicons/l32_93HrJjV.png 1.1x">&nbsp;White Label</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          The project is&nbsp;a&nbsp;platform that will provide users with exciting solutions for team coordination &amp;&nbsp;collaboration, task tracking &amp;&nbsp;notice-making. In&nbsp;a&nbsp;few words&nbsp;— this is&nbsp;the combination of&nbsp;Notion/Dropbox, Papers &amp;&nbsp;Trello, and working on&nbsp;the TipTap editor.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="230010">
          <div class="date">24 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/vaimo/vacancies/230010/">Senior Vue Storefront Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/vaimo/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/vaimo.png" srcset="https://s.dou.ua/img/static/favicons/32_TzYqLr9.png 1.1x">&nbsp;VAIMO</a></strong>

            <span class="cities">Вроцлав (Польща), віддалено</span>
        </div>

        <div class="sh-info">
          Vaimo is&nbsp;one of&nbsp;the world’s most respected experts in&nbsp;digital commerce and customer experiences. As&nbsp;a&nbsp;full-service agency, we&nbsp;deliver consulting, design, development, support, and analytics services to&nbsp;brands, retailers, manufacturers, and organizations all over the world.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="205099">
          <div class="date">24 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/cadeau-concepten/vacancies/205099/">Senior NextJS Developer at&nbsp;Cadeau Concepten</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/cadeau-concepten/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_6HQ919r.png" srcset="https://s.dou.ua/img/static/favicons/32_LXahS3b.png 1.1x">&nbsp;Cadeau Concepten</a></strong>
            <span class="salary">$4500–5000</span>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          With 3&nbsp;years of&nbsp;experience as&nbsp;a&nbsp;React JS&nbsp;developer, you are looking for a&nbsp;new adventure. We&nbsp;hear you! At&nbsp;Cadeau Concepten we’re looking for a&nbsp;teammate with experience in&nbsp;ReactJS, NextJS, REST, Javascript 6&nbsp;ES6+ and knowledge of&nbsp;git and git workflows.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229968">
          <div class="date">23 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/windmill-smart-solutions/vacancies/229968/">React Lead</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/windmill-smart-solutions/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_QXmY4oV.png" srcset="https://s.dou.ua/img/static/favicons/32_EP3gnkV.png 1.1x">&nbsp;Windmill Digital</a></strong>

            <span class="cities">Львів</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for an&nbsp;enthusiastic and experienced React Development Lead who is&nbsp;focused on&nbsp;designing and delivering high-quality software and applications to&nbsp;join our team.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="227509">
          <div class="date">23 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/soc-prime-inc/vacancies/227509/">Full-Stack Web Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/soc-prime-inc/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/sp16_EeOl5Fl.png" srcset="https://s.dou.ua/img/static/favicons/32_TNeV0D5.png 1.1x">&nbsp;SOC Prime</a></strong>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are growing and looking for a&nbsp;new member of&nbsp;our team! Let’s start your successful career in&nbsp;a&nbsp;cybersecurity product company. We&nbsp;are looking for a&nbsp;Full-Stack web developer who will be&nbsp;an&nbsp;integral member of&nbsp;the SOC Prime R&amp;D&nbsp;team.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229905">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/evo/vacancies/229905/">Senior Front End Engineer (Akurata)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/evo/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/evo.png" srcset="https://s.dou.ua/img/static/favicons/evo32.png 1.1x">&nbsp;EVO</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          Akurata&nbsp;— це&nbsp;сервіс для міжнародного підписання документів від творців «Вчасно». Ми&nbsp;полегшуємо обмін договорами, інвойсами, комерційними пропозиціями і&nbsp;ще&nbsp;багато якими документами. Все що&nbsp;про документи нудно? Ні, це&nbsp;не&nbsp;про нас.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229856">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/rubygarage/vacancies/229856/">Senior front-end Developer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/rubygarage/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_ooKZcH2.png" srcset="https://s.dou.ua/img/static/favicons/32_qSLOHBt.png 1.1x">&nbsp;RubyGarage</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for an&nbsp;experienced React Developer to&nbsp;join our team. We’re using the latest technologies, including React, ES6&nbsp;JavaScript, pub/sub architecture, and a&nbsp;clean component-based approach to&nbsp;deliver reusable, innovative, and responsive experiences.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229855">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/dataart/vacancies/229855/">Senior Roku Developer with BrightScript</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/dataart/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_vF17PH7.png" srcset="https://s.dou.ua/img/static/favicons/32_0OCVxOP.png 1.1x">&nbsp;DataArt</a></strong>

            <span class="cities">Київ, Харків, Львів, Дніпро, Одеса, Краків (Польща), Лодзь (Польща), Люблін (Польща), Вроцлав (Польща), віддалено</span>
        </div>

        <div class="sh-info">
          CLIENT

The client is&nbsp;the leading omnichannel platform for selling fine jewelry, and colored gemstones in&nbsp;the United States.

They would like to&nbsp;build&nbsp;TV apps for different platforms like Android, Apple, Roku, etc.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229843">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/brainstack/vacancies/229843/">JavaScript developer (Marketing RnD)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/brainstack/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_wwacKUj.png" srcset="https://s.dou.ua/img/static/favicons/32_wQr2YlB.png 1.1x">&nbsp;Brainstack_</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Зараз ми&nbsp;шукаємо досвідченого Javascript developer який приєднається до&nbsp;Marketing RND  Brainstack_ - українська мультипродуктова IT-компанія, яка розробляє кросплатформенні додатки та&nbsp;сервіси.  Ми— команда однодумців, яких об’єднує спільна мета та&nbsp;цінності.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="82353">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/leap-gaming/vacancies/82353/">Frontend game Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/leap-gaming/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/l16_l5HEZEV.png" srcset="https://s.dou.ua/img/static/favicons/l32_Gf60obR.png 1.1x">&nbsp;Leap-Gaming</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are devoted developers of&nbsp;high-end gaming applications. Our games are offered by&nbsp;online and retail gaming operators worldwide and generate tens of&nbsp;thousands of&nbsp;engagement points with end-users.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="218667">
          <div class="date">22 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/pin-up-tech/vacancies/218667/">Frontend Developer (Angular)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/pin-up-tech/vacancies/">PIN-UP.TECH</a></strong>

            <span class="cities">Київ, Варшава (Польща), віддалено</span>
        </div>

        <div class="sh-info">
          Responsibilities:  • Development of&nbsp;new modules for the system; • Support and extension of&nbsp;existing modules; • APIs integration, Swagger review\proposals; • Collaboration with other team members; • Participation in&nbsp;task estimation and prioritisation; • Project improvement/refactoring...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="208249">
          <div class="date">21 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/xenoss/vacancies/208249/">Middle/Senior Frontend Developer&nbsp;| Toshiba</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/xenoss/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/x16_FTSDpQU.png" srcset="https://s.dou.ua/img/static/favicons/x32_8tb1rzn.png 1.1x">&nbsp;Xenoss</a></strong>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          Toshiba is&nbsp;the global market share leader in&nbsp;retail store technology.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229782">
          <div class="date">21 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/artkai/vacancies/229782/">Senior Frontend (React) Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/artkai/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_Ukxq3qj.png" srcset="https://s.dou.ua/img/static/favicons/32_oiHx15Z.png 1.1x">&nbsp;Artkai</a></strong>
            <span class="salary">$3500–4500</span>

            <span class="cities">Київ, Дніпро</span>
        </div>

        <div class="sh-info">
          We&nbsp;are a&nbsp;global digital product design &amp;&nbsp;development team of&nbsp;100+ people headquartered in&nbsp;Ukraine. From whiteboard to&nbsp;market we&nbsp;assist enterprises and startups to&nbsp;shape, build and enhance products that make sense.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="223908">
          <div class="date">21 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/treeum/vacancies/223908/">Frontend Developer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/treeum/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/tr16_SEnAjXV.png" srcset="https://s.dou.ua/img/static/favicons/32_CLPaZxv.png 1.1x">&nbsp;Treeum</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          Treeum&nbsp;— продуктова FinTech-компанія. Ми&nbsp;розробляємо платформи, прості та&nbsp;зручні сервіси, які дозволяють українцям легко вибрати і&nbsp;замовити фінансові послуги.

Одним із&nbsp;бізнес напрямків в&nbsp;компанії є&nbsp;страхування.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229752">
          <div class="date">21 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/playtika-ua/vacancies/229752/">Senior JavaScript (TypeScript) Developer(Slotomania)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/playtika-ua/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_hkMCCcT.png" srcset="https://s.dou.ua/img/static/favicons/32_a5qqctP.png 1.1x">&nbsp;Playtika</a></strong>

            <span class="cities">Київ, Дніпро</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;JavaScript Developer to&nbsp;join our Kyiv team on&nbsp;a&nbsp;full-time basis.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229741">
          <div class="date">21 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/biscience/vacancies/229741/">Senior Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/biscience/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_jU6uovN.png" srcset="https://s.dou.ua/img/static/favicons/32_3wpY8xt.png 1.1x">&nbsp;BIScience</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          BIScience  BIScience is&nbsp;an&nbsp;Internet technology company pioneering the world of&nbsp;digital media and  audience intelligence with innovative technologies, harnessing user-centric data at&nbsp;scale to  bring new insights into the online marketing industry and audience analytics.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229716">
          <div class="date">20 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/dataart/vacancies/229716/">Interactive Front-end Developer, Online Education Solutions</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/dataart/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_vF17PH7.png" srcset="https://s.dou.ua/img/static/favicons/32_0OCVxOP.png 1.1x">&nbsp;DataArt</a></strong>

            <span class="cities">Київ, Харків, Львів, Дніпро, Одеса, Краків (Польща), Лодзь (Польща), Люблін (Польща), Рига (Латвія), Софія (Болгарія), Тбілісі (Грузія), Варна (Болгарія), Вроцлав (Польща), Єреван (Вірменія), віддалено</span>
        </div>

        <div class="sh-info">
          Our client is&nbsp;a&nbsp;pioneer in&nbsp;US schools education since 2000, it&nbsp;is&nbsp;leading the way in&nbsp;next-generation curriculum and formative assessment. They develop a&nbsp;number of&nbsp;solutions and interactive web products for teachers, students and their parents.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="151516">
          <div class="date">20 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/trueplay/vacancies/151516/">Senior Frontend developer (Vue.js, TypeScript)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/trueplay/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_m5k4hO4.png" srcset="https://s.dou.ua/img/static/favicons/32_fSF14Ie.png 1.1x">&nbsp;Trueplay</a></strong>

            <span class="cities">Варна (Болгарія), віддалено</span>
        </div>

        <div class="sh-info">
          TruePlay capitalizes on&nbsp;the latest distributed ledger technologies, making player activity tracking easy and transparent for any party involved.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229647">
          <div class="date">20 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/united-tech/vacancies/229647/">Lead Front-End Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/united-tech/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_ooUPmFK.png" srcset="https://s.dou.ua/img/static/favicons/32_X4Jo2Bx.png 1.1x">&nbsp;United Tech</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          By&nbsp;bringing talented and bold minds together, we&nbsp;build global social networking and streaming products to&nbsp;connect people worldwide.

And now we’re looking for an&nbsp;experienced Front-End developer who will join the Front-end part of&nbsp;our product and continue its evolution.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="227370">
          <div class="date">20 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/spd-ukraine/vacancies/227370/">Middle JS/VueJS Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/spd-ukraine/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/s16_OBaPIcq.png" srcset="https://s.dou.ua/img/static/favicons/s32_qpGjA0n.png 1.1x">&nbsp;SPD-Ukraine</a></strong>

            <span class="cities">Київ, Львів, Черкаси, віддалено</span>
        </div>

        <div class="sh-info">
          SPD-Ukraine is&nbsp;looking for a&nbsp;Middle JS/VueJS developer to&nbsp;work with Fintech-product for the&nbsp;US market. You’ll work with the Data Feed subproject, which consists of&nbsp;several areas.

About the project

PitchBook&nbsp;— a&nbsp;platform for investment professionals.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="178627">
          <div class="date">18 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/n-ix/vacancies/178627/">Senior Front End Engineer (#15911126)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/n-ix/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/n16_xvPlf0s.png" srcset="https://s.dou.ua/img/static/favicons/favicon_32.png 1.1x">&nbsp;N-iX</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          Our customer is&nbsp;a&nbsp;leading digital health company delivering a&nbsp;range of&nbsp;evidence-based digital psychological therapy programs to&nbsp;those affected by&nbsp;mental health-related issues.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229561">
          <div class="date">17 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/marka-development/vacancies/229561/">Middle/Middle+ Full-stack developer (C/JS)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/marka-development/vacancies/">Marka Development</a></strong>
            <span class="salary">$2500–3500</span>

            <span class="cities">Запоріжжя, віддалено</span>
        </div>

        <div class="sh-info">
          Must have skills

—&nbsp;a&nbsp;good knowledge of&nbsp;C (for backend)

—&nbsp;a&nbsp;good knowledge of&nbsp;JS (for frontend)

—&nbsp;a&nbsp;good knowledge of&nbsp;Linux

—&nbsp;PHP

—&nbsp;HTML5/CSS

—&nbsp;Soap/Rest API

—&nbsp;Sql

—&nbsp;3+&nbsp;years of&nbsp;commercial development experience

—&nbsp;at&nbsp;least upper-intermediate level in&nbsp;English



Nice...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229542">
          <div class="date">17 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/ciklum/vacancies/229542/">Senior Full Stack Engineer (230001MZ)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/ciklum/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_3R6tmbV.png" srcset="https://s.dou.ua/img/static/favicons/32_NNimfkW.png 1.1x">&nbsp;Ciklum</a></strong>

            <span class="cities">Київ, Харків, Львів, Дніпро, Одеса, Вінниця, віддалено</span>
        </div>

        <div class="sh-info">
          Ciklum is&nbsp;looking for a&nbsp;Senior Full Stack Engineer to&nbsp;join our team full-time in&nbsp;Ukraine.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="158377">
          <div class="date">17 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/apomedical-ltd/vacancies/158377/">Middle+/Senior Front-End developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/apomedical-ltd/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_OHyyuen.png" srcset="https://s.dou.ua/img/static/favicons/32_Y0RoUSG.png 1.1x">&nbsp;Apomedical (IL) Ltd</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Вимоги:
Мінімум 5&nbsp;років досвіду роботи front-end розробником
Мінімум&nbsp;1,5 року досвіду роботи в&nbsp;Angular 2+&nbsp;(маршрутизація, компоненти, реактивні форми, директиви, сервіси і&nbsp;т.п.)
Базові знання патернів програмування (Dependency Injection, Singleton, Fabric, Adapter, Observer...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229473">
          <div class="date">16 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/gr8-tech/vacancies/229473/">Senior Front-End Engineer for CRM (Engagement)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/gr8-tech/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_ba3Jm1I.png" srcset="https://s.dou.ua/img/static/favicons/32_0mq3LVZ.png 1.1x">&nbsp;GR8 Tech</a></strong>

            <span class="cities">Лімасол (Кіпр), Прага (Чехія)</span>
        </div>

        <div class="sh-info">
          GR8 Tech&nbsp;— це&nbsp;глобальна продуктова компанія, яка розробляє та&nbsp;забезпечує інноваційні, масштабовані платформи та&nbsp;бізнес-рішення для індустрії iGaming.
        </div>
      </div>
    </li>


               
    <li class="l-vacancy">
      <div class="vacancy" _id="229423">
          <div class="date">16 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/socialtech/vacancies/229423/">Middle Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/socialtech/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_B7Zc2Bu.png" srcset="https://s.dou.ua/img/static/favicons/32_ZBwSkfl.png 1.1x">&nbsp;SocialTech</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          Brighterly&nbsp;— стартап venture builder’а SocialTech, який будує онлайн школу з&nbsp;вивчення математики для дітей від 6&nbsp;до&nbsp;13&nbsp;років в&nbsp;США.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229388">
          <div class="date">15 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/innovecs/vacancies/229388/">Senior Front End Web Developer (JavaScript, Angular)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/innovecs/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/innovecs_16.png" srcset="https://s.dou.ua/img/static/favicons/innovecs32.png 1.1x">&nbsp;Innovecs</a></strong>

            <span class="cities">Будапешт (Угорщина), Краків (Польща), віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;Senior Front End Web Developer to&nbsp;join our project a&nbsp;fun &amp;&nbsp;social platform (App, Web) for photographers of&nbsp;all levels

REQUIREMENTS



At&nbsp;least 5&nbsp;years of&nbsp;experience in&nbsp;JavaScript.

At&nbsp;least 4&nbsp;years of&nbsp;experience with Angular (2+)&nbsp;— must.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229287">
          <div class="date">15 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/mintymint/vacancies/229287/">Middle VueJS Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/mintymint/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_W8ibCqS.png" srcset="https://s.dou.ua/img/static/favicons/32_5gGtN58.png 1.1x">&nbsp;MintyMint</a></strong>
            <span class="salary">$4000–4500</span>

            <span class="cities">за кордоном</span>
        </div>

        <div class="sh-info">
          MintyMint is&nbsp;a&nbsp;custom full-cycle development and mobile company. At&nbsp;MintyMint, the priority is&nbsp;to&nbsp;save your time and effort by&nbsp;delivering world-class software that makes life easier.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229269">
          <div class="date">14 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/908/vacancies/229269/">Middle Frontend Developer (Vue.js)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/908/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_OW9AiMk.png" srcset="https://s.dou.ua/img/static/favicons/32_YnGRAAv.png 1.1x">&nbsp;908</a></strong>

            <span class="cities">Дніпро</span>
        </div>

        <div class="sh-info">
          908&nbsp;— продуктова компанія, яка спеціалізується на&nbsp;Low-code, чатботах та&nbsp;Legal tech. Наші сервіси допомагають мільйонам користувачів та&nbsp;десяткам тисяч бізнесів.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="226645">
          <div class="date">14 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/frozeneon/vacancies/226645/">Team Lead Front-End (Vue.js)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/frozeneon/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/n16_MX2qWSz.png" srcset="https://s.dou.ua/img/static/favicons/n32_AIDsCHd.png 1.1x">&nbsp;Frozeneon</a></strong>

            <span class="cities">Удаленная работа, віддалено</span>
        </div>

        <div class="sh-info">
          Hey, Front-End Superstar! Ты&nbsp;владеешь высокими навыками в&nbsp;Vue.js и&nbsp;имеешь минимум год опыта управления командой? Твоя цель&nbsp;— создание уникальных и&nbsp;увлекательных игровых продуктов?
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229245">
          <div class="date">14 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/onix/vacancies/229245/">Frontend Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/onix/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_L8PwsUi.png" srcset="https://s.dou.ua/img/static/favicons/32_outzpeA.png 1.1x">&nbsp;Onix-Systems</a></strong>
            <span class="salary">$3200–4000</span>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          Transifex, a&nbsp;Greek-born company, internationally recognized by&nbsp;today’s tech leaders as&nbsp;a&nbsp;leading agile translation management solution, is&nbsp;seeking an&nbsp;experienced Backend Software Engineer with a&nbsp;strong technical background and experience in&nbsp;an&nbsp;interactive development process.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229177">
          <div class="date">14 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/delphi-llc/vacancies/229177/">Senior Front End React.js native developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/delphi-llc/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/del.png" srcset="https://s.dou.ua/img/static/favicons/d32_MqHZczf.png 1.1x">&nbsp;Delphi Software</a></strong>

            <span class="cities">Вінниця, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;Senior Front End React.js native developer to&nbsp;join our team. Our US&nbsp;customer is&nbsp;working on&nbsp;community project for geotagging regions with wild animals.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229152">
          <div class="date">13 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/numerical-technologies-ltd/vacancies/229152/">Front-end Developer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/numerical-technologies-ltd/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/compatibl.ico" srcset="https://s.dou.ua/img/static/favicons/co32_kS8mUPJ.png 1.1x">&nbsp;Numerical Technologies</a></strong>

            <span class="cities">за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          Numerical Technologies is&nbsp;a&nbsp;leading provider of&nbsp;custom software solutions and services specializing in&nbsp;risk, limits, and regulatory capital. Right now, we&nbsp;are looking for a&nbsp;Front-end Developer to&nbsp;join our team.  What will you be&nbsp;doing?
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229067">
          <div class="date">13 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/olearis/vacancies/229067/">FullStack developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/olearis/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_F1mPnqK.png" srcset="https://s.dou.ua/img/static/favicons/32_M6WiTUZ.png 1.1x">&nbsp;Olearis</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          learis is&nbsp;looking for a&nbsp;full-stack developer for a&nbsp;project of&nbsp;electronic online spreadsheets for calculations.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="229055">
          <div class="date">12 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/ralabs/vacancies/229055/">Strong Middle React Engineer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/ralabs/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_m21dnBx.png" srcset="https://s.dou.ua/img/static/favicons/r32_gsMiTVL.png 1.1x">&nbsp;Ralabs</a></strong>

            <span class="cities">Львів, за кордоном, віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are looking for a&nbsp;Strong Middle React Engineer for the cutting-edge AI&nbsp;project to&nbsp;join our team.  What is&nbsp;this project about? The project is&nbsp;from Ireland, whose mission is&nbsp;to&nbsp;build an&nbsp;amazing data science development experience.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="149049">
          <div class="date">12 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/wix/vacancies/149049/">Frontend Engineer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/wix/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_uc90nsl.png" srcset="https://s.dou.ua/img/static/favicons/32_t8J72jT.png 1.1x">&nbsp;WiX</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          We&nbsp;are:

Wix Kyiv’s Frontend Engineering group, developing the best products in&nbsp;the world. Wix is&nbsp;a&nbsp;platform that enables more than 180M users around the world to&nbsp;build an&nbsp;online presence and manage their business online.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="228997">
          <div class="date">10 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/bossgs/vacancies/228997/">Middle+ Front end developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/bossgs/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/b_cjk5WnJ.png" srcset="https://s.dou.ua/img/static/favicons/32_N69unM9.png 1.1x">&nbsp;BOSS. Gaming Solutions</a></strong>

            <span class="cities">Київ</span>
        </div>

        <div class="sh-info">
          Requirements:

• 3+&nbsp;years of&nbsp;commercial experience with Angular (we&nbsp;use version from 12); • Excellent knowledge of&nbsp;Javascript standards; • Good understanding of&nbsp;OOP and strong knowledge of&nbsp;Typescript; • Fundamental concepts of&nbsp;Software Engineering; • Experience with CSS preprocessors;...
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="224997">
          <div class="date">10 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/free-ua/vacancies/224997/">Full Stack developer (Node.js, React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/free-ua/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_zPdpeU2.png" srcset="https://s.dou.ua/img/static/favicons/32_qE0R3R4.png 1.1x">&nbsp;Free UA</a></strong>
            <span class="salary">$2000–3500</span>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          Web Development Agency FreeUA у&nbsp;звʼязку з&nbsp;розширенням розшукує амбітних та&nbsp;талановитих Full Stack розробників з&nbsp;досвідом роботи в&nbsp;комерційних проєктах від 3&nbsp;років.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="228850">
          <div class="date">8 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/raiffeisen/vacancies/228850/">Senior Frontend Developer (Angular)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/raiffeisen/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/aval.png" srcset="https://s.dou.ua/img/static/favicons/a32_WoPJi1m.png 1.1x">&nbsp;Raiffeisen Bank</a></strong>

            <span class="cities">віддалено</span>
        </div>

        <div class="sh-info">
          We&nbsp;are Aval&nbsp;— Raiffeisen Bank Aval&nbsp;— Raiffeisen Bank Ukraine. We&nbsp;are Ukrainian bank. For 30&nbsp;years, since the first steps of&nbsp;Independence, we&nbsp;have been creating and building the banking system of&nbsp;our country #Together_with_Ukraine.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="228848">
          <div class="date">8 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/similarweb/vacancies/228848/">Senior Front-End Engineer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/similarweb/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_g1rbuJX.png" srcset="https://s.dou.ua/img/static/favicons/32_mntYfDa.png 1.1x">&nbsp;Similarweb</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Similarweb is&nbsp;the leading digital intelligence platform used by&nbsp;over 3500 global customers. Our wide range of&nbsp;solutions powers the digital strategies of&nbsp;companies like Google, eBay, and Adidas.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="228833">
          <div class="date">8 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/similarweb/vacancies/228833/">Front-End Engineer (React)</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/similarweb/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_g1rbuJX.png" srcset="https://s.dou.ua/img/static/favicons/32_mntYfDa.png 1.1x">&nbsp;Similarweb</a></strong>

            <span class="cities">Київ, віддалено</span>
        </div>

        <div class="sh-info">
          Similarweb is&nbsp;the leading digital intelligence platform used by&nbsp;over 3500 global customers. Our wide range of&nbsp;solutions powers the digital strategies of&nbsp;companies like Google, eBay, and Adidas.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="228808">
          <div class="date">8 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/gr8-tech/vacancies/228808/">Middle Front End Developer for Gambling Team</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/gr8-tech/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_ba3Jm1I.png" srcset="https://s.dou.ua/img/static/favicons/32_0mq3LVZ.png 1.1x">&nbsp;GR8 Tech</a></strong>

            <span class="cities">Лімасол (Кіпр), Прага (Чехія)</span>
        </div>

        <div class="sh-info">
          GR8 Tech&nbsp;— це&nbsp;глобальна продуктова компанія, яка розробляє та&nbsp;забезпечує інноваційні, масштабовані платформи та&nbsp;бізнес-рішення для індустрії iGaming.
        </div>
      </div>
    </li>

               
    <li class="l-vacancy">
      <div class="vacancy" _id="223803">
          <div class="date">8 лютого 2023</div>
        <div class="title">
          <a class="vt" href="https://jobs.dou.ua/companies/sixt/vacancies/223803/">Senior\Middle React Developer</a>&nbsp;<strong>в&nbsp;<a class="company" href="https://jobs.dou.ua/companies/sixt/vacancies/"><img class="f-i" src="https://s.dou.ua/img/static/favicons/16_N3k9BkA.png" srcset="https://s.dou.ua/img/static/favicons/32_YfTuvQD.png 1.1x">&nbsp;SIXT</a></strong>

            <span class="cities">за кордоном</span>
        </div>

        <div class="sh-info">
          This position is&nbsp;open in&nbsp;Lisbon, Portugal. Work schedule supposed to&nbsp;work from the office 2-3 days a&nbsp;week.

 Sixt is&nbsp;a&nbsp;leading global mobility service provider with sales of&nbsp;€1.53 billion and around 7,000 employees worldwide.
        </div>
      </div>
    </li>

</ul>`


module.exports = router;
