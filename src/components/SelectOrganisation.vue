<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';
import { useOrganizationStore } from '@/stores/organization';
import { ref, watch } from 'vue';

const configStore = useConfigStore();
const organisationStore = useOrganizationStore();

const organisations = ref<string[]>([]);
const organisation = ref<string>('');
const merchants = ref<any[]>([]);
const merchant = ref<string>('');

await organisationStore.fetchOrganizations();

organisations.value = organisationStore.organizations.map((org: any) => org.organisationName);
organisation.value = organisationStore.organizations[0]?.organisationName || '';
configStore.activeOrganisation = organisationStore.organizations[0] || {};

if (organisationStore.organizations[0]?.merchant?.length > 0) {
  merchants.value = organisationStore.organizations[0]?.merchant;
  merchant.value = merchants.value[0]?.merchantName || '';
  configStore.activeMerchant = merchants.value[0] || {};
}

function changeOrganisation() {
  const selectedOrganisation = organisationStore.organizations.find(
    (org: any) => org.organisationName === organisation.value
  );

  if (selectedOrganisation) {
    configStore.activeOrganisation = selectedOrganisation;
    merchants.value = selectedOrganisation.merchant;
    merchant.value = selectedOrganisation.merchant[0]?.merchantName || '';
    configStore.activeMerchant = selectedOrganisation.merchant[0] || {};
  }
}

function merchantChanged() {
  const selectedMerchant = configStore.activeOrganisation.merchant.find(
    (m: any) => m.merchantName === merchant.value
  );

  if (selectedMerchant) {
    configStore.activeMerchant = selectedMerchant;
  }
}

watch(organisation, changeOrganisation);
watch(merchant, merchantChanged);

</script>

<template>
  <AppAutocomplete
v-model="merchant" class="pl-2" density="compact" :items="merchants.map(m => m.merchantName)"
    placeholder="Select Merchant" />

  <AppAutocomplete
v-model="organisation" class="pl-2" density="compact" :items="organisations"
    placeholder="Select Organisation" />
</template>
