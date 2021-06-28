var request = require('supertest');
request = request('http://localhost:8000');

// var assert = require('assert');
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

/**
 * Test get tags
 */
  describe("GET /tags", () => {
  it('responds with json', (done) => {
    request.get('/v1/tags')
    .set('Content-Type', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, (err, res) => {
      if (err) return done(err);
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
    it('should respond with status 200 and json.', (done) => {
      request
        .post('/v1/signup')
        .send({
          "email" : "test@test.fr",
          "password" : "test",
          "nickname" : "test"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
  
  /**
   * Test with credentials
   */
  describe('POST /login - success', () => {
    it('should login the user and set cookie access_token', (done) => {
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
            // console.log(res.data);
            done();
          });
      });
    });               
        
    /**
     * Test update user
     */          
      describe('PUT /me - success', () => {
      it('should add tags to user', (done) => {
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
          .expect(200, done);
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

  describe('POST /login - fail', () => {
    it('should send status 409', (done) => {
      request
        .post('/v1/login')
        .send({
          "email" : "inconnu@inconnu.fr",
          "password" : "inconnu",
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(409, done)
    });
  });
});
