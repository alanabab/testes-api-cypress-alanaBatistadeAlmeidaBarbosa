import { faker } from '@faker-js/faker'

let token
let userId
let fakeName
let fakeEmail
let fakePassword
let movieId
let movieInfo
let movieTitle

  //testes de usuário criando filme, atualizando filme, criando review e atualizando review

  describe('Teste Api Raromdb - Criação de Filme e de Review', () => {
   
    before(() => {
    
      fakeName = faker.internet.userName();
      fakeEmail = faker.internet.email();
      fakePassword = faker.internet.password({ length: 12 });
     
      cy.fixture('newMovie').then((response) => {
        movieInfo = response
      })
      cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response)=>{
        userId = response.body.id
      }),
      cy.login(fakeEmail, fakePassword, true).then((response)=>{
        token = response.body.accessToken
      })
    })

  it('Deve Cadastrar Filme', () => {
    cy.admin (token, true).then((response)=>{
    expect(response.status).to.equal(204)
    })
    cy.request({ 
       method: 'POST',
       url: '/movies',
       body: movieInfo,
       headers: {
      Authorization: 'Bearer ' +token
       }
    })
    .then((response)=>{
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('title');
      expect(response.body).to.have.property('description');
      expect(response.body).to.have.property('durationInMinutes');
      expect(response.body).to.have.property('releaseYear');
      expect(response.body).to.have.property('genre');
      movieId = response.body.id
      movieTitle = response.body.title
      cy.log(response.body)
    })
  })

  it('Deve Atualizar Filme Cadastrado', () => {
    cy.request({ 
       method: 'PUT',
       url: '/movies/' + movieId,
       body: {
        title: 'New Title',
        genre: 'New Genre',
        releaseYear: 2000
       },
       headers: {
      Authorization: 'Bearer ' +token
       }
    })
    .then((response)=>{
      expect(response.status).to.equal(204);
      cy.log(response.body)
    })
  })
      
  it('Deve criar review de filme', () => {
    cy.request({
      method: 'POST',
      url: '/users/review',
      body: {
        movieId: movieId,
        score: 5,
        reviewText: "ótimo filme"
      },
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(201)
    })
  });
      
  it('Deve atualizar a review anterior de filme', () => {
    cy.request({
      method: 'POST',
      url: '/users/review',
      body: {
        movieId: movieId,
        score: 2,
        reviewText: "novo texto"
      },
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(201)
    })
  })

  it('Usuário Admin tem permissão para excluir filme', () => {
    cy.request({
      method: 'DELETE',
      url: '/movies/' + movieId,
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response) => {
      expect(response.status).to.equal(204)
    })
  })

})


//testes de consulta de filmes

describe('Teste Api Raromdb - Consulta de filmes', () => {
   
  before(() => { //criar um usuário para cadastrar novo filme, e excluir o usuário criado

    fakeName = faker.internet.userName();
    fakeEmail = faker.internet.email();
    fakePassword = faker.internet.password({ length: 12 });
   
    cy.fixture('newMovie').then((response) => {
      movieInfo = response
    }),
    cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response)=>{
      userId = response.body.id
    }),
    cy.login(fakeEmail, fakePassword, true).then((response)=>{
      token = response.body.accessToken
    }),
    cy.admin (token, true)
    cy.request({ 
      method: 'POST',
      url: '/movies',
      body: movieInfo,
      headers: {
     Authorization: 'Bearer ' +token
      }
    })
    .then((response) => {
      movieId = response.body.id
      movieTitle = response.body.title
    })
    cy.request({ 
      method: 'DELETE',
      url: '/users/' + (userId + 1),
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
  })

  it('Deve mostrar lista de filmes, mesmo sem logar', () => {
    cy.request({
      method: 'GET',
      url: '/movies',
    })
    .then((response)=>{
      expect(response.status).to.equal(200),
      expect(response.body).to.be.an('array'),
      expect(response.body[0]).has.property('id'),
      expect(response.body[0]).has.property('title'),
      expect(response.body[0]).has.property('genre'),
      expect(response.body[0]).has.property('description'),
      expect(response.body[0]).has.property('totalRating'),
      expect(response.body[0]).has.property('durationInMinutes'),
      expect(response.body[0]).has.property('releaseYear'),
      cy.log(response.body)
    })
  });

  it('Deve buscar filme por iD, mesmo sem logar', () => {
    cy.request({
      method: 'GET',
      url: '/movies/' + movieId
    })
    .then((response)=>{
      expect(response.status).to.equal(200);
      expect(response.body.id).to.be.equal(movieId);
      expect(response.body).has.property('id');
      expect(response.body).has.property('title');
      expect(response.body).has.property('genre');
      expect(response.body).has.property('description');
      expect(response.body).has.property('reviews');
      expect(response.body).has.property('durationInMinutes');
      expect(response.body).has.property('releaseYear');
      expect(response.body).has.property('criticScore');
      expect(response.body).has.property('audienceScore')
    })
  });

  it('Deve procurar filme por título, mesmo sem logar', () => {
    cy.request({
      method: 'GET',
      url: '/movies/search',
      qs: { title: movieTitle }
    })
    .then((response)=>{
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array')
    })
  });

  it('Não permitir exclusão de filme por usuário Comum', () => {
    cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response)=>{
    }),
    cy.login(fakeEmail, fakePassword, true).then((response)=>{
      token = response.body.accessToken
    }),
    cy.request({
      method: 'DELETE',
      url: '/movies/' + movieId,
      headers: {
        Authorization: 'Bearer ' +token
      },
      failOnStatusCode: false
    })
    .then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body.message).to.deep.equal('Access denied.')
    })
  })
})