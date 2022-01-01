const faker = require('faker');
const bcrypt = require('bcrypt');

const randomData =  async() => {
const randomFirstName = faker.name.firstName();
const randomLastName = faker.name.lastName();
const randomEmail = faker.internet.email();
const randomUsername = faker.internet.userName(randomFirstName, randomLastName)
const randomPwd = await bcrypt.hash(randomUsername, 10);

console.log(`('${randomFirstName}', '${randomLastName}', '${randomUsername}', '${randomPwd}', '${randomEmail}'),`);

};

for (let index = 0; index <25; index++) {
  randomData();
}