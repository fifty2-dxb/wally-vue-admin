import { ref } from 'vue';

interface SnackbarState {
  show: boolean;
  text: string;
  color: string;
  timeout?: number;
}

const snackbar = ref<SnackbarState>({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
});

export function useSnackbar() {
  const showSuccess = (message: string) => {
    snackbar.value = {
      show: true,
      text: message,
      color: 'success',
      timeout: 3000,
    };
  };

  const showError = (message: string) => {
    snackbar.value = {
      show: true,
      text: message,
      color: 'error',
      timeout: 5000,
    };
  };

  const showWarning = (message: string) => {
    snackbar.value = {
      show: true,
      text: message,
      color: 'warning',
      timeout: 4000,
    };
  };

  const hideSnackbar = () => {
    snackbar.value.show = false;
  };

  return {
    snackbar,
    showSuccess,
    showError,
    showWarning,
    hideSnackbar,
  };
} 