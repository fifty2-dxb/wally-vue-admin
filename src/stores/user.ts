import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref([]);
  const selectedUser = ref(null);

  const fetcUserData = async () => {
    try {
      const response = await $wallyApi("/users/me", { method: "GET" });
      user.value = response.userData || [];
    } catch (error) {
      throw error
    }
  };

  const loginUser = async (userData) => {
    try {
      const response = await $wallyApi("/users/login", {
        method: "POST",
        body: userData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (userData) => {

    try {
      const response = await $wallyApi("/users/register", {
        method: "POST",
        body: userData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await $wallyApi(`/users/${id}`, {
        method: "PATCH",
        body: userData,
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await $wallyApi(`/users/${id}`, { method: "DELETE" });
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    selectedUser,
    loginUser,
    registerUser,
    fetcUserData,
    updateUser,
    deleteUser,
  };
});
