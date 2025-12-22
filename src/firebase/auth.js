import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  sendEmailVerification,
  linkWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// 🔥 Configuración inicial del store (debe coincidir con initialState de tu store)
const getInitialStoreData = (uid) => ({
  uid,
  backgroundType: "image",
  background: "/background.png",
  mobileBackground: "/background.webp",
  theme: "#b91c1c",
  textTheme: "#fafafa",
  displayColors: true,
  displayLinks: true,
  period: "all",
  completed: true,
  images: [],
  task: [],
  mode: "tools",
  lastTaskId: 0,
  colors: Array.from({ length: 48 }, (_, i) => {
    if (i === 0) return { id: 1, nombre: "theme", color: "b91c1c" };
    if (i === 1) return { id: 2, nombre: "text", color: "fafafa" };
    return { id: i + 1, nombre: "", color: "" };
  }),
  links: Array.from({ length: 48 }, (_, i) => {
    if (i === 0) {
      return {
        id: 1,
        nombre: "Fasttools",
        link: "https://fasttools.vercel.app",
        icono: "https://fasttools.vercel.app/icono.png",
      };
    }
    return { id: i + 1, nombre: "", link: "", icono: "" };
  }),
  text: "",
  title: "",
  tabs: {
    header: true,
    calculator: false,
    recorder: false,
    notes: false,
    conversor: false,
    links: false,
    colors: false,
    apiTester: false,
    jwt: false,
    editor: false,
    qr: false,
    colorpicker: false,
  },
  notes: Array.from({ length: 32 }, (_, i) => {
    if (i === 0) {
      return {
        id: 1,
        title: "Example",
        content: "Write a note here",
        color1: "#b91c1c",
        color2: "#FAFAFA",
      };
    }
    return {
      id: i + 1,
      title: "",
      content: "",
      color1: i === 1 ? "#000000" : "",
      color2: "#FAFAFA",
    };
  }),
  toolbarArea: [
    { id: 2, label: "calculator" },
    { id: 3, label: "recorder" },
    { id: 4, label: "colorpicker" },
    { id: 5, label: "conversor" },
    { id: 7, label: "colors" },
    { id: 10, label: "editor" },
    { id: 11, label: "qr" },
  ],
  headerArea: [
    { id: 1, label: "notes" },
    { id: 6, label: "links" },
    { id: 8, label: "apiTester" },
    { id: 9, label: "jwt" },
    { id: 12, label: "videoTrimmer" },
    { id: 13, label: "webanalyler" },
  ],
  api: "http://localhost:3000",
  socketApi: "http://localhost:3000",
});

export const login = async (email, password, callback) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (!userCredential.user.emailVerified) {
      return callback({
        success: false,
        error: { code: "email-not-verified", message: "Email not verified" },
      });
    }

    callback({ success: true, user: userCredential.user });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 🔥 Crear el store inmediatamente después del registro
    const uid = userCredential.user.uid;
    const storeRef = doc(db, "stores", uid);
    const storeData = getInitialStoreData(uid);

    await setDoc(storeRef, storeData);
    console.log("✅ Store inicial creado para nuevo usuario:", uid);

    await sendEmailVerification(userCredential.user);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const loginWithGoogle = async (callback) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si el usuario existe
    const userDocRef = doc(db, "users", user.uid);
    const userExists = (await getDoc(userDocRef)).exists();

    if (!userExists) {
      // Crear documento de usuario
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        createdAt: Date.now(),
      });
    }

    // 🔥 Verificar y crear store si no existe
    const storeDocRef = doc(db, "stores", user.uid);
    const storeExists = (await getDoc(storeDocRef)).exists();

    if (!storeExists) {
      const storeData = getInitialStoreData(user.uid);
      await setDoc(storeDocRef, storeData);
      console.log("✅ Store inicial creado para usuario de Google:", user.uid);
    }

    callback({ success: true, user });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const logout = async () => {
  if (window.__UNSUB_FIRESTORE__) {
    try {
      window.__UNSUB_FIRESTORE__();
      delete window.__UNSUB_FIRESTORE__;
    } catch (e) {}
  }
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const resendEmailVerification = async (callback) => {
  try {
    if (!auth.currentUser) {
      return callback({ success: false, error: "No user logged in" });
    }

    await sendEmailVerification(auth.currentUser);

    callback({ success: true });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const loginWithGithub = async (callback) => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // 🔥 Verificar y crear store si no existe
    const storeDocRef = doc(db, "stores", user.uid);
    const storeExists = (await getDoc(storeDocRef)).exists();

    if (!storeExists) {
      const storeData = getInitialStoreData(user.uid);
      await setDoc(storeDocRef, storeData);
      console.log("✅ Store inicial creado para usuario de GitHub:", user.uid);
    }

    callback({ success: true, user });
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const pendingCred = GithubAuthProvider.credentialFromError(error);
      const email = error.customData.email;

      return callback({
        success: false,
        error: "need-link",
        email,
        pendingCred,
      });
    }

    callback({ success: false, error });
  }
};

export const linkGithubAccount = async (
  email,
  password,
  pendingCred,
  callback
) => {
  try {
    // Login normal con email/password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Vincular credencial pendiente de GitHub
    await linkWithCredential(user, pendingCred);

    callback({ success: true, user });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const resetPassword = async (email, callback) => {
  try {
    await sendPasswordResetEmail(auth, email);
    callback({ success: true });
  } catch (error) {
    callback({ success: false, error });
  }
};
