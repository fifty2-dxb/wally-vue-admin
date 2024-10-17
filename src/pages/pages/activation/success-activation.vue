<script setup lang="ts">
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant';
import successfulylActivated from '@images/illustrations/congo-illustration.png';
import miscMaskDark from '@images/pages/misc-mask-dark.png';
import miscMaskLight from '@images/pages/misc-mask-light.png';

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)
</script>

<template>
  <div class="misc-wrapper">
    <div class="text-center mt-10">
      <h4 class="text-h4 font-weight-medium mb-4">
        {{ $t("Successfully Activated") }}
      </h4>
      <p class="text-body-1 mb-6">
        {{ $t("You successfully activated your pass") }}
      </p>
    </div>

    <div class="d-flex justify-center mb-8 mt-6">
      <VBtn to="/" class="mb-11" href="https://wally.ae">
        Back to Home
      </VBtn>
    </div>

    <div class="misc-avatar w-100 text-center">
      <VImg :src="successfulylActivated" alt="activated" :max-height="$vuetify.display.smAndDown ? 300 : 340"
        class="mx-auto" />
    </div>

    <img class="misc-footer-img d-none d-md-block" :src="authThemeMask" alt="misc-footer-img" height="320">
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
