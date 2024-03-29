require('dotenv').config()

const { Actions, Builder, By, Key, until } = require('selenium-webdriver')
driver = new Builder().forBrowser('chrome').build()

//くじのリンクは以下のページから拝借
kuji_list_url = 'https://rakucoin.appspot.com/rakuten/kuji/'
urls = []
cookie = null

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function login(driver, url) {
  await console.log('ログイン処理開始')
  // ユーザー名の入力
  await sleep(5000)
  let username = await driver.findElement(By.name('username'))
  await driver.wait(until.elementIsEnabled(username), 10000)
  await driver.wait(until.elementIsVisible(username), 10000)
  await driver.findElement(By.name('username')).sendKeys(process.env.UID, Key.RETURN)
    .then(async function () {
      return await console.log('ユーザー名完了')
    })
    .then(async function() {
      await sleep(5000)

      let password = await driver.findElement(By.name('password'))
      await driver.wait(until.elementIsEnabled(password), 10000)
      await driver.wait(until.elementIsVisible(password), 10000)
      // パスワードの入力
      await driver.findElement(By.name('password')).sendKeys(process.env.PASSWORD, Key.RETURN)
      return console.log('パスワード完了')
    })
    .catch(function(error) {
      console.log(error)
      console.log('ログイン失敗')
    })

  var reg = await new RegExp('^(?!.*'+url+').+$')
  await driver.wait(until.urlMatches(reg), 15000)

  await console.log('ログイン処理終了')

  console.log(await driver.getCurrentUrl())

  return driver;
}

async function kuji(driver, url) {
  // くじを引ける画面の場合
  await console.log(await driver.getTitle()+':くじを引く。')

  await driver.wait(until.elementLocated(By.id('entry')), 10000)
  let btn = await driver.findElement(By.id('entry'))
  await driver.wait(until.elementIsEnabled(btn), 10000)
  await driver.wait(until.elementIsVisible(btn), 10000)
  let status = false
  while(status == false) {
    style = await btn.getAttribute('height')
    status = style > 10
  }
  await btn.click()

  // くじを引き、リダイレクト処理が行われるまで待機する。
  var reg = await new RegExp('^(?!.*'+url+').+$')
  await driver.wait(until.urlMatches(reg), 20000)

  return driver;
}

(async() => {
  await driver.get(kuji_list_url)
  kuji_urls = await driver.findElements(By.css('table tbody tr td a'))
  for (url of kuji_urls) {
    urls.push(await url.getAttribute('href'))
  }

  urls = [urls[0]]

  for (url of urls) {
    console.log(url)
    try {
      await driver.get(url)
      current_url = driver.getCurrentUrl()

      if (await driver.wait(until.urlContains('login'), 5000)) {
        console.log('ログイン処理')
        await login(driver, await current_url)
        await kuji(driver, url)
      }
      else {
        await kuji(driver, url)
      }
    }
    catch (error) {
      console.log(error)
      console.log(await driver.getTitle()+':くじは引けませんでした。')
    }
  }
  driver.quit()
})()