<script setup lang="ts">
import NFCReadersTable from '@/views/demos/forms/tables/simple-table/NFCReadersTable.vue';

</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        NFC Readers
      </h4>
      <div class="text-body-1">
        View and manage your individual readers
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">

      <VBtn>Add New Reader</VBtn>
    </div>
  </div>
  <VRow>
    <VCol cols="12">
      <NFCReadersTable />
    </VCol>

  </VRow>
</template>
