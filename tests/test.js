let request = require('supertest');
request = request('http://localhost:8000');
const chai = require('chai');

let accessToken, refreshToken;

/**
 * Test get tags
 */
describe("GET /tags - without credentials - success", () => {
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

/**
 * Test get channels
 */
describe("GET /channels - without credentials - fail", () => {
  it('should respond with an error 401 - unauthorized', (done) => {
    request.get('/v1/channels')
    .set('Content-Type', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401, done);
  });
});

/**
 * Test create user
 */
 describe('POST /signup with empty input', () => {
  it('should respond with an error 412 "Precondition Failed"', (done) => {
    request
      .post('/v1/signup')
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
  it('should respond with an error 500 "Internal Server Error"', (done) => {
    request
      .post('/v1/signup')
      .send({
        "email" : "test",
        "password" : "test",
        "nickname" : "test"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, done);
  });
});

describe('POST /signup with correct input', () => {
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
describe('POST /login with empty email  - fail', () => {
  it('should respond with an error 412 "Precondition Failed', (done) => {
    request
      .post('/v1/login')
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
    request
      .post('/v1/login')
      .send({
        "email" : "testeur@testeur.fr",
        "password" : "testeur",
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409, done)
      });
    });
    
    

describe('POST /login with credentials - success', () => {
  it('should respond with status 200 and set cookie access_token and refresh_token', (done) => {
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
  });

/**
 * Test GET user
 */
describe('Tests with access-token', () => {

  describe('GET /me with invalid access-token - fail', () => {
    it('should return status 401 unauthorized', (done) => {
      request
      .get('/v1/me')
      .set('Cookie', [ 'access-token=notgood', refreshToken ])
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(401, done);
    })
  })

  describe('GET /me with access-token - success', () => {
    it('should return user data with expected properties', (done) => {
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
  

  describe('GET /me/channels with access-token - success', () => {
    it('should return status 200 and an empty list', (done) => {
      request
        .get(`/v1/me/channels`)
        .set('Cookie', [ accessToken, refreshToken ])
        .set('Accept', 'application/json')
        .send()
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) return done(err);
          chai.expect(res.body).to.have.lengthOf(0)
          done();
        });
    });
  });  
  
  describe('GET /channel/2 with invalid access-token - fail', () => {
    it('should return status 401 unauthorized', (done) => {
      request
      .get('/v1/channel/2')
      .set('Cookie', [ 'access-token=notgood', refreshToken ])
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(401, done);
    })
  })
  
  describe('GET /channel/2 with access-token - success', () => {
    it('should return status 200 and channel n°32 datas', (done) => {
      request
      .get('/v1/channel/2')
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
   * Test update user
   */          
  describe('PUT /me - success', () => {
  it('should add 3 tags to user and return user data ', (done) => {
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
  
  describe('PUT /me/avatar - success', () => {
    it('should add an avatar to user and return user data with avatar property ', (done) => {
      request
        .put(`/v1/me/avatar`)
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
      request
        .get(`/v1/me/recommended`)
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

  
  describe('GET /tags/channels with access-token - success', () => {
    it('should return status 200 and a list with several objects', (done) => {
      request
        .get(`/v1/tags/channels`)
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
  describe('DELETE /me with access-token - success', () => {
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
