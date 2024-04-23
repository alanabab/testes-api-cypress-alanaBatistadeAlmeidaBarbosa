Cypress.Commands.add('newUser', (name, email, password, failOnStatusCode)=>{
    cy.request( 
         {method:'POST', url: `/users`,
          body: {
             "name": name,
            "email": email,
             "password": password
         }, failOnStatusCode: failOnStatusCode}
 )
 })
 
 Cypress.Commands.add('login', (email, password, failOnStatusCode)=>{
 
     cy.request({
         method: 'POST', url: `/auth/login`, body: {
             "email": email, 
             "password": password
         }, failOnStatusCode: failOnStatusCode
     })
 })
 
 Cypress.Commands.add('admin', (token, failOnStatusCode)=>{
 
     cy.request({
         method: 'PATCH',
         url: `/users/admin`,
         headers: {
             Authorization: `Bearer ${token}`
         }, failOnStatusCode: failOnStatusCode
     })
 })