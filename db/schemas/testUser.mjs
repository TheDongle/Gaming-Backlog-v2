import { userSchema } from "./user.mjs";
import { usernameValidation } from "../validation.mjs";
import { Schema } from "mongoose";

const testUserSchema = new Schema();
testUserSchema.add(userSchema);
testUserSchema.add({
  username: {
    type: String,
    required: true,
    unique: false,
    validate: {
      validator: function (value) {
        return RegExp(usernameValidation.pattern).test(value);
      },
      message: usernameValidation.message,
    },
  },
});

testUserSchema.set("collection", "test");

export { testUserSchema };
