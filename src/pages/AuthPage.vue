<template>
    <div>
        <h2>Выберите роль</h2>
        <select v-model="role">
            <option selected disabled value="">Выберите один из вариантов</option>
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
        </select>
        <button @click="checkRole">Войти</button>
    </div>
</template>

<script>
    export default {
        name: 'AuthPage',
        data(){
            return{
                role: '',
            }
        },
        methods: {
            checkRole() {
                switch(this.role){
                    case 'user':
                      this.$router.push('/user')
                      break
                    case 'admin':
                      this.$router.push('/admin')
                      break
                }
            }
        }
    }
</script>

<style scoped>
div {
  padding: 20px;
  min-height: 100vh;
}
</style>