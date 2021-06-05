const { sequelize, Channel, Tag, User } = require('../app/models')
const bcrypt = require('bcrypt')
const faker = require('faker')

faker.locale = 'fr'
faker.seed(999)

const SALT_ROUNDS = 10

// Don't forget to create a db first and set DATABASE_URL in your .env before running this file

;(async () => {
  try {
    await sequelize.sync({ force: true })

    const createdTags = await Tag.bulkCreate([
      { name: 'Cuisine' },
      { name: 'Cinéma' },
      { name: 'Horreur' },
      { name: 'Variété française' },
      { name: 'Catch' },
      { name: 'Planche à voile' },
      { name: 'Comédies Musicales' },
      { name: 'Mangas/Animes' },
      { name: 'Poterie' },
      { name: 'Jeux Vidéos' },
      { name: 'Action' },
      { name: 'Jeux de cartes' },
      { name: 'Jeux de société' },
      { name: 'Romantique' },
      { name: 'Séries TV' },
      { name: 'Mignon' },
      { name: 'Épique' },
      { name: 'RPG' },
      { name: 'Livres' },
      { name: 'Stratégie' },
      { name: 'Comédie' },
      { name: 'Mystère' },
      { name: 'Réflexion' },
      { name: 'Enquête' },
      { name: 'Sport' },
      { name: 'Comics' },
    ])

    const channelMap = [
      {
        title: 'GLOW',
        tags: [{ name: 'Séries TV' }, { name: 'Catch' }, { name: 'Comédie' }],
      },
      {
        title: 'The walking dead',
        tags: [
          { name: 'Séries TV' },
          { name: 'Horreur' },
          { name: 'Action' },
          { name: 'Comics' },
        ],
      },
      {
        title: "Jeux vidéos d'action",
        tags: [{ name: 'Jeux Vidéos' }, { name: 'Action' }],
      },
      {
        title: "Films d'action",
        tags: [{ name: 'Films' }, { name: 'Action' }],
      },
      {
        title: 'Cats',
        tags: [{ name: 'Films' }, { name: 'Comédies Musicales' }],
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
          { name: 'RPG' },
          { name: 'Livres' },
        ],
      },
      {
        title: 'Magic',
        tags: [
          { name: 'Jeux de cartes' },
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
          { name: 'Enquête' },
          { name: 'Réflexion' },
        ],
      },
      {
        title: 'Crazy Ex-Girlfriend',
        tags: [
          { name: 'Série TV' },
          { name: 'Comédies Musicales' },
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
          { name: 'Planche à voile' },
          { name: 'Sport' },
        ],
      },
      {
        title: 'Phoenix Wright/Ace Attorney',
        tags: [
          { name: 'Jeux Vidéos' },
          { name: 'Mangas/Animes' },
          { name: 'Épique' },
          { name: 'Enquête' },
          { name: 'Réflexion' },
        ],
      },
    ]

    const defaultChannels = createdTags.map((tag) => {
      return { title: tag.name, tags: [{ name: tag.name }] }
    })

    const createdChannels = []

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

    for (let index = 0; index < 50; index++) {
      const newUser = await User.create({
        email: faker.internet.email(),
        password: await bcrypt.hash(faker.internet.password(), SALT_ROUNDS),
        nickname: faker.internet.userName(),
      })

      const tagCount = Math.round(Math.random() * (11 - 1) + 1)
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

      const recommendedChannels = []
      const otherChannels = []

      for (const userTag of userTags) {
        for (const { channel, tags } of createdChannels) {
          const matchingTag = tags.find(
            (channelTag) =>
              channelTag.dataValues.name === userTag.dataValues.name
          )

          if (matchingTag) {
            recommendedChannels.push(channel)
          } else {
            otherChannels.push(channel)
          }
        }
      }

      const recommendedChannelsCount = Math.round(
        Math.random() * (userTags.length - 2) + 2
      )
      const otherChannelsCount = Math.round(
        (Math.random() * recommendedChannelsCount) / 3
      )

      for (let index = 0; index <= recommendedChannelsCount; index++) {
        const randomChannelIndex = Math.floor(
          Math.random() * recommendedChannels.length
        )

        await newUser.addChannel(
          recommendedChannels[randomChannelIndex].dataValues.id
        )
      }

      for (let index = 0; index <= otherChannelsCount; index++) {
        const randomChannelIndex = Math.floor(
          Math.random() * otherChannels.length
        )

        await newUser.addChannel(
          otherChannels[randomChannelIndex].dataValues.id
        )
      }

      await newUser.save()
    }

    const testUser = await User.create({
      email: 'testeur@testmail.com',
      password: await bcrypt.hash('7357', SALT_ROUNDS),
      nickname: 'le serial testeur',
    })

    const testUserTags = []

    for (let index = 1; index <= 9; index++) {
      const randomIndex = Math.floor(Math.random() * createdTags.length)

      if (
        createdTags[randomIndex] &&
        !testUserTags.includes(createdTags[randomIndex])
      ) {
        await testUser.addTag(createdTags[randomIndex])
        testUserTags.push(createdTags[randomIndex])
      }
    }

    const recommendedChannels = []
    const otherChannels = []

    for (const userTag of testUserTags) {
      for (const { channel, tags } of createdChannels) {
        const matchingTag = tags.find(
          (channelTag) => channelTag.dataValues.name === userTag.dataValues.name
        )

        if (matchingTag) {
          recommendedChannels.push(channel)
        } else {
          otherChannels.push(channel)
        }
      }
    }

    for (let index = 0; index <= 5; index++) {
      const randomChannelIndex = Math.floor(
        Math.random() * recommendedChannels.length
      )

      await testUser.addChannel(
        recommendedChannels[randomChannelIndex].dataValues.id
      )
    }

    for (let index = 0; index <= 2; index++) {
      const randomChannelIndex = Math.floor(
        Math.random() * otherChannels.length
      )

      await testUser.addChannel(otherChannels[randomChannelIndex].dataValues.id)
    }

    await testUser.save()
  } catch (err) {
    console.error('>> Error while creating: ', err)
  } finally {
    sequelize.close()
  }
})()
