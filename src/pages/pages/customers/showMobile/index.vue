<script setup lang="ts">
import { ref } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { QrcodeStream } from 'vue-qrcode-reader';

interface DecodedCode {
  rawValue: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CustomerDetails {
  name?: string;
  surname?: string;
  email?: string;
  phonenumber?: string;
}

interface SerialNumberData {
  stampImageUrl?: string;
  totalStamps: number;
  redeemable: boolean;
  customers_details?: CustomerDetails;
}

const cameraActive = ref(false);
const loading = ref(true);
const customerStore = useCustomerStore();
const selectedConstraints = ref({ facingMode: 'environment' });
const result = ref('');
const cameraError = ref<string | null>(null);
const customerLoaded = ref(false);
const currentStamps = ref(1);

const getSerialNumberData = () => {
  return customerStore.serialNumberData as unknown as SerialNumberData;
};

const fetchCustomerDetails = async (serialNumber: string) => {
  try {
    await customerStore.fetchCustomerBySerialNumber(serialNumber);
    customerLoaded.value = true;
  } catch (error) {
    console.error('Error fetching customer:', error);
  }
};

const receiveNfcData = async (data: string) => {
  if (data) {
    try {
      await customerStore.fetchCustomerBySerialNumber(data);
      customerLoaded.value = true;
    } catch (error) {
      customerLoaded.value = false;
    }
  }
};

onMounted(() => {
  (window as any).receiveNfcData = receiveNfcData;
});

const onDecode = (decodedCodes: DecodedCode[]) => {
  const scannedCode = decodedCodes.map(code => code.rawValue).join(', ');
  result.value = scannedCode;
  customerStore.customer.serialNumber = scannedCode;
  fetchCustomerDetails(scannedCode);
  cameraActive.value = false;
};

const toggleCamera = () => {
  cameraActive.value = !cameraActive.value;
};

const onCameraReady = async () => {
  loading.value = false;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  cameraError.value = videoDevices.length ? null : "No cameras found";
};

const paintBoundingBox = (detectedCodes: DecodedCode[], ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  detectedCodes.forEach(code => {
    const { x, y, width, height } = code.boundingBox;
    ctx.strokeRect(x, y, width, height);
  });
};

const updateStampCount = (increment: number) => {
  const newCount = currentStamps.value + increment;
  if (newCount <= 10 && newCount >= 1) {
    currentStamps.value = newCount;
  }
};

const addStamps = () => {
  customerStore.stamp(currentStamps.value, customerStore.customer.eventGuid || "");
  const serialNumberData = getSerialNumberData();
  if (serialNumberData) {
    serialNumberData.totalStamps += currentStamps.value;
  }
  currentStamps.value = 1;
};

watch(() => customerStore.customer, (newVal) => {
  customerLoaded.value = !!newVal;
});

onBeforeRouteLeave((to, from, next) => {
  customerStore.resetCustomerData();
  next();
});
</script>

<template>
  <VContainer class="fill-height pa-4">
    <VCard class="mx-auto" max-width="500" elevation="2">
      <!-- Header with Actions -->
      <VCardItem class="d-flex justify-space-between align-center">
        <VCardTitle class="text-h5">
          {{ $t('Customer Card') }}
        </VCardTitle>
        <div class="d-flex gap-2">
          <VBtn
            icon
            variant="text"
            color="primary"
            @click="toggleCamera"
          >
            <VIcon>tabler-camera</VIcon>
          </VBtn>
          <VBtn
            icon
            variant="text"
            color="primary"
            @click="receiveNfcData"
          >
            <VIcon>tabler-nfc</VIcon>
          </VBtn>
        </div>
      </VCardItem>

      <!-- QR Scanner -->
      <VCardText v-if="cameraActive">
        <qrcode-stream
          :constraints="selectedConstraints"
          :track="paintBoundingBox"
          @detect="onDecode"
          @camera-on="onCameraReady"
          @error="error => { cameraError = error; cameraActive = false; }"
        >
          <template #loading>
            <div class="d-flex justify-center align-center pa-4">
              <VProgressCircular indeterminate />
            </div>
          </template>
        </qrcode-stream>
      </VCardText>

      <!-- Card Image -->
      <VCardText v-if="getSerialNumberData()?.stampImageUrl">
        <div class="d-flex justify-center mb-4">
          <VImg
            :src="getSerialNumberData().stampImageUrl"
            height="180"
            width="300"
            class="rounded-lg"
          >
            <template #placeholder>
              <VRow class="fill-height ma-0" align="center" justify="center">
                <VProgressCircular indeterminate />
              </VRow>
            </template>
          </VImg>
        </div>

        <!-- Stamps Counter -->
        <div class="d-flex justify-center align-center mb-4">
          <VBtn
            icon
            variant="text"
            :disabled="currentStamps <= 1"
            @click="updateStampCount(-1)"
          >
            <VIcon>tabler-minus</VIcon>
          </VBtn>
          <span class="text-h4 mx-4">{{ currentStamps }}</span>
          <VBtn
            icon
            variant="text"
            :disabled="currentStamps >= 10"
            @click="updateStampCount(1)"
          >
            <VIcon>tabler-plus</VIcon>
          </VBtn>
        </div>

        <!-- Action Buttons -->
        <VRow v-if="customerLoaded" class="ma-0">
          <VCol cols="6" class="pa-1">
            <VBtn
              block
              color="success"
              :loading="customerStore.stamping"
              :disabled="getSerialNumberData()?.redeemable"
              @click="addStamps"
              class="text-body-1"
            >
              <VIcon start>tabler-rubber-stamp</VIcon>
              {{ $t("Stamp") }}
            </VBtn>
          </VCol>
          <VCol cols="6" class="pa-1">
            <VBtn
              block
              color="info"
              :loading="customerStore.redeeming"
              :disabled="!getSerialNumberData()?.redeemable"
              @click="customerStore.redeem(1, customerStore.customer.eventGuid || '')"
              class="text-body-1"
            >
              <VIcon start>tabler-gift</VIcon>
              {{ $t("Redeem") }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <!-- Customer Information -->
      <VDivider />
      <VCardText>
        <VList class="pa-0">
          <VListItem>
            <template #prepend>
              <VIcon color="primary" class="me-2">tabler-user</VIcon>
            </template>
            <VListItemTitle>{{ $t('Name') }}</VListItemTitle>
            <VListItemSubtitle>{{ getSerialNumberData()?.customers_details?.name }}</VListItemSubtitle>
          </VListItem>

          <VDivider />

          <VListItem>
            <template #prepend>
              <VIcon color="primary" class="me-2">tabler-user-circle</VIcon>
            </template>
            <VListItemTitle>{{ $t('Surname') }}</VListItemTitle>
            <VListItemSubtitle>{{ getSerialNumberData()?.customers_details?.surname }}</VListItemSubtitle>
          </VListItem>

          <VDivider />

          <VListItem>
            <template #prepend>
              <VIcon color="primary" class="me-2">tabler-mail</VIcon>
            </template>
            <VListItemTitle>{{ $t('Email') }}</VListItemTitle>
            <VListItemSubtitle>{{ getSerialNumberData()?.customers_details?.email }}</VListItemSubtitle>
          </VListItem>

          <VDivider />

          <VListItem>
            <template #prepend>
              <VIcon color="primary" class="me-2">tabler-phone</VIcon>
            </template>
            <VListItemTitle>{{ $t('Phone Number') }}</VListItemTitle>
            <VListItemSubtitle>{{ getSerialNumberData()?.customers_details?.phonenumber }}</VListItemSubtitle>
          </VListItem>
        </VList>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<style lang="scss" scoped>
.v-card {
  border-radius: 12px;
}

.v-list-item {
  min-height: 48px;
}

.v-list-item-title {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}

.v-list-item-subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}
</style>
