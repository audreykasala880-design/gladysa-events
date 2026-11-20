import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import WhatsAppButton from "../components/whatsAppButton";
import AnnouncementBar from "../components/AnnouncementBar";
import PwaInstallButton from "../components/PwaInstallButton";

function MainLayout({ children }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
      <PwaInstallButton />
    </>
  );
}

export default MainLayout;