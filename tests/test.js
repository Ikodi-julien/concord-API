let request = require('supertest');
request = request('http://localhost:8000');
const chai = require('chai');

/**
 * Test get tags
 */
  describe("GET /tags", () => {
  it('responds with json list length greater than 10', (done) => {
    request.get('/v1/tags')
    .set('Content-Type', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, (err, res) => {
      if (err) return done(err);
      chai.expect(res.body).length.to.be.greaterThan(10);
      done();
    });
  });
});
  
describe("CRUD of Concord User", () => {
  
  let accessToken, refreshToken;
  
  /**
   * Test create user
   */
  describe('POST /signup', () => {
    it('should respond with status 200 and json with property "id"', (done) => {
      request
        .post('/v1/signup')
        .send({
          "email" : "test@test.fr",
          "password" : "test",
          "nickname" : "test"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.property('id');
          done();
        });
    });
  });
  
  /**
   * Test with credentials
   */
  describe('POST /login - success', () => {
    it('should respond with status 200, login the user and set cookie access_token and refresh_token', (done) => {
      request
        .post('/v1/login')
        .send({
          "email" : "test@test.fr",
          "password" : "test",
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('Set-Cookie', /access_token/)
        .expect('Set-Cookie', /refresh_token/)
        .end((err, res) => {
          if (err) return done(err);
          
          [ accessToken, refreshToken ] = res.header['set-cookie'];
          chai.expect(accessToken).to.be.a.string;
          chai.expect(refreshToken).to.be.a.string;
          
          done();
        });
      });

    /**
     * Test GET user
     */      
    describe('GET /me - success', () => {
      it('should return user data', (done) => {
        request
          .get(`/v1/me`)
          .set('Cookie', [ accessToken, refreshToken ])
          .set('Accept', 'application/json')
          .send()
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) return done(err);
            chai.expect(res.body).to.have.property('id');
            chai.expect(res.body).to.have.property('email');
            chai.expect(res.body).to.have.property('nickname');
            chai.expect(res.body).to.have.property('tags');
            done();
          });
      });
    });               
        
    /**
     * Test update user
     */          
      describe('PUT /me - success', () => {
      it('should add 3 tags to user', (done) => {
        request
          .put(`/v1/me`)
          .set('Cookie', [ accessToken, refreshToken ])
          .set('Accept', 'application/json')
          .send({
            "email": "test@test.fr",
            "nickname": "test",
            "tags": [1, 2, 3 ]
          })
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) return done(err);
            chai.expect(res.body).to.have.property('id');
            chai.expect(res.body).to.have.property('email');
            chai.expect(res.body).to.have.property('nickname');
            chai.expect(res.body).to.have.property('tags').with.lengthOf(3);
            done();
          });
      });
    }); 
        
    /**
     * Test logout user
     */ 
      describe('POST /logout - success', () => {
        it('should logout the user', (done) => {
          request
            .post('/v1/logout')
            .set('Cookie', [ accessToken, refreshToken ])
            .set('Accept', 'application/json')
            .send()
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
      });          
          
    /**
     * Test delete user account
     */ 
      describe('DELETE /me - success', () => {
        it('should delete user account', (done) => {
          request
            .delete('/v1/me')
            .set('Cookie', [ accessToken, refreshToken ])
            .set('Accept', 'application/json')
            .send()
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
      }); 
  });
  
  /**
   * Test login after deleted user account
   */ 
  describe('POST /login - fail after user deleted', () => {
    it('should send status 409', (done) => {
      request
        .post('/v1/login')
        .send({
          "email" : "test@test.fr",
          "password" : "test",
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(409, done)
    });
  });
});
