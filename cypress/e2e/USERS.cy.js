import { faker } from '@faker-js/faker';

describe('Teste da Api Raromdb - testes de usuário', () => {
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
    })
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

  it('Deve consultar usuário por id', () => {
    cy.request({
      method: 'GET',
      url: `https://raromdb-3c39614e42d4.herokuapp.com/api/users/${userId}`,
      headers: {
        Authorization: 'Bearer ' +accessToken
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(userData)
      cy.log(response.body)
    })
  });

  it('Deve tornar usuário Critic', () => {
    cy.log(accessToken)
    cy.request({
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/apply',
      headers: {
        Authorization: 'Bearer ' +accessToken
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
  });

  it('Deve tornar usuário Admin', () => {
    cy.log(accessToken)
    cy.request({
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin',
      headers: {
        Authorization: 'Bearer ' +accessToken
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
  });

  it('Deve listar todos os usuarios', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      headers: {
        Authorization: 'Bearer ' +accessToken
      }
    })
    .then ((response)=>{
      expect(response.status).to.equal(200)
      expect(response.body).to.be.an('array')
      cy.log(response.body)
    })
  });

  it('Deve deletar o usuário', () => {
    cy.request({
      method: 'DELETE',
      url: `https://raromdb-3c39614e42d4.herokuapp.com/api/users/${userId}`,
      headers: {
        Authorization: 'Bearer ' +accessToken
      }
    })
    .then ((response)=>{
      expect(response.status).to.equal(204)
    })
  });
})