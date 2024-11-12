<template>
  <v-card class="elevation-0" :title="$t('Fields')" :subtitle="$t('Please select fields shown on card')">
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-h6 text-center mb-6"><v-icon class="mr-3" size="24" icon="tabler-brand-apple"></v-icon></div>
          <v-select v-for="index in 6" :key="'apple' + index"
            :label="$t(`Field ${index}`)" :items="filteredFieldListApple" item-title="name" item-value="key"
            variant="outlined" v-model="value.template.fields.apple[`f${index}`]" outlined class="mb-6"></v-select>
          <v-autocomplete v-if="showCurrencySelectApple" :label="$t('Select Currency')" :items="currencies"
            item-title="name" item-value="symbol" v-model="selectedCurrencyApple" variant="outlined" class="mb-6"></v-autocomplete>
        </v-col>

        <v-col cols="6">
          <div class="text-h6 text-center mb-6"><v-icon class="mr-3" size="24" icon="tabler-brand-android"></v-icon></div>
          <v-select v-for="index in 6" :key="'google' + index"
            :label="$t(`Field ${index}`)" :items="filteredFieldListGoogle" item-title="name" item-value="key"
            variant="outlined" v-model="value.template.fields.google[`f${index}`]" outlined class="mb-6"></v-select>
          <v-autocomplete v-if="showCurrencySelectGoogle" :label="$t('Select Currency')" :items="currencies"
            item-title="name" item-value="symbol" v-model="selectedCurrencyGoogle" variant="outlined" class="mb-6"></v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import TemplateService from '@/services/TemplateService';

const props = defineProps(['modelValue']);
const emits = defineEmits(['update:modelValue']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  }
});

const fieldList = ref(TemplateService.getFields());
const currencies = TemplateService.getCurrencies();
const selectedCurrencyApple = ref(null);
const selectedCurrencyGoogle = ref(null);
const templateType = computed(() => props.modelValue.template.type);

const showCurrencySelectApple = ref(false);
const showCurrencySelectGoogle = ref(false);

watch(
  () => Object.values(value.value.template.fields.apple || {}),
  (fields) => {
    showCurrencySelectApple.value = fields.includes('balance');
  },
  { deep: true }
);

watch(
  () => Object.values(value.value.template.fields.google || {}),
  (fields) => {
    showCurrencySelectGoogle.value = fields.includes('balance');
  },
  { deep: true }
);

watch(selectedCurrencyApple, (currency) => {
  if (currency) value.value.template.fields.apple.currency = currency;
});

watch(selectedCurrencyGoogle, (currency) => {
  if (currency) value.value.template.fields.google.currency = currency;
});

// Filter fields based on template type while ensuring six fields are always available
const getFilteredFields = () => {
  const options = {
    balance: ['name', 'phone', 'email', 'empty', 'balance'],
    stamp: ['name', 'phone', 'email', 'stampCount', 'empty' ],
    membership: ['name', 'phone', 'email', 'empty']
  };
  return options[templateType.value] || fieldList.value;
};

const filteredFieldListApple = computed(() => getFilteredFields());
const filteredFieldListGoogle = computed(() => getFilteredFields());
</script>
