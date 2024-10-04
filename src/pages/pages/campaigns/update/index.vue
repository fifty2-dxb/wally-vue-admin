<script setup lang="ts">
import { ref, onMounted } from 'vue';
import WallyStepHeader from '@/components/global/WallyStepHeader.vue';
import { useConfigStore } from '@/@core/stores/config';
import { useRouter, useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';

const router = useRouter();
const route = useRoute();
const campaignGuid = route.params.id;
const campaignStore = useCampaignStore();

const currentStep = ref(0);
const loading = ref(true);

const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const steps = [
  { title: 'Card Design', icon: 'tabler-artboard' },
  { title: 'Fields', icon: 'tabler-list-details' },
  { title: 'Additional Info', icon: 'tabler-info-square' },
  { title: 'Enrollment Form', icon: 'tabler-user-plus' },
  { title: 'Done', icon: 'tabler-square-rounded-check' },
];

const loyaltyData = ref({
  template: {},
  styleSettings: {},
  validFromDt: {},
  validTillDt: {}
});

const configStore = useConfigStore();
const saving = ref(false);

const fetchCampaignById = async (campaignGuid: string) => {
  try {
    await campaignStore.fetchCampaignByCampaignGuid(campaignGuid);
    const campaign = campaignStore.campaigns.find(c => c.campaignGuid === campaignGuid);

    if (campaign) {
      loyaltyData.value = {
        ...campaign,
        template: campaign.styleSettings || {},
      };
      loading.value = false;
    }
  } catch (error) {
    showSnackbar(error.response._data.message, 'error');
    loading.value = false;
  }
};

onMounted(() => {
  fetchCampaignById(campaignGuid);
});

const saveCampaign = async () => {
  const merchantId = configStore.activeMerchant?.merchantGuid;
  const appleSettings = {
    webServiceURL: "https://b390-2a02-a46d-9f37-1-ccc-d820-b275-ea8d.ngrok-free.app/",
    teamIdentifier: "772239U7XT",
    sharingProhibited: false,
    passTypeIdentifier: "pass.com.freshwallet.loyalhero",
    authenticationToken: "Lu@ByGo9G6QMepMKQxA4",
    associatedStoreIdentifiers: [],
  };

  const postBody = {
    merchantGuid: merchantId,
    styleSettings: { type: "stamp", ...loyaltyData.value.template, appleSettings },
    validFromDt: loyaltyData.value.validFromDt,
    validTillDt: loyaltyData.value.validTillDt,
  };

  try {
    saving.value = true;
    await campaignStore.updateCampaign(campaignGuid, postBody);
    saving.value = false;
    router.push('/pages/campaigns');
  } catch (error) {
    saving.value = false;
    showSnackbar('Failed to update campaign', 'error');
  }
};
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Update Campaign') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Update a loyalty card campaign') }}
      </div>
    </div>
  </div>

  <v-row v-if="loading">
    <v-col cols="12" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <v-row v-else>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <WallyStepHeader v-model:activeTab="currentStep" :steps="steps" />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-row>
          <v-col cols="12" :lg="currentStep == 4 ? '12' : '8'" class="elevation-0">
            <div v-if="currentStep == 0">
              <CardDesign v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 1">
              <CardFields v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 2">
              <CardAdditional v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 3">
              <EnrollmentForm v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 4">
              <v-row>
                <v-col class="text-center" cols="12">
                  <h3 class="text-h4 pt-4 pb-2">
                    {{ $t("Preview") }}
                  </h3>
                  <p class="pb-4">
                    {{ $t("Please check and confirm the preview of your loyalty card") }}
                  </p>
                  <v-btn class="mb-4 mt-2" color="primary" @click="saveCampaign()" :loading="saving">
                    {{ $t("Submit") }}
                  </v-btn>
                </v-col>
                <v-col cols="12" lg="12" class="d-flex justify-center align-center">
                  <PhonePreview :data="loyaltyData" :seeAll="true" />
                </v-col>
              </v-row>
            </div>
            <v-divider class="mt-3"></v-divider>
            <v-card-actions class="pt-2">
              <v-btn color="primary" @click="currentStep = currentStep - 1" :disabled="currentStep == 1">
                {{ $t('Back') }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="currentStep = currentStep + 1" :disabled="currentStep == 5">
                {{ $t('Next') }}
              </v-btn>
            </v-card-actions>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="12" lg="4" class="lg:order-last" v-if="currentStep != 5">
            <PhonePreview :data="loyaltyData" v-if="currentStep != 4" />
            <FormPreview :data="loyaltyData" class="mt-3 pr-2" v-else />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
  {{ snackbarMessage }}
</VSnackbar>
</template>
