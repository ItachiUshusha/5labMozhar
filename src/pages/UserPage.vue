<template>
    <div>
        <MyModal v-model:isOpen="modalVisible">
            <button>ffffff</button>
        </MyModal>
        <button @click="addMaterial">Добавить материал</button>
        <button @click="addType">Добавить тип здания</button>
        <button @click="addPod">Добавить подрядчиков</button>
        <button @click="addClient">Добавить клиента</button>
    </div>
</template>

<script>
import MyModal from '@/shared/Modal/MyModal.vue';
    export default {
        components:{
            MyModal
        },
        data(){
            return{
                modalVisible:false
            }
        },
        methods: {
            addMaterial(){
                this.modalVisible=true
            }
        }
    }
</script>

<style scoped>

</style>