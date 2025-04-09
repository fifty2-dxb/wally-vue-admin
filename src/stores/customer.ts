import { defineStore } from "pinia";
import { ref } from "vue";

interface CustomerDetails {
  id: string;
  name: string;
  surname: string;
  phonenumber: string;
  email: string;
  promotion: string;
  birthday: string | null;
  gender: string | null;
  smsMarketing: number;
  emailMarketing: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id?: string;
  status?: string;
  customers_details: CustomerDetails;
  serialNumber: string;
  type: string;
  stats: any[];
  redeemable: boolean;
  stampImageUrl: string;
  currentStamps?: number;
  requiredStamps?: number;
  activated?: boolean;
  expiresAt?: string;
  platform?: string;
  isExpired?: boolean;
  logs?: any[];
}

interface UpdatePassDetails {
  expirationDate: string;
  activated: boolean;
}

export const useCustomerStore = defineStore("customer", () => {
  const customers = ref<CustomerDetails[]>([]);
  const customer = ref<Customer>({
    status: "",
    customers_details: {
      id: "",
      name: "",
      surname: "",
      phonenumber: "",
      email: "",
      promotion: "",
      birthday: null,
      gender: null,
      smsMarketing: 0,
      emailMarketing: 0,
      note: null,
      createdAt: "",
      updatedAt: "",
    },
    serialNumber: "",
    type: "",
    stats: [],
    redeemable: false,
    stampImageUrl: "",
    currentStamps: 0,
    requiredStamps: 0,
    expiresAt: "",
    platform: "",
    isExpired: false,
  });
  const serialNumberData = ref<any[]>([]);
  

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
      customer.value = response || [];
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
        customer.value = {
          status: response.status,
          customers_details: response.customers_details,
          serialNumber: response.serialNumber,
          type: response.type,
          stats: response.stats || [],
          redeemable: response.redeemable,
          stampImageUrl: response.stampImageUrl,
          currentStamps: response.currentStamps,
          requiredStamps: response.requiredStamps,
          activated: response.activated,
          platform: response.platform,
          expiresAt: response.expiresAt,
          isExpired: response.isExpired,
        };
        fetchLogs(id);
      } else {
        customer.value = {
          status: "",
          customers_details: {
            id: "",
            name: "",
            surname: "",
            phonenumber: "",
            email: "",
            promotion: "",
            birthday: null,
            gender: null,
            smsMarketing: 0,
            emailMarketing: 0,
            note: null,
            createdAt: "",
            updatedAt: "",
          },
          serialNumber: "",
          type: "",
          stats: [],
          redeemable: false,
          stampImageUrl: "",
          currentStamps: 0,
          requiredStamps: 0,
          activated: false,
          expiresAt: "",
          platform: "",
          isExpired: false,
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
      if (customer.value.customers_details?.id) {
        await fetchCustomerById(customer.value.customers_details.id);
      }
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
      if (customer.value.customers_details?.id) {
        await fetchCustomerById(customer.value.customers_details.id);
      }
    } catch (error) {
      console.error("Error redeeming customer by GUID:", error);
      throw error;
    } finally {
      redeeming.value = false;
    }
  };

  const resetCustomerData = () => {
    customer.value = {
      status: "",
      customers_details: {
        id: "",
        name: "",
        surname: "",
        phonenumber: "",
        email: "",
        promotion: "",
        birthday: null,
        gender: null,
        smsMarketing: 0,
        emailMarketing: 0,
        note: null,
        createdAt: "",
        updatedAt: "",
      },
      serialNumber: "",
      type: "",
      platform: "",
      stats: [],
      redeemable: false,
      stampImageUrl: "",
      currentStamps: 0,
      requiredStamps: 0,
      expiresAt: "",
      isExpired: false,
    };
    serialNumberData.value = [];
  };

  const updating = ref(false);
  const updateCustomer = async (id: string, customerData: Partial<CustomerDetails>) => {
    updating.value = true;
    try {
      const response = await $wallyApi(`/customers/${id}`, {
        method: "PATCH",
        body: customerData,
      });
      
      if (response?.customers_details) {
        // Update the local customer state with the response
        customer.value = {
          ...customer.value,
          customers_details: response.customers_details,
        };
      }
      return response;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    } finally {
      updating.value = false;
    }
  };

  const addMember = async (customerData: Partial<CustomerDetails>, event: { eventId: string }) => {
    try {
      const updatedData = {
        ...customerData,
        smsMarketing: Number(customerData.smsMarketing ? 1 : 0),
        emailMarketing: Number(customerData.emailMarketing ? 1 : 0),
      };
      const response = await $wallyApi(`/customers/member/${event.eventId}`, {
        method: "POST",
        body: updatedData,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const response = await $wallyApi(`/customers/${id}`, {
        method: "DELETE",
      })
        await fetchCustomers();
    } catch (error) {
      throw error;
    }
  };

  const updatePassDetails = async (serialNumber: string, details: UpdatePassDetails) => {
    try {
      const response = await $wallyApi(`/passes/${serialNumber}`, {
        method: 'PATCH',
        body: details,
      });
      if (response.data) {
        // Update the customer object with new pass details
        customer.value = {
          ...customer.value,
          status: details.activated ? 'active' : 'inactive',
          expiresAt: details.expirationDate,
        };
      }
    } catch (error) {
      console.error('Error updating pass details:', error);
      throw error;
    }
  };

  const sendUpdateNotification = async () => {
    try {
      const response = await $wallyApi(`/v1/devices/notification/${customer.value.serialNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Your card has been updated"
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send notification')
      }
      

    } catch (error) {
      console.error('Error sending update notification:', error)
    }
  }

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
    resetCustomerData,
    updating,
    updateCustomer,
    addMember,
    deleteMember,
    updatePassDetails,
    sendUpdateNotification,
  };
});
