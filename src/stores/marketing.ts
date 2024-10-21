import { defineStore } from "pinia";
import { ref } from "vue";

export const useMarketingStore = defineStore("marketing", () => {
  const marketingData = ref<any[]>([]);
  const singleMarketData = ref('')

  const fetchMarketingData = async (platform, merchantGuid) => {
    try {
      const response = await $wallyApi(`/marketing-campaign/${platform}/${merchantGuid}`, { method: "GET" });
      marketingData.value = response.data || [];
    } catch (error) {
      throw error;
    }
  };

  const addMarketing = async (data) => {
    try {
      const response = await $wallyApi("/marketing-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      singleMarketData.value = response.data
      return response
    } catch (error) {
      throw error;
    }
  };

  return {
    marketingData,
    fetchMarketingData,
    addMarketing,
  };
});
