<script setup lang="ts">
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth card -->
      <VCard
        class="auth-card"
        max-width="660"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-2'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <RouterLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </RouterLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
  <div class="text-center">
    <h4 class="text-h4 mb-4">
      Payment Failed 😔
    </h4>
    <p>
      Unfortunately, your top-up payment was unsuccessful.  Please check the following:
    </p>
    <ul class="mb-4">
      <li><strong>Card Details:</strong> Ensure the card number, expiry date, and CVV are correct.</li>
      <li><strong>Sufficient Funds:</strong> Verify that you have enough balance on your card.</li>
      <li><strong>Card Restrictions:</strong> Check if your card is valid for online transactions and has not been blocked.</li>
    </ul>
    <p>
      If you've checked all of the above and are still experiencing issues, please contact your bank or card provider for assistance.
    </p>
    <p class="mb-0">
       For further support, you can also contact us directly.
    </p>
  </div>

  <VBtn
    block
    to="/pages/campaigns" 
    class="my-5 mt-3"
  >
    Back to campaign page
  </VBtn>
</VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@core/scss/template/pages/page-auth";

.auth-v1-top-shape {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -38%);
}

.auth-v1-bottom-shape {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%); 
}

.auth-card {
  position: relative;
  z-index: 1;
}
</style>
 