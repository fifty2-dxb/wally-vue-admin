import { defineStore } from "pinia";
import { ref } from "vue";

export const useCertificateStore = defineStore("certificates", () => {
  const certificates = ref([]);
  const selectedCertificate = ref(null);

  const fetchCertificates = async () => {
    try {
      const response = await $wallyApi("/certificates", { method: "GET" });
      certificates.value = response.certificates || [];
    } catch (error) {
      console.error("Error fetching certificates", error);
    }
  };

  const addCertificate = async (certificateData) => {  
    try {
      const response = await $wallyApi("/certificates", {
        method: "POST",
        body: certificateData,
      });
      certificates.value.push(response?.data);
    } catch (error) {
      throw error;
    }
  };

  const downloadCSRCertificate = async (downloadData) => {
    try {
      const response = await $wallyApi("/certificates/generateCSR", {
        method: "POST",
        body: downloadData,
      });
      return response; 
    } catch (error) {
      throw error;
    }
  };
  
  const uploadCertificate = async (formData) => {
    try {
      const response = await $wallyApi("/certificates/upload", {
        method: "POST",
        body: formData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deleteCertificate = async (id) => {
    try {
      await $wallyApi(`/certificates/${id}`, { method: "DELETE" });
      certificates.value = certificates.value.filter(cert => cert?.id !== id);
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      throw error;
    }
  };

  const updateCertificate = async (id, certificatesData) => {
    try {
      const response = await $wallyApi(`/certificates/${id}`, {
        method: "PATCH",
        body: certificatesData,
      });
      const index = certificates.value.findIndex(cert => cert?.id === id);
      if (index !== -1) {
        certificates.value[index] = response.data;
      }
    } catch (error) {
      console.error("Failed to update certificate:", error);
      throw error;
    }
  };

  return {
    certificates,
    selectedCertificate,
    fetchCertificates,
    addCertificate,
    downloadCSRCertificate,
    uploadCertificate,
    updateCertificate,
    deleteCertificate
  };
});
