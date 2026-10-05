import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/whatsAppButton";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default MainLayout;