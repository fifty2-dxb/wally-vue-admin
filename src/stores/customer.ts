import { defineStore } from "pinia";
import { ref } from "vue";

export const useCustomerStore = defineStore("customer", () => {
  const customers = ref([]);
  const customer = ref({
    id: "",
    serialNumber: "",
    stats: [],
    type: "",
  });
  const serialNumberData = ref([])
  

  const fetchCustomers = async () => {
    try {
      const response = await $wallyApi(`/customers`, { method: "GET" });
      customers.value = response.customers || [];
    } catch (error) {
      console.error("Error fetching customers", error);
    }
  };

  const fetchCustomerBySerialNumber = async (serialNumber: string) => {
    try {
      const response = await $wallyApi(`/customers/pass/${serialNumber}`, { method: "GET" });
      serialNumberData.value = response || [];
    } catch (error) {
      console.error("Error fetching customers", error);
    }
  };

  const fetchCustomerById = async (id: string) => {
    try {
      const response = await $wallyApi(`/customers/${id}`, { method: "GET" });
      console.log("response", response);
      if (response?.customers_details) {
        customer.value = response.customers_details;
        customer.value.serialNumber = response.serialNumber;
        customer.value.stampImageUrl = response.stampImageUrl;
        customer.value.redeemable = response.redeemable;
        customer.value.stats = response.stats;
        customer.value.type = response.type;
        fetchLogs(id);
      } else {
        customer.value = {
          id: "",
          serialNumber: ""
        };
      }
    } catch (error) {
      console.error("Error fetching customer by GUID:", error);
      throw error;
    }
  };


  const gettingLogs = ref(false);
  const fetchLogs = async (id: string) => {
    gettingLogs.value = true;
    try {
      const response = await $wallyApi(`/customers/${id}/logs`, { method: "GET" });
      console.log("response", response);
      if (response?.pass_value) {
        customer.value.logs = response.pass_value;
      } else {
        customer.value.logs = [];
      }
    } catch (error) {
      console.error("Error fetching logs by GUID:", error);
      throw error;
    } finally {
      gettingLogs.value = false;
    }
  }

  const stamping = ref(false);
  const stamp = async (count: any) => {
    stamping.value = true;
    try {
      const response = await $wallyApi(`/pass-value`, {
        method: "POST",
        body: {
          "serialNumber": customer.value.serialNumber,
          "value": count,
          "type": "stamp"
        },
      });
      console.log("response", response);
      await fetchCustomerById(customer.value.id);
    } catch (error) {
      console.error("Error stamping customer by GUID:", error);
      throw error;
    } finally {
      stamping.value = false;
    }
  };

  const redeeming = ref(false);
  const redeem = async (count: any = 1) => {
    redeeming.value = true;
    try {
      const response = await $wallyApi(`/pass-value`, {
        method: "POST",
        body: {
          "serialNumber": customer.value.serialNumber,
          "value": count,
          "type": "redeem"
        },
      });
      console.log("response", response);
      await fetchCustomerById(customer.value.id);
    } catch (error) {
      console.error("Error redeeming customer by GUID:", error);
      throw error;
    } finally {
      redeeming.value = false;
    }
  };

  const resetCustomerData = () => {
    customer.value = {
      id: "",
      serialNumber: "",
      stats: [],
      type: "",
    };
    serialNumberData.value = [];
  };

  return {
    customers,
    customer,
    fetchCustomers,
    fetchCustomerById,
    fetchCustomerBySerialNumber,
    stamping,
    stamp,
    redeeming,
    redeem,
    gettingLogs,
    serialNumberData,
    resetCustomerData 
  };
});
