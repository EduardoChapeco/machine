
/**
 * FIREBASE SERVICE LAYER
 * Centraliza as operações de persistência para garantir integridade dos dados.
 * Nota: Assume-se que o firebaseApp já foi inicializado no projeto.
 */
import { CarouselProject, Brand } from '../types';

// Mock/Interface do Firestore (ajuste conforme seu setup real do Firebase)
const db: any = (window as any).firestore; 

export const saveProjectToFirestore = async (project: CarouselProject, userId: string) => {
  try {
    // Exemplo de salvamento no Firestore
    console.log(`[Firestore] Salvando projeto ${project.id} para usuário ${userId}`);
    // await setDoc(doc(db, "projects", project.id), { ...project, userId, updatedAt: Date.now() });
    localStorage.setItem(`machine_proj_${project.id}`, JSON.stringify(project)); // Fallback local
    return true;
  } catch (error) {
    console.error("Erro ao salvar projeto no Firestore:", error);
    return false;
  }
};

export const loadUserProjects = async (userId: string): Promise<CarouselProject[]> => {
  try {
    // Lógica real de fetch:
    // const q = query(collection(db, "projects"), where("userId", "==", userId));
    // const snapshot = await getDocs(q);
    return []; 
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    return [];
  }
};

export const saveBrandKitToFirestore = async (brand: Brand, userId: string) => {
  try {
    console.log(`[Firestore] Salvando Brand Kit ${brand.name}`);
    localStorage.setItem(`machine_brand_${brand.id}`, JSON.stringify(brand));
    return true;
  } catch (error) {
    return false;
  }
};
