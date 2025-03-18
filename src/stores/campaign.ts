import { useConfigStore } from "@/@core/stores/config";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCampaignStore = defineStore("campaign", () => {
  const campaigns = ref([]);
  const campaign = ref(null);
  const customers = ref([]);
  const statistics = ref({})
  const barchartStats = ref({})

  const fetchCampaigns = async () => {
    try {
      const response = await $wallyApi(`/campaign/merchant/`, { method: "GET" });
      campaigns.value = response.campaign || [];
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  const fetchCampaignStatistics = async (
    campaignGuid: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
  
      const url = `/v1/statistics/${campaignGuid}?${queryParams.toString()}`;
      const response = await $wallyApi(url, { method: "GET" });
      statistics.value = response?.data || {};
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };

  const fetchCampaignStatisticsMonthly = async (campaignGuid: string, startDate: string, endDate: string) => {
    try {
      const url = `/v1/statistics/${campaignGuid}/monthly?startDate=${startDate}&endDate=${endDate}`;
      const response = await $wallyApi(url, { method: "GET" });
      console.log("Fetched statistics:", response);
      barchartStats.value = response?.data || {};
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchCampaignByMerchantGuid = async (merchantGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/merchant/${merchantGuid}`, { method: "GET" });
      campaigns.value = response?.campaign_details || [];
    } catch (error) {
      console.error("Error fetching campaigns by merchant GUID:", error);
      throw error;
    }
  };

  const fetchCampaignByCampaignGuid = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}`, { method: "GET" });
      if (response?.campaign) {
        campaign.value = response.campaign;
      } else {
        campaign.value = null;
      }
      return response;
    } catch (error) {
      console.error("Error fetching campaign by campaign GUID:", error);
      throw error;
    }
  };

  const fetchCustomerByCampaignGuid = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}/customers`, { method: "GET" });
      if (response) {
        customers.value = response.customers;
      } else {
        customers.value = [];
      }
    } catch (error) {
      console.error("Error fetching customers by campaign GUID:", error);
      throw error;
    }
  };

  const fetchPassValue = async (
    campaignGuid: string,
    startDate: string,
    endDate: string,
    campaignType: string,
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("type", campaignType);
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
  
      const url = `/pass-value/campaigId/${campaignGuid}?${queryParams.toString()}`;
      const response = await $wallyApi(url, { method: "GET" });
      return response;
    } catch (error) {
      console.error("Error fetching pass value:", error);
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
    campaign,
    customers,
    statistics,
    barchartStats,
    fetchCampaignByMerchantGuid,
    fetchCampaignByCampaignGuid,
    fetchCustomerByCampaignGuid,
    addCampaign,
    deleteCampaign,
    updateCampaign,
    fetchCampaignStatistics,
    fetchCampaignStatisticsMonthly,
    fetchPassValue
  };
});

