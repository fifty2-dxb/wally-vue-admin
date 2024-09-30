import { defineStore } from "pinia";
import { ref } from "vue";

export const useActivationStore = defineStore("activation", () => {
  const activation = ref([]);

  const fetchaActivation = async () => {
    try {
      const response = await $wallyApi("/activation", { method: "GET" });
      activation.value = response.data || [];
    } catch (error) {
      throw error;
    }
  };

  const addCustomerActivation = async (activationData) => {
    try {
      const response = await $wallyApi("/customers/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activationData),
      });
      activation.value.push(response.data);
    } catch (error) {
      throw error;
    }
  };

  return {
    activation,
    fetchaActivation,
    addCustomerActivation,
  };
});
