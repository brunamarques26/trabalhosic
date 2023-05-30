// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, getDocs,addDoc,setDoc, onSnapshot, query, where, updateDoc,  doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

//Codigo para que a textarea se ajuste verticalmente consuante o conteudo 
const textarea = document.querySelector('.notes-input');
textarea.addEventListener('input', () => {
  textarea.style.height = 'auto'; // Reset the height to auto
  textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scrollHeight
});

//----------------------------------------------Calendario----------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const monthYearElement = document.querySelector(".month-year");
  const daysContainer = document.querySelector(".days");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");

  let currentDate = new Date();

  // Display the current month
  displayMonth(currentDate);

  // Event listeners for previous and next buttons
  prevButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayMonth(currentDate);
  });

  nextButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayMonth(currentDate);
  });

  function displayMonth(date) {
    // Clear the calendar days
    daysContainer.innerHTML = "";

    // Set the month and year in the header
    monthYearElement.textContent = getMonthName(date) + " " + date.getFullYear();

    // Get the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get the number of days in the month
    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Calculate the index of the first day in the weekdays list (0 - Sunday, 1 - Monday, etc.)
    const firstDayIndex = firstDay.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement("div");
      daysContainer.appendChild(emptyCell);
    }

    // Add the calendar days
    for (let i = 1; i <= totalDays; i++) {
      const dayCell = document.createElement("div");
      dayCell.textContent = i;
      daysContainer.appendChild(dayCell);

      // Add click event listener to each day cell
      dayCell.addEventListener("click", function() {
        const selectedDay = document.querySelector(".selected");
        if (selectedDay) {
          selectedDay.classList.remove("selected");
        }

        // Mark the clicked day as selected
        this.classList.add("selected");

        // Save the selected date to the database
        const selectedDate = new Date(date.getFullYear(), date.getMonth(), i);
        saveSelectedDateToDatabase(selectedDate);
      });

      // Mark the current date as selected
      if (
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() === currentDate.getMonth() &&
        i === currentDate.getDate()
      ) {
        dayCell.classList.add("selected");
      }
    }
  }

  function getMonthName(date) {
    const options = { month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  async function saveSelectedDateToDatabase(selectedDate) {
    try {
      const user = auth.currentUser;
      const userId = user.uid;
      const name = user.displayName;
  
      // Check if the selected date already exists in the database for the current user
      const querySnapshot = await getDocs(
        query(collection(db, "data"), where("data", "==", selectedDate), where("userId", "==", userId))
      );
  
      if (!querySnapshot.empty) {
        // If the date exists, delete it from the database
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
          console.log("Document deleted with ID: ", doc.id);
        });
  
        // Perform any additional logic or UI updates after deletion
        // ...
  
      } else {
        // If the date doesn't exist, save it to the database
        const docRef = await addDoc(collection(db, "data"), {
          data: selectedDate,
          userId: userId,
          userName: name
        });
        console.log("Document written with ID: ", docRef.id);
  
        // Perform any additional logic or UI updates after saving
        // ...
      }
    } catch (e) {
      console.error("Error accessing database: ", e);
    }
  }
});


  // Add event listeners to previous and next buttons
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");

  prevButton.addEventListener("click", () => {
    // Handle the click action for the previous button
    // For example, you can navigate to the previous month
    //alert("Previous button clicked");
  });

  nextButton.addEventListener("click", () => {
    // Handle the click action for the next button
    // For example, you can navigate to the next month
    //alert("Next button clicked");
  });

//-------------------------------------------------------------------------------------

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

//Form da Bruna
const form = document.querySelector('#todo-form');

//Form em condições
const formnotas = document.querySelector('#notes-form');

const list = document.querySelector('.list');

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
  
          const deleteButton = document.createElement('button');
          const deleteIcon = document.createElement('span');
          deleteIcon.classList.add('material-icons');
          deleteIcon.textContent = 'delete_forever';
          deleteButton.classList.add('delete-button');
          deleteButton.appendChild(deleteIcon);
          deleteButton.addEventListener('click', () => {
            deleteItem(taskId);
          });
          

          listItem.setAttribute('data-task-id', taskId); // Adicionar o atributo data-task-id
  
          listItem.appendChild(checkbox);
          listItem.appendChild(label);
          listItem.appendChild(deleteButton);
  
          list.appendChild(listItem);
  
          // Adicionar o ID do documento ao conjunto de IDs exibidos
          displayedTasks.add(taskId);
        }
      });
    });
  }
  
  // Função para excluir uma tarefa
  function deleteItem(taskId) {
    const taskRef = doc(db, "users", taskId);
    deleteDoc(taskRef)
      .then(() => {
        console.log("Documento excluído com sucesso!");
  
        // Encontrar o elemento correspondente pelo atributo data-task-id e removê-lo da lista
        const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
        if (listItem) {
          listItem.remove();
        }
      })
      .catch((error) => {
        console.error("Erro ao excluir o documento: ", error);
      });
  }
  


// Chamar a função displayTasks no evento onAuthStateChanged
auth.onAuthStateChanged((user) => {
  if (user) {
    //alert("Login com sucesso: " + user.displayName);
    console.log(user);
    displayTasks();
  }
});

//Chamar a função displayTasks no evento submit do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let tarefa = document.querySelector('[name=tarefa]').value;
  try {
    const user = auth.currentUser;
    const userId = user.uid;
    const name = user.displayName

    const docRef = await addDoc(collection(db, "users"), {
      tarefa: tarefa,
      userId: userId,
      userName: name
    });
    console.log("Document written with ID: ", docRef.id);

    //Limpar o conjunto de IDs exibidos para evitar duplicação após adicionar uma nova tarefa
    displayedTasks.clear();
    displayTasks();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  //alert('Registado com sucesso');
  form.reset();
});

// Chamar a função displayTasks no evento input do textarea notas
const notasTextarea = document.querySelector('[name=tarefa-notes]');
notasTextarea.addEventListener('input', async (e) => {
  const user = auth.currentUser;
  const userId = user.uid;

  if (userId) {
    const notesQuery = query(collection(db, "notes"), where("userId", "==", userId));
    const notesSnapshot = await getDocs(notesQuery);

    if (notesSnapshot.empty) {
      let tarefa_notas = e.target.value;
      if (tarefa_notas !== "") {
        try {
          const name = user.displayName;

          const docRef = await addDoc(collection(db, "notes"), {
            texto: tarefa_notas,
            userId: userId,
            userName: name
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    } else {
      const notesDoc = notesSnapshot.docs[0];
      const tarefa_notas = e.target.value;
      try {
        const name = user.displayName;

        await setDoc(notesDoc.ref, {
          texto: tarefa_notas,
          userId: userId,
          userName: name
        }, { merge: true });
        console.log("Document updated with ID: ", notesDoc.id);
      } catch (e) {
        console.error("Error updating document: ", e);
      }
    }
  }
});