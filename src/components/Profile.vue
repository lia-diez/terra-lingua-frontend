<script setup lang="ts">
import {getToken, getUserdata, onTokenChange, removeToken} from "../helpers/token-helpers.ts";
import { useRouter} from 'vue-router'
import {ref} from "vue";
import {useToast} from "primevue";

const keys = ref([] as any[]);


const endpoint = import.meta.env.VITE_API_ENDPOINT;
const toast = useToast();
const router = useRouter();

const fetchKeys = async () => {
  try {
    const response = await fetch(`${endpoint}/apikey/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (response.ok) {
      keys.value = await response.json();
    } else {
      console.error('Failed to fetch keys');
    }
  } catch (error) {
    console.error('Error fetching keys:', error);
  }
}

const deleteKey = async (keyId: string) => {
  try {
    const response = await fetch(`${endpoint}/apikey/delete/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Ключ видалено',
        life: 2000
      });
      await fetchKeys();
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Помилка видалення ключа',
      detail: error instanceof Error ? error.message : 'Невідома помилка',
      life: 2000
    });
  }
}

const createKey = async () => {
  try {
    const response = await fetch(`${endpoint}/apikey/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (response.ok) {
      await fetchKeys();
      toast.add(
        {
          severity: 'success',
          summary: 'Ключ створено',
          life: 2000
        }
      )
    } else {
      toast.add(
        {
          severity: 'error',
          summary: 'Помилка створення ключа',
          life: 2000
        }
      )
    }
  } catch (error) {
    toast.add(
      {
        severity: 'error',
        summary: 'Помилка створення ключа',
        detail: error instanceof Error ? error.message : 'Невідома помилка',
        life: 2000
      }
    )
  }
}

fetchKeys();
const logout = () => {
  removeToken();
  toast.add({
    severity: 'success',
    summary: 'Вихід з системи',
    detail: 'Ви успішно вийшли з системи',
    life: 2000
  });
  router.push('/');
}

const username = ref(getUserdata()?.name);
if (!username.value) {
  router.push('/');
}

onTokenChange((newToken) => {
  if (newToken) {
    let user = getUserdata();
    if (user) {
      username.value = user.name;
    } else {
      username.value = 'Користувач';
    }
  }
});

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.add({
      severity: 'success',
      summary: 'Ключ скопійовано',
      detail: 'Ключ скопійовано до буферу обміну',
      life: 2000
    });

  }).catch(err => {
    toast.add({
      severity: 'error',
      summary: 'Помилка копіювання',
      detail: 'Не вдалося скопіювати ключ до буферу обміну',
      life: 2000
    });
    console.error('Failed to copy text: ', err);
  });
}


</script>

<template>
  <div class="container">
    <div class="main">
      <panel style="border-radius: 2rem; padding: 1rem;">
        <template #header>

          <div class="column">
            <h3>Профіль користувача</h3>
            <div class="header">
              <h2>{{username}}</h2>
              <Button severity="secondary" icon="pi pi-sign-out" rounded @click="logout"></Button>
            </div>
          </div>
        </template>
        <div class="column">
          <div class="card">

            <DataTable :value="keys" tableStyle="min-width: 50rem">
              <template #header>
                <div class="tbl-header">
                  <h2>Ключі доступу</h2>
                  <Button icon="pi pi-plus"  severity="primary" rounded label="Додати" @click="createKey"></Button>
                </div>
              </template>
              <Column field="keyString" header="Ключ"></Column>
              <Column field="validTill" header="Дійсний до"></Column>

              <Column class="w-24 !text-end">
                <template #body="slot">
                  <div class="header">
                    <Button class="tbl-btn" icon="pi pi-clone" @click="copyToClipboard(slot.data.keyString)" severity="secondary"
                            rounded></Button>
                    <Button class="tbl-btn" icon="pi pi-trash" @click="deleteKey(slot.data.keyId)" severity="contrast"
                            rounded></Button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>


      </panel>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
}

.main {
  grid-column: 2;
  margin-top: 1rem;
  width: 60vw;
}

.column {
  display: flex;
  flex-direction: column;
}

h3 {
  font-weight: normal;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.tbl-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

</style>