<script setup lang="ts">

const props = defineProps({
  data: {
    type: Array as PropType<
      Array<{ title: string; value: number | null; icon: string; desc: string; change?: number; color?: string }>
    >,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const defaultLabel = computed(() => {
  const customerData = chartData.value.find((item) => item.title === 'Customers');
  return customerData ? { label: customerData.title, value: customerData.value || 0 } : { label: '', value: 0 };
});

const chartColors = {
  donut: {
    series1: '#28C76F',
    series2: '#28C76FCC',
    series3: '#28C76F99',
    series4: '#28C76F66',
  },
}

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'

const chartData = computed(() => {
  const relevantTitles = ['Customers', 'Apple Cards', 'Google Cards'];
  return props.data.filter((item) => relevantTitles.includes(item.title));
});

const deliveryExceptionsChartSeries = computed(() =>
  chartData.value.map((item) => item.value || 0)
);

const deliveryExceptionsChartLabels = computed(() =>
  chartData.value.map((item) => item.title)
)

const deliveryExceptionsChartConfig = computed(() => ({
  labels: deliveryExceptionsChartLabels.value,
  colors: [
    chartColors.donut.series1,
    chartColors.donut.series2,
    chartColors.donut.series3,
  ],
  stroke: {
    width: 0,
  },
  dataLabels: {
    enabled: false,
    formatter(val: string) {
      return `${Number.parseInt(val)}`
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 10,
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5,
    },
    fontSize: '13px',
    fontWeight: 400,
    labels: {
      colors: headingColor,
      useSeriesColors: false,
    },
  },
  tooltip: {
    theme: false,
  },
  grid: {
    padding: {
      top: 15,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '24px',
            color: headingColor,
            fontWeight: 500,
            offsetY: -20,
            formatter(val: string) {
              return `${Number.parseInt(val)}`
            },
          },
          name: { offsetY: 20 },
          total: {
            show: true,
            fontSize: '0.9375rem',
            fontWeight: 400,
            label: defaultLabel.value.label,
            color: labelColor,
            formatter() {
              return `${defaultLabel.value.value}`;
            },
          },
        },
      },
    },
  },
}));
</script>

<template>
  <VCard>
    <VCardItem title="Customer & Card Overview" subtitle="Breaking down customer data by card preference">
    </VCardItem>
    <VCardText>
      <VueApexCharts type="donut" height="370" :options="deliveryExceptionsChartConfig"
        :series="deliveryExceptionsChartSeries" />
    </VCardText>
  </VCard>
</template>
