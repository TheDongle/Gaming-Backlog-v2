import { expect, jest, test } from "@jest/globals";
import { AddNewGuestToDB, AddNewUserToDB, getGuestGames } from "./create.mjs";
import request from "supertest";
import { passwordValidation } from "../../db/validation.mjs";
import { postData } from "../../public/javascripts/components/forms.mjs";
import { default as MakeApp } from "../../app.mjs";
import { connectionFactory } from "../../db/index.mjs";
const app = MakeApp(await connectionFactory());


// describe("Create User(Properly)", () => {
//   let conn, User;
//   beforeAll(async () => {
//     conn = await connectionFactory();
//     User = conn.models.User;
//   });
//   afterAll(async () => {
//     await conn.close();
//   });
//   test("User is created", async () => {
//     const params = {
//       username: "imaReallyRealGuy1234",
//       password: "passwordface1234",
//       playStyle: "completionist",
//     };
//     request(app)
//       .post("/new")
//       .field("username", "imaReallyRealGuy123")
//       .field("password", "passwordface1234")
//       .field("playStyle", "completionist")
//       .expect(200)
//       .end(function (err, res) {
//         if (err) throw err;
//       });
//     if (await User.exists({ username: "imaReallyRealGuy123" })) {
//       await User.deleteOne({ username: "imaReallyRealGuy123" });
//     }
//   });
// });

describe("Create User", () => {
  let conn, TestUser, createdUser;
  const params = { username: "crabbyFace10", password: "passy1234", playStyle: "casual" };
  beforeAll(async () => {
    conn = await connectionFactory();
    TestUser = conn.models.TestUser;
    createdUser = await AddNewUserToDB(TestUser, params);
  });
  afterAll(async () => {
    if (createdUser !== undefined) await TestUser.deleteOne({ _id: createdUser._id });
    await conn.close();
  });
  test(`New User should be created`, async () => {
    expect(createdUser).toBeTruthy();
  });
  test(`New User contain specified parameters`, async () => {
    expect(createdUser.username).toEqual(params.username);
    expect(createdUser.playStyle).toEqual(params.playStyle);
  });
  test(`Password should be hashed`, async () => {
    expect(createdUser.password).not.toEqual(params.password);
  });
  test(`comparePassword should confirm password is correct`, async () => {
    expect(createdUser.comparePassword(params.password)).resolves.toBe(true);
  });
});

describe("Create User Validation", () => {
  let conn, TestUser;
  const params = { username: "crabbyFace10", password: "passy1234", playStyle: "casual" };
  beforeAll(async () => {
    conn = await connectionFactory();
    TestUser = conn.models.TestUser;
  });
  afterEach(async () => {
    const testID = await TestUser.exists({});
    if (testID !== null) {
      await TestUser.deleteOne({ _id: testID });
    }
  });
  afterAll(async () => {
    await conn.close();
  });
  test.each(["", "123", "abc", "seven12", "123456789012345678901234567890123"])(
    "Invalid password shouldn't be accepted",
    async (sample) => {
      params.password = sample;
      await expect(async () => await AddNewUserToDB(TestUser, params)).rejects.toThrow();
    },
  );
  test.each(["", "badName", "123456789012345678901234567890123", "Space Man"])(
    "Invalid Username shouldn't be accepted",
    async (sample) => {
      params.username = sample;
      await expect(async () => await AddNewUserToDB(TestUser, params)).rejects.toThrow();
    },
  );
  test("Invalid playStyle shouldn't be accepted", async () => {
    params.playStyle = "Bad";
    await expect(async () => await AddNewUserToDB(TestUser, params)).rejects.toThrow();
  });
});

test("Usernames should be Unique (for real Users)", async () => {
  const conn = await connectionFactory();
  const { User } = conn.models;
  const params = { username: "crabbyFace13", password: "passy1234", playStyle: "casual" };
  const id = await User.exists({ username: "crabbyFace13" });
  const uniqueUser = id !== null ? await User.findById(id) : await AddNewUserToDB(User, params);
  params.username = uniqueUser.username;
  await expect(async () => await await AddNewUserToDB(User, params)).rejects.toThrow();
  await conn.close();
});

describe("Create Guest", () => {
  let conn, createdGuest, Guest;
  beforeAll(async () => {
    conn = await connectionFactory();
    Guest = conn.models.Guest;
    createdGuest = await AddNewGuestToDB(Guest);
    console.log(createdGuest)
  });
  afterAll(async () => {
    if (createdGuest !== undefined) {
      await createdGuest.deleteOne({ _id: createdGuest._id });
    }
    await conn.close();
  });
  test(`New Guest should exist`, async () => {
    expect(createdGuest).toBeDefined();
  });
  test(`New Guest should have default username 'Guest' and playstyle'casual'`, async () => {
    expect(createdGuest.username).toEqual("guest");
    expect(createdGuest.playStyle).toEqual("casual");
  });
});
