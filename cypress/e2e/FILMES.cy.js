describe('Teste da Api Raromdb - testes de filmes', () => {

  it('Deve mostrar lista de filmes', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies',
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

  it('Deve procurar filme por título', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/search',
      qs: { title: 'titulo do filme'}
    })
    .then((response)=>{
      expect(response.status).to.equal(200),
      expect(response.body).to.be.an('array')
    })
  });

  it('Deve buscar filme por iD', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/1'
    })
    .then((response)=>{
      expect(response.status).to.equal(200),
      expect(response.body.id).to.be.equal(1)
    })
  });
})