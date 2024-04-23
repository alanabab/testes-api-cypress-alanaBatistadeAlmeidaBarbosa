import { faker } from '@faker-js/faker'

let token
let userId
let fakeName
let fakeEmail
let fakePassword

describe('Teste Api Raromdb - Autenticação', () => {

  before(() => {
    fakeName = faker.internet.userName();
    fakeEmail = faker.internet.email();
    fakePassword = faker.internet.password({ length: 12 });

    cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response) => {
       expect(response.status).to.equal(201);
       userId = response.body.id
    })
  })

  it('Deve verificar senha incorreta', () => {
    cy.login(fakeEmail, "wrongPassword", false)
    .then((response)=>{
      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal('Invalid username or password.')
    });
  });

  it('Deve verificar email inválido', () => {
    cy.login("wrongEmail", fakePassword, false)
    .then((response)=>{
      expect(response.status).to.equal(400);
      expect(response.body.message).to.deep.equal(['email must be an email'])
    });
  });

  it('Deve verificar campo Email vazio', () => {
    cy.login(null, fakePassword, false)
    .then((response)=>{
      expect(response.status).to.equal(400);
      expect(response.body.message).to.deep.equal(['email should not be empty', 'email must be an email'])
    });
  });

  it('Deve verificar campo Senha vazio', () => {
    cy.login(fakeEmail, null, false)
    .then((response)=>{
      expect(response.status).to.equal(400);
      expect(response.body.message).to.deep.equal(['password must be a string', 'password should not be empty'])
    });
  });

  it('Deve verificar ambos os campos vazios', () => {
    cy.login(null, null, false)
    .then((response)=>{
      expect(response.status).to.equal(400);
      expect(response.body.message).to.deep.equal(['email should not be empty', 'email must be an email', 'password must be a string', 'password should not be empty'])
    });
  });

  it('Deve realizar o login com sucesso', () => {
    cy.login(fakeEmail, fakePassword, true)
    .then((response)=>{
      expect(response.status).to.equal(200);
      token = response.body.accessToken
    })
  })
})