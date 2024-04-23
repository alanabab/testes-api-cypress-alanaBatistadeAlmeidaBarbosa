import { faker } from '@faker-js/faker'

let token
let userId
let userData
let fakeName
let fakeEmail
let fakePassword
let movieId

//testes de cadastro de usuário

describe('Teste Api Raromdb - Cadastro de Usuário', () => {
    beforeEach(() => {
        fakeName = faker.internet.userName();
        fakeEmail = faker.internet.email();
        fakePassword = faker.internet.password({ length: 12 });
    })

    it('Deve cadastrar um novo usuário com sucesso', () => {
        cy.newUser(fakeName, fakeEmail, fakePassword, true)
        .then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body).to.have.property("id");
            expect(response.body).to.have.property("email");
            expect(response.body).to.have.property("name");
            expect(response.body).to.have.property("type");
            expect(response.body.id).to.be.a("number");
            expect(response.body.type).to.deep.equal(0) //verifica se o usuário nasce com o tipo comum (type: 0)
        })
    })

    it('Não permitir cadastro e enviar mensagem de erro por senha maior que 12 caracteres', () => {
      cy.newUser(fakeName, fakeEmail, "veryLongPassword", false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["password must be shorter than or equal to 12 characters"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por senha menor que 6 caracteres', () => {
      cy.newUser(fakeName, fakeEmail, "short", false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["password must be longer than or equal to 6 characters"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por email já existente', () => {
      //criando um novo usuário
      cy.newUser(fakeName, fakeEmail, fakePassword, true)
      //reutilizando o email criado acima
      cy.newUser(fakeName, fakeEmail, fakePassword, false)
      .then((response)=>{
        expect(response.status).to.equal(409);
        expect(response.body.message).to.equal('Email already in use')
      });
    });
  
    it('Não permitir cadastro e enviar mensagem de erro por email inválido', () => {
      cy.newUser(fakeName, "emailInvalido", fakePassword, false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["email must be an email"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por campo Email vazio', () => {
      cy.newUser(fakeName, null, fakePassword, false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["email must be longer than or equal to 1 characters", "email must be an email", "email should not be empty"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por campo Nome vazio', () => {
      cy.newUser(null, fakeEmail, fakePassword, false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["name must be longer than or equal to 1 characters", "name must be a string", "name should not be empty"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por campo Senha vazio', () => {
      cy.newUser(fakeName, fakeEmail, null, false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal(["password must be longer than or equal to 6 characters", "password must be a string", "password should not be empty"])
      });
    });

    it('Não permitir cadastro e enviar mensagem de erro por todos os campos vazios', () => {
      cy.newUser(null, null, null, false)
      .then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.deep.equal([
          "name must be longer than or equal to 1 characters",
          "name must be a string",
          "name should not be empty",
          "email must be longer than or equal to 1 characters",
          "email must be an email",
          "email should not be empty",
          "password must be longer than or equal to 6 characters",
          "password must be a string",
          "password should not be empty"
          ])
      });
    });
  })

  //testes de consulta de usuário

  describe('Teste Api Raromdb - Consulta de Usuário', () => {
   
    before(() => {
      cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response)=>{
         userData = response.body; 
         userId = response.body.id
      })
      cy.login(fakeEmail, fakePassword, true).then((response)=>{
        token = response.body.accessToken
      })
  })

  it('Deve consultar usuário por id', () => {
    cy.request({
      method: 'GET',
      url: '/users/' + userId,
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(userData);
      cy.log(response.body)
    })
  });

  it('Não permitir que usuário Comum acesse a lista com todos os usuários', () => {
    cy.request({
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: 'Bearer ' +token
      },
      failOnStatusCode: false
    })
    .then ((response)=>{
      expect(response.status).to.equal(403)
      cy.log(response.body)
    })
  });

  it('Usuário Admin tem permissão para acessar a lista com todos os usuários', () => {
    cy.admin (token, true) //primeiro promover usuário para Admin para ter permissão para buscar a lista de usuários
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
    cy.request({ 
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then ((response)=>{
      expect(response.status).to.equal(200)
      expect(response.body).to.be.an('array')
      cy.log(response.body)
    })
  });

  it('Deve atualizar informações do usuário', () => {
    cy.request({
      method: 'PUT',
      url: '/users/' + userId,
      headers: {
        Authorization: 'Bearer ' +token
      },
      body: {
        name: "newName",
        password: "newPassword"
      },
    })
    .then((response)=>{
      expect(response.status).to.equal(200);
      expect(response.body.name).to.equal("newName");
      cy.log(response.body)
    })
  });

  it('Deve promover usuário a Critico', () => {
    cy.request({
      method: 'PATCH',
      url: '/users/apply',
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
    cy.request({
      method: 'GET',
      url: '/users/' + userId,
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.body.type).to.deep.equal(2);
      cy.log(response.body)
    })
  });
  
  it('Usuário Admin tem permissão para deletar outros usuários', () => {
    cy.admin (token, true) //primeiro promover usuário para Admin para ter permissão para deletar outros usuários
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
    cy.request({ 
      method: 'DELETE',
      url: 'users/' + (userId - 1),
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
  });

  it('Deve inativar a própria conta', () => {
    cy.request({
      method: 'PATCH',
      url: '/users/inactivate',
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
  });
})

  //testes de usuário criando review

  describe('Teste Api Raromdb - Usuário criando Review', () => {
   
    before(() => {
      cy.newUser(fakeName, fakeEmail, fakePassword, true).then((response)=>{
         userData = response.body; 
         userId = response.body.id
      }),
      cy.login(fakeEmail, fakePassword, true).then((response)=>{
        token = response.body.accessToken
      })
    })

    it('Deve Cadastrar Filme', () => {
      cy.admin (token, true) //primeiro promover usuário para Admin para ter permissão para cadastrar filmes
    .then((response)=>{
      expect(response.status).to.equal(204)
    })
      cy.request({ 
         method: 'POST',
         url: '/movies',
         body: {
          "title": "movie title",
          "genre": "movie genre",
          "description": "movie description",
          "durationInMinutes": 120,
          "releaseYear": 2010
        },
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
      })
      })
      
  it('Deve criar review de filme', () => {
    cy.request({
      method: 'POST',
      url: '/users/review',
      body: {
        movieId: movieId,
        score: 4,
        reviewText: "muito legal"
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
        score: 3,
        reviewText: "novo texto"
      },
      headers: {
        Authorization: 'Bearer ' +token
      }
    })
    .then((response)=>{
      expect(response.status).to.equal(201)
    })
  });
})