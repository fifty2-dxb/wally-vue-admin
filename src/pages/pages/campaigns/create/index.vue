<script setup lang="ts">
import { ref } from 'vue';
import WallyStepHeader from '@/components/global/WallyStepHeader.vue';
import TemplateService from '@/services/TemplateService';
import { useConfigStore } from '@/@core/stores/config';
import { router } from '@/plugins/1.router';



const currentStep = ref(0);
const steps = [
  {
    title: 'Select Template',
    icon: 'tabler-columns-1',
  },
  {
    title: 'Card Design',
    icon: 'tabler-artboard',
  },
  {
    title: 'Fields',
    icon: 'tabler-list-details',
  },
  {
    title: 'Additional Info',
    icon: 'tabler-info-square',
  },
  {
    title: 'Enrollment Form',
    icon: 'tabler-user-plus',
  },
  {
    title: 'Done',
    icon: 'tabler-square-rounded-check',
  },
];

const templates = ref(TemplateService.getTemplates());

const loyaltyData = ref({
  template: templates.value[0],
});

console.log(loyaltyData);

const configStore = useConfigStore();
const saving = ref(false);
const saveCampaign = async () => {
  
  let merchantId = configStore.activeMerchant?.merchantGuid;
  let appleSettings = {
    "webServiceURL": "https://b390-2a02-a46d-9f37-1-ccc-d820-b275-ea8d.ngrok-free.app/",
    "teamIdentifier": "772239U7XT",
    "sharingProhibited": false,
    "passTypeIdentifier": "pass.com.freshwallet.loyalhero",
    "authenticationToken": "Lu@ByGo9G6QMepMKQxA4",
    "associatedStoreIdentifiers": []
  };
  let postBody = {
    "merchantGuid": merchantId,
    "styleSettings": {type:"stamp",...loyaltyData.value.template,appleSettings},
    "validFromDt": {},
    "validTillDt": {}
  };
  try {
    saving.value = true;
    const res = await $wallyApi('/campaigns', {
      method: 'POST',
      onResponseError({ response }) {
        console.log(response);
      },
      body: JSON.stringify(postBody),
    });
    saving.value = false;
    const { status, campaign_details } = res;

    if (status === 'success') {
      router.push('/pages/campaigns');
    }
  } catch (err) {
    console.error(err);
    saving.value = false;
  }
};


</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Create Campaign') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Create a new loyalty card campaign') }}
      </div>
    </div>
  </div>

  <VRow>
    <VCol cols="12">
      <v-card>
        <v-card-text>
          <WallyStepHeader v-model:activeTab="currentStep" :steps="steps" />
        </v-card-text>
      </v-card>
    </VCol>

    <VCol cols="12">
      <v-card>
        <v-row>

          <v-col cols="12" :lg="currentStep == 5 ? '12' : '8'" class="elevation-0">
            <div v-if="currentStep == 0">
              <v-card class="elevation-0" title="Select Template" subtitle="Please select template of your campaign">
                <v-container>
                  <v-row>
                    <v-col cols="6" lg="3" v-for="template in templates">
                      <v-card @click="loyaltyData.template = template" rounded="lg"
                        :style="loyaltyData.template == template ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
                        :class="loyaltyData.template == template ? 'border' : 'border border-dashed elevation-0'">
                        <v-img :src="template.image" alt="" width="100%"></v-img>
                        <v-card-text class="text-center">
                          <div class="text-h6 font-weight-medium">
                            {{ template.name }}
                          </div>
                          <div class="text-subtitle-2 font-weight-thin">
                            {{ template.description }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </div>
            <div v-if="currentStep == 1">
              <CardDesign v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 2">
              <CardFields v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 3">
              <CardAdditional v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 4">
              <EnrollmentForm v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 5">
              <v-row>
                <v-col class="text-center" cols="12">
                  <h3 class="text-h4 pt-4 pb-2">
                    {{ $t("Preview") }}
                  </h3>
                  <p class="pb-4">
                    {{
                      $t(
                        "Please check and confirm the preview of your loyalty card "
                      )
                    }}
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
              <v-btn color="primary" @click="currentStep = currentStep - 1" :disabled="currentStep == 0">
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
    </VCol>
  </VRow>
</template>
