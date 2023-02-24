require('dotenv').config();

const { Actions, Builder, By, Key, until } = require('selenium-webdriver')
driver = new Builder().forBrowser('chrome').build()

//くじのリンクは以下のページから拝借
kuji_list_url = 'https://rakucoin.appspot.com/rakuten/kuji/';
urls = [];
cookie = null;

(async() => {
  await driver.set
  await driver.get(kuji_list_url)
  kuji_urls = await driver.findElements(By.css('table tbody tr td a'))
  for (url of kuji_urls) {
    urls.push(await url.getAttribute('href'))
  }

  for (url of urls) {
    console.log(url)
    try {
      await driver.get(url)
      current_url = await driver.getCurrentUrl()
      if (current_url !== url) {
        // ログインに飛んだ場合
        await driver.wait(until.elementLocated(By.id('loginForm')), 5000);
        // ユーザー名の入力
        await driver.findElement(By.name('u')).sendKeys(process.env.UID);
        // パスワードの入力
        await driver.findElement(By.name('p')).sendKeys(process.env.PASSWORD, Key.RETURN);

        await driver.wait(until.urlMatches(reg), 15000);
        session = await driver.session();
      }
      
      // くじを引ける画面の場合
      await driver.wait(until.elementLocated(By.id('entry')), 5000)
      console.log(await driver.getTitle()+':くじを引く。')
      var btn = await driver.findElement(By.id('entry'))
      await driver
        .wait(until.elementIsEnabled(btn), 10000)
        .wait(until.elementIsVisible(btn), 10000)
      await btn.click()

      // くじを引き、リダイレクト処理が行われるまで待機する。
      var reg = await new RegExp('^(?!.*'+url+').+$');
      await driver.wait(until.urlMatches(reg), 15000);
    }
    catch (error) {
      console.log(await driver.getTitle()+':くじは引けませんでした。')
    }
  }
  driver.quit();
})()