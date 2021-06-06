var faker = require('faker');

const messages = [];

for (let index = 0; index < 100; index++) {
  const content = faker.lorem.sentences(1);
  messages.push({content});
}

const messagesAndChannel = messages.map(message => ({...message, channel_id: Math.floor(Math.random() * 16 + 1)}))

module.exports = messagesAndChannel.map(message => ({...message, user_id: Math.floor(Math.random() * 29 +1)}));