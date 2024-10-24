import { useConfigStore } from "@/@core/stores/config";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useReaderstore = defineStore("readers", () => {
  const readers = ref([]);

  const fetchReaders = async (merchantGuid: string) => {
    try {
      const response = await $wallyApi(`/v1/readers/merchant/${merchantGuid}`, {
        method: "GET",
      });
      readers.value = response.data || [];
      return response;
    } catch (error) {
      console.error("Error fetching Readers", error);
    }
  };

  const addReader = async (readerData) => {
    try {
      const response = await $wallyApi("/v1/readers", {
        method: "POST",
        body: readerData,
      });
      readers.value.push(response?.data);
    } catch (error) {
      throw error;
    }
  };

  const deleteReader = async (readerGuid) => {
    try {
      await $wallyApi(`/v1/readers/${readerGuid}`, { method: "DELETE" });
      readers.value = readers.value.filter(
        (reader) => reader?.readerGuid !== readerGuid
      );
    } catch (error) {
      console.error("Failed to delete reader:", error);
      throw error;
    }
  };

  const updateReader = async (readerGuid, readersData) => {
    try {
      const response = await $wallyApi(`/v1/readers/${readerGuid}`, {
        method: "PATCH",
        body: readersData,
      });
      const index = readers.value.findIndex(
        (readers) => readers?.readerGuid === readerGuid
      );
      if (index !== -1) {
        readers.value[index] = response.data;
      }
    } catch (error) {
      console.error("Failed to update reader:", error);
      throw error;
    }
  };

  return {
    readers,
    fetchReaders,
    addReader,
    updateReader,
    deleteReader,
  };
});
