import puppeteer from "puppeteer";

async function scrapeSite(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    timeout: 7000,
    waitForInitialPage: false,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.goto(url);
  const data = await page.content();
  await browser.close();
  return data;
}

async function getTitleDate(data, title) {
  let reg = RegExp(`(?<=>)${title}.+?(?=<\/)`, "vi");
  let foundTitle = reg.exec(data);
  if (foundTitle === null) return { title: title };
  let year = foundTitle[0].match(/\([0-9]{4}\)/v);
  return { title: year !== null ? (title += " " + year) : title };
}

async function getTimes(data) {
  const matches = data.match(/(?<=>)\d{1,5}(?=.? Hours)(?! Hours Ago)/g);
  const truncated =
    matches !== null
      ? matches.filter((_, i) => i < 4).sort((a, b) => Number(a) - Number(b))
      : Array(4).fill("0");
  if (truncated.length < 4) {
    return {
      standardLength: Math.min(...truncated),
      completionist: Math.max(...truncated),
    };
  }
  return {
    standardLength: parseInt(truncated.at(1)),
    completionist: parseInt(truncated.at(-1)),
  };
}

async function getGameData(url, title) {
  let data = await scrapeSite(url);
  let [datedTitle, times] = await Promise.all([getTitleDate(data, title), getTimes(data)]);
  return Object.assign({}, datedTitle, times);
}

export { scrapeSite, getTimes, getTitleDate, getGameData };
