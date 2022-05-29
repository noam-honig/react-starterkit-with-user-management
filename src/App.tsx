import { remult, setAuthToken } from "./common";
import ChangePassword from "./components/changePassword/changePassword";
import DataBrowser from "./components/data-browser";
import SignIn from "./components/signIn/signIn";
import Users from "./components/users";
import { terms } from "./shared/terms";
import { User } from "./shared/users/user";


function App() {


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
    <DataBrowser repo={remult.repo(User)} hideFields={f => [f.id]} />
  </div>
}

export default App
