<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import {useCustomerStore} from '@/stores/customer';  // Import the store
const router = useRouter()

const route = useRoute('pages-customers-show')

const customerStore = useCustomerStore()
const fetchCustomerDetails = async (customerId: string) => {
  try {
    await customerStore.fetchCustomerById(customerId);
  } catch (error) {
    console.error('Error fetching customer:', error);
  }
};



onMounted(() => {
  fetchCustomerDetails(route.params.id);
})

</script>
<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        Customer Details
      </h4>
      <div class="text-body-1">
        View customer details
      </div>
    </div>
    <div class="d-flex flex-column justify-center">
      <v-btn color="primary" variant="outlined">
        Actions
      </v-btn>
    </div>
  </div>
  <v-row>
    <v-col md="4" sm="12">
      <VCard class="mb-6" v-if="customerStore.customer.type == 'stamp'">
        <v-img :src="customerStore.customer.stampImageUrl"></v-img>
        <v-card-actions class="pt-3 justify-space-between">
          <v-btn :color="customerStore.customer.redeemable ? '' : 'success'" @click="customerStore.stamp(1)" :loading="customerStore.stamping" :disabled="customerStore.customer.redeemable"><v-icon size="22" class="mr-2">tabler-rubber-stamp</v-icon> Stamp</v-btn>
          <v-btn :color="customerStore.customer.redeemable ? '' : 'error'"  @click="customerStore.stamp(-1)" :loading="customerStore.stamping" :disabled="customerStore.customer.redeemable"><v-icon size="22" class="mr-2">tabler-rubber-stamp</v-icon> Unstamp</v-btn>
          <v-btn :color="!customerStore.customer.redeemable ? '' : 'info'" @click="customerStore.redeem()" :loading="customerStore.redeeming" :disabled="!customerStore.customer.redeemable"><v-icon size="22" class="mr-2">tabler-gift</v-icon> Redeem</v-btn>
        </v-card-actions>
      </VCard>   
      <VCard class="mb-6" >
        <v-card-title class="text-primary">{{ $t('User Data') }}</v-card-title>
        <v-list class="py-0">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Name') }}</v-list-item-title>
              <v-list-item-subtitle>{{ customerStore.customer.name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Surname') }}</v-list-item-title>
              <v-list-item-subtitle>{{ customerStore.customer.surname }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Email') }}</v-list-item-title>
              <v-list-item-subtitle>{{ customerStore.customer.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Phone Number') }}</v-list-item-title>
              <v-list-item-subtitle>{{ customerStore.customer.phonenumber }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card-title>{{ $t('Additional Info') }}</v-card-title>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('Gender') }}</v-list-item-title>
              <v-list-item-subtitle>{{ customerStore.customer.gender }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </VCard>
      <VCard class="mb-6" >
        <v-card-title class="text-primary">{{ $t('Notes') }}</v-card-title>
        <VCardText class="px-3 h-100">
          <v-textarea rows="5" :placeholder="'Your notes about this customer'" v-model="customerStore.customer.note"></v-textarea>
        </VCardText>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" >Save</v-btn>
        </v-card-actions>
      </VCard>
    </v-col>
    <v-col md="8" sm="12">
      <VCard class="mb-6" v-if="customerStore.customer.stats.length > 0">
        <v-row>
          <v-col md="4" v-for="stat in customerStore.customer.stats">
            <v-card-title class="text-primary">{{$t(stat.label)}}</v-card-title>
            <v-card-text>
              <h2>{{ stat.value }}</h2>
            </v-card-text>
          </v-col>
        </v-row>
      </VCard>
      <VCard class="mb-6">
        <v-card-title class="text-primary">{{ $t('Customer History') }}</v-card-title>
        <v-data-table min-height="600"
          :headers="[
            { title: 'Date', value: 'date' },
            { title: 'Descripton', value: 'description' },
          ]"
          :items="customerStore.customer.logs"
          :items-per-page="50"
          class="elevation-1"
          :loading="customerStore.gettingLogs"
        >
          <template v-slot:item.date="{ item }">
            {{ item.updatedAt }}
          </template>
          <template v-slot:item.description="{ item }">
            <span class="text-success" v-if="item.type=='stamp' && item.value > 0 ">Customer gained {{ item.value }} stamp. </span>
            <span class="text-error" v-if="item.type=='stamp' && item.value < 0 ">{{  0 - item.value }} stamp reverted from the card. </span>
            <span class="text-info" v-if="item.type=='redeem'">Customer redeemed the reward.</span>
          </template>
        </v-data-table>
      </VCard>  
    </v-col>

  </v-row>
</template>
