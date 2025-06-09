<script setup lang="ts">

import {ref} from "vue";
import {getUserdata, onTokenChange, setToken} from "../helpers/token-helpers.ts";
import {useToast} from "primevue";

const modalVisible = ref(false);
const toast = useToast();

const formdata = ref({
  username: '',
  password: '',
  password2: ''
});

const loged_in = ref(getUserdata() !== null);

const username = ref(getUserdata()?.name);

onTokenChange((newToken) => {
  loged_in.value = newToken !== null;
  if (newToken) {
    let user = getUserdata();
    if (user) {
      username.value = user.name;
    } else {
      username.value = 'Користувач';
    }
  }
});

const login = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_ENDPOINT + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formdata.value.username,
        password: formdata.value.password
      })
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      modalVisible.value = false;
      toast.add(
        {
          severity: 'success',
          summary: 'Успішний вхід',
          detail: `Вітаємо, ${formdata.value.username}!`,
          life: 2000
        }
      )
    } else {
      toast.add(
        {
          severity: 'error',
          summary: 'Помилка входу',
          detail: await response.body?.getReader().read().then((result) => {
            const decoder = new TextDecoder();
            return decoder.decode(result.value);
          }) || 'Невідома помилка',
          life: 2000
        }
      )
      console.error('Login failed');
    }
  } catch (error: any) {
    toast.add(
        {
          severity: 'error',
          summary: 'Помилка входу',
          detail: error instanceof Error ? error.message : 'Невідома помилка',
          life: 2000
        }
    )
  }
};

const register = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_ENDPOINT + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formdata.value.username,
        password: formdata.value.password,
        passwordConfirm: formdata.value.password2
      })
    });

    if (response.ok) {
      await login();
    } else {
      console.error('Registration failed');
    }
  } catch (error) {
    console.error('Error during registration:', error);
  }
};

</script>

<template>
  <div v-if="!loged_in">
    <Button @click="modalVisible = !modalVisible" rounded>Увійти</Button>
    <Dialog class="modal" v-model:visible="modalVisible" modal
            :draggable="false" :show-header="false" style="border-radius: 2rem;">

      <Tabs value="0" class="tabs">
        <TabList>
          <Tab value="0"><h3>Вхід</h3></Tab>
          <Tab value="1"><h3>Реєстрація</h3></Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <InputText type="text" placeholder="Ім'я користувача" class="input" v-model="formdata.username"/>
            <InputText type="password" placeholder="Пароль" class="input" v-model="formdata.password"/>
            <div class="right">
              <Button type="submit" severity="primary" label="Увійти" class="submit" rounded @click="login"/>
            </div>

          </TabPanel>
          <TabPanel value="1">
            <InputText type="text" placeholder="Ім'я користувача" class="input" v-model="formdata.username"/>
            <InputText type="password" placeholder="Пароль" class="input" v-model="formdata.password"/>
            <InputText type="password" placeholder="Підтвердження пароля" class="input" v-model="formdata.password2"/>
            <div class="right">
              <Button type="submit" severity="primary" label="Реєстрація" class="submit" rounded @click="register"/>
            </div>

          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>
  </div>
  <div v-else>
    <router-link to="/profile">{{username}}</router-link>
  </div>
</template>

<style scoped>


.tabs {
  margin-top: 1rem;
  width: 20rem;
}

.input {
  width: 100%;
  margin-bottom: 1rem;
}

.right {
  display: flex;
  justify-content: flex-end;
}

</style>