const { sequelize, Channel, Tag, User, Message } = require('../app/models')
const bcrypt = require('bcrypt')
const faker = require('faker');

const tags = require('./tags');
const animsData = require('./anim-data.json');
const messages = require('./fakeMessages');
const avatar_1 = require('./avatar_1');
const avatar_2 = require('./avatar_2');
const avatar_3 = require('./avatar_3');
const avatar_4 = require('./avatar_4');
const avatar_5 = require('./avatar_5');
const avatar_6 = require('./avatar_6');
const avatarList = [avatar_1, avatar_2, avatar_3, avatar_4, avatar_5, avatar_6];

faker.locale = 'fr';
faker.seed(999);

const SALT_ROUNDS = 10;

// Create a db first and set DATABASE_URL in your .env before running this file

(async () => {
  try {
    await sequelize.sync({ force: true })

    const createdTags = await Tag.bulkCreate(tags);

    const createdChannels = []

    // This creates a channel in DB for each anim in anim-data.response
    for (const anim of animsData.response) {
      const channel = await Channel.create(
        {
          title: anim.name,
          img_url: anim.img,
          rank: anim.rank,
          plot: anim.plot,
          year: anim.year,
        })
      const channelTags = []

      for (const tag of anim.tags) {
        const matchingTag = createdTags.find(
          (createdTag) => createdTag.dataValues.name === tag
        )
        if (matchingTag) {
          await channel.addTag(matchingTag.dataValues.id)
          channelTags.push(matchingTag)
        }
      }
      await channel.save()
      createdChannels.push({ channel, tags: channelTags })
    }

    // This creates 50 users
    for (let index = 0; index < 50; index++) {
      const newUser = await User.create({
        email: faker.internet.email(),
        password: await bcrypt.hash(faker.internet.password(), SALT_ROUNDS),
        nickname: faker.internet.userName(),
        avatar: avatarList[Math.floor(Math.random() * 6)],
      })

      // Add  random tags to user
      const tagCount = Math.round(Math.random() * 5 + 1)
      const userTags = []

      for (let index = 1; index <= tagCount; index++) {
        const randomIndex = Math.floor(Math.random() * createdTags.length)

        if (
          createdTags[randomIndex] &&
          !userTags.includes(createdTags[randomIndex])
        ) {
          await newUser.addTag(createdTags[randomIndex])
          userTags.push(createdTags[randomIndex])
        }
      }

      // Search for channels with the same tags as the user
      const recommendedChannels = []

      for (const userTag of userTags) {
        for (const { channel, tags } of createdChannels) {
          const matchingTag = tags.find(
            (channelTag) =>
              channelTag.dataValues.name === userTag.dataValues.name
          )

          if (matchingTag) {
            recommendedChannels.push(channel)
          }
        }
      }
      
      // Add half of reco channels to user channels
      for (let index = 0; index < (recommendedChannels.length / 2); index++) {
        await newUser.addChannel(
          recommendedChannels[index].dataValues.id
        )
      }

      await newUser.save()
    }
    
    // Inserts fakeMessages in DB
    await Message.bulkCreate(messages);

    /*--- Creates test user ---*/
    const testUser = await User.create({
      email: 'testeur@testmail.com',
      password: await bcrypt.hash('7357', SALT_ROUNDS),
      nickname: 'le serial testeur',
    })

    const testUserTags = []

    // Add random tags to test user
    for (let index = 1; index <= 5; index++) {
      const randomIndex = Math.floor(Math.random() * createdTags.length)

      if (
        createdTags[randomIndex] &&
        !testUserTags.includes(createdTags[randomIndex])
      ) {
        await testUser.addTag(createdTags[randomIndex])
        testUserTags.push(createdTags[randomIndex])
      }
    }

    // Filter channels with matching tags
    const recommendedChannels = []

    for (const userTag of testUserTags) {
      for (const { channel, tags } of createdChannels) {
        const matchingTag = tags.find(
          (channelTag) => channelTag.dataValues.name === userTag.dataValues.name
        )

        if (matchingTag) {
          recommendedChannels.push(channel)
        } 
      }
    }

    // Add half of reco channels to user channels
    for (let index = 0; index < (recommendedChannels.length / 2); index++) {
      await testUser.addChannel(
        recommendedChannels[index].dataValues.id
      )
    }

    await testUser.save()
    
    const bob = await User.create({
      email: 'bob@bob.fr',
      password: await bcrypt.hash('bob', SALT_ROUNDS),
      nickname: 'bob',
      avatar: avatarList[Math.floor(Math.random() * 6)],
    })
    await bob.save()
    
    // Test messages
    // const channel = await Channel.findByPk(1, {
    //   include: [{
    //     association: 'users',
    //     attributes: ['id', 'avatar', 'nickname', 'isLogged'],
    //     through: {
    //         attributes: []
    //     }
    //   }, 
    //   {
    //     association: 'channel_messages',
    //   }]
    // });
    // console.log(channel);
    // console.log(channel.channel_messages);
    
  } catch (err) {
    console.error('>> Error while creating: ', err)
  } finally {
    sequelize.close()
  }
})()
