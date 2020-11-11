const cheerio = require('cheerio');
const axios = require('axios');
const iconv = require('iconv-lite');
var sequence = require('promise-sequence');
// основноый вызов
/*
    Runs tasks in sequence and resolves a promise upon finish

    tasks: an array of functions that return a promise upon call.
    parameters: an array of arrays corresponding to the parameters to be passed on each function call.
    context: Object to use as context to call each function. (The 'this' keyword that may be used inside the function definition)
*/

list = [
    "http://www.yuzhcable.info/index.php?CAT=11&MRI=110101",
    "http://www.yuzhcable.info/index.php?CAT=11&MRI=110103",
    "http://www.yuzhcable.info/index.php?CAT=11&MRI=110104",
    "http://www.yuzhcable.info/index.php?CAT=11&MRI=110105",
    "http://www.yuzhcable.info/index.php?CAT=11&MRI=110106",
    // "http://www.yuzhcable.info/index.php?CAT=11&MRI=110201",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100101",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100102",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100103",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100104",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100105",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100106",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100107",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100409",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100410",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100411",
    // "http://www.yuzhcable.info/index.php?CAT=10&MRI=100412",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=150701",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=150702",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=150801",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=150802",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=152201",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=152301",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=152302",
    // "http://www.yuzhcable.info/index.php?CAT=15&MRI=152401",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180101",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180108",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180109",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180116",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180117",
    // "http://www.yuzhcable.info/index.php?CAT=18&MRI=180123",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200105",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200106",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200107",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200205",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200206",
    // "http://www.yuzhcable.info/index.php?CAT=20&MRI=200303",
];

let result = [];
let promises = [];

// запускаме паралельные копии ДОЛГО!!!!

// async function readSeqiencily () {
//     for (const element of list) {
//         const contents = await getCategory(element)
//         console.log(contents);
//     }
// }

new Promise(() => {
        list.forEach((element) => {
            setTimeout(() => promises.push(
                getCategory(element)
            ), 1000);
        })
    }
).then(
    // толпа  экземпляров getCategory
    // накпаливает реузультат в result
    //Promise.all(promises).then((xx) =>
    sequence(promises).then((xx) =>
        //sequential(promises).then((xx) =>
        console.log(
            'Верхний промис',
            JSON.stringify(xx)
        )
    )
)

function wait(ms, value) {
    return new Promise(resolve => setTimeout(resolve, ms, value));
}

function getCategory(url) {
    // для getProduct
    let localPromices = [];
    return axios.get(url,
        {
            // не поддерживаме редирект ловим 301 code и пустую страницу ловим
            maxRedirects: 0,
            responseEncoding: 'binary',

            headers: {
                'authority': 'www.olx.ua',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                // ВАЖНО !!!
                'referer': url,
                'accept-language': 'en-UA,en;q=0.9,ru-AU;q=0.8,ru;q=0.7,en-US;q=0.6',
                //'cookie': 'PHPSESSID=psb0hg31nq2ceekba3cunsm847'
            }
        }
    )
        .then(value => wait(1000, value))
        .then(
            (content) => {
                return cheerio.load(
                    iconv.decode(content.data, 'windows-1251')
                    // content.data
                    //         .replace(/[\r\n\t]+/g, ' ')
                    //         .replace(/ +(?= )/g, '')
                    //         .trim()
                );
            }
        ).catch(_error => {
            console.log('getCategory ДАННЫХ НЕТ axios вернул ошибку \n' + url, _error);
            // контент пустой
            return '';
        }).then(($) => {

                // список товаров
                $('td.UK_Tbll a').each((idx, elem) => {
                    let link = $(elem).attr('href');
                    let title = $(elem).find('span.UK_Tbb').text();


                    // парсим сразу ребенка
                    setTimeout(() => localPromices.push(
                        getProduct({
                            'url_parent': url,
                            'link_product': "http://www.yuzhcable.info/" + link,
                            'name': title,
                        })
                            .then((response) => {
                                result.push(response);
                            })
                    ), 1000)

                })

                //const timeout = async ms => new Promise(resolve =>
                //   setTimeout(() => {
                //     console.log("done", ms);
                //     resolve();
                //   }, ms)
                // );


            }
        ).then(() => {

            // толпа экземпляров getProduct
            // не двигаемся дальше пока не выполним всех  для данной категории
            //return Promise.all(localPromices)
            return sequence(localPromices)

                .then(() =>
                    setTimeout(function () {
                        var d = new Date();
                        localtime = d.toLocaleTimeString('en-US', {hour12: false});

                        console.log("ждем после категории", localtime);
                    }, 0)
                )
                .then(() => result
                    // console.log("ОТРАБОТАЛИ СЛЕДУЮЩУЮ КАТЕГОРИЮ - НАКОПИЛИ",
                    //     JSON.stringify(result)
                    // )

                )

        })
}

function getProduct(parent) {
    let content;
    let url_product = parent.link_product;
    let product = {};
    product.name = parent.name;


    return axios.get(url_product,
        {
            // не поддерживаме редирект ловим 301 code и пустую страницу ловим
            maxRedirects: 0,
            responseEncoding: 'binary',
            headers: {
                'authority': 'www.olx.ua',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                // ВАЖНО !!!
                'referer': url_product,
                'accept-language': 'en-UA,en;q=0.9,ru-AU;q=0.8,ru;q=0.7,en-US;q=0.6',
                //'cookie': 'PHPSESSID=psb0hg31nq2ceekba3cunsm847'
            }
        }
    )
        .then(value => wait(1000, value))
        .then(
            (con) => {

                // глобальная
                content = iconv.decode(con.data, 'windows-1251');
                // JQUERY
                return cheerio.load(
                    content
                    // content.data
                    //         .replace(/[\r\n\t]+/g, ' ')
                    //         .replace(/ +(?= )/g, '')
                    //         .trim()
                );
            }
        ).catch(_error => {
            console.log('getProduct ДАННЫХ НЕТ axios вернул ошибку \n' + url_product, _error);
            // контент пустой
            return '';

        })


        .then(($) => {

            if (typeof content == 'undefined') {
                console.log("НЕ ВИЖУ этот продукт", parent)
                return {};

            }
            //UK_TextDescr = '(.*?)'
            //UK_TextConstr = '(.*?)'
            //UK_TextChar = '(.*?)'

            // let matches = content.matchAll(/UK_TextDescr = '(.*?)'/g);


            //console.log(content);

            product.descr =
                Array.from(content.matchAll(/UK_TextDescr = '(.*?)'/g), m => m[1])[0]

            // обозначение на схеме не требуется
            // product.constr =
            //     Array.from(content.matchAll(/UK_TextConstr = '(.*?)'/g), m => m[1])[0]

            product.text =
                Array.from(content.matchAll(/UK_TextChar = '(.*?)'/g), m => m[1])[0]

            let gost =
                Array.from(content.matchAll(/<BR>(.*?)<\/TD>/g), m => m[1])[0]
            product.name += " " + gost

            //console.log(content);
            $('img.UK_Cable').each((idx, elem) => {
                let link = $(elem).attr('src');
                product.link_image =
                    "http://www.yuzhcable.info/" + link;

            })
            return product;
        })


        .then((product) => {
            return new Promise(function (resolve, reject) {
                // Setting 2000 ms time
                setTimeout(() => {
                    var d = new Date();
                    localtime = d.toLocaleTimeString('en-US', {hour12: false});
                    console.log("ЖДЕМ ТОВАР ****************** ", localtime);
                    resolve(product);
                }, 0);
            })
        });


}
