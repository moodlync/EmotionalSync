import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PremiumFeatureModal } from '@/components/welcome/premium-feature-modal';

type PremiumFeatureModalContextType = {
  showModal: (title: string, description: string, imageSrc: string) => void;
  closeModal: () => void;
};

const PremiumFeatureModalContext = createContext<PremiumFeatureModalContextType | undefined>(undefined);

export const usePremiumFeatureModal = () => {
  const context = useContext(PremiumFeatureModalContext);
  if (!context) {
    throw new Error('usePremiumFeatureModal must be used within a PremiumFeatureModalProvider');
  }
  return context;
};

export const PremiumFeatureModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    description: '',
    imageSrc: '',
  });

  const showModal = (title: string, description: string, imageSrc: string) => {
    setModalData({ title, description, imageSrc });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <PremiumFeatureModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      <PremiumFeatureModal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalData.title}
        description={modalData.description}
        imageSrc={modalData.imageSrc}
      />
    </PremiumFeatureModalContext.Provider>
  );
};