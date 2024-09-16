import { defineStore } from "pinia";
import { ref } from "vue";

export const useMerchantStore = defineStore("merchant", () => {
  const merchants = ref([]);
  const selectedMerchant = ref(null);

  const fetchMerchants = async () => {
    try {
      const response = await $wallyApi("/merchants", { method: "GET" });
      merchants.value = response.data || [];
    } catch (error) {
      console.error("Error fetching merchants:", error);
    }
  };

  const addMerchant = async (merchantData) => {
    try {
      const response = await $wallyApi("/merchants", {
        method: "POST",
        body: merchantData,
      });
      merchants.value.push(response.data);
    } catch (error) {
      console.error("Error adding merchant:", error);
    }
  };

  const updateMerchant = async (id, merchantData) => {
    try {
      const response = await $wallyApi(`/merchants/${id}`, {
        method: "PATCH",
        body: merchantData,
      });
      const index = merchants.value.findIndex(
        (merchant) => merchant?.id === id
      );
      if (index !== -1) {
        merchants.value[index] = response.data;
      }
    } catch (error) {
      console.error("Error updating merchant:", error);
    }
  };

  const deleteMerchant = async (id) => {
    try {
      await $wallyApi(`/merchants/${id}`, { method: "DELETE" });
      merchants.value = merchants.value.filter(
        (merchant) => merchant?.id !== id
      );
    } catch (error) {
      console.error("Error deleting merchant:", error);
    }
  };

  return {
    merchants,
    selectedMerchant,
    fetchMerchants,
    addMerchant,
    updateMerchant,
    deleteMerchant,
  };
});
