<script setup lang="ts">

const route = useRoute('pages-campaigns-show')
console.log(route.params.id);

const widgetData = ref([
  { title: 'Customers', value: '250', icon: 'tabler-smart-home', desc: '5 new', change: 5.7 },
  { title: 'Push Notifications', value: '85', icon: 'tabler-brand-apple', desc: '21k orders', change: 12.4 },
  { title: 'Android Notifications', value: '5', icon: 'tabler-brand-android', desc: '6k orders' },
  { title: 'Total Stamps', value: '375', icon: 'tabler-rubber-stamp', desc: '150 orders', change: -3.5 },
])
</script>

<template>
      <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Settings
        </h4>
        <div class="text-body-1">
          Configure your campaign settings
        </div>
      </div>
      </div> 
      <VCard class="mb-6">
      <VCardText class="px-3">
        <VRow>
          <template
            v-for="(data, id) in widgetData"
            :key="id"
          >
            <VCol
              cols="12"
              sm="6"
              md="3"
              class="px-6"
            >
              <div
                class="d-flex justify-space-between"
                :class="$vuetify.display.xs
                  ? id !== widgetData.length - 1 ? 'border-b pb-4' : ''
                  : $vuetify.display.sm
                    ? id < (widgetData.length / 2) ? 'border-b pb-4' : ''
                    : ''"
              >
                <div class="d-flex flex-column gap-y-1">
                  <div class="text-body-1 text-capitalize">
                    {{ data.title }}
                  </div>

                  <h4 class="text-h4">
                    {{ data.value }}
                  </h4>

                  <div class="d-flex align-center gap-x-2">
                    <div class="text-no-wrap">
                      {{ data.desc }}
                    </div>

                    <VChip
                      v-if="data.change"
                      label
                      :color="data.change > 0 ? 'success' : 'error'"
                      size="small"
                    >
                      {{ prefixWithPlus(data.change) }}%
                    </VChip>
                  </div>
                </div>

                <VAvatar
                  variant="tonal"
                  rounded
                  size="44"
                >
                  <VIcon
                    :icon="data.icon"
                    size="28"
                    class="text-high-emphasis"
                  />
                </VAvatar>
              </div>
            </VCol>
            <VDivider
              v-if="$vuetify.display.mdAndUp ? id !== widgetData.length - 1
                : $vuetify.display.smAndUp ? id % 2 === 0
                  : false"
              vertical
              inset
              length="92"
            />
          </template>
        </VRow>
      </VCardText>
    </VCard>
</template>
