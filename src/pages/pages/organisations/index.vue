<script setup lang="ts">
import { useMerchantStore } from '@/stores/merchant';
import { useOrganizationStore } from '@/stores/organization';
import { onMounted, ref } from 'vue';

const organizationStore = useOrganizationStore();
const merchantStore = useMerchantStore();

const isNewOrganisationVisible = ref(false);
const isEditOrganisationVisible = ref(false);
const isAddMerchantVisible = ref(false);
const selectedOrganisationGuid = ref('');
const selectedOrganisation = ref({});
const isDeleteOrganisationConfirmationVisible = ref(false);
const isDeleteMerchantConfirmationVisible = ref(false);
const selectedMerchantId = ref('');
const isEditMerchantVisible = ref(false);
const selectedMerchant = ref(null);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const showSnackbar = ref(false);

const moreList = [
  { title: 'Add Merchant', value: 'add' },
  { title: 'Edit Organisation', value: 'edit' },
  { title: 'Delete Organisation', value: 'delete' },
];

const showSnackbarMessage = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

onMounted(async () => {
  try {
    await organizationStore.fetchOrganizations();
  } catch (error) {
    showSnackbarMessage('Failed to load organizations!', 'error');
  }
});

const handleEditMerchant = (merchant, organisationGuid) => {
  selectedMerchant.value = merchant;
  selectedOrganisationGuid.value = organisationGuid;
  isEditMerchantVisible.value = true;
};

const handleDeleteMerchant = (merchantId, organisationGuid) => {
  selectedMerchantId.value = merchantId;
  selectedOrganisationGuid.value = organisationGuid;
  isDeleteMerchantConfirmationVisible.value = true;
};

const handleOptionSelected = (option, organisationGuid, organisation) => {
  selectedOrganisationGuid.value = organisationGuid;
  selectedOrganisation.value = organisation;

  if (option === 'add') {
    selectedMerchant.value = null;
    isAddMerchantVisible.value = true;
  } else if (option === 'edit') {
    isEditOrganisationVisible.value = true;
  } else if (option === 'delete') {
    isDeleteOrganisationConfirmationVisible.value = true;
  }
};

const confirmDeleteMerchant = async () => {
  try {
    await merchantStore.deleteMerchant(selectedMerchantId.value);
    showSnackbarMessage('Merchant deleted successfully!', 'success');
    await organizationStore.fetchOrganizations();
  } catch (error) {
    showSnackbarMessage('Failed to delete the merchant!', 'error');
  } finally {
    showSnackbar.value = true;
    isDeleteMerchantConfirmationVisible.value = false;
  }
};

const confirmDeleteOrganisation = async () => {
  const hasMerchants =
    selectedOrganisation.value.merchant &&
    selectedOrganisation.value.merchant.length > 0;

  if (hasMerchants) {
    showSnackbarMessage(
      'Cannot delete organisation until all its merchants are deleted!',
      'error'
    );
    return;
  }

  try {
    await organizationStore.deleteOrganization(selectedOrganisationGuid.value);
    showSnackbarMessage('Organisation deleted successfully!', 'success');
    await organizationStore.fetchOrganizations();
  } catch (error) {
    showSnackbarMessage('Failed to delete the organisation!', 'error');
  } finally {
    showSnackbar.value = true;
    isDeleteOrganisationConfirmationVisible.value = false;
  }
};

const handleSnackbar = (message: string, color: string) => {
  showSnackbarMessage(message, color);
};
</script>

<template>
  <!-- Add New Organisation Dialog -->
  <CardAddEditOrganisation :model-value="isNewOrganisationVisible"
    @update:model-value="isNewOrganisationVisible = $event" @reset-org-details="resetOrgDetails"
    @showSnackbarMessage="handleSnackbar" />

  <CardAddEditOrganisation :model-value="isEditOrganisationVisible" :organisation="selectedOrganisation"
    :organisationGuid="selectedOrganisationGuid" @update:model-value="isEditOrganisationVisible = $event"
    @showSnackbarMessage="handleSnackbar" />

  <!-- Add New Merchant Dialog -->
  <CardAddEditMerchant :model-value="isAddMerchantVisible" :cardDetails="selectedMerchant"
    :organisationGuid="selectedOrganisationGuid" @update:model-value="isAddMerchantVisible = $event" />
  <CardAddEditMerchant :model-value="isEditMerchantVisible" :cardDetails="selectedMerchant"
    :organisationGuid="selectedOrganisationGuid" @update:model-value="isEditMerchantVisible = $event" />

  <!-- Delete Confirmation Dialog -->
  <VDialog v-model="isDeleteOrganisationConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">Are you sure?</VCardTitle>
      <VCardText>
        Do you really want to delete this organisation? This action cannot be
        undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="isDeleteOrganisationConfirmationVisible = false">
          Cancel
        </VBtn>
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
      <VBtn @click="isNewOrganisationVisible = !isNewOrganisationVisible">
        New Organisation
      </VBtn>
    </div>
  </div>

  <VRow>
    <VCol v-for="(organisation, index) in organizationStore.organizations" :key="index" cols="12" sm="6" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>{{ organisation?.organisationName }}</VCardTitle>
          <VCardSubtitle>{{ organisation?.merchant.length }} Merchants</VCardSubtitle>
          <template #append>
            <div class="mt-n4 me-n2">
              <MoreBtn :menuList="moreList" @option-selected="handleOptionSelected"
                :organisationGuid="organisation?.organisationGuid" :organisation="organisation" />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem v-if="organisation?.merchant.length === 0">
              <VListItemTitle class="font-weight-medium me-4">
                No merchants available
              </VListItemTitle>
            </VListItem>
            <VListItem v-else v-for="merchant in organisation?.merchant" :key="merchant.id">
              <VListItemTitle class="font-weight-medium me-4">
                {{ merchant.merchantName }}
              </VListItemTitle>
              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">{{ merchant.count }}</div>
                  <div :class="`text-${merchant.statsColor}`">
                    {{ merchant.stats }}
                  </div>
                  <IconBtn @click="handleEditMerchant(merchant, organisation.organisationGuid)">
                    <VIcon icon="tabler-pencil" />
                  </IconBtn>
                  <IconBtn @click="handleDeleteMerchant(merchant.merchantGuid, organisation.organisationGuid)">
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

  <VDialog v-model="isDeleteMerchantConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">Are you sure?</VCardTitle>
      <VCardText>
        Do you really want to delete this merchant? This action cannot be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="isDeleteMerchantConfirmationVisible = false">
          Cancel
        </VBtn>
        <VBtn color="error" @click="confirmDeleteMerchant">Delete</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Snackbar for success or error messages -->
  <VSnackbar v-model="showSnackbar" :color="snackbarColor" :timeout="5000" top right>
    {{ snackbarMessage }}
  </VSnackbar>
</template>
