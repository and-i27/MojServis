"use client";

import { useState, useEffect } from "react";
import { UserStats, getUsersWithStats, updateUserRole } from "@/lib/adminData";

type SortField =
  | "name"
  | "email"
  | "role"
  | "carCount"
  | "todoCount"
  | "totalServiceCost";
type SortDirection = "asc" | "desc";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await getUsersWithStats();
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Napaka pri posodabljanju role");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "fleet_manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="main">
        <div className="text-center">Nalaganje...</div>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>Nadzorna plošča</h1>
      <p className="text-lg">Pregled uporabnikov in njihove statistike</p>

      {/* Filters */}
      <div className="section-primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-2">Išči uporabnika</label>
            <input
              type="text"
              placeholder="Ime ali email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-input w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Filter po roli</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-input w-full h-8"
            >
              <option value="all">Vse role</option>
              <option value="user">Uporabik</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setSortField("name");
                setSortDirection("asc");
              }}
              className="btn"
            >
              Počisti filtre
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 text-primary">
        <div className="section-primary">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="">Skupaj uporabnikov</div>
        </div>
        <div className="section-primary">
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="">Admin uporabnikov</div>
        </div>
        <div className="section-primary">
          <div className="text-2xl font-bold">
            {users.reduce((sum, u) => sum + u.carCount, 0)}
          </div>
          <div className="">Skupaj avtomobilov</div>
        </div>
        <div className="section-primary">
          <div className="text-2xl font-bold">
            {users.reduce((sum, u) => sum + u.totalServiceCost, 0).toFixed(2)} €
          </div>
          <div className="">Skupni stroški</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="section-primary overflow-hidden">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background/80">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  Uporabnik{" "}
                  {sortField === "name" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("role")}
                >
                  Rola{" "}
                  {sortField === "role" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("carCount")}
                >
                  Avtomobili{" "}
                  {sortField === "carCount" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("todoCount")}
                >
                  Opravila{" "}
                  {sortField === "todoCount" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalServiceCost")}
                >
                  Stroški{" "}
                  {sortField === "totalServiceCost" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role === "admin"
                        ? " Administrator"
                        : user.role === "fleet_manager"
                          ? "Fleet Manager"
                          : "Uporabnik"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.carCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.todoCount} skupaj
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.completedTodos} dokončanih, {user.pendingTodos}{" "}
                      čakajočih
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.totalServiceCost.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.pendingTodos > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {user.pendingTodos} čakajočih opravil
                        </span>
                      )}
                      {user.carCount > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.carCount} avtomobilov
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="text-input bg-white! hover:bg-background!"
                    >
                      <option value="user">Uporabnik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8">Ni najdenih uporabnikov</div>
        )}
      </div>
    </div>
  );
}
