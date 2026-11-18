import { describe, expect, it } from "vitest";
import type { User } from "@/features/users";
import { splitByMembership } from "./utils";

const user = (id: string, name: string, isOnline: boolean): User => ({
  id,
  name,
  avatarUrl: "",
  isOnline,
});

const users = [
  user("u-zoe", "Zoe", true),
  user("me", "Alex", false),
  user("u-ben", "Ben", false),
  user("u-amy", "Amy", true),
  user("u-cat", "Cat", false),
];

describe("splitByMembership", () => {
  it("puts you first, then online members, then the rest by name", () => {
    const { members } = splitByMembership(
      users,
      ["u-ben", "me", "u-zoe", "u-amy"],
      "me",
    );
    expect(members.map((m) => m.name)).toEqual(["Alex", "Amy", "Zoe", "Ben"]);
  });

  it("lists everyone else as people who can be added", () => {
    const { others } = splitByMembership(users, ["me", "u-ben"], "me");
    expect(others.map((u) => u.name)).toEqual(["Amy", "Cat", "Zoe"]);
  });
});
