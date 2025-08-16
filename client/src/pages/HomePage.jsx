// client/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // For multilingual support
import { isRTL } from '../utils/languageUtils'; // Utility to detect RTL

const HomePage = () => {
  const { i18n } = useTranslation();

  // Dummy data for translation projects
  const projects = [
    { id: 1, title: "Understanding Quantum Physics", type: "article" },
    { id: 2, title: "TED Talk: Future of AI", type: "video" },
    { id: 3, title: "How to Learn Persian", type: "article" },
  ];

  return (
    <div className={`min-h-screen p-6 ${isRTL(i18n.language) ? 'rtl' : 'ltr'}`}>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Community Translation Hub</h1>
        <p className="mt-2 text-gray-600">Translate articles and videos into Persian — together!</p>
      </header>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Available Projects</h2>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              <Link to={`/project/${project.id}`} className="block">
                <h3 className="font-medium">{project.title}</h3>
                <span className="text-sm text-gray-500 capitalize">{project.type}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;