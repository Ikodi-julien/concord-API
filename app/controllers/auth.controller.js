const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const { User, Channel } = require("../models");
const authService = require('../services/auth.service');

const SALT_ROUNDS = 10;
const JWT_SECRET = require('../services/JWT_SECRET');

const authController = {
    /**
     *
     * @param {string} req.body
     * @param {*} res
     * @returns
     */
    signup: async (req, res) => {
        try {
            const { email, nickname, password } = req.body;

            if (!email || !password || !nickname) {
                return res
                    .status(412)
                    .json({
                        message: "Missing information, you need to provide an email, a password and a nickname"
                    });
            }

            const emailExists = await User.findOne({
                where: {
                    email,
                },
            });

            if (emailExists) {
                return res
                    .status(409)
                    .json({
                        message: `Validation error: The mail address is invalid or already in use`
                    });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                nickname,
            });

            return res.json(newUser);
        } catch (error) {
            const message = error.parent?.detail || error.message
            console.log(error);
            res.status(500).json({ message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(412)
                    .json({
                        message: "Missing information, you need to provide an email and a password"
                    });
            }

            const user = await User.scope('withPassword').findOne({
                include: [
                    {
                        association: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                    {
                        association: "channels",
                        through: {
                            attributes: [],
                        },
                    },
                ],

                where: {
                    email,
                },
            });

            const isPasswordValid = user ?
                await bcrypt.compare(password, user.password) :
                false;

            if (!isPasswordValid) {
                return res.status(409).json({
                    messsage: `Your credentials are invalid.`
                });
            }

            const recommendedChannels = await Channel.findAll({
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                    where: {
                        id: user.tags.map(({ id }) => id),
                    },
                },
            });

            user.recommendedChannels = recommendedChannels;

            const { accessToken, refreshToken } = await authService.generateTokens({ id: user.id });

            res.cookie("access_token", accessToken, authService.cookieOptions);

            res.cookie("refresh_token", refreshToken, authService.cookieOptions);

            res.status(200).json(user)

        } catch (error) {
            console.log(error)
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    logout: async (req, res) => {
        try {
            if (!req.cookies.access_token || !req.cookies.refresh_token) {
                return res.status(401).json({
                    message: 'User is already logout'
                })
            }

            const decoded = jwt.verify(req.cookies.access_token, JWT_SECRET, {
                ignoreExpiration: true
            })

            await authService.deleteRefreshToken(decoded.id, req.cookies.access_token);

            res.clearCookie("access_token", authService.cookieOptions);
            res.clearCookie("refresh_token", authService.cookieOptions);

            res.status(200).json({ message: 'Logout succeed' });

        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(400).json({ message });
        }
    }
};

module.exports = authController;