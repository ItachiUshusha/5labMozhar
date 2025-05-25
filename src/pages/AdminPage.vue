<template>
  <div>
    <MyButton @click="() => router.push('/')">Выйти</MyButton>
    <MyModal v-model:isOpen="modalVisible">
      <div v-if="activeModalType === 'client'">
        <h3>Добавить клиента</h3>

        <label>Имя:</label>
        <input v-model="formData.client.name" type="text" required />

        <label>Телефон:</label>
        <input v-model="formData.client.phone" type="text" required />

        <MyButton type="submit" @click="addItem('clients')">Сохранить</MyButton>
      </div>

      <div v-else-if="activeModalType === 'podryad'">
        <h3>Добавить подрядчика</h3>

        <label>Имя:</label>
        <input v-model="formData.contractor.name" type="text" />

        <label>Специализация:</label>
        <input v-model="formData.contractor.specialization" type="text" />

        <MyButton @click="addItem('contractors')">Сохранить</MyButton>
      </div>

      <div v-else-if="activeModalType === 'obj'">
        <h3>Добавить тип объекта</h3>

        <label>Название:</label>
        <input v-model="formData.objectType.name" type="text" />

        <MyButton @click="addItem('object-types')">Сохранить</MyButton>
      </div>

      <div v-else-if="activeModalType === 'material'">
        <h3>Добавить материал</h3>

        <label>Название:</label>
        <input v-model="formData.material.name" type="text" />

        <label>Цена:</label>
        <input v-model="formData.material.price" type="text" />

        <MyButton @click="addItem('materials')">Сохранить</MyButton>
      </div>

      <div v-if="activeModalType === 'showClient'">
        <h3>Список клиентов</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Телефон</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in items" :key="client._id">
              <td>{{ client.name || 'Не указано' }}</td>
              <td>{{ client.phone || 'Не указано' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeModalType === 'showPodryad'">
        <h3>Список подрядчиков</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Специализация</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contractor in items" :key="contractor._id">
              <td>{{ contractor.name || 'Не указано' }}</td>
              <td>{{ contractor.specialization || 'Не указано' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeModalType === 'showObj'">
        <h3>Список объектов</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Название</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="obj in items" :key="obj._id">
              <td>{{ obj.name || 'Не указано' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeModalType === 'showMaterial'">
        <h3>Список материалов</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Название</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="materials in items" :key="materials._id">
              <td>{{ materials.name || 'Не указано' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MyModal>

    <MyButton @click="openModal('client')">Добавить клиента</MyButton>
    <MyButton @click="openModal('podryad')">Добавить подрядчика</MyButton>
    <MyButton @click="openModal('obj')">Добавить тип объекта</MyButton>
    <MyButton @click="openModal('material')">Добавить материал</MyButton>
    <MyButton @click="openModal('showClient')">Просмотреть клиентов</MyButton>
    <MyButton @click="openModal('showPodryad')"
      >Просмотреть подрядчиков</MyButton
    >
    <MyButton @click="openModal('showObj')">Просмотреть типы объектов</MyButton>
    <MyButton @click="openModal('showMaterial')"
      >Просмотреть материалы</MyButton
    >
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import MyModal from '@/shared/Modal/MyModal.vue';
import MyButton from '@/shared/MyButton.vue';
import { useRouter } from 'vue-router';

const activeModalType = ref('');
const modalVisible = ref(false);
const items = ref([]); // Для хранения данных из БД
const router = useRouter();

const formData = ref({
  client: { name: '', phone: '' },
  contractor: { name: '', specialization: '' },
  objectType: { name: '' },
  material: { name: '', price: '' },
});

// Определяем функцию fetchItems
async function fetchItems(apiEndpoint) {
  try {
    const { data } = await axios.get(
      `http://localhost:8000/api/db/${apiEndpoint}`,
    );
    items.value = data;
    console.log('Данные получены:', items.value);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    alert('Не удалось загрузить данные');
  }
}

const typeMap = {
  clients: 'client',
  contractors: 'contractor',
  'object-types': 'objectType',
  materials: 'material',
};

async function addItem(apiEndpoint) {
  try {
    const itemType = typeMap[apiEndpoint];
    const formValues = formData.value[itemType];

    // Валидация
    if (itemType === 'client' && (!formValues.name || !formValues.phone)) {
      throw new Error('Заполните все поля');
    }

    const response = await axios.post(
      `http://localhost:8000/api/db/${apiEndpoint}`,
      { ...formValues },
    );

    console.log('Server response:', response.data);

    // Сброс формы
    formData.value[itemType] = {
      name: '',
      phone: '',
      specialization: '',
      price: '',
    };
    modalVisible.value = false;

    // Обновить список
    if (activeModalType.value.startsWith('show')) {
      await fetchItems(apiEndpoint);
    }
  } catch (error) {
    console.error('Full error:', error);
    console.error('Response data:', error.response?.data);
    alert(`Ошибка: ${error.response?.data?.error || error.message}`);
  }
}

function openModal(modalType) {
  activeModalType.value = modalType;
  modalVisible.value = true;
  if (modalType.startsWith('show')) {
    const endpointMap = {
      showClient: 'clients',
      showPodryad: 'contractors',
      showObj: 'object-types',
      showMaterial: 'materials',
    };
    fetchItems(endpointMap[modalType]); // Теперь функция определена
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}
</style>
