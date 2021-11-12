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
    for (const anim of animsData) {
      if (anim.name) {
        
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
        createdChannels.push({ channel, tags: channelTags })
        await channel.save()
      }
    }

    // This creates 27 users
    for (let index = 1; index < 28; index++) {
      const newUser = await User.create({
        authid: index,
        nickname: faker.internet.userName(),
        avatar: avatarList[Math.floor(Math.random() * 6)],
      })
      // console.log(newUser);
      
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
    
    await Message.bulkCreate(messages);
        
  } catch (err) {
    console.error('>> Error while creating: ', err)
  } finally {
    sequelize.close()
  }
})()
