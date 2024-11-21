<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Pusher from 'pusher-js';

const pusherKey = import.meta.env.VITE_APP_PUSHER_KEY;

const customerName = ref('John Doe');
const eventName = ref('New Years Eve Gala');
const ticketPrice = ref(1499);
const paidDeposit = ref(299);
const totalLeft = ref(ticketPrice.value - paidDeposit.value);

const proceedToPayment = () => {
  console.log('Redirecting to payment...');
};

onMounted(() => {
  const pusher = new Pusher(pusherKey, {
    cluster: 'ap1',
  });

  const channel = pusher.subscribe('wally-saas');
  channel.bind('ticket-update', (data: any) => {
    console.log('Pusher data received:', data);

    customerName.value = data?.customerName || customerName.value;
    eventName.value = data?.eventName || eventName.value;
    ticketPrice.value = data?.ticketPrice || ticketPrice.value;
    paidDeposit.value = data?.paidDeposit || paidDeposit.value;
    totalLeft.value = (ticketPrice.value - paidDeposit.value) || totalLeft.value;
  });
});
</script>


<template>
  <div id="price-table-page">
    <div class="content-wrapper">
      <div class="welcome-box">
        <div class="welcome-message">
          <div class="greeting">
            <span>Hi</span>
            <span class="highlight">{{ customerName }}</span> 👋
          </div>
          <div class="event-message">
            <span>Welcome to</span>
            <span class="event-highlight">
              🎉 {{ eventName }} 🎉
            </span>
          </div>
        </div>
      </div>

      <div class="price-details-wrapper">
        <div class="price-details">
          <div class="price-row">
            <span>Ticket Price:</span>
            <span>{{ ticketPrice }} AED</span>
          </div>
          <div class="price-row">
            <span>Paid Deposit:</span>
            <span>{{ paidDeposit }} AED</span>
          </div>
          <hr />
          <div class="price-row total">
            <span>Total Left:</span>
            <span>{{ totalLeft }} AED</span>
          </div>
        </div>

        <v-btn @click="proceedToPayment" class="action-button">
          Proceed to Payment
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
#price-table-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #faf3e0, #f5efe6);
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 42rem;
  width: 26rem;
  padding: 2.5rem 2rem;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 1.2s ease;
}

.welcome-box {
  text-align: center;
  margin-bottom: 1.5rem;
}

.welcome-message {
  font-family: 'Roboto', sans-serif;
  color: #333333;
}

.greeting {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.greeting-icon {
  width: 32px;
  height: 32px;
  margin-right: 0.5rem;
}

.highlight {
  color: #bb9965;
  font-weight: 800;
}

.event-message {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: #444;
}

.event-highlight {
  display: inline-block;
  background: linear-gradient(135deg, #f5f5f5, #ffe6cc);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 1.6rem;
  color: #8b6b3f;
  font-weight: 700;
  margin-top: 0.5rem;
}

.price-details-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-details {
  margin-bottom: 1.5rem;
  text-align: left;
  width: 100%;
  font-size: 0.95rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-weight: 500;
  color: #444444;
}

.price-row.total {
  font-weight: 700;
  font-size: 1rem;
}

hr {
  border: none;
  border-top: 1px solid #eaeaea;
  margin: 15px 0;
}

.action-button {
  background: linear-gradient(135deg, #caa375, #b18c55);
  color: #ffffff !important;
  font-size: 0.95rem;
  width: 100%;
  height: 3rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-weight: 600;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
