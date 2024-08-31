<script setup lang="ts">
</script>

<template>
      <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          API Keys
        </h4>
        <div class="text-body-1">
          Create your API keys to access the API.
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">

        <VBtn>New API key</VBtn>
      </div>
    </div>
  <VRow>
    <VCol cols="12">
      <APIKeysTable/>
    </VCol>
    
  </VRow>
</template>
