const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mailer = require('../utils/mailer');

let refreshTokens = [];
const authControllers = {
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
        phone: req.body.phone,
      });
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  //Generate Token
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.MY_SECRETKEY,
      {
        expiresIn: "30d",
      }
    );
  },
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.MY_REFRESHKEY,
      {
        expiresIn: "365d",
      }
    );
  },
  getResetPasswordToken: (user) => {
    const resetToken = crypto.randomBytes(25).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
  },
  loginUser: async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json("Wrong email !!!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!validPassword) {
        return res.status(404).json("Wrong password !!!");
      }
      if (user && validPassword) {
        const accessToken = authControllers.generateAccessToken(user);
        const refreshToken = authControllers.generateRefreshToken(user);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        refreshTokens.push(refreshToken);
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.MY_REFRESHKEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      const newAccessToken = authControllers.generateAccessToken(user);
      const newRefreshToken = authControllers.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  },
  logOut: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.status(200).json("Logged out successfully!");
  },
  forgotPassword: async (req, res) => {
    const subject = "Booking4T - Confirm new password";

    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) return res.status(401).json({ error: 'User not Found!' });

      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex")
        }).save();
      }

      const resetToken = jwt.sign({
        userId: token.userId,
        token: token.token
      },
        process.env.MY_SECRETKEY,
        {
          expiresIn: "3600s"
        }
      );

      const link = `${process.env.DEPLOY_URL}/activenewpass?resetToken=${resetToken}`;
      const htmlContent =
        `<p>
                Bạn đã tiến hành lấy lại thông tin tài khoản trên website của Travelgo <br/>

                Xin hãy kích vào đường dẫn dưới đây để xác nhận và lấy lại tên tài khoản cùng mật khẩu mới: <br/>
                
                <a href="${link}">XÁC NHẬN LẤY LẠI THÔNG TIN TÀI KHOẢN</a> <br/>
                
                Travelgo <br/>
                
                Hỗ trợ: <br/>
                
                Tel: 097.421.5002 - Email: <a href="mailto:tridung3210@gmail.com">tridung3210@gmail.com</a>
            </p>`;
      await mailer.sendMail(email, subject, htmlContent);

      res.status(200).json({ message: "Send mail successfully!" });
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: error.message });
    }

  },
  verifyResetToken: async (req, res) => {
    const { resetToken } = req.body;

    jwt.verify(resetToken, process.env.MY_SECRETKEY, async (err, userToken) => {
      if (err) {
        console.log(err);
        return;
      }
      const user = await User.findById(userToken.userId);
      if (!user) return res.status(401).json({ error: 'Invalid or expired link!' });

      const token = await Token.findOne({
        userId: userToken.userId,
        token: userToken.token
      });
      if (!token) return res.status(401).json({ error: 'Invalid or expired link!' });

      res.status(200).json({ email: user.email, token: userToken.token })
    });

  },

  resetPassword: async (req, res) => {
    try {
      const { email, password, token } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) return res.status(401).json({ error: 'Invalid or expired link!' });

      const userToken = await Token.findOne({
        userId: user._id,
        token: token
      });

      if (!userToken) return res.status(401).json({ error: 'Invalid or expired link!' });

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      user.password = hashedPass;
      await user.save();
      await userToken.delete();

      res.status(200).json({ message: "Reset password successfully!" });
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: error.message });
    }
  },
};

module.exports = authControllers;
