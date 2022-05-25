import { useEffect, useState } from "react";
import { remult, setAuthToken } from "./common";
import ChangePassword from "./components/changePassword/changePassword";
import { listenToServerEvents } from "./components/realtime/list-to-server-events";
import SignIn from "./components/signIn/signIn";
import Users from "./components/users";
import { terms } from "./shared/terms";


function App() {
  const [message, setMessages] = useState<string[]>([]);
  useEffect(() => listenToServerEvents('/api/stream', {
    onMessage: message => {
      setMessages(m => [...m, message]);
      console.log({message});
    }
  }), [])
  const signOut = () => {
    setAuthToken(null);
    window.location.reload();
  }
  if (!remult.authenticated())
    return <SignIn />
  return <div>
    <p>
      Hi {remult.user.name} <button onClick={signOut}>Sign out</button>
      <ChangePassword />
    </p>
    <Users />
  </div>
}

export default App
