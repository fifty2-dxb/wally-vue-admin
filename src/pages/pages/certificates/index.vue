<script setup lang="ts">

</script>

<template>
      <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Apple Wallet Certificates
        </h4>
        <div class="text-body-1">
          Create your Apple Wallet certificates
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">

        <VBtn>New Apple Wallet Certificate</VBtn>
      </div>
    </div>
  <VRow>
    <VCol cols="12">
      <AppleCertificatesTable/>
    </VCol>
    
  </VRow>

  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6 mt-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Android Wallet Certificates
        </h4>
        <div class="text-body-1">
          Create your Android Wallet certificates
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">

        <VBtn>New Android Wallet Certificate</VBtn>
      </div>
    </div>
  <VRow>
    <VCol cols="12">
      <AppleCertificatesTable/>
    </VCol>
    
  </VRow>
</template>
