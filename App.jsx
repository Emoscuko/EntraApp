// src/App.jsx

import React, { useEffect } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

/**
 * Korumalı İçeriği gösteren bileşen
 */
const ProfileContent = () => {
  const { accounts } = useMsal(); // Giriş yapmış kullanıcı bilgisi
  
  if (accounts.length > 0) {
    const user = accounts[0];
    return (
      <div>
        <h3>Welcome, {user.idTokenClaims?.given_name || "Kullanıcı"}!</h3>
        <p>E-posta: {user.username}</p>
        <p>This is a PROTECTED area visible only to logged in users..</p>
      </div>
    );
  }
  return null; 
};

/**
 * Ana App bileşeni
 */
function App() {
  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    // ✅ Eğer hesap varsa ve aktif değilse, aktif yap
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
      console.log("✅ Active account set in App:", accounts[0]);
    }
  }, [accounts, instance]);

  // Giriş Yap butonu fonksiyonu
  const handleLogin = () => {
    // ✅ Zaten bir işlem devam ediyorsa, tekrar başlatma
    if (inProgress === "none") {
      instance.loginRedirect(loginRequest).catch((e) => {
        console.error("❌ Login error:", e);
      });
    }
  };

  // Çıkış Yap butonu fonksiyonu
  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/", // Çıkış yaptıktan sonra ana sayfaya dön
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Homework: MSAL & Entra External ID React Implementation</h2>

      {/* AuthenticatedTemplate: Sadece giriş yapıldığında içindekileri gösterir.
      */}
      <AuthenticatedTemplate>
        <ProfileContent />
        <button onClick={handleLogout} style={{ marginTop: '10px' }}>
          Sign Out (Çıkış Yap)
        </button>
      </AuthenticatedTemplate>

      {/* UnauthenticatedTemplate: Sadece giriş yapılmadığında içindekileri gösterir.
      */}
      <UnauthenticatedTemplate>
        <p>Please log in to view protected content.</p>
        <button onClick={handleLogin} disabled={inProgress !== "none"}>
          {inProgress !== "none" ? "Yükleniyor..." : "Sign In / Sign "}
        </button>
      </UnauthenticatedTemplate>
    </div>
  );
}

export default App;