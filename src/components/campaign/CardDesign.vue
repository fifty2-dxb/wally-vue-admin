<template>
  <v-card class="elevation-0" :title="$t('Card Design')" :subtitle="$t('Please name your campaign')">
    <v-card-text>
      <v-text-field :label="$t('Loyalty Campaign Name')" hide-details variant="outlined" v-model="value.template.name"
        outlined class="mb-6"></v-text-field>
      <v-text-field :label="$t('Description')" hide-details variant="outlined" v-model="value.template.description"
        outlined class="mb-6"></v-text-field>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Images')">
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-subtitle-2 mb-3">
            {{ $t("Logo") }}
          </div>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <div class="w-100 position-relative" v-if="value.template.properties.logo">
                <img style="height: 60px" v-bind="props" :src="value.template.properties.logo" class="float-left" />

                <v-icon v-if="value.template.properties.logo" color="red" size="small" icon="tabler-trash"
                  class="position-absolute top-0 right-0" @click="value.template.properties.logo = ''"></v-icon>
              </div>

              <div class="w-100 position-relative" v-else>
                <v-btn v-bind="props" class="w-100" size="small" color="primary" variant="outlined">
                  {{ $t("Upload Image") }}
                </v-btn>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-text class="text-h5 fw-bold text-primary text-center my-4" v-if="value.template.properties.logo">
                  {{ $t("Preview") }}</v-text>
                <v-img v-bind="props" :src="value.template.properties.logo" v-if="value.template.properties.logo"
                  height="300px" class="mb-8"></v-img>
                <v-card-text class="px-8 pt-8">
                  <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
                    v-model="files.logo" @change="uploadImage($event, 'logo')"></v-file-input>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
        </v-col>
        <v-col cols="6">
          <div class="text-subtitle-2 mb-3">
            {{ $t("Icon") }}
          </div>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <div class="w-100 position-relative" v-if="value.template.properties.icon">
                <img style="height: 60px" v-bind="props" :src="value.template.properties.icon" class="float-left" />

                <v-icon v-if="value.template.properties.icon" color="red" size="small" icon="tabler-trash"
                  class="position-absolute top-0 right-0" @click="value.template.properties.icon = ''"></v-icon>
              </div>

              <div class="w-100 position-relative" v-else>
                <v-btn v-bind="props" class="w-100" size="small" color="primary" variant="outlined">
                  {{ $t("Upload Image") }}
                </v-btn>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-text class="text-h5 fw-bold text-primary text-center my-4" v-if="value.template.properties.icon">
                  {{ $t("Preview") }}</v-text>
                <v-img v-bind="props" :src="value.template.properties.icon" v-if="value.template.properties.icon"
                  height="300px" class="mb-8"></v-img>
                <v-card-text class="px-8 pt-8">
                  <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
                    v-model="files.icon" @change="uploadImage($event, 'icon')"></v-file-input>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Stamps')">
    <v-card-text>
      <v-select :items="[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        20, 25, 30,
      ]" :label="$t('Please Select Stamps Number')" class="mt-3 mb-6" v-model="value.template.properties.stampsNumber"
        outlined @update:modelValue="updateStampImage" :bg-color="'transparent'">
      </v-select>

      <v-row>
        <v-col cols="12" lg="6">
          <v-select :items="stampImages" item-title="name" item-value="url" :label="$t('Stamp Icon')" class="mt-3"
            v-model="value.template.properties.stampIcon" outlined :bg-color="'transparent'"
            @update:modelValue="updateStampImage">
          </v-select>
          <div class="text-subtitle-2 text-center my-4">
            {{ $t("Or") }}
          </div>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <div class="w-100 position-relative d-flex justify-center" v-if="value.template.properties.stampImage">
                <img v-bind="props" :src="value.template.properties.stampImage" class="float-left w-100" />

                <v-icon v-if="value.template.properties.stampImage" color="white" size="small" icon="tabler-trash"
                  class="position-absolute top-0 right-0 border pa-3 rounded-circle bg-primary" @click="
                    value.template.properties.stampImage = ''
                    "></v-icon>
              </div>

              <div class="w-100 position-relative" v-else>
                <v-btn v-bind="props" class="w-100" color="primary" variant="outlined" size="small">
                  {{ $t("Upload Image") }}
                </v-btn>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-text class="text-h5 fw-bold text-primary text-center my-4">
                  {{ $t("Preview") }}</v-text>
                <v-img v-bind="props" :src="value.template.properties.stampImage" height="300px"
                  class="mb-8 w-100"></v-img>
                <v-card-text class="px-8">
                  <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
                    v-model="files.stampImage" @change="uploadImage($event, 'stampImage')"></v-file-input>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
        </v-col>
        <v-col cols="12" lg="6">
          <v-select :items="stampImages" :label="$t('Unstamp Icon')" class="mt-3" item-title="name"
            :bg-color="'transparent'" item-value="url" v-model="value.template.properties.unStampIcon"
            @update:modelValue="updateStampImage"></v-select>
          <div class="text-subtitle-2 text-center my-4">
            {{ $t("Or") }}
          </div>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <div class="w-100 position-relative d-flex justify-center" v-if="value.template.properties.unStampImage">
                <img v-bind="props" :src="value.template.properties.unStampImage
                  " class="float-left w-100" />

                <v-icon v-if="
                  value.template.properties.unStampImage
                " color="white" size="small" icon="tabler-trash"
                  class="position-absolute top-0 right-0 border pa-3 rounded-circle bg-primary" @click="
                    value.template.properties.unStampImage =
                    ''
                    "></v-icon>
              </div>

              <div class="w-100 position-relative" v-else>
                <v-btn v-bind="props" class="w-100" color="primary" variant="outlined" size="small">
                  {{ $t("Select Image") }}
                </v-btn>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-text class="text-h5 fw-bold text-primary text-center my-4" v-if="
                  value.template.properties.unStampImage
                ">
                  {{ $t("Preview") }}</v-text>
                <v-img v-bind="props" :src="value.template.properties.unStampImage
                  " v-if="
                    value.template.properties.unStampImage
                  " height="300px" class="mb-8"></v-img>
                <v-card-text class="px-8 mt-3">
                  <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
                    v-model="files.unStampImage" @change="uploadImage($event, 'unStampImage')"></v-file-input>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Colors')">
    <v-card-subtitle>Card</v-card-subtitle>
    <v-card-text>
      <v-row no-gutters>
        <v-col cols="6" lg="4" class="">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Card color") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.background + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.background"
                    @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>

        <v-col cols="6" lg="4" class="">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Text color") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.text + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.text"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-subtitle>Background</v-card-subtitle>
    <v-card-text>
      <v-row no-gutters>
        <v-col cols="6" lg="4" class="mb-4">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Rectangle behind stamps") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties
                      .rectangleBehindStamps + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties
                    .rectangleBehindStamps
                    " @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>

        <v-col cols="6" lg="6" class="mb-4">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Upload a background image") }}
          </div>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <div class="w-100 position-relative d-flex justify-center"
                v-if="value.template.properties.backgroundImage">
                <img v-bind="props" :src="value.template.properties.backgroundImage" class="float-left" />

                <v-icon v-if="value.template.properties.backgroundImage" color="red" size="small" icon="tabler-trash"
                  class="position-absolute top-0 end-0 border p-4 rounded-circle bg-primary" @click="
                    value.template.properties.backgroundImage = ''
                    "></v-icon>
              </div>

              <div class="w-100 position-relative" v-else>
                <v-btn v-bind="props" class="w-100" color="primary" variant="outlined" size="small">
                  {{ $t("Select Image") }}
                </v-btn>
              </div>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-text class="text-h5 fw-bold text-primary text-center my-4" v-if="value.template.properties.backgroundImage">
                  {{ $t("Preview") }}</v-text>
                <v-img v-bind="props" :src="value.template.properties.backgroundImage" v-if="value.template.properties.backgroundImage"
                  height="300px" class="mb-8"></v-img>
                <v-card-text class="px-8 pt-8">
                  <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
                    v-model="files.backgroundImage" @change="uploadImage($event, 'backgroundImage')"></v-file-input>
                </v-card-text>
              </v-card>
            </template>

          </v-dialog>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-subtitle>Stamp</v-card-subtitle>
    <v-card-text>
      <v-row class="mt-2" no-gutters>
        <v-col cols="6" lg="3">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Stamp Circle") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.circle + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.circle"
                    @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>

        <v-col cols="6" lg="3">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Circle Border") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.circleBorder + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.circleBorder
                    " @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>
        <v-col cols="6" lg="3">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Stamp Image") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.stampImageColor + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.stampImageColor
                    " @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>

        <v-col cols="6" lg="3">
          <div class="text-subtitle-2 mb-2">
            {{ $t("Unstamp Image") }}
          </div>
          <div class="ps-2" style="width: 45px; height: 45px">
            <div></div>
            <v-dialog width="300">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :style="{
                  backgroundColor:
                    value.template.properties.unStampImageColor + ' !important',
                }" style="width: 100%; height: 100%">
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-sheet>
                  <v-color-picker v-model="value.template.properties.unStampImageColor
                    " @update:model-value="updateStampImage"></v-color-picker>
                </v-sheet>
              </template>
            </v-dialog>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style>
.v-expansion-panel__shadow {
  box-shadow: none;
}

.v-field__input input {
  background-color: transparent;
}

.v-expansion-panel-title {
  padding: 16px 12px;
  font-weight: 600;
}

.v-expansion-panel-title__icon {
  color: rgb(var(--v-theme-primary)) !important;
}

.stick {
  position: fixed;
  top: 0;
  margin: 60px 0 0;
}
</style>

<script setup>
// get data from v-model
import { ref, watch, computed, onMounted } from "vue";
import TemplateService from "@/services/TemplateService";

import axios from "axios";

const props = defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);

const stamps = ref(TemplateService.getStamps());

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

onMounted(() => {
  var previewContainer = document.getElementById("previewContainer"),
    // -60 so it won't be jumpy
    stop = previewContainer.offsetTop + 150,
    docBody =
      document.documentElement || document.body.parentNode || document.body,
    hasOffset = window.pageYOffset !== undefined,
    scrollTop;

  window.onscroll = function (e) {
    // cross-browser compatible scrollTop.
    scrollTop = hasOffset ? window.pageYOffset : docBody.scrollTop;

    // if user scrolls to 60px from the top of the left div
    if (scrollTop >= stop) {
      // stick the div
      previewContainer.className = "stick";
    } else {
      // release the div
      previewContainer.className = "";
    }
  }; // Check if this logs to the console
});

const isOpen = ref([0]);
const isOpenTwo = ref([0]);
const isOpenThree = ref([0]);
const selectedStampImage = ref(null);
const selectedUnStampImage = ref(null);

const stampImages = ref([
  "anchor",
  "aromatherapy",
  "bagel",
  "bagel2",
  "baguette",
  "ballet",
  "ballet2",
  "balls",
  "bamboo",
  "barber-shop-chair",
  "barber-shop",
  "bath",
  "beach",
  "beer",
  "bell",
  "bicycle",
  "book",
  "bouquet",
  "bowl",
  "bowling",
  "bowling2",
  "brush",
  "building",
  "burger",
  "burrito",
  "cake",
  "candle",
  "candy-cane",
  "candy",
  "car",
  "carwash",
  "cat",
  "champagne",
  "chef",
  "cloud",
  "cocktail",
  "coffee-2",
  "coffee",
  "couple",
  "croissant",
  "cupcake",
  "cutlery-2",
  "cutlery",
  "dance",
  "dance2",
  "dance3",
  "dance4",
  "diamond",
  "dog",
  "dollar",
  "donkey",
  "doughnut",
  "dumbbell",
  "dumbell2",
  "earring",
  "earring2",
  "emoji-cool-cat",
  "emoji-cool",
  "euro",
  "event",
  "eye",
  "feet",
  "flag",
  "flower",
  "flower2",
  "fruit",
  "gobbler",
  "golf",
  "golf2",
  "golf3",
  "graduate",
  "hair-dryer",
  "haircut",
  "hanger",
  "heart",
  "herb",
  "hexagon-cross",
  "hexagon-heart",
  "hexagon-star",
  "hexagon-star2",
  "hexagon-tick",
  "hotdog",
  "house",
  "hug",
  "ice-cream-2",
  "ice-cream-3",
  "ice-cream-4",
  "ice-cream",
  "ice-skate",
  "jewelry",
  "kettle-bell",
  "kid-happy",
  "kiss",
  "kiss2",
  "lawnmower",
  "lips",
  "lipstick",
  "lipstick2",
  "lollipop",
  "lotions",
  "love",
  "makeup",
  "makeup2",
  "makeup3",
  "manicure",
  "manicure2",
  "massage",
  "massage2",
  "massage3",
  "massage4",
  "meeting",
  "moon",
  "muffin",
  "nail-polish",
  "nail-polish2",
  "nail-polish3",
  "necklace",
  "ninja",
  "noodles",
  "pants",
  "pattern-intricate",
  "paw",
  "pencil",
  "pizza",
  "plane",
  "plate",
  "rackets",
  "razor-blade",
  "ring",
  "ring2",
  "ring3",
  "rock-climbing",
  "roller",
  "rosette",
  "running",
  "sad-emoji",
  "salad",
]);

const updateStampImage = function () {
  function createLoopyLoyaltyURL() {
    const baseUrl = "https://api.loopyloyalty.com/images";
    const query = new URLSearchParams({
      json: JSON.stringify({
        width: 1125,
        height: 432,
        padding: 40,
        totalStamps: value.value.template.properties.stampsNumber,
        stampImage: selectedStampImage.value,
        unstampImage: selectedUnStampImage.value,
        backgroundColor: value.value.template.properties.rectangleBehindStamps,
        backgroundOpacity: 1,
        stampColor: value.value.template.properties.stampImageColor,
        stampOpacity: 1,
        unstampColor: value.value.template.properties.unStampImageColor,
        unstampOpacity: 1,
        placeholders: true,
        placeholderColor: value.value.template.properties.circle,
        placeholderOpacity: 1,
        placeholderBorderColor: value.value.template.properties.circleBorder,
        placeholderBorderOpacity: 1,
        rewardsPlaceholders: true,
        rewardBorderColor: "#000000",
        rewardBorderOpacity: 1,
        rewardBackgroundColor: "#000000",
        rewardBackgroundOpacity: 1,
        rewardPositions: 0,
        stampedStatus: 3,
        imageType: "png",
      }),
    }).toString();
    console.log(query, "query");

    return `${baseUrl}?${query}`;
  }

  // Kullanıcıdan alacağınız parametreleri bu şekilde tanımlayabilirsiniz

  value.value.template.properties.stampImagePreview = createLoopyLoyaltyURL();
};
const files = ref({});
async function uploadImage(event, type) {

  const file = event.target.files[0];

  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await $wallyApi('/photo', {
        method: 'POST',
        body: formData,
      });

      const imageUrl = response.url;
      value.value.template.properties[type] = imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
}
</script>
