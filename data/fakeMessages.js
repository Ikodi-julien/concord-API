var faker = require('faker');

const messages = [];

for (let index = 0; index < 200; index++) {
  messages.push({
    content: {
      ops: [{
        insert: faker.lorem.sentences(1),
      }],
    }});
};

const messagesAndChannel = messages.map(message => ({...message, channel_id: Math.floor(Math.random() * 35 + 1)}))

module.exports = messagesAndChannel.map(message => ({...message, user_id: Math.floor(Math.random() * 30 +1)}));