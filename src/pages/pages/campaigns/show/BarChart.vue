<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch, onMounted } from "vue";

const chartColors = {
  line: {
    series1: "#FFB400",
    series2: "#9055FD",
    series3: "#7367f029",
  },
};

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  campaignType: {
    type: String,
    default: "stamp",
  },
});

const emit = defineEmits(["monthSelected"]);

const stampData = ref([]);
const redeemData = ref([]);
const categoriesData = ref([]);
const selectedMonth = ref("January");
const selectedYear = ref(new Date().getFullYear());
const isLoading = ref(true);
const dataInitialized = ref(false);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

watch(
  () => props.campaignType,
  () => {
    isLoading.value = true;
    processData(props.data);
  }
);

const processData = (newData) => {
  if (!newData || Object.keys(newData).length === 0) {
    isLoading.value = false;
    return;
  }

  const keys = Object.keys(newData);
  
  keys.forEach((key) => {
    const monthData = newData[key] || {};

    if (props.campaignType === "stamp") {
      stampData.value = monthData.stamps || [];
      redeemData.value = monthData.redeemed || [];
    } else {
      stampData.value = monthData.access || [];
      redeemData.value = [];
    }

    const [year, month] = key.split("-");
    const monthIndex = parseInt(month, 10) - 1;

    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      const daysInMonth = new Date(parseInt(year, 10), monthIndex + 1, 0).getDate();

      categoriesData.value = Array.from({ length: daysInMonth }, (_, day) => {
        const monthAbbr = months[monthIndex]?.slice(0, 3);
        return `${day + 1} ${monthAbbr}`;
      });
    } else {
      console.error(`Invalid key: ${key}`);
    }
  });

  dataInitialized.value = true;
  isLoading.value = false;
};

watch(
  () => props.data,
  (newData) => {
    isLoading.value = true;
    processData(newData);
  },
  { immediate: true }
);

onMounted(() => {
  isLoading.value = true;
  if (props.data && Object.keys(props.data).length > 0) {
    processData(props.data);
  }
});

const series = computed(() => {
  if (props.campaignType === "stamp") {
    return [
      {
        name: "Stamp Data",
        type: "column",
        data: stampData.value.map((item) => item.count || 0),
      },
      {
        name: "Redeem Data",
        type: "line",
        data: redeemData.value.map((item) => item.count || 0),
      },
    ];
  } else {
    return [
      {
        name: "Membership Access",
        type: "column",
        data: stampData.value.map((item) => item.count || 0),
      },
    ];
  }
});

const maxYValue = computed(() => {
  // Ensure we handle empty arrays gracefully
  const stampMax = Math.max(...(stampData.value.map((item) => item.count || 0) || [0]));
  const redeemMax = Math.max(...(redeemData.value.map((item) => item.count || 0) || [0]));
  return Math.max(stampMax, redeemMax) || 50;
});

const handleMonthChange = () => {
  const monthIndex = months.indexOf(selectedMonth.value);
  const year = selectedYear.value;

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);

  isLoading.value = true;

  emit("monthSelected", {
    startDate: startDate.toString(),
    endDate: endDate.toString(),
  });
};

watch([selectedMonth, selectedYear], handleMonthChange);

const ChartData = computed(() => ({
  chart: {
    type: "line",
    stacked: false,
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },

  markers: {
    size: 5,
    colors: "#fff",
    strokeColors: chartColors.line.series2,
    hover: { size: 6 },
    borderRadius: 4,
  },

  stroke: {
    curve: "smooth",
    width: props.campaignType === "stamp" ? [0, 3] : [0],
    lineCap: "round",
  },

  legend: {
    show: true,
    position: "bottom",
    markers: { width: 8, height: 8, offsetX: -3 },
    height: 40,
    itemMargin: { horizontal: 10, vertical: 0 },
    fontSize: "15px",
    fontFamily: "Open Sans",
    fontWeight: 400,
    labels: { useSeriesColors: false },
    offsetY: 10,
  },

  grid: {
    strokeDashArray: 8,
    borderColor: "rgba(var(--v-border-color), var(--v-border-opacity))",
  },

  colors: [chartColors.line.series1, chartColors.line.series2],

  fill: { opacity: [1, 1] },

  plotOptions: {
    bar: { columnWidth: "30%", borderRadius: 4, borderRadiusApplication: "end" },
  },

  dataLabels: { enabled: false },

  tooltip: {
    y: { formatter: (value) => value || 0 },
  },

  xaxis: {
    tickAmount: 10,
    categories: categoriesData.value,
    labels: { style: { fontSize: "13px", fontWeight: 400 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  yaxis: {
    tickAmount: 4,
    min: 0,
    max: maxYValue.value,
    labels: {
      formatter: (val) => val,
    },
  },
}));
</script>

<template>
  <VCard>
    <VCardItem
      :title="campaignType === 'stamp' ? 'Monthly Stamp and Redeem Overview' : 'Membership Access Overview'"
      :subtitle="campaignType === 'stamp'
        ? 'Daily breakdown of stamps and redeems during the month'
        : 'Daily membership access trends'"
    >
      <template #append>
        <VSelect :items="months" v-model="selectedMonth" @change="handleMonthChange" label="Select Month" outlined />
        <VSelect :items="years" v-model="selectedYear" label="Select Year" outlined />
      </template>
    </VCardItem>
    <VCardText>
      <div v-if="isLoading || !dataInitialized" class="loader-container">
        <VProgressCircular indeterminate color="primary" size="64" width="5" />
        <div class="loading-text mt-4">Loading data...</div>
      </div>
      <VueApexCharts
        v-else
        id="campaign-statistics"
        type="line"
        height="340"
        :options="ChartData"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

.v-btn-group--divided .v-btn:not(:last-child) {
  border-inline-end-color: rgba(var(--v-theme-primary), 0.5);
}

#campaign-statistics {
  .apexcharts-legend-text {
    font-size: 16px !important;
  }

  .apexcharts-legend-series {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 0.375rem;
    padding-block: 4px;
    padding-inline: 16px 12px;
  }

  .apexcharts-legend-text {
    color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity)) !important;
  }
}

.loader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 340px;
}

.loading-text {
  font-size: 16px;
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
</style>
