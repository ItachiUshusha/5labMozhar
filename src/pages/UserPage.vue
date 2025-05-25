<template>
  <div>
    <button @click="() => router.push('/')">Выход</button>
    <MyModal v-model:isOpen="modalVisible">
      <div v-if="activeModalType === 'create'">
        <h3>Создать заказ</h3>
        <form @submit.prevent="createOrder" class="create__form">
          <div>
            <label>Клиент:</label>
            <select v-model="formData.clientId">
              <option
                v-for="client in clients"
                :key="client.id"
                :value="client._id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>

          <div>
            <label>Подрядчик:</label>
            <select v-model="formData.contractorId">
              <option
                v-for="contractor in contractors"
                :key="contractor.id"
                :value="contractor._id"
              >
                {{ contractor.name }}
              </option>
            </select>
          </div>

          <div>
            <label>Тип объекта:</label>
            <select v-model="formData.objectTypeId">
              <option
                v-for="type in objectTypes"
                :key="type.id"
                :value="type._id"
              >
                {{ type.name }}
              </option>
            </select>
          </div>

          <div>
            <label>Площадь:</label>
            <input
              v-model.number="formData.area"
              type="number"
              @input="calculateCost"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label>Материалы:</label>
            <select
              v-model="formData.materialIds"
              multiple
              @change="calculateCost"
            >
              <option
                v-for="material in materials"
                :key="material.id"
                :value="material._id"
              >
                {{ material.name }} ({{ material.price }} руб.)
              </option>
            </select>
          </div>

          <div v-if="totalCost > 0">
            <strong>Итоговая стоимость: {{ totalCost }} руб.</strong>
          </div>

          <MyButton type="submit">Подтвердить</MyButton>
        </form>
      </div>

      <div v-else>
        <h3>Список заказов</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Подрядчик</th>
              <th>Материалы</th>
              <th>Стоимость</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order._id">
              <td>{{ getClientName(order.clientId) }}</td>
              <td>{{ getContractorName(order.contractorId) }}</td>
              <td>{{ getMaterialName(order.materialIds) }}</td>
              <td>{{ getObjectTypeName(order.objectTypeId) }}</td>
              <td>{{ order.totalCost }} руб.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MyModal>

    <MyButton @click="openModal('create')">Создать заказ</MyButton>
    <MyButton @click="openModal('')">Просмотреть заказы</MyButton>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import MyModal from '@/shared/Modal/MyModal.vue';
import MyButton from '@/shared/MyButton.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const activeModalType = ref('');
const modalVisible = ref(false);
const formData = ref({
  clientId: '',
  contractorId: '',
  objectTypeId: '',
  area: '',
  materialIds: [],
});
const clients = ref([]);
const contractors = ref([]);
const objectTypes = ref([]);
const materials = ref([]);
const orders = ref([]);
const totalCost = ref(0);
const router = useRouter();

function getClientName(clientId) {
  const client = clients.value.find((c) => c._id === clientId);
  return client ? client.name : 'Неизвестный клиент';
}

function getContractorName(contractorId) {
  const contractor = contractors.value.find((c) => c._id === contractorId);
  return contractor ? contractor.name : 'Неизвестный подрядчик';
}

function getObjectTypeName(objectTypeId) {
  const type = objectTypes.value.find((t) => t._id === objectTypeId);
  return type ? type.name : 'Неизвестный тип';
}

function getMaterialName(materialIds) {
  if (!materialIds || !materialIds.length) return 'Нет материалов';

  // Находим все материалы по их ID
  const foundMaterials = materialIds
    .map((id) => materials.value.find((m) => m._id === id))
    .filter(Boolean); // Удаляем undefined, если материал не найден

  if (!foundMaterials.length) return 'Материалы не найдены';

  // Собираем названия материалов в строку
  return foundMaterials.map((m) => m.name).join(', ');
}

async function fetchData() {
  try {
    const responses = await Promise.all([
      axios.get('http://localhost:8000/api/db/clients'),
      axios.get('http://localhost:8000/api/db/contractors'),
      axios.get('http://localhost:8000/api/db/object-types'),
      axios.get('http://localhost:8000/api/db/materials'),
      axios.get('http://localhost:8000/api/db/orders'),
    ]);

    clients.value = responses[0].data;
    contractors.value = responses[1].data;
    objectTypes.value = responses[2].data;
    materials.value = responses[3].data;
    orders.value = responses[4].data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function calculateCost() {
  try {
    const area = parseFloat(formData.value.area);
    if (isNaN(area) || area <= 0 || !formData.value.materialIds?.length) {
      totalCost.value = 0;
      return 0;
    }

    // Получаем все материалы один раз
    const { data: allMaterials } = await axios.get(
      'http://localhost:8000/api/db/materials',
    );

    // Фильтруем выбранные материалы
    const selectedMaterials = allMaterials.filter((m) =>
      formData.value.materialIds.includes(m._id),
    );

    // Расчет стоимости на клиенте
    totalCost.value = selectedMaterials.reduce(
      (sum, material) => sum + material.price * area,
      0,
    );

    return totalCost.value;
  } catch (error) {
    console.error('Ошибка расчета стоимости:', error);
    totalCost.value = 0;
    return 0;
  }
}

async function createOrder() {
  try {
    // Проверка полей
    if (
      !formData.value.clientId ||
      !formData.value.contractorId ||
      !formData.value.objectTypeId ||
      !formData.value.area
    ) {
      throw new Error('Заполните все обязательные поля');
    }

    // Расчет стоимости
    const cost = await calculateCost();
    if (cost <= 0) {
      throw new Error('Некорректная стоимость заказа');
    }

    // Данные заказа
    const orderData = {
      clientId: formData.value.clientId,
      contractorId: formData.value.contractorId,
      objectTypeId: formData.value.objectTypeId,
      area: parseFloat(formData.value.area),
      materialIds: formData.value.materialIds,
      totalCost: cost,
      status: 'created',
      createdAt: new Date(),
    };

    // Отправка заказа
    const response = await axios.post(
      'http://localhost:8000/api/db/orders',
      orderData,
    );

    // Очистка формы
    formData.value = {
      clientId: '',
      contractorId: '',
      objectTypeId: '',
      area: '',
      materialIds: [],
    };
    totalCost.value = 0;

    // Обновление списка и закрытие модального окна
    await fetchData();
    modalVisible.value = false;

    console.log('Заказ создан:', response.data);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    alert(`Ошибка: ${error.message}`);
  }
}

function openModal(modalType) {
  activeModalType.value = modalType;
  modalVisible.value = true;
  if (modalType === '') fetchData();
}

onMounted(() => {
  fetchData();
});

watch(
  () => [formData.value.area, formData.value.materialIds],
  () => {
    calculateCost();
  },
  { deep: true },
);
</script>

<style scoped>
.create__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create__form select {
  width: 70%;
}

.create__form input {
  padding: 0;
  width: 68.5%;
}

.create__form label {
  display: inline-block;
  width: 30%;
}

ul {
  list-style-type: none;
  padding: 0;
}
</style>
