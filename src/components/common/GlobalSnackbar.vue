<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar';

const { snackbar, hideSnackbar } = useSnackbar();
</script>

<template>
  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top"
    @update:model-value="hideSnackbar"
  >
    {{ snackbar.text }}
    
    <template #actions>
      <VBtn
        color="white"
        variant="text"
        @click="hideSnackbar"
      >
        {{ $t('Close') }}
      </VBtn>
    </template>
  </VSnackbar>
</template> 