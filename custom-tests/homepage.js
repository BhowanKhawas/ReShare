describe('ReShare Basic Pages', function() {
    
    it('Checks if the Home Page loads correctly', function(browser) {
      browser
        .navigateTo('http://localhost:3000') 
        .waitForElementVisible('body')       
        .assert.titleContains('ReShare');    
    }); 

    it('Checks if the Login Page loads', function(browser) {
      browser
        .navigateTo('http://localhost:3000/login')
        .waitForElementVisible('body')
        .assert.visible('form')              
        .end();                              
    }); 

});
