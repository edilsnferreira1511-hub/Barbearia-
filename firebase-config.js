/* ============================================================
   CONFIGURAÇÃO DO FIREBASE
   ------------------------------------------------------------
   Já conectado ao seu projeto: barbearia-b244b ✅
   Ainda faltam, no Firebase Console (console.firebase.google.com):
   1) Authentication > Sign-in method > ativar "E-mail/senha" e "Anônimo"
   2) Firestore Database > criar banco (modo produção)
   3) Storage > ativar (usado para fotos no painel admin)
   4) Firestore Database > Regras > colar o conteúdo de firestore.rules
   5) Storage > Regras > colar o conteúdo de storage.rules
   6) Criar o usuário do PIN admin (veja o README.md, seção 4)
   Esse objeto abaixo pode ficar público no frontend sem problema:
   ele só identifica o projeto. Quem protege os dados de verdade são
   as REGRAS do Firestore/Storage e a autenticação.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDMAjpjz4Gw4n5qGqyMBKBsTWc-ZkYlMhw",
  authDomain: "barbearia-b244b.firebaseapp.com",
  projectId: "barbearia-b244b",
  storageBucket: "barbearia-b244b.firebasestorage.app",
  messagingSenderId: "348369484535",
  appId: "1:348369484535:web:1715bd92e79b9c967b71f2",
  measurementId: "G-297RKJLL0F"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
// storage só existe se o SDK do Storage foi incluído na página (admin.html)
const storage = (typeof firebase.storage === 'function') ? firebase.storage() : null;
// analytics só existe se o SDK do Analytics foi incluído na página (index.html)
const analytics = (typeof firebase.analytics === 'function') ? firebase.analytics() : null;

// E-mail interno fixo usado apenas para autenticar o PIN do administrador.
// Você cria esse usuário manualmente uma única vez no Firebase Console
// (Authentication > Add user) com este e-mail e a senha = o PIN desejado.
const ADMIN_INTERNAL_EMAIL = "admin@dennerbarbearia.internal";
