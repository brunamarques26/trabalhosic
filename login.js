// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
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

const signInButton = document.getElementById('signInButton');

//Event Listener para o botão de "Sign Up with Google"
signInButton.addEventListener('click', () => {
    //Pop-Up da Google
    signInWithPopup(auth, provider)
        .then((result) => {
            //Código que deve ser executado quando o utilizador fizer login com sucesso
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            //Redirecionamento para a Home Page
            window.location.href = "home.html";
        })
        .catch((error) => {
            // Código a ser executado em caso de erro durante o login
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
});

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let tarefa = document.querySelector('[name=tarefa]').value;
    try {
        const docRef = await addDoc(collection(db, "users"), {
            tarefa: tarefa
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
    alert('Registado com sucesso');
    form.reset();
});

auth.onAuthStateChanged((val) => {
    if (val) {
        alert("Login com sucesso: " + val.displayName)
        console.log(val)
    }
});

const list = document.querySelector('.list');

const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
    list.innerHTML = '';
    snapshot.forEach((doc) => {
        list.innerHTML += `${doc.data().tarefa}<br>`;
    });
});
