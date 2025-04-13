<template>
    <div class="modal" v-if="isOpen" @click="changeVisible">
        <div @click.stop class="modal__content">
            <slot></slot>
             
        </div>
    </div>
</template>

<script>
    export default {
        props:{
            isOpen: {
                type: Boolean,
                deafult: false
            }
        },
        methods:{
            changeVisible(){
                this.$emit('update:isOpen', false)
            }
        }
    }
</script>

<style scoped>
.modal{
    display: flex;
    top: 0;
    left: 0; 
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,.5);
    position: fixed;
}

.modal__content{
    margin:auto;
    background: white;
    border-radius: 12px;
    min-height: 50px;
    min-width: 300px;
    padding: 20px;
}
</style>