import { useConfigStore } from "@/@core/stores/config";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCampaignStore = defineStore("campaign", () => {
  const campaigns = ref([]);
  const selectedCertificate = ref(null);
  const configStore = useConfigStore();

  const fetchCampaigns = async () => {
    try {
      const response = await $wallyApi(`/campaign/merchant/`, { method: "GET" });
      campaigns.value = response.campaign || [];
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  const fetchCampaignByMerchantGuid = async (merchantGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/merchant/${merchantGuid}`, { method: "GET" });
      campaigns.value = response?.campaign_details || [];
      console.log("Fetched campaigns by Merchant GUID:", campaigns.value);
    } catch (error) {
      console.error("Error fetching campaigns by merchant GUID:", error);
      throw error;
    }
  };

  const fetchCampaignByCampaignGuid = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}`, { method: "GET" });
      if (response?.campaign) {
        campaigns.value = [response.campaign];
      } else {
        campaigns.value = [];
      }
      console.log("Fetched campaigns by GUID:", campaigns.value);
    } catch (error) {
      console.error("Error fetching campaigns by campaign GUID:", error);
      throw error;
    }
  };

  const addCampaign = async (campaignData) => {
    try {
      const response = await $wallyApi("/campaigns", {
        method: "POST",
        body: campaignData,
      });
      campaigns.value.push(response?.data);
    } catch (error) {
      throw error;
    }
  };

  const deleteCampaign = async (campaignGuid: string) => {
    console.log(campaignGuid);
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}`, { method: "DELETE" });
      if (response.status === 'success') {
        campaigns.value = campaigns.value.filter((c) => c.campaignGuid !== campaignGuid);
      } else {
        throw new Error(response.message || 'Failed to delete the campaign');
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      throw error;
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await $wallyApi(`/campaigns/${id}`, {
        method: "PATCH",
        body: campaignData,
      });
      const index = campaigns.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        campaigns.value[index] = response.data;
      }
    } catch (error) {
      console.error("Failed to update campaign:", error);
      throw error;
    }
  };

  return {
    campaigns,
    fetchCampaigns,
    fetchCampaignByMerchantGuid,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    fetchCampaignByCampaignGuid
  };
});
