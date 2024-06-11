import createError from "http-errors";
import { strict as assert } from "node:assert";
import { showGames } from "../games_middlewear/index.mjs";

async function getDetails(req, res, next) {
  try {
    res.render("users/details", (_, html) => {
      res.send(html);
    });
  } catch (err) {
    next(err);
  }
}

class ShowUser {
  constructor(verifyFn, syncFn) {
    this.verifyFn = verifyFn;
    this.syncFn = syncFn;
    this.route = [verifyFn, syncFn, getDetails];
  }
}

export default function (verifyFn, syncFn) {
  const ShowDetails = new ShowUser(verifyFn, syncFn);
  return ShowDetails.route;
}
