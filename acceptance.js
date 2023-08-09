const assert = require('assert');
const { remote } = require('webdriverio');

(async () => {
        browser = await remote({
        capabilities: { browserName: 'edge' }
        
    });

    try {
        // Open the lecturer rating website
        await browser.navigateTo('https://lec-review-tyj8.onrender.com/');

        // Enter name
        const nameInput = await browser.$('#name');
        await nameInput.setValue('John Doe');

        // Select rating out of 10
        const ratingInput = await browser.$('[name="rating"]');
        await ratingInput.selectByVisibleText('8'); // Assuming 8 out of 10

        // Submit the form
        const submitButton = await browser.$('[type="submit"]');
        await submitButton.click();

        // Verify report content
        const report = await browser.$('.report');
        const reportText = await report.getText();

        // Assuming the report displays the submitted data
        assert.strictEqual(reportText.includes('Name: John Doe'), true);
        assert.strictEqual(reportText.includes('Rating: 8'), true);
        assert.strictEqual(reportText.includes('Report Generated'), true);
    } finally {
        await browser.deleteSession();
    }
})().catch((err) => {
    // Handle any errors that occurred during the test
    console.error(err);
    // Ensure the WebDriver session is deleted, even in case of an error
    return browser.deleteSession();
});
