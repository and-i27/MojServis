import { client } from "@/sanity/lib/client";

export interface UserStats {
  _id: string;
  name: string;
  email: string;
  role: string;
  carCount: number;
  todoCount: number;
  totalServiceCost: number;
  completedTodos: number;
  pendingTodos: number;
}

export async function getUsersWithStats(): Promise<UserStats[]> {
  // Pridobi vse uporabnike
  const users = await client.fetch(`
    *[_type == "user"] {
      _id,
      name,
      email,
      role
    }
  `);

  // Za vsakega uporabnika pridobi statistike
  const usersWithStats = await Promise.all(
    users.map(async (user: any) => {
      // Število avtomobilov
      const carCount = await client.fetch(
        `count(*[_type == "car" && owner._ref == $userId])`,
        { userId: user._id }
      );

      // Število todojev
      const todoCount = await client.fetch(
        `count(*[_type == "todo" && user._ref == $userId])`,
        { userId: user._id }
      );

      // Število dokončanih todojev
      const completedTodos = await client.fetch(
        `count(*[_type == "todo" && user._ref == $userId && status == "done"])`,
        { userId: user._id }
      );

      // Število čakajočih todojev
      const pendingTodos = await client.fetch(
        `count(*[_type == "todo" && user._ref == $userId && status == "open"])`,
        { userId: user._id }
      );

      // Skupni stroški servisov
      const totalServiceCost = await client.fetch(
        `math::sum(*[_type == "serviceRecord" && user._ref == $userId && defined(cost)].cost)`,
        { userId: user._id }
      );

      return {
        _id: user._id,
        name: user.name || "Brez imena",
        email: user.email,
        role: user.role || "user",
        carCount: carCount || 0,
        todoCount: todoCount || 0,
        totalServiceCost: totalServiceCost || 0,
        completedTodos: completedTodos || 0,
        pendingTodos: pendingTodos || 0,
      };
    })
  );

  return usersWithStats;
}

export async function updateUserRole(userId: string, newRole: string) {
  return await client.patch(userId).set({ role: newRole }).commit();
}