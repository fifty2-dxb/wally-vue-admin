<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';

const configStore = useConfigStore()
const userData = useCookie('userData').value

const merchants = ref([])
const merchant = ref('')

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
