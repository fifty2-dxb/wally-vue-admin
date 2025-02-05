<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CheckoutData } from './types'
import { loadStripe } from '@stripe/stripe-js'

const prop = defineProps<{
  currentStep?: number
  checkoutData: CheckoutData
}>()

const emit = defineEmits<{
  (e: 'update:currentStep', value: number): void
  (e: 'update:checkout-data', value: CheckoutData): void
}>()

const checkoutPaymentDataLocal = ref(prop.checkoutData)

const cardFormData = ref({
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvv: '',
  isCardSave: true,
})

const stripePromise = loadStripe(import.meta.env.VITE_APP_PUBLISHABLE_KEY)
const stripe = ref<any>(null)
const errorMessage = ref<string>('')

onMounted(async () => {
  stripe.value = await stripePromise
})
const cardType = computed(() => {
  const number = cardFormData.value.cardNumber.replace(/\s/g, '')
  if (/^4/.test(number)) return 'Visa'
  if (/^5[1-5]/.test(number)) return 'MasterCard'
  if (/^3[47]/.test(number)) return 'American Express'
  if (/^6(?:011|5)/.test(number)) return 'Discover'
  return ''
})

watch(
  () => cardFormData.value.cardNumber,
  (newVal, oldVal) => {
    let digits = newVal.replace(/\D/g, '')
    if (digits.length > 16) {
      digits = digits.slice(0, 16)
    }
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || ''
    if (formatted !== newVal) {
      cardFormData.value.cardNumber = formatted
    }
  }
)

watch(
  () => cardFormData.value.cardExpiry,
  (newVal) => {
    let digits = newVal.replace(/\D/g, '')
    if (digits.length > 4) {
      digits = digits.slice(0, 4)
    }
    if (digits.length >= 3) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2)
    }
    if (digits !== newVal) {
      cardFormData.value.cardExpiry = digits
    }
    if (digits.length >= 2) {
      const month = parseInt(digits.slice(0, 2))
      if (month < 1 || month > 12) {
        errorMessage.value = 'Invalid month in expiry. Must be between 01 and 12.'
      } else {
        errorMessage.value = ''
      }
    }
  }
)

watch(
  () => cardFormData.value.cardCvv,
  (newVal) => {
    const maxLen = (cardType.value === 'American Express') ? 4 : 3
    let digits = newVal.replace(/\D/g, '')
    if (digits.length > maxLen) {
      digits = digits.slice(0, maxLen)
    }
    if (digits !== newVal) {
      cardFormData.value.cardCvv = digits
    }
  }
)


const processPayment = async () => {
  if (!stripe.value) {
    errorMessage.value = 'Stripe is not properly initialized.'
    return false
  }
  
  const expiryParts = cardFormData.value.cardExpiry.split('/')
  if(expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
    errorMessage.value = 'Invalid expiry format. Use MM/YY'
    return false
  }
  const exp_month = parseInt(expiryParts[0])
  let exp_year = parseInt(expiryParts[1])
  if(exp_year < 100) {
    exp_year += 2000
  }
  
  const cardData = {
    number: cardFormData.value.cardNumber.replace(/\s/g, ''),
    exp_month,
    exp_year,
    cvc: cardFormData.value.cardCvv,
    name: cardFormData.value.cardName
  }
  
  const { token, error } = await stripe.value.createToken('card', cardData)
  if (error) {
    errorMessage.value = error.message || 'An error occurred while creating the token.'
    console.error('Stripe token error:', error)
    return false
  }
  
  try {
    const response = await fetch('/api/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.id,
        orderAmount: checkoutPaymentDataLocal.value.orderAmount,
        currency: checkoutPaymentDataLocal.value.currency
      })
    })
    const result = await response.json()
    if (result.success) {
      return true
    } else {
      errorMessage.value = 'Payment failed on the server.'
      return false
    }
  } catch (err) {
    console.error('Payment processing error:', err)
    errorMessage.value = 'Payment processing error.'
    return false
  }
}

const updateCartData = () => {
  emit('update:checkout-data', checkoutPaymentDataLocal.value)
}

const nextStep = async () => {
  updateCartData()
  const paymentSuccess = await processPayment()
  if (paymentSuccess) {
    emit('update:currentStep', prop.currentStep ? prop.currentStep + 1 : 1)
  } else {
    alert('Payment failed. Please check the error and try again.')
  }
}

const totalCost = computed(() => checkoutPaymentDataLocal.value.orderAmount || 0)
const selectedCurrency = computed(() => checkoutPaymentDataLocal.value.currency || 'EUR')
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

watch(() => prop.currentStep, updateCartData)
</script>

<template>
  <VRow>
    <VCol cols="12" md="8">
      <div>
        <v-card class="mx-auto" max-width="100%" elevation="2">
          <v-card-title class="text-h6 pt-4 pb-2">Card Details</v-card-title>
          <v-card-text>
            <VForm class="mt-3">
              <VRow class="ma-0 pa-n2">
                <VCol cols="12">
                  <AppTextField 
                    id="card-number"
                    v-model="cardFormData.cardNumber" 
                    type="text" 
                    label="Card Number"
                    placeholder="1356 3215 6548 7898">
                    <template #append-inner>
                      <span v-if="cardType" style="font-weight: bold; margin-right: 0.5rem;">{{ cardType }}</span>
                    </template>
                  </AppTextField>
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField 
                    id="card-name"
                    v-model="cardFormData.cardName" 
                    label="Name" 
                    placeholder="John Doe" />
                </VCol>
                <VCol cols="6" md="4">
                  <AppTextField 
                    id="card-expiry"
                    v-model="cardFormData.cardExpiry" 
                    label="Expiry" 
                    placeholder="MM/YY" />
                </VCol>
                <VCol cols="6" md="4">
                  <AppTextField 
                    id="card-cvv"
                    v-model="cardFormData.cardCvv" 
                    label="CVV" 
                    placeholder="123" 
                    type="number">
                    <template #append-inner>
                      <VTooltip text="Card Verification Value" location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <VIcon v-bind="tooltipProps" size="20" icon="tabler-help" />
                        </template>
                      </VTooltip>
                    </template>
                  </AppTextField>
                </VCol>
                <VCol cols="12" class="pt-1">
                  <div class="mt-4">
                    <VBtn class="me-4" @click="nextStep">
                      Save Changes
                    </VBtn>
                    <VBtn variant="tonal" color="secondary">
                      Reset
                    </VBtn>
                  </div>
                </VCol>
              </VRow>
            </VForm>
            <div v-if="errorMessage" style="color:red; margin-top: 1rem;">{{ errorMessage }}</div>
          </v-card-text>
        </v-card>
      </div>
    </VCol>
    <VCol cols="12" md="4">
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
    </VCol>
  </VRow>
</template>
