// TODO: migrate to a class so item_shares can simply overwrite this?
const { passwd_hasher } = require("../utils/middleware");

/**
 * column `id` is the primary key
 */
const router = require("express").Router({ mergeParams: true });
const { generic: svc } = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(/\/(?<id>\d+)?/, async ({ params: { tbl, id } }, res) => {
  res.send(await svc.query(tbl, id ? { where: "id = ?", params: [id] } : null));
});

router.post(
  "/",
  auth_checker,
  body_validator,
  passwd_hasher,
  async ({ body: { entities }, params: { tbl }, user }, res) => {
    res.send(await svc.create(tbl, entities, user));
  }
);

router.delete(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  async ({ body: { entities }, params: { tbl, id }, user }, res, next) => {
    // allow deletion via path
    if (id !== undefined) entities.push({ id });

    if (entities.length > 0) res.send(await svc.delete(tbl, entities, user));
    else next({ name: "malformed body", message: "nothing to delete" });
  }
);

router.put(
  "/",
  auth_checker,
  body_validator,
  passwd_hasher,
  async ({ body: { entities }, params: { tbl }, user }, res, next) => {
    if (entities.length > 0) res.send(await svc.update(tbl, entities, user));
    else next({ name: "malformed body", message: "nothing to update" });
  }
);

module.exports = router;
