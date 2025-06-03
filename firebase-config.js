// Firebase 구성 정보
const firebaseConfig = {
    apiKey: "AIzaSyCgJwy61zp8uOpPm7zOc_Rcl82dyieJ7Ug",
    authDomain: "qna85-d287e.firebaseapp.com",
    projectId: "qna85-d287e",
    storageBucket: "qna85-d287e.firebasestorage.app",
    messagingSenderId: "704464565702",
    appId: "1:704464565702:web:49980db29f7b2f0c992ec7",
    measurementId: "G-09M0QNY6ND"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스 초기화
const analytics = firebase.analytics();
const db = firebase.firestore(); 