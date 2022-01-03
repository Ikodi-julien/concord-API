const { User, Tag, Channel } = require("../models");
const { Op, Sequelize } = require("sequelize");
const cookieService = require("../services/cookie.service");

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const userController = {
  /**
   *
   * @param {json} req.body
   * @param {json} res.json
   * @returns
   */

  updateMe: async (req, res) => {
    const { user } = req;
    // const { nickname, email } = req.body;

    try {
      const userData = await User.findOne({ where: { authid: user.id } });

      if (!userData) {
        return res.status(400).json({ message: "No user found." });
      }

      await userData.update({ nickname: user.nickname, email: user.email });

      await userData.save();

      res.status(200).json(userData);
    } catch (error) {
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },

  updateMeTags: async (req, res) => {
    const { user } = req;
    const { tags } = req.body;
    try {
      const options = tags
        ? {
            include: {
              association: "tags",
              through: {
                attributes: [],
              },
            },
          }
        : null;

      const userSql = await User.findOne({
        where: { authid: user.id },
        options,
      });

      if (!userSql) {
        return res.status(400).json({ message: "No user found." });
      }

      if (tags) {
        await userSql.setTags(tags);
      }

      await userSql.save();

      res.status(200).json(userSql);
    } catch (error) {
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },

  updateAvatar: async (req, res) => {
    const authid = req.user.id;
    const { avatar } = req.body;

    try {
      const user = await User.findOne({
        where: { authid },
      });

      if (!user) {
        return res.status(400).json({ message: "No user found." });
      }

      await user.update({ avatar });

      await user.reload();

      res.status(200).json(user);
    } catch (error) {
      const message = error.parent.detail || error.message;
      res.status(500).json({ message });
    }
  },

  updatePassword: async (req, res) => {
    // on récupère l'ancien mot de passe dans req.body
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res
        .status(409)
        .json({ message: "Current or new password is missing." });
    }

    const id = req.user.id;

    try {
      const user = await User.scope("withPassword").findByPk(id);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(409)
          .json({ message: "The current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      user.password = hashedPassword;
      await user.save();

      await jwtService.deleteAllRefreshToken(id);

      res.clearCookie("access_token", cookieService.options);
      res.clearCookie("refresh_token", cookieService.options);

      return res.status(200).json({ message: "Password updated" });
    } catch (error) {
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },

  delete: async (req, res) => {
    // store id in a const with incoming request parameters id
    const id = req.user.id;
    try {
      // delete the user
      const deleted = await User.destroy({ where: { authid: id } });

      if (deleted === 0) {
        return res.status(404).json({
          message: "This user does not exist or is already deleted",
        });
      }

      // send a 200 status and a message to show that user has been deleted
      res.status(200).json({
        message: `User account successfully deleted`,
      });
    } catch (error) {
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },

  profile: async (req, res) => {
    const { id } = req.user;
    try {
      const user = await User.findOne({
        where: {
          authid: id,
        },
        include: {
          association: "tags",
          through: {
            attributes: [],
          },
        },
      });
      if (!user) return userController.newProfile(req, res);

      res.status(200).json(user);
    } catch (error) {
      userController.newProfile(req, res);
      console.log("profile error", error);
    }
  },

  newProfile: async (req, res) => {
    try {
      const { user } = req;
      if (!user.id) {
        return res.status(412).json({
          message: "Missing data",
        });
      }

      const newUser = await User.create({
        nickname: user.nickname,
        authid: user.id,
      });

      return res.json(newUser);
    } catch (error) {
      const message = error.parent?.detail || error.message;
      // console.log(error);
      res.status(500).json({ message });
    }
  },

  getUserChannels: async (req, res) => {
    const userId = req.query.userid;
    // console.log("channels param userId", userId);
    if (userId === "-1") return res.sendStatus(204);

    try {
      const channels = await Channel.findAll({
        attributes: [
          "id",
          "title",
          "img_url",
          "rank",
          "plot",
          "year",
          [Sequelize.fn("COUNT", Sequelize.col("users")), "usersCount"],
        ],
        group: ["Channel.id", "tags.id"],
        include: [
          {
            association: "users",
            through: {
              attributes: [],
            },
            attributes: [],
          },
          {
            association: "tags",
            through: {
              attributes: [],
            },
            attributes: ["id", "name"],
          },
        ],
        where: {
          id: {
            [Op.in]: Sequelize.literal(
              `(SELECT channel_id FROM user_has_channel WHERE user_id = ${userId})`
            ),
          },
        },
      });

      res.status(200).json(channels);
    } catch (error) {
      const message = error.parent?.detail || error.message;
      // console.log(error);
      res.status(500).json({ message });
    }
  },

  removeJoinedChannel: async (req, res) => {
    const userId = req.query.userid;
    if (userId === "-1") return res.sendStatus(204);

    try {
      const channel = await Channel.findByPk(req.params.id);

      if (!channel) {
        return res.status(404).json({ message: `Channel not found` });
      }

      await channel.removeUser(userId);

      res.status(200).json({ message: "Channel removed successfully" });
    } catch (error) {
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },

  getRecommendedChannels: async (req, res) => {
    const userId = req.query.userid;
    // console.log("userId in recos", userId);
    if (userId === "-1") return res.sendStatus(204);

    try {
      const user = await User.findOne({
        where: {
          id: userId,
        },
        attributes: ["id"],
        include: [
          {
            association: "channels",
            through: {
              attributes: [],
            },
            attributes: ["id"],
          },
          {
            association: "tags",
            through: {
              attributes: [],
            },
            attributes: ["id"],
          },
        ],
      });

      const recommendedChannels = user.tags.length
        ? await Channel.findAll({
            attributes: [
              "id",
              "title",
              "img_url",
              "rank",
              "plot",
              "year",
              [Sequelize.fn("COUNT", Sequelize.col("users")), "usersCount"],
            ],
            include: [
              {
                association: "users",
                through: {
                  attributes: [],
                },
                attributes: [],
              },
              {
                association: "tags",
                through: {
                  attributes: [],
                },
                attributes: ["id", "name"],
              },
            ],
            group: ["Channel.id", "tags.id"],
            where: {
              id: {
                [Op.and]: [
                  {
                    [Op.notIn]: user.channels.map(({ id }) => id),
                  },
                  {
                    [Op.in]: Sequelize.literal(
                      `(SELECT channel_id FROM channel_has_tag WHERE tag_id in (${user.tags.map(
                        ({ id }) => id
                      )}))`
                    ),
                  },
                ],
              },
            },
          })
        : [];

      if (recommendedChannels.length) {
        for (const channel of recommendedChannels) {
          for (const tag of channel.tags) {
            tag.matchingTag = user.tags.find(
              (userTag) => userTag.dataValues.id === tag.id
            )
              ? true
              : false;
          }
        }

        recommendedChannels.sort((a, b) => {
          return (
            b.tags.filter((tag) => tag.matchingTag).length -
            a.tags.filter((tag) => tag.matchingTag).length
          );
        });
      }

      res.status(200).json(recommendedChannels);
    } catch (error) {
      console.error(error);
      const message = error.parent?.detail || error.message;
      res.status(500).json({ message });
    }
  },
};

module.exports = userController;
