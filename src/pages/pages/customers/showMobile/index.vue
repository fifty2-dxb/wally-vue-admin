<script setup lang="ts">
import { ref } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { QrcodeStream } from 'vue-qrcode-reader';

const cameraActive = ref(false);
const loading = ref(true)
const customerStore = useCustomerStore();
const selectedConstraints = ref({ facingMode: 'environment' });
const result = ref('');
const cameraError = ref(null);
const customerLoaded = ref(false);

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

const onDecode = (decodedCodes) => {
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

const paintBoundingBox = (detectedCodes, ctx) => {
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  detectedCodes.forEach(code => {
    const { x, y, width, height } = code.boundingBox;
    ctx.strokeRect(x, y, width, height);
  });
};
const currentStamps = ref(1);

const updateStampCount = (increment) => {
  const newCount = currentStamps.value + increment;
  if (newCount <= 10 && newCount >= 1) {
    currentStamps.value = newCount;
  }
};

const addStamps = () => {
  customerStore.stamp(currentStamps.value);
  customerStore.serialNumberData.totalStamps += currentStamps.value;
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
  <v-container class="d-flex justify-center align-center fill-height p-2">
    <v-card class="card-container">
      <v-icon size="24" class="p-2" @click="toggleCamera">tabler-camera</v-icon>
      <v-icon size="24" class="p-2" @click="receiveNfcData">tabler-nfc</v-icon>
      <qrcode-stream v-if="cameraActive" :constraints="selectedConstraints" :track="paintBoundingBox" @detect="onDecode"
        @camera-on="onCameraReady" @error="error => { cameraError = error; cameraActive = false; }">
        <template #loading>
          <div class="loading-indicator" v-if="loading">{{ $t("Loading...") }}</div>
        </template>
      </qrcode-stream>

      <v-img :src="customerStore.serialNumberData?.stampImageUrl" height="120px"
        class="d-flex align-center justify-center mb-4">
        <div class="stamps-overlay">
          <v-icon v-for="n in 10" :key="n" class="stamp-icon">mdi-star</v-icon>
        </div>
      </v-img>

      <v-row class="counter-section my-2">
        <v-btn icon class="counter-btn" @click="updateStampCount(-1)">
          <v-icon size="24">tabler-minus</v-icon>
        </v-btn>
        <span class="counter-text">{{ currentStamps }}</span>
        <v-btn icon class="counter-btn" @click="updateStampCount(1)">
          <v-icon size="24">tabler-plus</v-icon>
        </v-btn>
      </v-row>

      <v-row class="my-2" v-if="customerLoaded">
        <v-col cols="6" class="px-1">
          <v-btn block rounded="lg" color="success" @click="addStamps" :loading="customerStore.stamping"
            :disabled="customerStore.serialNumberData.redeemable" class="text-h6 font-weight-medium add-redeem-card">
            <v-icon size="22" class="mr-2">tabler-rubber-stamp</v-icon>
            {{ $t("Stamp") }}
          </v-btn>
        </v-col>
        <v-col cols="6" class="px-1">
          <v-btn block rounded="lg" color="info" @click="customerStore.redeem()" :loading="customerStore.redeeming"
            :disabled="!customerStore.serialNumberData.redeemable" class="text-h6 font-weight-medium add-redeem-card">
            <v-icon size="22" class="mr-2">tabler-gift</v-icon>
            {{ $t("Redeem") }}
          </v-btn>
        </v-col>
      </v-row>

      <v-list dense class="info-list">
        <v-list-item>
          <v-list-item-content class="info-label">{{ $t('Name') }}:</v-list-item-content>
          <v-list-item-content class="info-value">{{ customerStore.serialNumberData.customers_details?.name
            }}</v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item>
          <v-list-item-content class="info-label">{{ $t('Surname') }}:</v-list-item-content>
          <v-list-item-content class="info-value">{{ customerStore.serialNumberData.customers_details?.surname
            }}</v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item>
          <v-list-item-content class="info-label">{{ $t('Email') }}:</v-list-item-content>
          <v-list-item-content class="info-value">{{ customerStore.serialNumberData.customers_details?.email
            }}</v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item>
          <v-list-item-content class="info-label">{{ $t('Phone Number') }}:</v-list-item-content>
          <v-list-item-content class="info-value">{{ customerStore.serialNumberData.customers_details?.phonenumber
            }}</v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
      </v-list>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-container {
  background-color: #f7f7f7;
}

.card-container {
  max-width: 400px;
  width: 100%;
  padding: 16px;
}

.stamps-overlay {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: -30px;
}

.stamp-icon {
  font-size: 24px;
  color: grey;
}

.add-redeem-card {
  border: 1px solid #ccc;
}

.add-redeem-card.active {
  border-color: #6200ea;
}

.counter-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 16px;
}

.counter-btn {
  background-color: #6200ea;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.counter-text {
  font-size: 24px;
  font-weight: bold;
  margin: 0 12px;
}

.add-stamps-btn {
  width: 100%;
}

.info-list {
  width: 100%;
  padding: 0;
}

.info-list .v-list-item-content {
  display: flex;
  justify-content: space-between;
}

.info-label {
  color: #666;
  font-weight: 500;
  flex-grow: 1;
}

.info-value {
  color: #333;
  font-weight: 600;
  float: right;
}

.v-card .v-card-text {
  line-height: 0.375rem !important;
}

.loading-indicator {
  color: #6200ea;
  text-align: center;
}
</style>
