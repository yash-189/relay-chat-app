import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/features/users";
import { renderWithProviders } from "@/test/render";
import { GroupInfoPanel } from "./GroupInfoPanel";

const addMember = vi.fn();
const removeMember = vi.fn();

const users: User[] = [
  { id: "me", name: "Alex Rivera", avatarUrl: "", isOnline: true },
  { id: "u-2", name: "Sarah Chen", avatarUrl: "", isOnline: true },
  { id: "u-3", name: "Marcus Johnson", avatarUrl: "", isOnline: false },
];

vi.mock("@/features/users", () => ({
  CURRENT_USER_ID: "me",
  useUsers: () => ({ users, isPending: false }),
}));
vi.mock("../hooks/useAddMember", () => ({
  useAddMember: () => ({ mutate: addMember, isPending: false }),
}));
vi.mock("../hooks/useRemoveMember", () => ({
  useRemoveMember: () => ({ mutate: removeMember, isPending: false }),
}));

const group = { id: "conv-2", name: "Design", participantIds: ["me", "u-2"] };

describe("GroupInfoPanel", () => {
  beforeEach(() => {
    addMember.mockClear();
    removeMember.mockClear();
  });

  it("lists members with online status and no remove button for you", () => {
    renderWithProviders(<GroupInfoPanel group={group} />);
    const members = screen.getByRole("region", { name: /members/i });

    expect(within(members).getByText("(you)")).toBeInTheDocument();
    expect(within(members).getByText("Sarah Chen")).toBeInTheDocument();
    expect(
      within(members).queryByRole("button", { name: "Remove Alex Rivera" }),
    ).not.toBeInTheDocument();
  });

  it("removes a member", async () => {
    const { user } = renderWithProviders(<GroupInfoPanel group={group} />);
    await user.click(screen.getByRole("button", { name: "Remove Sarah Chen" }));

    expect(removeMember).toHaveBeenCalledWith(users[1]);
  });

  it("adds someone who isn't in the group yet", async () => {
    const { user } = renderWithProviders(<GroupInfoPanel group={group} />);
    await user.click(
      screen.getByRole("button", { name: "Add Marcus Johnson" }),
    );

    expect(addMember).toHaveBeenCalledWith(users[2]);
  });
});
