<script setup lang="ts">
import { ref } from 'vue';

const isNewOrganisationVisible = ref(false);
const isEditOrganisationVisible = ref(false);
const isAddMerchantVisible = ref(false);
const selectedOrganisationGuid = ref('');
const selectedOrganisation = ref({})
const isDeleteConfirmationVisible = ref(false);

const userData = useCookie('userData').value;
const organisations = userData ? userData.organisations : [];

const snackbarMessage = ref('');
const snackbarColor = ref('');
const showSnackbar = ref(false);

const moreList = [
  { title: 'Add Merchant', value: 'add' },
  { title: 'Edit Organisation', value: 'edit' },
  { title: 'Delete Organisation', value: 'delete' },
];

// Handle MoreBtn option selection
const handleOptionSelected = (option: string, organisationGuid: string, organisation: {}) => {

  selectedOrganisationGuid.value = organisationGuid;
  selectedOrganisation.value = organisation

  if (option === 'add') {
    isAddMerchantVisible.value = true;
  } else if (option === 'edit') {
    isEditOrganisationVisible.value = true
  } else if (option === 'delete') {
    isDeleteConfirmationVisible.value = true;
  }
};

const confirmDeleteOrganisation = async () => {
  try {
    const response = await fetch(`/organisations/${selectedOrganisationGuid.value}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const index = organisations.findIndex(org => org.organisationGuid === selectedOrganisationGuid.value);
      if (index !== -1) organisations.splice(index, 1);

      snackbarMessage.value = 'Organisation deleted successfully!';
      snackbarColor.value = 'success';
    } else {
      snackbarMessage.value = 'Failed to delete the organisation!';
      snackbarColor.value = 'error';
    }
  } catch (error) {
    snackbarMessage.value = 'An error occurred while deleting the organisation!';
    snackbarColor.value = 'error';
  } finally {
    showSnackbar.value = true;
    isDeleteConfirmationVisible.value = false;
  }
};

</script>

<template>
  <!-- 👉 Add New Organisation Dialog -->
  <CardAddEditOrganisation v-model:isDialogVisible="isNewOrganisationVisible" />
  <CardAddEditOrganisation v-model:isDialogVisible="isEditOrganisationVisible" :organisation="selectedOrganisation"
    :organisationGuid="selectedOrganisationGuid" />

  <!-- 👉 Add New Merchant Dialog -->
  <CardAddEditMerchant v-model:isDialogVisible="isAddMerchantVisible" :organisationGuid="selectedOrganisationGuid" />

  <!-- Delete Confirmation Dialog -->
  <VDialog v-model="isDeleteConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">Are you sure?</VCardTitle>
      <VCardText>Do you really want to delete this organisation? This action cannot be undone.</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="isDeleteConfirmationVisible = false">Cancel</VBtn>
        <VBtn color="error" @click="confirmDeleteOrganisation">Delete</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Organisations List -->
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">Organisations</h4>
      <div class="text-body-1">Create or edit your organisations</div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="isNewOrganisationVisible = !isNewOrganisationVisible">New Organisation</VBtn>
    </div>
  </div>

  <VRow>
    <VCol v-for="(organisation, index) in organisations" :key="organisation.organisationGuid" cols="12" sm="6" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>{{ organisation.organisationName }}</VCardTitle>
          <VCardSubtitle>{{ organisation.merchant.length }} Merchants</VCardSubtitle>
          <template #append>
            <div class="mt-n4 me-n2">
              <MoreBtn :menuList="moreList" @option-selected="handleOptionSelected"
                :organisationGuid="organisation.organisationGuid" :organisation="organisation" />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem v-if="organisation.merchant.length === 0">
              <VListItemTitle class="font-weight-medium me-4">No merchants available</VListItemTitle>
            </VListItem>
            <VListItem v-else v-for="merchant in organisation.merchant" :key="merchant.id">
              <VListItemTitle class="font-weight-medium me-4">{{ merchant.merchantName }}</VListItemTitle>
              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">{{ merchant.count }}</div>
                  <div :class="`text-${merchant.statsColor}`">
                    {{ merchant.stats }}
                  </div>
                  <IconBtn>
                    <VIcon icon="tabler-trash" />
                  </IconBtn>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Snackbar for success or error messages -->
  <VSnackbar v-model="showSnackbar" :color="snackbarColor" top right>
    {{ snackbarMessage }}
  </VSnackbar>
</template>
