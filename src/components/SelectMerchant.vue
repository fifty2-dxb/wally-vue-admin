<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';

const configStore = useConfigStore()
const userData = useCookie('userData').value

const merchants = ref([]);
const merchant = ref('');

if (configStore.activeMerchant !== null) { 
  merchants.value = configStore.activeOrganisation.merchant;
  merchant.value = configStore.activeMerchant.merchantName;
} else { 
  console.log('no active merchants');
}

function changeActiveMerchant() { 
  console.log('change active merchant')
}

watch(configStore.activeOrganisation, ()=> { 
  changeActiveMerchant()
}, { deep: true, immediate: true})

</script>

<template> 
  <AppSelect
      v-model="merchant"
      class="pl-2"
      density="compact"
    :items="merchants"
    placeholder="Select Merchant"
  />
</template>
