module.exports = async (page, log, date) => {
    
    const whereto = "http://www.neopets.com/pirates/anchormanagement.phtml";
    log(`Page going to ${whereto}`);
    await page.goto(whereto);
    log("Aiming cannon at seamonster");
    try {
        await page.$eval("#form-fire-cannon", form => form.submit());
        log("Successfully fired cannon at seamonster");
    } catch (err) {
        log("Already defeated seamonster for today");
    }
    return page;

  };