import React from 'react';
import { Header } from './components/Header';
import { useTheme } from './hooks/useTheme';
import { InputForm } from './components/InputForm';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <InputForm theme={theme} />
      </main>
    </div>
  );
};

export default App;