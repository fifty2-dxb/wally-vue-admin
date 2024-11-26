<template>
  <div class="w-100 pb-3">
    <div class="d-flex align-center justify-center flex-column">
      <v-btn-toggle class="my-3" v-model="selectedPlatform" divided variant="outlined" color="primary" v-if="!seeAll">
        <v-btn size="40" value="ios">
          <v-icon size="large" icon="tabler-brand-apple"></v-icon>
        </v-btn>
        <v-btn size="60" value="android" class="ml-2">
          <v-icon size="large" icon="tabler-brand-android"></v-icon>
        </v-btn>
      </v-btn-toggle>
      <div class="preview-container" :class="seeAll ? 'd-lg-flex gap-5' : ''" id="previewContainer">
        <div class="pb-3" v-if="selectedPlatform == 'ios' || seeAll">
          <div class="apple-container">
            <v-img src="/images/loyalty/iphoneLayout.svg" alt="" :width="seeAll ? '300px' : '300px'">
              <div class="apple-screen-container">
                <div class="card-preview" v-if="selectedPage == 'preview'">
                  <div class="apple-side-btn-container">
                    <p class="mb-0">Done</p>
                    <div class="d-flex justify-content-center align-items-center cursor-link"
                      style="width: 20px; height: 20px" @click="toggleDynamicView">
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="dynamic-icon"
                        style="width: 14px; height: 14px;">
                        <path
                          d="M8 16c4.377 0 8-3.631 8-8 0-4.376-3.631-8-8.008-8C3.624 0 0 3.624 0 8c0 4.369 3.631 8 8 8zm0-1.333A6.634 6.634 0 011.341 8a6.628 6.628 0 016.651-6.667A6.653 6.653 0 0114.667 8 6.636 6.636 0 018 14.667zM4.337 9.145a1.145 1.145 0 000-2.29c-.635 0-1.145.518-1.145 1.145s.51 1.145 1.145 1.145zm3.655 0c.628 0 1.145-.518 1.145-1.145S8.62 6.855 7.992 6.855c-.627 0-1.145.518-1.145 1.145s.518 1.145 1.145 1.145zm3.663 0a1.145 1.145 0 000-2.29c-.635 0-1.145.518-1.145 1.145s.51 1.145 1.145 1.145z"
                          fill="#000"></path>
                      </svg>
                    </div>
                  </div>
                  <div v-if="!dynamicView" class="apple-card-container" id="applePreview"
                    :style="{ background: data.template.properties?.background, color: data.template.properties?.text }">
                    <div class="apple-card-header mt-4">
                      <img :src="data.template.properties?.logo" style="height: 24px" />
                      <div class="head-position" v-if="data.template.fields?.apple.f1 != 'empty'">
                        <p class="head-position--header">{{
                          getField(data.template.fields?.apple.f1)?.label }}</p>
                        <p class="head-position--value">{{
                          getField(data.template.fields?.apple.f1)?.sample }}</p>
                      </div>
                      <div class="head-position" v-if="data.template.fields?.apple.f2 != 'empty'">
                        <p class="head-position--header">{{
                          getField(data.template.fields?.apple.f2)?.label }}</p>
                        <p class="head-position--value">{{
                          getField(data.template.fields?.apple.f2)?.sample }}</p>
                      </div>
                    </div>
                    <div class="apple-strip-image">
                      <img
                        :src="data.template.type == 'membership' ? data.template.properties?.stripImagePreviewApple : data.template.properties?.stampImagePreview"
                        alt="" width="100%" cover></img>
                    </div>
                    <div class="apple-fields">
                      <div class="container-value" v-if="data.template.fields?.apple.f3 != 'empty'">
                        <p class="field-text">{{ getField(data.template.fields?.apple.f3)?.label
                          }}</p>
                        <p class="field-value">{{
                          getField(data.template.fields?.apple.f3)?.sample }}</p>
                      </div>
                      <div class="container-value" v-if="data.template.fields?.apple?.f4 != 'empty'">
                        <p class="field-text">{{ getField(data.template.fields?.apple.f4)?.label
                          }}</p>
                        <p class="field-value">{{
                          getField(data.template.fields?.apple.f4)?.sample }}</p>
                      </div>
                      <div class="container-value" v-if="data.template.fields?.apple.f5 != 'empty'">
                        <p class="field-text">{{ getField(data.template.fields?.apple.f5)?.label
                          }}</p>
                        <p class="field-value">{{
                          getField(data.template.fields?.apple.f5)?.sample }}</p>
                      </div>
                    </div>
                    <div class="apple-qrcode">
                      <div class="qrcode-container code128">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SampleQRCodeData"
                          alt="QR Code" class="img-fluid" />
                        <div class="qrcode-name text-center">
                          %CARD_CODE%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <v-container class="py-5" style="max-width: 600px; margin: auto;">

                      <v-row justify="space-between" align="center" class="mb-4">
                        <v-img src="https://cdn.pub1.passkit.io/images/5rzPsGAxOP489Y2xOhv7Lh/strip/strip@3x.png"
                          height="30" contain width="100%"></v-img>
                      </v-row>

                      <v-row class="text-center mb-4">
                        <v-col>
                          <h3 class="text-h6 font-weight-bold">{{data.template.name}}</h3>
                        </v-col>
                      </v-row>

                      <v-row class="mb-4">
                        <v-btn block color="primary" class="text-none">
                          Add Application
                        </v-btn>
                      </v-row>

                      <v-row class="mb-4">
                        <v-col>
                          <v-row align="center" justify="space-between" class="mb-4">
                            <span class="text-body-1 font-weight-medium">Automatic Updates</span>
                            <v-switch v-model="autoUpdates" color="primary"></v-switch>
                          </v-row>
                          <v-divider></v-divider>
                          <v-row align="center" justify="space-between " class="mt-4">
                            <span class="text-body-1 font-weight-medium">Allow Notifications</span>
                            <v-switch v-model="allowNotifications" color="primary"></v-switch>
                          </v-row>
                        </v-col>
                      </v-row>

                      <v-row justify="center" class="mb-4">
                        <v-col class="text-center">
                          <p class="text-body-1 font-weight-medium text-danger background-clr">Remove Pass</p>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-card class="pa-2 mb-3" outlined>
                            <p class="text-body-1 font-weight-bold text-uppercase mb-2">Information</p>
                            <v-skeleton-loader :loading="true" :height="'25px'" :width="'100%'"
                              tile></v-skeleton-loader>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-container>
                  </div>
                </div>
              </div>
            </v-img>
          </div>
        </div>
        <div class="pb-3" v-if="selectedPlatform == 'android' || seeAll">
          <div class="google-container">
            <v-img src="/images/loyalty/googleLayout.svg" alt="" :width="seeAll ? '300px' : '300px'">
              <div class="google-screen-container">
                <div class="shadow-container" bis_skin_checked="1"></div>
                <section class="GoogleCardContainer"
                  :style="{ background: data.template.properties?.background, color: data.template.properties?.text }">
                  <div data-v-e0338a20="" class="GoogleCardContainer--header d-flex align-items-center"
                    bis_skin_checked="1">
                    <div class="img-container mr-10"
                      :style="'background-image: url(' + data.template.properties?.icon + ');'" bis_skin_checked="1">
                    </div>
                    <div class="company-name" bis_skin_checked="1">{{ data.template.name }}
                    </div>
                  </div>
                  <div class="br-header" bis_skin_checked="1"></div>
                  <div class="GoogleCardContainer--name" bis_skin_checked="1">
                    <p class="mb-0 loyaltyProgramName">Loyalty card</p>
                  </div>
                  <div data-v-e0338a20="" class="GoogleCardContainer--fields d-flex justify-content-between"
                    bis_skin_checked="1">
                    <div class="left-block" bis_skin_checked="1">
                      <p class="head">{{
                        getField(data.template.fields?.google.f1)?.label }}</p>
                      <p class="val">{{
                        getField(data.template.fields?.google.f1)?.sample }}</p>
                    </div>
                    <div class="right-block text-right" bis_skin_checked="1">
                      <p class="head">{{
                        getField(data.template.fields?.google.f2)?.label }}</p>
                      <p class="val">{{
                        getField(data.template.fields?.google.f2)?.sample }}</p>
                    </div>
                  </div>
                  <div class="GoogleCardContainer--qrcode" bis_skin_checked="1">
                    <div class="qrcode-container code128" bis_skin_checked="1">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SampleQRCodeData"
                        alt="QR Code" class="img-fluid" />
                    </div>
                    <div class="qrcode-name text-center" bis_skin_checked="1">
                      %CARD_CODE%
                    </div>
                  </div>

                </section>
                <div class="GoogleCardContainer--strip">
                  <img
                    :src="data.template.type == 'membership' ? data.template.properties?.stripImagePreviewGoogle : data.template.properties?.stampImagePreview"
                    alt="" width="100%" cover />
                </div>

                <div data-v-49c5ed53="" class="google-device-btn-info cursor-link" bis_skin_checked="1">
                  Information
                </div>
              </div>
            </v-img>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TemplateService from "@/services/TemplateService";

defineProps({
  data: {
    type: Object,
    default: () => { },
  },
  seeAll: {
    type: Boolean,
    default: false,
  },
  sticky: {
    type: Boolean,
    default: false,
  },
});

const selectedPlatform = ref("ios");
const selectedPage = ref("preview");
const dynamicView = ref(false); 
const autoUpdates = ref(true); 
const allowNotifications = ref(true); 

const getField = function (key) {
  return TemplateService.getFieldByKey(key);
};

const toggleDynamicView = () => {
  dynamicView.value = !dynamicView.value;
};

</script>

<style>

.text-danger {
  margin: 0px;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    color: rgb(211, 47, 47);
}

.background-clr {
  /* width: 100%; */
    cursor: pointer;
    padding: 16px;
    margin-top: 3px;
    border-radius: 8px;
    margin-bottom: 3px;
    background-color: #f9f9f9;
}

.dynamic-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #333;
  font-size: 1.2rem;
}


.google-container .google-screen-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  width: 300px;
  height: auto;
  top: 0;
  padding: 84px 22px 22px 22px;
}

.google-container .GoogleCardContainer {
  width: 256px;
  height: 370px;
  -webkit-box-shadow: 0 1px 4px rgba(21, 27, 38, .15);
  box-shadow: 0 1px 4px rgba(21, 27, 38, .15);
  border-radius: 12px;
  overflow: hidden;
}

.google-container .GoogleCardContainer--header {
  padding: 15px 0 13px 12px;
  height: 54px;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
}

.google-container .frontDisplay .shadow-container {
  -webkit-filter: brightness(.5);
  filter: brightness(.5);
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  border-radius: 45px;
  background: #000;
  opacity: 0;
  width: 300px;
  height: 626px;
  -webkit-transition: all .5s;
  transition: all .5s;
}

.google-container .GoogleCardContainer--header .img-container {
  width: 26px;
  height: 26px;
  background-size: contain;
  background-position: 50%;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-color: #fff;
  margin-right: .83333rem !important;
}

.google-container .GoogleCardContainer--header .company-name {
  font-size: 13px;
  line-height: 16px;
}

.google-container .company-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  margin-right: 7.5px;
}

.google-container .GoogleCardContainer .br-header {
  content: "";
  opacity: .1;
  border-bottom: 1px solid #fff;
  width: 100%;
}

.google-container .GoogleCardContainer--name {
  padding: 15px 10px 13px 12px;
  width: 90%;
  height: 54px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.google-container .GoogleCardContainer--name .loyaltyProgramName {
  font-size: 18px;
  line-height: 23px;
  width: 90%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.google-container .GoogleCardContainer--fields {
  padding: 0 13px;
  height: 29px;
  -webkit-box-pack: justify !important;
  -ms-flex-pack: justify !important;
  justify-content: space-between !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
}

.google-container .GoogleCardContainer--fields .head {
  text-transform: uppercase;
  font-size: 9px;
  line-height: 11px;
}

.google-container .GoogleCardContainer--fields .val {
  font-size: 14px;
  line-height: 18px;
}

.google-container .GoogleCardContainer--qrcode {
  height: auto;
  padding: 20px 10px 12px 10px;
  text-align: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-line-pack: stretch;
  align-content: stretch;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}


.google-container .GoogleCardContainer--qrcode .qrcode-container {
  background: #fff;
  border-radius: 2px;
}

.google-container .img-fluid,
.img-thumbnail {
  max-width: 100%;
  height: auto;
}

.google-container .GoogleCardContainer--qrcode .qrcode-name {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
}

.google-container .GoogleCardContainer--strip {
  height: 92px;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
}

.google-device-btn-info {
  border: 1px solid #dbdcde;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 39px;
  text-align: center;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: .02em;
  color: #3973df;
  height: 28px;
  padding: 7px;
  margin-top: 120px;
}

.cursor-link {
  cursor: pointer;
}

.apple-container .apple-screen-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  padding: 35px 12px 11px;
}

.apple-container .card-preview {
  width: 100%;
  padding: 0px 12px;
}

.apple-container .apple-card-container {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 0 12px 20px;
  gap: 10px;
}

.apple-container .apple-side-btn-container {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.apple-card-container .apple-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 11px;
  height: 48px;
  width: 100%;
}

.apple-card-header .head-position {
  text-transform: uppercase;
  font-size: 8px;
}

.apple-card-container .apple-fields {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  gap: 6px;
  height: auto;
}

.apple-fields .field-text {
  text-transform: uppercase;
  font-size: 8px;
  margin-bottom: 8px;
}

.apple-fields .field-value {
  font-size: 12px;
  margin-bottom: 8px;
}

.apple-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  color: #0e0e0e;
}

.apple-qrcode .qrcode-container {
  text-align: center;
  max-width: 200px;
  border-radius: 5px;
  background: #fff;
  padding: 8px 10px;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.qrcode-container img {
  margin: auto;
  width: 150px;
}

.qrcode-container .qrcode-name {
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 5px;
  font-size: 10px;
  text-align: center;
}
</style>
