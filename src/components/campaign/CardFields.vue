<template>
  <v-card class="elevation-0" :title="$t('Fields')" :subtitle="$t('Please select fields shown on card')">
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-h6 text-center mb-6">
            <v-icon class="mr-3" size="24" icon="tabler-brand-apple"></v-icon>
          </div>
          <v-select v-for="(field, index) in filteredFieldListApple" :key="'apple' + index"
            :label="$t(`Field ${index + 1}`)" :items="filteredFieldListApple" item-title="name" item-value="key"
            variant="outlined" v-model="value.template.fields.apple[`f${index + 1}`]" outlined class="mb-6"></v-select>

          <v-autocomplete v-if="showCurrencySelectApple" :label="$t('Select Currency')" :items="currencies" item-title="name"
            item-value="symbol" v-model="selectedCurrencyApple" variant="outlined" class="mb-6"></v-autocomplete>
        </v-col>

        <v-col cols="6">
          <div class="text-h6 text-center mb-6">
            <v-icon class="mr-3" size="24" icon="tabler-brand-android"></v-icon>
          </div>
          <v-select v-for="(field, index) in filteredFieldListGoogle" :key="'google' + index"
            :label="$t(`Field ${index + 1}`)" :items="filteredFieldListGoogle" item-title="name" item-value="key"
            variant="outlined" v-model="value.template.fields.google[`f${index + 1}`]" outlined class="mb-6"></v-select>

          <v-autocomplete v-if="showCurrencySelectGoogle" :label="$t('Select Currency')" :items="currencies" item-title="name"
            item-value="symbol" v-model="selectedCurrencyGoogle" variant="outlined" class="mb-6"></v-autocomplete>
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

const filteredFieldListApple = computed(() => {
  if (templateType.value === 'balance') {
    return fieldList.value.map((field, index) => ({
      ...field,
      label: index === 4 ? "" : field.label,
    })).filter(field => ['name', 'phone', 'email', 'empty', 'balance'].includes(field.key));
  } else if (templateType.value === 'stamp') {
    return fieldList.value.filter(field => ['name', 'phone', 'email', 'stampCount'].includes(field.key));
  } else if (templateType.value === 'membership') {
    return fieldList.value.filter(field => ['name', 'phone', 'email'].includes(field.key));
  }
  return fieldList.value;
});

const filteredFieldListGoogle = computed(() => filteredFieldListApple.value);
</script>
