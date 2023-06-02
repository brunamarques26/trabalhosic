// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, getDocs,addDoc,setDoc, onSnapshot, query, where, updateDoc,  doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

//Codigo para que a textarea se ajuste verticalmente consoante o conteudo 
const textarea = document.querySelector('.notes-input');
textarea.addEventListener('input', () => {
  textarea.style.height = 'auto'; 
  textarea.style.height = `${textarea.scrollHeight}px`;
});

//----------------------------------------------Calendario----------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const monthYearElement = document.querySelector(".month-year");
  const daysContainer = document.querySelector(".days");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");

  let currentDate = new Date();

  displayMonth(currentDate);

  prevButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayMonth(currentDate);
  });

  nextButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayMonth(currentDate);
  });

  function displayMonth(date) {
    daysContainer.innerHTML = "";

    monthYearElement.textContent = getMonthName(date) + " " + date.getFullYear();

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const firstDayIndex = firstDay.getDay();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement("div");
      daysContainer.appendChild(emptyCell);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dayCell = document.createElement("div");
      dayCell.textContent = i;
      daysContainer.appendChild(dayCell);

      dayCell.addEventListener("click", function() {
        const selectedDay = document.querySelector(".selected");
        if (selectedDay) {
          selectedDay.classList.remove("selected");
        }

        this.classList.add("selected");

        const selectedDate = new Date(date.getFullYear(), date.getMonth(), parseInt(this.textContent));
        saveSelectedDateToDatabase(selectedDate);
      });

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

  const dateString = selectedDate.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');


      const querySnapshot = await getDocs(
        query(collection(db, "cal"), where("date", "==", dateString), where("userId", "==", userId))
      );
  
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
          console.log("Document deleted with ID: ", doc.id);
        });
  

  
      } else {
        const text = prompt("Insira o texto para a data selecionada:");
  
        if (text) {
          //Guarda a data que o utilizador escolhe e o texto
          const docRef = await addDoc(collection(db, "cal"), {
            date: dateString,
            userId: userId,
            userName: name,
            text: text,
          });
          displayCalen();
          console.log("Document written with ID: ", docRef.id);
        }
      }
    } catch (e) {
      console.error("Error: ", e);
    }
  }

  
});

//-------------------------------------------------------------------------------------


//-----Lista do calendario-----

const listCal = document.querySelector('.list-data');

const displayedCale = new Set();

function displayCalen() {
  displayedCale.clear();
  const user = auth.currentUser;
  const userId = user.uid;
  const userCalRef = collection(db, "cal");
  const calQuery = query(userCalRef, where("userId", "==", userId));

  listCal.innerHTML = "";
  listCal.style.listStyleType = "none";

  onSnapshot(calQuery, (snapshot) => {
    snapshot.forEach((doc3) => {
      const calId = doc3.id;
      const calData = doc3.data();

      if (!displayedCale.has(calId)) {
        const listItem = document.createElement("li");
        listItem.classList.add("list-data");

        const label = document.createElement("label");
        label.setAttribute("for", calId);

        label.innerText = calData.date + " \n " + calData.text;

        const deleteButton = document.createElement("button");
        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("material-icons");
        deleteIcon.textContent = "delete_forever";
        deleteButton.classList.add("delete-button");
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", () => {
          deleteCalItem(calId);
        });

        listItem.setAttribute("data-id", calId);

        listItem.appendChild(label);
        listItem.appendChild(deleteButton);

        listCal.appendChild(listItem);

        displayedCale.add(calId);
      }
    });
  });
}

function deleteCalItem(calId) { 
  const dataRef = doc(db, "cal", calId);
  deleteDoc(dataRef)
    .then(() => {
      console.log("Data excluída com sucesso!");

      const listItem = document.querySelector(`li[data-id="${calId}"]`);
      if (listItem) {
        listItem.remove();
      }
    })
    .catch((error) => {
      console.error("Erro ao excluir a data: ", error);
    });
}

//Your web app's Firebase configuration
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

//Form do To-Do
const form = document.querySelector('#todo-form');

//Form das Notas
const formnotas = document.querySelector('#notes-form');

//Lista do To-Do
const list = document.querySelector('.list');

//Lista das notas
const listNotes = document.querySelector('.list-notes');

// Armazena os IDs do que já apareceu no ecrã
const displayedTasks = new Set();

// Função para mostrar as tarefas numa lista com checkbox
function displayTasks() {
    const user = auth.currentUser;
    const userId = user.uid;
    const userTasksRef = collection(db, "users");
    const tasksQuery = query(userTasksRef, where("userId", "==", userId));
  
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
  
          //Verifica se a checkbox foi escolhida
          checkbox.addEventListener('change', (event) => {
            const checked = event.target.checked;
            const taskId = event.target.id;
  
            const taskRef = doc(db, "users", taskId);
  
            //Se sim atualiza o "completed" na firebase com checked
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
          deleteButton.classList.add('delete-button-task');
          deleteButton.appendChild(deleteIcon);
          deleteButton.addEventListener('click', () => {
            deleteItem(taskId);
          });
          

          listItem.setAttribute('data-task-id', taskId);
  
          listItem.appendChild(checkbox);
          listItem.appendChild(label);
          listItem.appendChild(deleteButton);
  
          list.appendChild(listItem);
  
          displayedTasks.add(taskId);
        }
      });
    });
  }
  
  //Função para apagar uma tarefa
  function deleteItem(taskId) {
    const taskRef = doc(db, "users", taskId);
    deleteDoc(taskRef)
      .then(() => {
        console.log("Documento excluído com sucesso!");
  
        //Encontra o elemento pelo atributo data-task-id e remove da lista
        const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
        if (listItem) {
          listItem.remove();
        }
      })
      .catch((error) => {
        console.error("Erro ao excluir o documento: ", error);
      });
  }


  const displayedNotes = new Set();

  function displayNotes() {
    const user = auth.currentUser;
    const userId = user.uid;
    const userNoteRef = collection(db, "notes");
    
  
    listNotes.innerHTML = "";
    listNotes.style.listStyleType = "none"; 

    const notesQuery = query(userNoteRef, where("userId", "==", userId));
  
    onSnapshot(notesQuery, (snapshot) => {
      snapshot.forEach((doc2) => {
        const noteId = doc2.id;
        const noteData = doc2.data();
  
        if (!displayedNotes.has(noteId)) {
          const listItem = document.createElement('li');
          listItem.classList.add('list-notes');
  
          const label = document.createElement('label');
          label.setAttribute('for', noteId);
          label.innerText = noteData.texto;
  
          const deleteButton = document.createElement('button');
          const deleteIcon = document.createElement('span');
          deleteIcon.classList.add('material-icons');
          deleteIcon.textContent = 'delete_forever';
          deleteButton.classList.add('delete-button');
          deleteButton.appendChild(deleteIcon);
          deleteButton.addEventListener('click', () => {
            deleteNoteItem(noteId); 
          });
  
          listItem.setAttribute('data-note-id', noteId);
  
          listItem.appendChild(label);
          listItem.appendChild(deleteButton);
  
          listNotes.appendChild(listItem);
  

          displayedNotes.add(noteId);
        }
      });
    });
  }
  

  function deleteNoteItem(noteId) { 
    const noteRef = doc(db, "notes", noteId);
    deleteDoc(noteRef)
      .then(() => {
        console.log("Nota excluída com sucesso!");
  
        const listItem = document.querySelector(`li[data-note-id="${noteId}"]`);
        if (listItem) {
          listItem.remove();
        }
      })
      .catch((error) => {
        console.error("Erro ao excluir a nota: ", error);
      });
  }

  let username = document.getElementById("username")
  
//Autenticação feita
auth.onAuthStateChanged((user) => {
  if (user) {
    username.innerHTML = user.displayName
    console.log(user);
    displayTasks();
    displayNotes();
    displayCalen();

    const photoURL = user.photoURL;
    const profilePhoto = document.getElementById("profile-photo");

    if (photoURL) {  
      profilePhoto.src = photoURL;
      profilePhoto.alt = "Foto de Perfil";
      profilePhoto.style.width = "30px";
    } else{
      profilePhoto.style.display = "none"
    }
  }
});

//Ao clicar no botão adiciona o registo e mostra ao utilizador
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


    displayedTasks.clear();
    displayTasks();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  form.reset();
});


formnotas.addEventListener('submit', async (e) => {
  e.preventDefault();
  let nota = document.querySelector('[name=tarefa-notes]').value;
  try {
    const user = auth.currentUser;
    const userId = user.uid;
    const name = user.displayName

    const docRef = await addDoc(collection(db, "notes"), {
      texto: nota,
      userId: userId,
      userName: name
    });
    console.log("Document written with ID: ", docRef.id);

    displayedNotes.clear();
    displayNotes();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  formnotas.reset();
});

//Sign-Out
let signOutBtn = document.getElementById('signOut');

//Event Listener para o botão de Sign Out
signOutBtn.addEventListener('click', async (e) => {;
    signOut(auth).then(() => {
      window.location.href = "index.html";
    }).catch((error) => {
      alert("Aconteceu um erro")
    });
});