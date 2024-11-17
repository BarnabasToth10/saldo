const jwt = require("jsonwebtoken");
const { compare } = require("bcrypt");
const router = require("express").Router();

const svc = require("../services");
const { SECRET } = require("../utils/config");

router.post("/", async ({ body: { email, password } }, res, next) => {
  const [user = null] = await svc.query("users", {
    where: "email = ?",
    params: [email],
  });

  if (!user)
    return next({
      name: "auth",
      message: "user not found",
    });

  const { id, pw_hash, name } = user;

  if (!(await compare(password, pw_hash)))
    return next({
      name: "auth",
      message: "wrong password",
    });

  const token = jwt.sign({ id }, SECRET);

  res.status(200).send({ token, name, email });
});

module.exports = router;