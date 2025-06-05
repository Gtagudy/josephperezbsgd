import { useState, useCallback } from 'react';

export const useSectionInteractables = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [interactables, setInteractables] = useState(new Map());

  // Register an interactable with a section
  const registerInteractable = useCallback((objectId, section) => {
    setInteractables(prev => {
      const newMap = new Map(prev);
      newMap.set(objectId, section);
      return newMap;
    });
  }, []);

  // Check if an interactable should be active
  const isInteractableActive = useCallback((objectId) => {
    const section = interactables.get(objectId);
    return section === activeSection;
  }, [activeSection, interactables]);

  // Update active section and pause/activate interactables accordingly
  const setSection = useCallback((section) => {
    setActiveSection(section);
  }, []);

  return {
    activeSection,
    setSection,
    registerInteractable,
    isInteractableActive
  };
}; 