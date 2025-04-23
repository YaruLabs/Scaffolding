import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { Navbar } from '../components/navbar';
import { QuickStartGuide } from '../components/quickstart';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <QuickStartGuide />
      </main>
    </div>
  );
};

export default Home;
