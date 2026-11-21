import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import WhatsAppButton from "../components/whatsAppButton";
import PwaInstallButton from "../components/PwaInstallButton";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
      <PwaInstallButton />
    </>
  );
}

export default MainLayout;