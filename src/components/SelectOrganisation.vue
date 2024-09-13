<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';

const configStore = useConfigStore()
const userData = useCookie('userData').value

const organisations = ref([])
const organisation = ref('')

var merchants = ref([]);
var merchant = ref('');

userData.organisations.forEach((org: any) => {
  organisations.value.push(org.organisationName)
})

organisation.value = userData.organisations[0]?.organisationName
configStore.activeOrganisation = userData.organisations[0]

if (userData.organisations[0]?.merchant.length > 0) {
  merchants.value = userData.organisations[0]?.merchant;
  merchant.value = userData.organisations[0]?.merchant[0].merchantName;
  configStore.activeMerchant = userData.organisations[0]?.merchant[0]
}

function changeOrganisation() {
  const selectedOrganisation = userData.organisations.find((org: any) => org.organisationName === organisation.value);
  configStore.activeOrganisation = selectedOrganisation;
  configStore.activeMerchant = selectedOrganisation.merchant[0];
  merchant.value = configStore.activeMerchant?.merchantName;
  merchants = configStore.activeOrganisation.merchant;
}

function merchantChanged() {
  const selectedMerchant = configStore.activeOrganisation.merchant.find((m: any) => m.merchantName === merchant.value);
  configStore.activeMerchant = selectedMerchant;
}

watch(organisation, () => {
  changeOrganisation();
});

watch(merchant, () => {
  merchantChanged();
})

</script>

<template>
  <AppSelect v-model="merchant" class="pl-2" density="compact" :items="merchants.map(m => m.merchantName)"
    placeholder="Select Merchant" />

  <AppSelect v-model="organisation" class="pl-2" density="compact" :items="organisations"
    placeholder="Select Organisation" />
</template>
