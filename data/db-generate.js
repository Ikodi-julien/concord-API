const { sequelize, Channel, Tag, User, Message } = require('../app/models')
const bcrypt = require('bcrypt')
const faker = require('faker');

const avatar_1 = require('./avatar_1');
const avatar_2 = require('./avatar_2');
const avatar_3 = require('./avatar_3');
const avatar_4 = require('./avatar_4');
const avatar_5 = require('./avatar_5');
const avatar_6 = require('./avatar_6');
const avatarList = [avatar_1, avatar_2, avatar_3, avatar_4, avatar_5, avatar_6];

faker.locale = 'fr'
faker.seed(999)

const SALT_ROUNDS = 10

// Create a db first and set DATABASE_URL in your .env before running this file

;(async () => {
  try {
    await sequelize.sync({ force: true })

    const createdTags = await Tag.bulkCreate([
      { name: 'Cuisine' },
      { name: 'Cinéma' },
      { name: 'Horreur' },
      { name: 'Catch' },
      { name: 'Mangas/Animes' },
      { name: 'Poterie' },
      { name: 'Jeux Vidéos' },
      { name: 'Action' },
      { name: 'Jeux de société' },
      { name: 'Romantique' },
      { name: 'Séries TV' },
      { name: 'Mignon' },
      { name: 'Épique' },
      { name: 'Livres' },
      { name: 'Stratégie' },
      { name: 'Comédie' },
      { name: 'Mystère' },
      { name: 'Réflexion' },
      { name: 'Sport' },
    ])

    const channelMap = [
      {
        title: 'The walking dead',
        tags: [
          { name: 'Séries TV' },
          { name: 'Horreur' },
          { name: 'Action' },
        ],
      },
      {
        title: "Jeux vidéos d'action",
        tags: [{ name: 'Jeux Vidéos' }, { name: 'Action' }],
      },
      {
        title: "Films d'action",
        tags: [{ name: 'Action' }],
      },
      {
        title: 'School Live/Gakkougurashi',
        tags: [
          { name: 'Mignon' },
          { name: 'Mangas/Animes' },
          { name: 'Horreur' },
        ],
      },
      {
        title: 'Berserk',
        tags: [
          { name: 'Épique' },
          { name: 'Mangas/Animes' },
          { name: 'Horreur' },
          { name: 'Action' },
        ],
      },
      {
        title: 'The Witcher',
        tags: [
          { name: 'Jeux Vidéos' },
          { name: 'Séries TV' },
          { name: 'Épique' },
          { name: 'Action' },
          { name: 'Livres' },
        ],
      },
      {
        title: 'Magic',
        tags: [
          { name: 'Stratégie' },
          { name: 'Réflexion' },
        ],
      },
      {
        title: "Let's create! Pottery VR",
        tags: [{ name: 'Jeux Vidéos' }, { name: 'Poterie' }],
      },
      {
        title: 'Danganronpa',
        tags: [
          { name: 'Jeux Vidéos' },
          { name: 'Mangas/Animes' },
          { name: 'Horreur' },
          { name: 'Réflexion' },
        ],
      },
      {
        title: 'Crazy Ex-Girlfriend',
        tags: [
          { name: 'Série TV' },
          { name: 'Comédie' },
          { name: 'Romantique' },
        ],
      },
      {
        title: 'Dixit',
        tags: [{ name: 'Jeux de société' }, { name: 'Réflexion' }],
      },
      {
        title: 'Fiesta de los Muertos',
        tags: [{ name: 'Jeux de société' }, { name: 'Réflexion' }],
      },
      {
        title: 'Muertigos',
        tags: [
          { name: 'Jeux de société' },
          { name: 'Réflexion' },
          { name: 'Jeux Vidéos' },
        ],
      },
      {
        title: 'Portal',
        tags: [{ name: 'Réflexion' }, { name: 'Jeux Vidéos' }],
      },
      {
        title: 'Les pires horreurs en cuisine',
        tags: [{ name: 'Cuisine' }, { name: 'Horreur' }],
      },
      {
        title: 'Le meilleur du catch à coup de planche à voile !',
        tags: [
          { name: 'Catch' },
          { name: 'Sport' },
        ],
      },
    ]

    const defaultChannels = createdTags.map((tag) => {
      return { title: tag.name, tags: [{ name: tag.name }] }
    })

    const createdChannels = []

    // This creates a channel in DB for each channel in channelMap and default channels.
    for (const { title, tags } of [...channelMap, ...defaultChannels]) {
      const channel = await Channel.create({ title })
      const channelTags = []

      for (const tag of tags) {
        const matchingTag = createdTags.find(
          (createdTag) => createdTag.dataValues.name === tag.name
        )
        if (matchingTag) {
          await channel.addTag(matchingTag.dataValues.id)
          channelTags.push(matchingTag)
        }
      }
      await channel.save()
      createdChannels.push({ channel, tags: channelTags })
    }

    // This creates 30 users
    for (let index = 0; index < 30; index++) {
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

    // Creates test user
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
    
  } catch (err) {
    console.error('>> Error while creating: ', err)
  } finally {
    sequelize.close()
  }
})()
