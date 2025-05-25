<template>
  <div class="auth-container">
    <h2>Вход в систему</h2>
    <form @submit.prevent="login" class="auth-form">
      <div>
        <label>Логин:</label>
        <input v-model="username" type="text" required />
      </div>
      <div>
        <label>Пароль:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" class="login-button">Войти</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

function login() {
  // Проверка учетных данных
  if (username.value === 'user' && password.value === 'user') {
    router.push('/user');
  } else if (username.value === 'admin' && password.value === 'admin') {
    router.push('/admin');
  } else {
    error.value = 'Неверный логин или пароль';
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  gap: 15px;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.auth-form div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.auth-form label {
  font-weight: 600;
}

.auth-form input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-button {
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #45a049;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
</style>
