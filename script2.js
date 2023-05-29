// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
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
    } catch (e) {
        console.error("Error adding document: ", e);
    }
    alert('Registado com sucesso');
    form.reset();
});

auth.onAuthStateChanged((user) => {
    if (user) {
        alert("Login com sucesso: " + user.displayName);
        console.log(user);

        const userId = user.uid;
        const userTasksRef = collection(db, "users");
        const tasksQuery = query(userTasksRef, where("userId", "==", userId));

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            snapshot.forEach((doc) => {
                const taskId = doc.id;
                const taskData = doc.data();
        
                const listItem = document.createElement('li');
                listItem.classList.add('list-item');
        
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('id', taskId);
                checkbox.checked = taskData.completed;
        
                const label = document.createElement('label');
                label.setAttribute('for', taskId);
                label.innerText = taskData.tarefa;
        
                listItem.appendChild(checkbox);
                listItem.appendChild(label);
        
                list.appendChild(listItem);
            });
        });
        
    }
});

const list = document.querySelector('.list');