import { faker } from '@faker-js/faker';

describe('Teste da Api Raromdb - testes de autenticação', () => {
  var fakeName = faker.internet.userName();
  var fakeEmail = faker.internet.email();
  var fakePassword = faker.internet.password({ length: 12 });
  let userData;
  let userId;
  let accessToken;

  it('Deve cadastrar um novo usuário', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: {
        "name": fakeName,
        "email": fakeEmail,
        "password": fakePassword
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(201),
      userId = response.body.id,
      cy.wrap(userId).as('userId'),
      userData = response.body,
      cy.wrap(userData).as('userData')
      cy.log(response.body)
    })
  });
 
  it('Deve enviar mensagem de erro por senha muito longa', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: {
        "name": fakeName,
        "email": fakeEmail,
        "password": "veryLongPassword"
      },
      failOnStatusCode: false
    })
    .then((response)=>{
      expect(response.status).to.equal(400),
      expect(response.body.message).to.be.an('array')
      expect(response.body.message).to.contain('password must be shorter than or equal to 12 characters')
      cy.log(response.body)
    });
  });

  it('Deve enviar mensagem de erro por email já em uso', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: {
        "name": fakeName,
        "email": fakeEmail,
        "password": fakePassword
      },
      failOnStatusCode: false
    })
    .then((response)=>{
      expect(response.status).to.equal(409),
      expect(response.body.message).to.equal('Email already in use')
      cy.log(response.body)
    });
  });

  it('Deve realizar o login com sucesso', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
      body: {
        "email": fakeEmail,
        "password": fakePassword
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(200),
      accessToken = response.body.accessToken,
      cy.wrap(accessToken).as('accessToken')
    });
  });
  
  it('Deve verificar senha incorreta', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
      body: {
        "email": fakeEmail,
        "password": "wrongPassword"
      },
      failOnStatusCode: false
    })
    .then((response)=>{
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Invalid username or password.')
      cy.log(response.body)
    });
  });
})