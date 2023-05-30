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

//Calendário
document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    selectable: true,
    select: function(info) {
      // Handle the selection of a date or range
      var startDate = info.start;
      var endDate = info.end;

      // Perform any desired actions with the selected date(s)
      // For example, send a notification or mark the selected days in some way
      // You can use external libraries or custom code to handle notifications

      // Example: Log the selected date(s) to the console
      console.log('Selected date(s):', startDate, endDate);
    }
  });
  calendar.render();
});

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
  
        //Encontra o elemento pelo atributo data-task-id e removev da lista
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
    const notesQuery = query(userNoteRef, where("userId", "==", userId));
  
    listNotes.innerHTML = "";
    listNotes.style.listStyleType = "none"; 
  
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
  
//quando é feita a autenticação
auth.onAuthStateChanged((user) => {
  if (user) {
    alert("Login com sucesso: " + user.displayName);
    console.log(user);
    displayTasks();
    displayNotes();
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
  alert('Registado com sucesso');
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
  alert('Registado com sucesso');
  formnotas.reset();
});

//Sign-Out

let signOutBtn = document.getElementById('signOut');

signOutBtn.addEventListener('click', async (e) => {;
    signOut(auth).then(() => {
      window.location.href = "index.html";
    }).catch((error) => {
      alert("Aconteceu um erro")
    });

});




// Chamar a função displayTasks no evento submit do botão notas
/*
formnotas.addEventListener('submit', async (e) => {
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
*/