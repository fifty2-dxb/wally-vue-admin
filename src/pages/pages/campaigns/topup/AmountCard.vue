<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CheckoutData } from './types'
import { loadStripe } from '@stripe/stripe-js'

interface Props {
  currentStep?: number
  checkoutData: CheckoutData
}

interface Emit {
  (e: 'update:currentStep', value: number): void
  (e: 'update:checkout-data', value: CheckoutData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const checkoutCartDataLocal = ref(props.checkoutData)

const amount = ref('')
const selectedCurrency = ref('EUR')

const currencies = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'CHF', symbol: 'CHF' },
  { code: 'CNY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
]

const totalCost = computed(() => {
  return amount.value ? parseFloat(amount.value) : 0
})

watch([amount, selectedCurrency], () => {
  emit('update:checkout-data', {
    ...checkoutCartDataLocal.value,
    orderAmount: totalCost.value,
    currency: selectedCurrency.value
  })
})

const stripePromise = loadStripe(import.meta.env.VITE_APP_PUBLISHABLE_KEY)

const nextStep = async () => {
  emit('update:checkout-data', {
    ...checkoutCartDataLocal.value,
    orderAmount: totalCost.value,
    currency: selectedCurrency.value
  })

  const stripe = await stripePromise
  if (!stripe) {
    console.error('Stripe failed to initialize.')
    return
  }

  try {
    const response = await $wallyApi('/campaigns/create-checkout-session', {
      method: 'POST',
      body: {
        orderAmount: totalCost.value,
        currency: selectedCurrency.value
      }
    })

    console.log('API Response:', response)

    if (!response || !response.id) {
      console.error('No session ID returned from backend:', response)
      return
    }

    const { error } = await stripe.redirectToCheckout({ sessionId: response.id })
    if (error) {
      console.error('Stripe redirect error:', error)
    }
  } catch (err) {
    console.error('Error creating checkout session:', err)
  }
}

</script>

<template>
  <VRow v-if="checkoutCartDataLocal">
    <VCol cols="12" lg="8">
      <div>
        <v-card class="mx-auto" max-width="100%" elevation="2">
          <v-card-title class="text-h6 pt-4 pb-2">Top-up balance</v-card-title>
          <v-card-text>
            <p class="text-subtitle-1 mb-2 mt-8">Amount</p>
            <v-row no-gutters>
              <v-col cols="4">
                <v-select
                  v-model="selectedCurrency"
                  :items="currencies"
                  item-title="code"
                  item-value="code"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="mr-2">
                  <template v-slot:selection="{ item }">
                    {{ item.raw.code }}
                  </template>
                </v-select>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="amount"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  placeholder="0.00">
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </VCol>

    <VCol cols="12" lg="4">
      <VCard flat variant="outlined">
        <VCardText>
          <div class="bg-var-theme-background rounded pa-6">
            <h6 class="text-h6 mb-2">Campaign Name :</h6>
            <p class="mb-2">Wally - Balance Card template.</p>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <div class="text-high-emphasis">
            <div class="d-flex justify-space-between mb-2">
              <span>Topup Amount</span>
              <span class="text-medium-emphasis">
                {{ currencies.find(c => c.code === selectedCurrency)?.symbol }}{{ totalCost }}
              </span>
            </div>
          </div>
        </VCardText>
      </VCard>
      <VBtn block class="mt-4" @click="nextStep">
        Proceed to payment
      </VBtn>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.checkout-item-remove-btn {
  position: absolute;
  inset-block-start: 14px;
  inset-inline-end: 14px;
}
</style>
