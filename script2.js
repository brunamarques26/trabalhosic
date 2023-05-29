// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, updateDoc,  doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1J6AjxQTH6-VMYbb_8xKXFsIJjLZKrkI",
    authDomain: "trabalhosic2023.firebaseapp.com",
    projectId: "trabalhosic2023",
    storageBucket: "trabalhosic2023.appspot.com",
    messagingSenderId: "895482491862",
    appId: "1:895482491862:web:c2a2774102183930562a77",
    measurementId: "G-YHDFPMQHB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);

const form = document.querySelector('form');

// Definir um conjunto para armazenar os IDs dos documentos exibidos
const displayedTasks = new Set();

// Função para exibir as tarefas
function displayTasks() {
  const user = auth.currentUser;
  const userId = user.uid;
  const userTasksRef = collection(db, "users");
  const tasksQuery = query(userTasksRef, where("userId", "==", userId));

  // Limpar a lista antes de exibir as tarefas novamente
  list.innerHTML = "";

  onSnapshot(tasksQuery, (snapshot) => {
    snapshot.forEach((doc1) => {
      const taskId = doc1.id;
      const taskData = doc1.data();

      if (!displayedTasks.has(taskId)) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-item');

        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', taskId);
        checkbox.checked = taskData.completed;

        // Adicionar o ouvinte de eventos ao evento 'change' da checkbox
        checkbox.addEventListener('change', (event) => {
          const checked = event.target.checked;
          const taskId = event.target.id;

          const taskRef = doc(db, "users", taskId);

          // Atualizar o campo "completed" no Firestore com o novo valor da checkbox
          updateDoc(taskRef, {
            completed: checked
          })
            .then(() => {
              console.log("Documento atualizado com sucesso!");
            })
            .catch((error) => {
              console.error("Erro ao atualizar o documento: ", error);
            });
        });

        const label = document.createElement('label');
        label.setAttribute('for', taskId);
        label.innerText = taskData.tarefa;

        listItem.appendChild(checkbox);
        listItem.appendChild(label);

        list.appendChild(listItem);

        // Adicionar o ID do documento ao conjunto de IDs exibidos
        displayedTasks.add(taskId);
      }
    });
  });
}

// Chamar a função displayTasks no evento onAuthStateChanged
auth.onAuthStateChanged((user) => {
  if (user) {
    alert("Login com sucesso: " + user.displayName);
    console.log(user);
    displayTasks();
  }
});

// Chamar a função displayTasks no evento submit do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let tarefa = document.querySelector('[name=tarefa]').value;
  try {
    const user = auth.currentUser;
    const userId = user.uid;

    const docRef = await addDoc(collection(db, "users"), {
      tarefa: tarefa,
      userId: userId
    });
    console.log("Document written with ID: ", docRef.id);

    // Limpar o conjunto de IDs exibidos para evitar duplicação após adicionar uma nova tarefa
    displayedTasks.clear();
    displayTasks();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  alert('Registado com sucesso');
  form.reset();
});



const list = document.querySelector('.list');