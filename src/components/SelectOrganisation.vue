<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';
import { useOrganizationStore } from '@/stores/organization';
import { ref, watch } from 'vue';

const configStore = useConfigStore();
const organisationStore = useOrganizationStore();

const route = useRoute();

const isUpdateRoute = computed(() => {
  const isUpdate = route.path.startsWith('/pages/campaigns/update/');
  return isUpdate;
});

const organisations = ref<string[]>([]);
const organisation = ref<string>('');
const merchants = ref<any[]>([]);
const merchant = ref<string>('');

await organisationStore.fetchOrganizations();

interface Organization {
  organisationName: string;
  merchant?: any[];
}

const orgs = (organisationStore.organizations as unknown as Organization[]);
const sortedOrgs = [...orgs].sort(
  (a: Organization, b: Organization) => a.organisationName.localeCompare(b.organisationName, undefined, { sensitivity: 'base' })
);

organisations.value = sortedOrgs.map((org: any) => org.organisationName);
organisation.value = sortedOrgs[0]?.organisationName || '';
configStore.activeOrganisation = (sortedOrgs[0] as any) || {};

if ((sortedOrgs[0]?.merchant?.length || 0) > 0) {
  const sortedMerchants = [...(sortedOrgs[0]?.merchant as any[] || [])].sort(
    (a: any, b: any) => a.merchantName.localeCompare(b.merchantName, undefined, { sensitivity: 'base' })
  );
  merchants.value = sortedMerchants;
  merchant.value = sortedMerchants[0]?.merchantName || '';
  configStore.activeMerchant = sortedMerchants[0] || {};
}

function changeOrganisation() {
  const selectedOrganisation = orgs.find(
    (org: Organization) => org.organisationName === organisation.value
  );

  if (selectedOrganisation) {
    configStore.activeOrganisation = selectedOrganisation as any;
    const sortedMerchants = [...(selectedOrganisation.merchant || [])].sort(
      (a: any, b: any) => a.merchantName.localeCompare(b.merchantName, undefined, { sensitivity: 'base' })
    );
    merchants.value = sortedMerchants;
    merchant.value = sortedMerchants[0]?.merchantName || '';
    configStore.activeMerchant = sortedMerchants[0] || {};
  }
}

function merchantChanged() {
  const merchantsList = ((configStore.activeOrganisation as any)?.merchant as any[]) || [];
  const selectedMerchant = merchantsList.find(
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
    placeholder="Select Merchant" :disabled="isUpdateRoute" />

  <AppAutocomplete
v-model="organisation" class="pl-2" density="compact" :items="organisations"
    placeholder="Select Organisation" :disabled="isUpdateRoute" />
</template>
