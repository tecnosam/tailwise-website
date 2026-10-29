import { getVersion } from "@/lib/releases";
import { NavBar } from "./nav-bar";

// The top bar, labelled with the latest release's version.
export async function Nav() {
  return <NavBar version={await getVersion()} />;
}
