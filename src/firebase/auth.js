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

export const register = async (email, password, callback) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user);
    return;
  } catch (error) {
    callback(error);
  }
};

export const loginWithGoogle = async (callback) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const docRef = doc(db, "users", user.uid);
    const exists = (await getDoc(docRef)).exists();

    if (!exists) {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        createdAt: Date.now(),
      });
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
