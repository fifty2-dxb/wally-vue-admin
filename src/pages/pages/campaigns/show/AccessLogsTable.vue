<script setup lang="ts">

defineProps<{
  accessLogs: Array<{ name: string; membershipType: string; date: string; }>
}>();

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Time Stamp', key: 'date' },
  { title: 'Membership Type', key: 'membershipType' },
];

// const resolveStatusVariant = (status: number) => {
//   if (status === 1)
//     return { color: 'primary', text: 'Not Registered' }
//   else if (status === 2)
//     return { color: 'success', text: 'Active' }
//   else if (status === 3)
//     return { color: 'error', text: 'In-Active' }
//   else if (status === 4)
//     return { color: 'warning', text: 'Resigned' }
//   else
//     return { color: 'info', text: 'Applied' }
// }
</script>

<template>
  <VDataTable
    :headers="headers"
    :items="accessLogs"
    :items-per-page="5"
  >
    <!-- full name -->
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <VAvatar
          size="32"
          :color="item.avatar ? '' : 'primary'"
          :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
          :variant="!item.avatar ? 'tonal' : undefined"
        >
          <!-- <VImg
            v-if="item.avatar"
            :src="item.avatar"
          /> -->
          <span >{{ avatarText(item.name) }}</span>
        </VAvatar>
        <div class="d-flex flex-column ms-3">
          <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.name }}</span>
        </div>
      </div>
    </template>

    <!-- <template #item.status="{ item }">
      <VChip
        :color="resolveStatusVariant(item.status).color"
        class="font-weight-medium"
        size="small"
      >
        {{ resolveStatusVariant(item.status).text }}
      </VChip>
    </template> -->
  </VDataTable>
</template>
