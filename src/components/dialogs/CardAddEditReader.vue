<script setup lang="ts">
import { useReaderstore } from '@/stores/reader';
import { ref, watch } from 'vue';
import { useCampaignStore } from '@/stores/campaign';
import { useConfigStore } from '@/@core/stores/config';

const props = defineProps({
  reader: { type: Object, default: () => null },
  showSnackbar: { type: Function, required: true }
});

const readerStore = useReaderstore();
const campaignStore = useCampaignStore();
const configStore = useConfigStore();

const emit = defineEmits(['close', 'submit']);

const selectedCampaign = ref('');
const serialNumber = ref('');
const readerName = ref('');
const readerDescription = ref('');
const campaignGuid = ref([]);
const readerGuid = ref('');

const resetFields = () => {
  serialNumber.value = '';
  readerName.value = '';
  readerDescription.value = '';
  campaignGuid.value = [];
  readerGuid.value = '';
};

watch(
  () => configStore.activeMerchant?.merchantGuid,
  async (newMerchantGuid) => {
    if (newMerchantGuid) {
      try {
        await campaignStore.fetchCampaignByMerchantGuid(newMerchantGuid);
        campaignGuid.value = campaignStore.campaigns;
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.reader,
  (newReader) => {
    if (newReader) {
      serialNumber.value = newReader.serialNumber;
      readerName.value = newReader.readerName;
      readerDescription.value = newReader.readerDescription;
      campaignGuid.value = newReader.campaignGuid;
      readerGuid.value = newReader.readerGuid;
    } else {
      resetFields();
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  const newReader = {
    campaignGuid: campaignStore.campaigns.find(c => c.campaignName === selectedCampaign.value)?.campaignGuid || '',
    merchantGuid: configStore.activeMerchant?.merchantGuid,
    serialNumber: serialNumber.value,
    readerName: readerName.value,
    readerDescription: readerDescription.value,
  };

  try {
    const merchantGuid = configStore.activeMerchant?.merchantGuid;

    if (props.reader) {
      await readerStore.updateReader(readerGuid.value, newReader);
      props.showSnackbar('Reader updated successfully', 'success');
    } else {
      await readerStore.addReader(newReader);
      props.showSnackbar('Reader added successfully', 'success');
    }
    await readerStore.fetchReaders(merchantGuid);
    emit('submit', newReader);
  } catch (error) {
    console.error('Error submitting reader data:', error);
    props.showSnackbar('Failed to submit reader data', 'error');
  } finally {
    resetFields();
    emit('close');
  }
};


</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 900" @close="emit('close')">
    <DialogCloseBtn @click="emit('close', false)" />
    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-2">
          <h4>
            {{ props.reader ? 'Edit Reader' : 'Add New Reader' }}
          </h4>
        </VCardTitle>
        <VCardTitle class="text-h4 mb-2">
          <p>
            {{ props.reader ? 'Edit reader details' : 'Add new reader details' }}
          </p>
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-6">
        <VForm @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12" md="6">
              <AppTextField v-model="serialNumber" label="Serial No." placeholder="Please input serial number" />
            </VCol>


            <VCol cols="12" md="6">
              <AppTextField v-model="readerName" label="Reader Name" placeholder="Please input reader name" />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField v-model="readerDescription" label="Reader Description"
                placeholder="Please input reader description" />
            </VCol>
            <VCol cols="12" md="6">
              <AppAutocomplete density="compact" v-model="selectedCampaign"
                :items="campaignStore.campaigns.map(c => c.campaignName)" placeholder="Select Campaign"
                label="Campaign" />
            </VCol>
            <VCol cols="12" class="text-center ">
              <VBtn class="mr-4" type="submit">{{$t("Submit")}}</VBtn>
              <VBtn type="reset" color="secondary" variant="tonal" @click="emit('close', false)">{{$t("Cancel")}}</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
