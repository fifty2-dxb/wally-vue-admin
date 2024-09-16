import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrganizationStore = defineStore("organization", () => {
  const organizations = ref([]);
  const selectedOrganization = ref(null);

  const fetchOrganizations = async () => {
    try {
      const response = await $wallyApi("/organisations", { method: "GET" });
      organizations.value = response.organisation_details || [];
    } catch (error) {}
  };

  const addOrganization = async (organizationData) => {
    try {
      const response = await $wallyApi("/organisations", {
        method: "POST",
        body: organizationData,
      });
      organizations.value.push(response.data);
    } catch (error) {
      throw error;
    }
  };

  const updateOrganization = async (id, organizationData) => {
    try {
      const response = await $wallyApi(`/organisations/${id}`, {
        method: "PATCH",
        body: organizationData,
      });
      const index = organizations.value.findIndex((org) => org.id === id);
      if (index !== -1) {
        organizations.value[index] = response.data;
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      throw error;
    }
  };

  const deleteOrganization = async (id) => {
    try {
      await $wallyApi(`/organisations/${id}`, { method: "DELETE" });
      organizations.value = organizations.value.filter((org) => org.id !== id);
    } catch (error) {
      throw error;
    }
  };

  return {
    organizations,
    selectedOrganization,
    fetchOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
  };
});
