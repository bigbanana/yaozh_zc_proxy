const http = require('http');
const url = require('url');
const queryString = require('querystring');
const puppeteer = require('puppeteer');

const proxyServer = new http.Server();
proxyServer.listen(3000);

proxyServer.on('request', async (req, res) => {
  let content;
  let reqUrl = url.parse(req.url);
  let params = queryString.parse(reqUrl.query);
  if (!params.slh) {
    res.writeHead(500, { 'Content-Type': 'text/html'});
    res.write('请输入受理号！');
    res.end();
    return false;
  }
  try {
    content = await getData(params.proxy, params.slh);
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write(content);
    res.end();
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html'});
    res.write(err.message);
    res.end();
  }
})

let launchManager = {}
const createPage = async address => {
  console.log(`Create Launch: ${address}`);
  let opt = {};
  if (address) {
    opt = { args: [`--proxy-server=${address}`] }
  }
  let browser = await puppeteer.launch(opt);
  const page = await browser.newPage();
  let clear = setTimeout(() => {
    browser.close();
  }, 60*1000);
  await page.goto('http://sq.cfda.gov.cn/datasearch/schedule/search.jsp?tableId=43&tableName=TABLE43&columnName=COLUMN464,COLUMN475&title1=%E8%8D%AF%E5%93%81%E6%B3%A8%E5%86%8C%E8%BF%9B%E5%BA%A6%E6%9F%A5%E8%AF%A2');
  return {
    browser,
    page,
    clear
  }
}
const getPage = async address => {
  let launch = launchManager[address];
  if (!launch) {
    launch = await createPage(address);
    launchManager[address] = launch;
  }
  clearTimeout(launch.clear);
  launch.clear = setTimeout(() => {
    launch.browser.close().then(() => {
      delete launchManager[address];
    });
  }, 60*1000);
  return launch.page;
}
const getData = async (address, slh) => {
  console.log(`FetchData: ${slh}`);
  const page = await getPage(address);
  
  await page.waitFor('#colval');
  let checkCode = await page.evaluate(() => {
    __createCode = createCode;
    createCode = () => {};
    __createCode();
    return document.getElementById('checkCode').value
  })
  let colval = await page.$('#colval');
  let input1 = await page.$('#input1');
  let testAjax = await page.$("#testAjax");
  await colval.type(slh);
  await input1.type(checkCode);
  await page.screenshot({path: 'example.png'});
  await testAjax.click();
  let res = await page.waitForResponse(res => /sq\.cfda\.gov\.cn\/datasearch\/schedule\/search\.jsp/.test(res.url()));
  let content = await res.text();
  return content;
}

