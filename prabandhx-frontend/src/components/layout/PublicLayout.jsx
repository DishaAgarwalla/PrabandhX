import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;