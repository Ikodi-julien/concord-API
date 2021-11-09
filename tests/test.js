require('dotenv').config();
const BASE_URL_TEST = process.env.BASE_URL_TEST;
const AUTH_URL_TEST = process.env.AUTH_URL_TEST;
let request = require('supertest');
const chai = require('chai');
const asserttype = require('chai-asserttype');
chai.use(asserttype);

let accessToken, refreshToken;

/**
 * Test get tags
 */
describe("GET /tags - without credentials - success", () => {
  it('responds with json list length greater than 10', (done) => {
    request(BASE_URL_TEST)
    .get('/tags')
    .set('Content-Type', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, (err, res) => {
      if (err) return done(err);
      chai.expect(res.body).length.to.be.greaterThan(10);
      done();
    });
  });
});

/**
 * Test get channels
 */
describe("GET /channels - without credentials - fail", () => {
  it('should respond with an error 401 - unauthorized', (done) => {
    request(BASE_URL_TEST)
    .get('/channels')
    .set('Content-Type', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401, done);
  });
});

/**
 * Test signup
 */
 describe('POST /signup with empty input', () => {
  it('should respond with an error 412 "Precondition Failed"', (done) => {
    request(AUTH_URL_TEST)
      .post('/signup')
      .send({
        "email" : "",
        "password" : "test",
        "nickname" : "test"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(412, done);
  });
});

  
describe('POST /signup with invalid email', () => {
  it('should respond with an error 422 "Unprocessable entity"', (done) => {
    request(AUTH_URL_TEST)
      .post('/signup')
      .send({
        "email" : "test",
        "password" : "lemdp",
        "firstname" : "test",
        "lastname" : "delapp"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422, done);
  });
});

describe('POST /signup with correct input', () => {
  it('should respond with status 200 and json with property "id"', (done) => {
    request(AUTH_URL_TEST)
      .post('/signup')
      .send({
        "email" : "test@test.fr",
        "password" : "lemdp",
        "firstname" : "test",
        "lastname" : "delapp"
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
 * Test login 
 */
describe('POST /login with empty email  - fail', () => {
  it('should respond with an error 412 "Precondition Failed', (done) => {
    request(AUTH_URL_TEST)
      .post('/login')
      .send({
        "email" : "",
        "password" : "test",
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(412, done)
      });
    });

describe('POST /login with invalid credentials  - fail', () => {
  it('should respond with an error 409', (done) => {
    request(AUTH_URL_TEST)
      .post('/login')
      .send({
        "email" : "testeur@testeur.fr",
        "password" : "testeur",
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409, done)
      });
    });
    
    

describe('POST /login - success', () => {
  it('should respond with status 200 and set cookie access_token and refresh_token', (done) => {
    request(AUTH_URL_TEST)
    .post('/login')
    .send({
      "email" : "test@test.fr",
      "password" : "lemdp",
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
});

/**
 * Test GET user
 */
describe('Tests access-token', () => {

  describe('GET /me/credentials with invalid access-token - fail', () => {
    it('should return status 401 unauthorized', (done) => {
      request(AUTH_URL_TEST)
      .get('/me/credentials')
      .set('Cookie', [ 'access-token=notgood', refreshToken ])
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(401, done);
    })
  })

  describe('GET /me with access-token - success', () => {
    it('should return user data with expected properties', (done) => {
      request(AUTH_URL_TEST)
        .get(`/me/credentials`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.property('id');
          chai.expect(res.body).to.have.property('email');
          done();
        });
    });
  });         
  

  describe('GET /me/channels with access-token - success', () => {
    it('should return status 200 and an empty list', (done) => {
      request(BASE_URL_TEST)
        .get(`/me/channels`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.be.array();
          done();
        });
    });
  });  
  
  describe('GET /channel/2 with invalid access-token - fail', () => {
    it('should return status 401 unauthorized', (done) => {
      request(BASE_URL_TEST)
      .get('/channel/2')
      .set('Cookie', [ 'access-token=notgood', refreshToken ])
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(401, done);
    })
  })
  
  describe('GET /channel/2 with access-token - success', () => {
    it('should return status 200 and channel n°32 datas', (done) => {
      request(BASE_URL_TEST)
      .get('/channel/2')
      .set('Cookie', [ accessToken, refreshToken ])
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) return done(err);
        chai.expect(res.body).to.have.property('id');
        chai.expect(res.body).to.have.property('title');
        done();
      });
    })
  })
  
      
          
  /**
   * PUT /me
   */          
   describe('PUT /me/credentials - success', () => {
    it('should put another email ', (done) => {
      request(AUTH_URL_TEST)
        .put(`/me/credentials`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send({
          "email" : "newtest@test.fr",
          "password" : "lemdp",
          "firstname" : "test",
          "lastname" : "delapp"
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.property('id');
          chai.expect(res.body).to.have.property('email').equal('newtest@test.fr');
          chai.expect(res.body).to.have.property('firstname');
          chai.expect(res.body).to.have.property('lastname');
          done();
        });
      });
    }); 
    
    describe('PUT /me/password - success', () => {
      it('should set new password for user', (done) => {
        request(AUTH_URL_TEST)
          .put(`/me/password`)
          .set('Cookie', [ accessToken, refreshToken ])
          .set('Accept', 'application/json')
          .send({
            "password" : "lemdp",
            "newPassword" : "lenouveaumdp",
          })
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) return done(err);
            done();
          });
      });
    });
  
  describe('PUT /me/avatar - success', () => {
    it('should add an avatar to user and return user data with avatar property ', (done) => {
      request(BASE_URL_TEST)
        .put(`/me/avatar`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send({
          "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAgAElEQVR4Xuy9B5hd5Xku+q62+94zs2f29D6j0aiMekddgOggQGCwwXaMwQlxnDix7z0557khT05ucnP",
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.property('avatar');
          done();
        });
      });
    }); 

  describe('GET /me/recommended with access-token - success', () => {
    it('should return status 200 and a list with several objects', (done) => {
      request(BASE_URL_TEST)
        .get(`/me/recommended`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.be.array();
          done();
        });
    });
  }); 

  
  describe('GET /tags/channels with access-token - success', () => {
    it('should return status 200 and a list with several objects', (done) => {
      request(BASE_URL_TEST)
        .get(`/tags/channels`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.length.greaterThan(1);
          done();
        });
    });
  }); 
  
  /**
   * Test logout user
   */ 
  describe('POST /logout with access-token - success', () => {
    it('should logout the user and redirect', (done) => {
      request(AUTH_URL_TEST)
        .post('/logout')
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        // .expect('Content-Type', /json/)
        .expect(302, done);
    });
  });          
            
  /**
   * DELETE /me
   */ 
   describe('DELETE /me/credentials', function() {
    
    let accessToken, refreshToken;
    
    describe('First login', function() {
      it('should login', (done) => {
        request(AUTH_URL_TEST)
        .post('/login')
        .send({
          "email" : "newtest@test.fr",
          "password" : "lenouveaumdp",
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          
          [ accessToken, refreshToken ] = res.header['set-cookie'];
          
          describe('Then DELETE /me/credentials with access-token - success', function() {
            it('should delete user account and return status 200', (done) => {
              request(AUTH_URL_TEST)
                .delete('/me/credentials')
                .set('Cookie', [ accessToken, refreshToken ])
                .set('Accept', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(200, () => {
                  
                  /**
                   * Test login after deleted user account
                   */ 
                  describe('Finally POST /login - fail after user deleted', () => {
                    it('should send status 409', (done) => {
                      request(AUTH_URL_TEST)
                        .post('/login')
                        .send({
                          "email" : "newtest@test.fr",
                          "password" : "lenouveaumdp",
                        })
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(409, done)
                    });
                  });
                  done();
                });
            });
          }); 
          done();
        });      
      })
    });
  })
});

