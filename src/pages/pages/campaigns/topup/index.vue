<script setup lang="ts">
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import AmountCard from './AmountCard.vue'
import PaymentCard from './PaymentCard.vue'
import type { CheckoutData } from '@/views/wizard-examples/checkout/types'
import customCart from '@images/svg/cart.svg'
import customPayment from '@images/svg/payment.svg'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const checkoutSteps = [
  {
    title: 'Amount',
    icon: customCart,
  },

  {
    title: 'Payment',
    icon: customPayment,
  },
]

const checkoutData = ref<CheckoutData>({
  cartItems: [

  ],
  promoCode: '',
  orderAmount: 1198,
  deliveryAddress: 'home',
  deliverySpeed: 'free',
  deliveryCharges: 0,
  addresses: [

  ],
})

const currentStep = ref(0)

</script>

<template>
  <div class="checkout-page">

    <Navbar />
    <VContainer>
      <div class="checkout-card">
        <VCard>
          <VCardText>
            <AppStepper v-model:current-step="currentStep" class="checkout-stepper" :items="checkoutSteps"
              :direction="$vuetify.display.mdAndUp ? 'horizontal' : 'vertical'" align="center" />
          </VCardText>
          <VDivider />
          <VCardText>
            <VWindow v-model="currentStep" class="disable-tab-transition" :touch="false">
              <VWindowItem>
                <AmountCard v-model:current-step="currentStep" v-model:checkout-data="checkoutData" />
              </VWindowItem>

              <VWindowItem>
                <PaymentCard v-model:current-step="currentStep" v-model:checkout-data="checkoutData" />
              </VWindowItem>
            </VWindow>
          </VCardText>
        </VCard>
      </div>
    </VContainer>
  </div>
</template>

<style lang="scss">
.checkout-card {
  margin-block: 10.5rem 5.25rem;
}

@media (max-width: 960px) and (min-width: 600px) {
  .checkout-page {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}

@media (max-width: 600px) {
  .checkout-card {
    margin-block-start: 6rem;
  }
}
</style>
