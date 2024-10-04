<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';
import { useCampaignStore } from '@/stores/campaign';
import iphoneLayout from '@images/iphoneLayout.png';

const configStore = useConfigStore()
const campaignStore = useCampaignStore(); 

const campaigns = ref(null)
const isDeleteConfirmationVisible = ref(false);
 const campaignToDelete = ref(null)
 const snackbarMessage = ref('');
 const snackbarColor = ref('');
 const showSnackbar = ref(false);

watch(
  () => configStore.activeMerchant,
  async (newMerchant, oldMerchant) => {
    if (newMerchant && newMerchant.merchantGuid !== (oldMerchant?.merchantGuid || '')) {
      try {
        await campaignStore.fetchCampaignByMerchantGuid(newMerchant.merchantGuid);
        campaigns.value = campaignStore.campaigns;
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    }
  },
  { immediate: true }
);

const showSnackbarMessage = (message: string, color: string) => {
   snackbarMessage.value = message;
   snackbarColor.value = color;
   showSnackbar.value = true;
 };
 
 const confirmDeleteCampaign = (campaignGuid) => {
   campaignToDelete.value = campaignGuid;
   isDeleteConfirmationVisible.value = true;
 };
 
 const handleDeleteCampaign = async () => {
   try {
     await campaignStore.deleteCampaign(campaignToDelete.value);
     showSnackbarMessage('Campaign deleted successfully', 'success');
   } catch (error) {
     console.error(error);
     showSnackbarMessage(error.response?._data.message || 'An error occurred while deleting the campaign', 'error');
   } finally {
     isDeleteConfirmationVisible.value = false;
     campaignToDelete.value = null;
   }
};
 
 const cancelDelete = () => {
   isDeleteConfirmationVisible.value = false;
   campaignToDelete.value = null;
	 };

const headers = [
  { title: 'ID', sortable: false, key: 'id' },
  { title: 'NAME', key: 'fullName' },
  { title: 'EMAIL', key: 'email' },
  { title: 'DATE', key: 'startDate' },
  { title: 'EXPERIENCE', key: 'experience' },
  { title: 'AGE', key: 'age' },
]

</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        Campaigns
      </h4>
      <div class="text-body-1">
        Show all campaigns
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">

      <VBtn @click="$router.push('/pages/campaigns/create')">Create new campaign</VBtn>
    </div>
  </div>
  <VRow>
    <!-- 👉 Apple iPhone 11 Pro -->
    <VCol sm="6" cols="12" v-for="c in campaigns">
      <VCard>
        <div class="d-flex justify-space-between flex-wrap flex-md-nowrap flex-column flex-md-row">
          <div class="ma-auto pa-5">
            <VImg width="137" height="176" style="object-fit: cover;object-position: center top;" :src="iphoneLayout" />
          </div>

          <VDivider :vertical="$vuetify.display.mdAndUp" />

          <div>
            <VCardItem>
              <VCardTitle>{{ c.campaignName }}</VCardTitle>
            </VCardItem>

            <VCardText>
              {{ c.campaignDescription }}
            </VCardText>

            <VCardActions class="justify-space-between mt-10">

              <VBtn :to="{ name: 'pages-campaigns-show', params: { id: c.campaignGuid } }">
                <VIcon icon="tabler-folder-open" />
                <span class="ms-2">Show Campaign</span>
              </VBtn>

              <IconBtn color="secondary" icon="tabler-share" />
              <IconBtn @click="confirmDeleteCampaign(c.campaignGuid)">
                     <VIcon icon="tabler-trash" />
	                   </IconBtn>
            </VCardActions>
          </div>
        </div>
      </VCard>
    </VCol>
  </VRow>
  <VDialog v-model="isDeleteConfirmationVisible" width="400">
	     <VCard>
       <VCardTitle class="headline">{{ $t('Are you sure?') }}</VCardTitle>
       <VCardText>
         {{ $t('Do you really want to delete this campaign? This action cannot be undone.') }}
       </VCardText>
       <VCardActions>
         <VSpacer />
         <VBtn color="secondary" @click="cancelDelete">{{ $t('Cancel') }}</VBtn>
         <VBtn color="error" @click="handleDeleteCampaign">{{ $t('Delete') }}</VBtn>
       </VCardActions>
     </VCard>
   </VDialog>
   <VSnackbar v-model="showSnackbar" :color="snackbarColor" :timeout="5000" location="top right">
     {{ snackbarMessage }}
   </VSnackbar>
</template>
