<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';

const configStore = useConfigStore()
const userData = useCookie('userData').value

const organisations = ref([])
const organisation = ref('')

userData.organisations.forEach((org: any) => {
  organisations.value.push(org.organisationName)
})

console.log(configStore.activeOrganisation)

if (configStore.activeOrganisation) {
  organisation.value = configStore.activeOrganisation.organisationName
} else { 
  organisation.value = userData.organisations[0].organisationName
  configStore.activeOrganisation = userData.organisations[0]

  if(userData.organisations[0].merchant[0].length > 0) {
    configStore.activeMerchant = userData.organisations[0].merchants[0]
  }
}

function changeOrganisation() {
  const selectedOrganisation = userData.organisations.find((org: any) => org.organisationName === organisation.value)
  configStore.activeOrganisation = selectedOrganisation
  configStore.activeMerchant = selectedOrganisation.merchants[0]

  console.log(configStore.activeOrganisation)
}

</script>

<template> 
  <AppSelect
      v-model="organisation"
      class="pl-2"
      density="compact"
    :items="organisations"
    placeholder="Select Organisation"
    @change="changeOrganisation()"
  />
</template>
