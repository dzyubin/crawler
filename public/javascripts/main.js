const axios = require('axios');
const cheerio = require('cheerio');
// const url = "https://www.iban.com/exchange-rates";
const url = 'https://jobs.dou.ua/vacancies/?category=Front%20End';

fetchData(url).then( (res) => {
    // console.log(res);
    const html = res.data;
    const $ = cheerio.load(html);
    // console.log($);
    const vacancies = $('#vacancyListId ul li');
    vacancies.each((i, el) => {
        if (i > 3) return
        const href = $(el).find('.title a.vt')[0].attribs.href;
        // console.log(href);
        fetchData(href).then(res1 => {
            // console.log(res);
            let text = ''
            let vacancy = cheerio.load(res1.data)
            const info = vacancy('.info .l-t').html()
            text += info
            const header = vacancy('.l-vacancy h1').text()
            // console.log(header);
            text += header
            // console.log(text);
            const paragraphs = vacancy('.l-vacancy .vacancy-section p')
            const vacancySection = vacancy('.l-vacancy .vacancy-section')
            text += ' '
            text += vacancySection.html()
            console.log(text);
            // console.log(vacancySection.html());
            // console.log(p.length);
            // paragraphs.each((i, el) => {
                // if (i != 1) return
                // console.log(el);
                // console.log('p: ', el.children[0].children[0].data);
                // text += '\n' + el.children[0].data
            // })
            // const li = vacancy('.l-vacancy li')
            // console.log(li);
            // li.each((i, li) => {
                // console.log('li: ', li.children[0].data);
            // })
            // console.log(text);
            const matches = text.match(/ai|machine|learning/gi)
            console.log(matches);
            // if (matches && matches.length) {
                console.log(href)
            // };
        })
        // let title = $(this).find('td').text();
        // console.log(title);
    });

    // console.log(vacancies[0]);
})

async function fetchData(url){
    console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}