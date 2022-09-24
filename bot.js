const puppeteer = require('puppeteer');
require('dotenv').config();
const fs = require('fs');

const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

// delay function
function waitFor(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

(async () => {
  // Attivazione browser
  const browser = await puppeteer.launch({headless: false, args: minimal_args})
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 13500})
  
  // Navigazione verso pagina artista
  let artista = "Marracash"
  await page.goto(`https://open.spotify.com/search/artist:${artista}/tracks`, {waitUntil: 'networkidle0'})
  // Click cookie notice
  await page.waitForSelector('#onetrust-accept-btn-handler')
  await page.click('#onetrust-accept-btn-handler')
  //setup scroll all'infinito
  const elem = await page.$('body');
  const boundingBox = await elem.boundingBox();
  await page.mouse.move(
    boundingBox.x + boundingBox.width / 2,
    boundingBox.y + boundingBox.height / 2,
  )
  let dati = []
    let elements = await page.$$(".h4HgbO_Uu1JYg5UGANeQ");
    for (let element of elements) {
        await element.click({button: "right"})
        await waitFor(100)
        await page.waitForSelector('.DuEPSADpSwCcO880xjUG > .NmbeQabkSLXf0mTAhSLl')
        await page.click('.DuEPSADpSwCcO880xjUG > .NmbeQabkSLXf0mTAhSLl')
        await waitFor(100)
        await page.waitForSelector('span.IpshWHA6nc9nJxRssAlb')
    // Raccolta scrittori
        let autori = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.iGT1RlMPCwUlIiRPbOqg > div:nth-of-type(2) span.IpshWHA6nc9nJxRssAlb'))
            .map(writer => writer.innerText)
        )
        await waitFor(100)
    // Raccolta titolo traccia e artisti partecipanti nel ciclo del 
        let traccia = await (await (await element.$('.t_yrXoUO3qGsJS4Y6iXX')).getProperty('innerHTML')).jsonValue()
        let artisti = await (await (await element.$('.rq2VQ5mb9SDAFWbBIUIn')).getProperty('textContent')).jsonValue()
    // Push autori, nome pezzo e artisti in dati
        dati.push({
            Traccia: traccia,
            Artisti: artisti,
            Scritto_da: autori
        })
        await page.mouse.click(10, 10)
    // await page.$(element)
        fs.writeFileSync(`./canzoni-${artista}.json`, JSON.stringify(dati, null, 2), "utf-8");
    }
  
    await browser.close()
})();